import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GroupStatisticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get comprehensive group statistics using database aggregation
   */
  async getGroupStatistics(groupId: string, userId: string) {
    // Use database aggregation for better performance
    const [totalStats, userStats, categoryStats] = await Promise.all([
      // Total statistics using aggregation
      this.prisma.groupExpense.aggregate({
        where: { groupId },
        _count: true,
        _sum: { amount: true },
        _avg: { amount: true },
      }),

      // User-specific statistics
      this.prisma.groupExpense.aggregate({
        where: { groupId, paidByUserId: userId },
        _sum: { amount: true },
      }),

      // Category breakdown
      this.prisma.groupExpense.groupBy({
        by: ['categoryId'],
        where: { groupId },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    // Get user's share from splits
    const userSplits = await this.prisma.groupExpenseSplit.aggregate({
      where: {
        userId,
        groupExpense: {
          groupId,
        },
      },
      _sum: { amountOwed: true },
    });

    const totalSpending = totalStats._sum.amount
      ? Number(totalStats._sum.amount)
      : 0;
    const yourTotalSpending = userStats._sum.amount
      ? Number(userStats._sum.amount)
      : 0;
    const yourShare = userSplits._sum.amountOwed
      ? Number(userSplits._sum.amountOwed)
      : 0;
    const averageExpense = totalStats._avg.amount
      ? Number(totalStats._avg.amount)
      : 0;

    // Fetch category names for breakdown
    const categoryIds = categoryStats
      .map((c) => c.categoryId)
      .filter((id): id is string => id !== null);
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    // Process category breakdown
    const categoryBreakdown: Record<string, number> = {};
    for (const cat of categoryStats) {
      if (cat.categoryId) {
        const categoryName = categoryMap.get(cat.categoryId) || 'Unknown';
        categoryBreakdown[categoryName] = cat._sum.amount
          ? Number(cat._sum.amount)
          : 0;
      }
    }

    return {
      totalExpenses: totalStats._count,
      totalSpending: Math.round(totalSpending * 100) / 100,
      yourTotalSpending: Math.round(yourTotalSpending * 100) / 100,
      yourShare: Math.round(yourShare * 100) / 100,
      averageExpense: Math.round(averageExpense * 100) / 100,
      expenseCount: totalStats._count,
      categoryBreakdown,
    };
  }

  /**
   * Get monthly analytics for the group
   */
  async getMonthlyAnalytics(groupId: string, months: number = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const expenses = await this.prisma.groupExpense.findMany({
      where: {
        groupId,
        expenseDate: {
          gte: startDate,
        },
      },
      select: {
        amount: true,
        expenseDate: true,
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        expenseDate: 'asc',
      },
    });

    // Group by month
    const monthlyData: Record<
      string,
      { total: number; count: number; categories: Record<string, number> }
    > = {};

    expenses.forEach((exp) => {
      const monthKey = `${exp.expenseDate.getFullYear()}-${String(exp.expenseDate.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { total: 0, count: 0, categories: {} };
      }

      const amount = Number(exp.amount);
      monthlyData[monthKey].total += amount;
      monthlyData[monthKey].count += 1;

      const categoryName = exp.category?.name || 'Uncategorized';
      monthlyData[monthKey].categories[categoryName] =
        (monthlyData[monthKey].categories[categoryName] || 0) + amount;
    });

    return monthlyData;
  }
}
