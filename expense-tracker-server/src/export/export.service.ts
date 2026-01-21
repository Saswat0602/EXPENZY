import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PdfGeneratorService } from './services/pdf-generator.service';
import {
  GroupExportData,
  ExpenseExportData,
  TransactionExportData,
} from './interfaces/export-data.interface';
import {
  ExportGroupDto,
  ExportExpensesDto,
  ExportTransactionsDto,
} from './dto/export.dto';

@Injectable()
export class ExportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfGenerator: PdfGeneratorService,
  ) {}

  /**
   * Export group report as PDF
   */
  async exportGroup(
    groupId: string,
    userId: string,
    options: ExportGroupDto,
  ): Promise<string> {
    // Fetch group data
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          where: { inviteStatus: 'accepted' },
        },
      },
    });

    if (!group) {
      throw new Error('Group not found');
    }

    // Build date filter
    const dateFilter: { expenseDate?: { gte?: Date; lte?: Date } } = {};
    if (options.startDate || options.endDate) {
      dateFilter.expenseDate = {};
      if (options.startDate) {
        dateFilter.expenseDate.gte = new Date(options.startDate);
      }
      if (options.endDate) {
        dateFilter.expenseDate.lte = new Date(options.endDate);
      }
    }

    // Fetch expenses
    const expenses = await this.prisma.groupExpense.findMany({
      where: {
        groupId,
        ...dateFilter,
      },
      include: {
        paidBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        category: {
          select: {
            name: true,
            icon: true,
          },
        },
        splits: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        expenseDate: 'desc',
      },
    });

    // Calculate statistics
    const statistics = options.includeStatistics
      ? {
          totalExpenses: expenses.length,
          totalAmount: expenses.reduce(
            (sum, exp) => sum + Number(exp.amount),
            0,
          ),
          averageExpense:
            expenses.length > 0
              ? expenses.reduce((sum, exp) => sum + Number(exp.amount), 0) /
                expenses.length
              : 0,
          categoryBreakdown: expenses.reduce(
            (acc, exp) => {
              const categoryName = exp.category?.name || 'Uncategorized';
              acc[categoryName] = (acc[categoryName] || 0) + Number(exp.amount);
              return acc;
            },
            {} as Record<string, number>,
          ),
        }
      : undefined;

    // Format data for PDF
    const exportData: GroupExportData = {
      group: {
        id: group.id,
        name: group.name,
        description: group.description || undefined,
        currency: group.currency,
        memberCount: group.members.length,
      },
      expenses: expenses.map((exp) => ({
        id: exp.id,
        description: exp.description,
        amount: Number(exp.amount),
        currency: exp.currency,
        expenseDate: exp.expenseDate,
        paidBy: {
          id: exp.paidBy?.id || '',
          name:
            `${exp.paidBy?.firstName || ''} ${exp.paidBy?.lastName || ''}`.trim() ||
            'Unknown',
          email: exp.paidBy?.email || '',
        },
        category: exp.category
          ? {
              name: exp.category.name,
              icon: exp.category.icon || undefined,
            }
          : undefined,
        splits: exp.splits.map((split) => ({
          user: {
            id: split.user?.id || '',
            name:
              `${split.user?.firstName || ''} ${split.user?.lastName || ''}`.trim() ||
              'Unknown',
          },
          amountOwed: Number(split.amountOwed),
          amountPaid: Number(split.amountPaid),
        })),
      })),
      statistics,
    };

    // Generate PDF
    return await this.pdfGenerator.generateGroupReport(exportData);
  }

  /**
   * Export personal expenses as PDF
   */
  async exportExpenses(
    userId: string,
    options: ExportExpensesDto,
  ): Promise<string> {
    // Build date filter
    const dateFilter: { expenseDate?: { gte?: Date; lte?: Date } } = {};
    if (options.startDate || options.endDate) {
      dateFilter.expenseDate = {};
      if (options.startDate) {
        dateFilter.expenseDate.gte = new Date(options.startDate);
      }
      if (options.endDate) {
        dateFilter.expenseDate.lte = new Date(options.endDate);
      }
    }

    // Fetch expenses
    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        deletedAt: null,
        ...dateFilter,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        expenseDate: 'desc',
      },
    });

    // Calculate summary
    const totalAmount = expenses.reduce(
      (sum, exp) => sum + Number(exp.amount),
      0,
    );
    const summary = {
      totalExpenses: expenses.length,
      totalAmount,
      averageExpense: expenses.length > 0 ? totalAmount / expenses.length : 0,
    };

    // Format data for PDF
    const exportData: ExpenseExportData = {
      expenses: expenses.map((exp) => ({
        id: exp.id,
        description: exp.description || 'No description',
        amount: Number(exp.amount),
        currency: exp.currency,
        expenseDate: exp.expenseDate,
        category: exp.category
          ? {
              name: exp.category.name,
            }
          : undefined,
      })),
      summary,
    };

    // Generate PDF
    return await this.pdfGenerator.generateExpenseReport(exportData);
  }

  /**
   * Export transactions (income + expenses) as PDF
   */
  async exportTransactions(
    userId: string,
    options: ExportTransactionsDto,
  ): Promise<string> {
    // Build date filter
    const expenseDateFilter: { expenseDate?: { gte?: Date; lte?: Date } } = {};
    const incomeDateFilter: { incomeDate?: { gte?: Date; lte?: Date } } = {};

    if (options.startDate || options.endDate) {
      expenseDateFilter.expenseDate = {};
      incomeDateFilter.incomeDate = {};

      if (options.startDate) {
        expenseDateFilter.expenseDate.gte = new Date(options.startDate);
        incomeDateFilter.incomeDate.gte = new Date(options.startDate);
      }
      if (options.endDate) {
        expenseDateFilter.expenseDate.lte = new Date(options.endDate);
        incomeDateFilter.incomeDate.lte = new Date(options.endDate);
      }
    }

    // Fetch expenses and income
    const [expenses, incomes] = await Promise.all([
      this.prisma.expense.findMany({
        where: {
          userId,
          deletedAt: null,
          ...expenseDateFilter,
        },
        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
      }),
      this.prisma.income.findMany({
        where: {
          userId,
          deletedAt: null,
          ...incomeDateFilter,
        },
        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    // Combine and sort transactions
    const transactions = [
      ...expenses.map((exp) => ({
        id: exp.id,
        type: 'expense' as const,
        description: exp.description || 'No description',
        amount: Number(exp.amount),
        currency: exp.currency,
        date: exp.expenseDate,
        category: exp.category
          ? {
              name: exp.category.name,
            }
          : undefined,
      })),
      ...incomes.map((inc) => ({
        id: inc.id,
        type: 'income' as const,
        description: inc.description || 'No description',
        amount: Number(inc.amount),
        currency: inc.currency,
        date: inc.incomeDate,
        category: inc.category
          ? {
              name: inc.category.name,
            }
          : undefined,
      })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    // Calculate summary
    const totalIncome = incomes.reduce(
      (sum, inc) => sum + Number(inc.amount),
      0,
    );
    const totalExpenses = expenses.reduce(
      (sum, exp) => sum + Number(exp.amount),
      0,
    );

    const exportData: TransactionExportData = {
      transactions,
      summary: {
        totalIncome,
        totalExpenses,
        netSavings: totalIncome - totalExpenses,
      },
    };

    // Generate PDF
    return await this.pdfGenerator.generateTransactionReport(exportData);
  }

  /**
   * Get file path for download
   */
  getFilePath(filename: string): string {
    return this.pdfGenerator.getFilePath(filename);
  }
}
