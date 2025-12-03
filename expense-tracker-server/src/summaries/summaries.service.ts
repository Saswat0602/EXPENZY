import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Currency } from '@prisma/client';

@Injectable()
export class SummariesService {
  constructor(private prisma: PrismaService) {}

  async getMonthlySummary(
    userId: string,
    year: number,
    month: number,
    currency: string = 'USD',
  ) {
    // Try to find existing summary
    const summary = await this.prisma.monthlySummary.findUnique({
      where: {
        userId_year_month_currency: {
          userId,
          year,
          month,
          currency: currency as Currency,
        },
      },
    });

    if (summary) {
      return summary;
    }

    // If not found, calculate it on the fly (and maybe save it? For now just calculate)
    // Real-time calculation fallback
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        expenseDate: {
          gte: startDate,
          lte: endDate,
        },
        currency: currency as Currency,
        deletedAt: null,
      },
    });

    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0,
    );

    return {
      userId,
      year,
      month,
      currency,
      totalExpenses,
      expenseCount: expenses.length,
      // Add other fields as needed
      isEstimated: true,
    };
  }

  async getYearlySummary(
    userId: string,
    year: number,
    currency: string = 'USD',
  ) {
    const summary = await this.prisma.yearlySummary.findUnique({
      where: {
        userId_year_currency: {
          userId,
          year,
          currency: currency as Currency,
        },
      },
    });

    if (summary) {
      return summary;
    }

    // Fallback calculation
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        expenseDate: {
          gte: startDate,
          lte: endDate,
        },
        currency: currency as Currency,
        deletedAt: null,
      },
    });

    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0,
    );

    return {
      userId,
      year,
      currency,
      totalExpenses,
      expenseCount: expenses.length,
      isEstimated: true,
    };
  }
}
