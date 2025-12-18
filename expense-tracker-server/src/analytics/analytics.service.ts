import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsQueryDto, AnalyticsPeriod } from './dto/analytics-query.dto';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) { }

  private getDateRange(
    period: AnalyticsPeriod,
    startDate?: string,
    endDate?: string,
  ) {
    const now = new Date();
    let start: Date;
    const end: Date = endDate ? new Date(endDate) : now;

    if (startDate && endDate) {
      start = new Date(startDate);
    } else {
      switch (period) {
        case AnalyticsPeriod.WEEK:
          start = new Date(now.setDate(now.getDate() - 7));
          break;
        case AnalyticsPeriod.MONTH:
          start = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case AnalyticsPeriod.QUARTER:
          start = new Date(now.setMonth(now.getMonth() - 3));
          break;
        case AnalyticsPeriod.YEAR:
          // Use start of current year (Jan 1) instead of 1 year ago
          start = new Date(now.getFullYear(), 0, 1); // Jan 1 of current year
          break;
        default:
          start = new Date(now.setMonth(now.getMonth() - 1));
      }
    }

    return { start, end };
  }

  async getDashboardSummary(userId: string, query: AnalyticsQueryDto) {
    const { start, end } = this.getDateRange(
      query.period || AnalyticsPeriod.MONTH,
      query.startDate,
      query.endDate,
    );

    // Parallel queries for performance
    const [
      totalIncome,
      totalExpenses,
      budgets,
      savingsGoals,
      recentTransactions,
      topCategories,
    ] = await Promise.all([
      // Total Income
      this.prisma.income.aggregate({
        where: {
          userId,
          incomeDate: { gte: start, lte: end },
          deletedAt: null,
        },
        _sum: { amount: true },
      }),

      // Total Expenses
      this.prisma.expense.aggregate({
        where: {
          userId,
          expenseDate: { gte: start, lte: end },
          deletedAt: null,
        },
        _sum: { amount: true },
      }),

      // Active Budgets
      this.prisma.budget.findMany({
        where: {
          userId,
          isActive: true,
          startDate: { lte: end },
          endDate: { gte: start },
        },
        include: { category: true },
        take: 5,
      }),

      // Active Savings Goals
      this.prisma.savingsGoal.findMany({
        where: {
          userId,
          isCompleted: false,
          isArchived: false,
        },
        orderBy: { priority: 'asc' },
        take: 5,
      }),

      // Recent Transactions (expenses)
      this.prisma.expense.findMany({
        where: {
          userId,
          deletedAt: null,
        },
        include: { category: true },
        orderBy: { expenseDate: 'desc' },
        take: 10,
      }),

      // Top Expense Categories
      this.prisma.expense.groupBy({
        by: ['categoryId'],
        where: {
          userId,
          expenseDate: { gte: start, lte: end },
          deletedAt: null,
        },
        _sum: { amount: true },
        _count: true,
        orderBy: { _sum: { amount: 'desc' } },
        take: 5,
      }),
    ]);

    const income = Number(totalIncome._sum.amount || 0);
    const expenses = Number(totalExpenses._sum.amount || 0);
    const netSavings = income - expenses;

    // Get category details for top categories
    const categoryIds = topCategories
      .map((c) => c.categoryId)
      .filter((id): id is string => id !== null);
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });

    const topCategoriesWithDetails = topCategories.map((tc) => {
      const category = categories.find((c) => c.id === tc.categoryId);
      return {
        categoryId: tc.categoryId,
        categoryName: category?.name || 'Uncategorized',
        categoryIcon: category?.icon,
        categoryColor: category?.color,
        totalAmount: Number(tc._sum.amount || 0),
        transactionCount: tc._count,
      };
    });

    // Calculate budget utilization
    const budgetUtilization = budgets.map((budget) => ({
      ...budget,
      amount: Number(budget.amount),
      spentAmount: Number(budget.spentAmount),
      utilization:
        Number(budget.amount) > 0
          ? (Number(budget.spentAmount) / Number(budget.amount)) * 100
          : 0,
    }));

    // Calculate savings progress
    const savingsProgress = savingsGoals.map((goal) => ({
      ...goal,
      targetAmount: Number(goal.targetAmount),
      currentAmount: Number(goal.currentAmount),
      progress:
        Number(goal.targetAmount) > 0
          ? (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100
          : 0,
    }));

    return {
      period: query.period,
      dateRange: { start, end },
      summary: {
        totalIncome: income,
        totalExpenses: expenses,
        netSavings,
        savingsRate: income > 0 ? (netSavings / income) * 100 : 0,
      },
      budgets: budgetUtilization,
      savingsGoals: savingsProgress,
      recentTransactions: recentTransactions.map((tx) => ({
        ...tx,
        amount: Number(tx.amount),
      })),
      topCategories: topCategoriesWithDetails,
    };
  }

  async getSpendingTrends(userId: string, query: AnalyticsQueryDto) {
    const { start, end } = this.getDateRange(
      query.period || AnalyticsPeriod.MONTH,
      query.startDate,
      query.endDate,
    );

    // Group expenses by date
    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        expenseDate: { gte: start, lte: end },
        deletedAt: null,
      },
      select: {
        expenseDate: true,
        amount: true,
        categoryId: true,
      },
      orderBy: { expenseDate: 'asc' },
    });

    // Group by day
    const dailyTotals = expenses.reduce(
      (acc, expense) => {
        const date = expense.expenseDate.toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += Number(expense.amount);
        return acc;
      },
      {} as Record<string, number>,
    );

    const trend = Object.entries(dailyTotals).map(([date, amount]) => ({
      date,
      amount,
    }));

    return {
      period: query.period,
      dateRange: { start, end },
      trend,
      totalExpenses: trend.reduce((sum, day) => sum + day.amount, 0),
      averageDaily:
        trend.length > 0
          ? trend.reduce((sum, day) => sum + day.amount, 0) / trend.length
          : 0,
    };
  }

  async getCategoryBreakdown(userId: string, query: AnalyticsQueryDto) {
    const { start, end } = this.getDateRange(
      query.period || AnalyticsPeriod.MONTH,
      query.startDate,
      query.endDate,
    );

    const categoryData = await this.prisma.expense.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        expenseDate: { gte: start, lte: end },
        deletedAt: null,
      },
      _sum: { amount: true },
      _count: true,
      _avg: { amount: true },
    });

    const categoryIds = categoryData
      .map((c) => c.categoryId)
      .filter((id): id is string => id !== null);
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });

    const breakdown = categoryData.map((data) => {
      const category = categories.find((c) => c.id === data.categoryId);
      return {
        categoryId: data.categoryId,
        categoryName: category?.name || 'Uncategorized',
        categoryIcon: category?.icon,
        categoryColor: category?.color,
        totalAmount: Number(data._sum.amount || 0),
        transactionCount: data._count,
        averageAmount: Number(data._avg.amount || 0),
      };
    });

    const total = breakdown.reduce((sum, cat) => sum + cat.totalAmount, 0);
    const breakdownWithPercentage = breakdown.map((cat) => ({
      ...cat,
      percentage: total > 0 ? (cat.totalAmount / total) * 100 : 0,
    }));

    return {
      period: query.period,
      dateRange: { start, end },
      breakdown: breakdownWithPercentage.sort(
        (a, b) => b.totalAmount - a.totalAmount,
      ),
      totalExpenses: total,
    };
  }

  async getCashFlow(userId: string, query: AnalyticsQueryDto) {
    const { start, end } = this.getDateRange(
      query.period || AnalyticsPeriod.MONTH,
      query.startDate,
      query.endDate,
    );

    const [incomes, expenses] = await Promise.all([
      this.prisma.income.findMany({
        where: {
          userId,
          incomeDate: { gte: start, lte: end },
          deletedAt: null,
        },
        select: { incomeDate: true, amount: true },
        orderBy: { incomeDate: 'asc' },
      }),
      this.prisma.expense.findMany({
        where: {
          userId,
          expenseDate: { gte: start, lte: end },
          deletedAt: null,
        },
        select: { expenseDate: true, amount: true },
        orderBy: { expenseDate: 'asc' },
      }),
    ]);

    // Group by date
    const cashFlowByDate: Record<
      string,
      { income: number; expense: number; net: number }
    > = {};

    incomes.forEach((income) => {
      const date = income.incomeDate.toISOString().split('T')[0];
      if (!cashFlowByDate[date]) {
        cashFlowByDate[date] = { income: 0, expense: 0, net: 0 };
      }
      cashFlowByDate[date].income += Number(income.amount);
    });

    expenses.forEach((expense) => {
      const date = expense.expenseDate.toISOString().split('T')[0];
      if (!cashFlowByDate[date]) {
        cashFlowByDate[date] = { income: 0, expense: 0, net: 0 };
      }
      cashFlowByDate[date].expense += Number(expense.amount);
    });

    // Calculate net cash flow
    Object.keys(cashFlowByDate).forEach((date) => {
      cashFlowByDate[date].net =
        cashFlowByDate[date].income - cashFlowByDate[date].expense;
    });

    const cashFlow = Object.entries(cashFlowByDate)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const totalIncome = cashFlow.reduce((sum, day) => sum + day.income, 0);
    const totalExpense = cashFlow.reduce((sum, day) => sum + day.expense, 0);

    return {
      period: query.period,
      dateRange: { start, end },
      cashFlow,
      summary: {
        totalIncome,
        totalExpense,
        netCashFlow: totalIncome - totalExpense,
        averageDailyIncome:
          cashFlow.length > 0 ? totalIncome / cashFlow.length : 0,
        averageDailyExpense:
          cashFlow.length > 0 ? totalExpense / cashFlow.length : 0,
      },
    };
  }

  async getBudgetPerformance(userId: string) {
    const activeBudgets = await this.prisma.budget.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: { category: true },
    });

    const performance = activeBudgets.map((budget) => {
      const amount = Number(budget.amount);
      const spent = Number(budget.spentAmount);
      const remaining = amount - spent;
      const utilization = amount > 0 ? (spent / amount) * 100 : 0;

      let status: 'on_track' | 'warning' | 'exceeded';
      if (utilization < 80) {
        status = 'on_track';
      } else if (utilization < 100) {
        status = 'warning';
      } else {
        status = 'exceeded';
      }

      return {
        budgetId: budget.id,
        categoryName: budget.category?.name || 'General',
        categoryIcon: budget.category?.icon,
        amount,
        spentAmount: spent,
        remaining,
        utilization,
        status,
        periodType: budget.periodType,
        startDate: budget.startDate,
        endDate: budget.endDate,
      };
    });

    return {
      budgets: performance,
      summary: {
        totalBudgeted: performance.reduce((sum, b) => sum + b.amount, 0),
        totalSpent: performance.reduce((sum, b) => sum + b.spentAmount, 0),
        averageUtilization:
          performance.length > 0
            ? performance.reduce((sum, b) => sum + b.utilization, 0) /
            performance.length
            : 0,
        onTrackCount: performance.filter((b) => b.status === 'on_track').length,
        warningCount: performance.filter((b) => b.status === 'warning').length,
        exceededCount: performance.filter((b) => b.status === 'exceeded')
          .length,
      },
    };
  }
}
