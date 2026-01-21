import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../../prisma/prisma.service';
import {
  GroupExportData,
  ExpenseExportData,
  TransactionExportData,
} from '../interfaces/export-data.interface';
import { generateExpenseReportHTML } from '../templates/expense-report.template';

@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name);
  private readonly uploadsDir = path.join(process.cwd(), 'uploads', 'exports');

  constructor(private readonly prisma: PrismaService) {
    // Ensure uploads directory exists
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  /**
   * Get category color from database
   */
  private async getCategoryColor(categoryName: string): Promise<string> {
    try {
      const category = await this.prisma.category.findFirst({
        where: {
          name: categoryName.toLowerCase().replace(/\s+/g, '_'),
        },
      });

      if (category?.color) {
        const { getTailwindColor } = await import('../utils/color-utils.js');
        return getTailwindColor(category.color);
      }

      // Fallback to default gray
      return '#6b7280';
    } catch {
      this.logger.warn(`Could not fetch color for category: ${categoryName}`);
      return '#6b7280';
    }
  }

  /**
   * Format amount to 1 decimal place
   */
  private formatAmount(amount: number): string {
    return amount.toFixed(1);
  }

  /**
   * Generate PDF for expense report with professional design
   */
  async generateExpenseReport(data: ExpenseExportData): Promise<string> {
    const startTime = Date.now();
    const date = new Date().toISOString().split('T')[0];
    const filename = `expense-report-${date}-${Date.now()}.pdf`;
    const filepath = path.join(this.uploadsDir, filename);

    try {
      // Calculate category distribution
      const categoryMap = new Map<string, number>();
      data.expenses.forEach((exp) => {
        const category = exp.category?.name || 'Uncategorized';
        categoryMap.set(
          category,
          (categoryMap.get(category) || 0) + exp.amount,
        );
      });

      const totalAmount = data.summary.totalAmount;
      const categoryEntries = Array.from(categoryMap.entries())
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: (amount / totalAmount) * 100,
        }))
        .sort((a, b) => b.amount - a.amount);

      // Fetch colors for all categories
      const categoryDistribution = await Promise.all(
        categoryEntries.map(async (entry) => ({
          ...entry,
          color: await this.getCategoryColor(entry.category),
        })),
      );

      // Prepare data for template
      const templateData = {
        title: 'EXPENSE REPORT',
        subtitle: 'Monthly Report',
        dateRange:
          data.expenses.length > 0
            ? `${new Date(data.expenses[data.expenses.length - 1].expenseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} - ${new Date(data.expenses[0].expenseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
            : 'No data',
        generatedDate: new Date().toLocaleString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        summaryCards: [
          {
            label: 'TOTAL SPENDING',
            value: `Rs ${this.formatAmount(data.summary.totalAmount)}`,
          },
          {
            label: 'TRANSACTIONS',
            value: data.summary.totalExpenses.toString(),
          },
          {
            label: 'AVERAGE PER DAY',
            value: `Rs ${this.formatAmount(data.summary.averageExpense)}`,
          },
          {
            label: 'TOP CATEGORY',
            value: categoryDistribution[0]?.category || 'N/A',
          },
        ],
        transactions: data.expenses.map((exp, index) => ({
          index: index + 1,
          date: new Date(exp.expenseDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: '2-digit',
          }),
          category: exp.category?.name || 'Uncategorized',
          description: exp.description,
          amount: exp.amount,
        })),
        categoryDistribution,
      };

      // Generate HTML
      const html = generateExpenseReportHTML(templateData);

      // Launch puppeteer and generate PDF
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      await page.pdf({
        path: filepath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        },
        preferCSSPageSize: true,
      });

      await browser.close();

      const duration = Date.now() - startTime;
      this.logger.log(`Generated expense report: ${filename} (${duration}ms)`);
      return filename;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error generating expense report: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Generate PDF for transaction report
   */
  async generateTransactionReport(
    data: TransactionExportData,
  ): Promise<string> {
    const startTime = Date.now();
    const date = new Date().toISOString().split('T')[0];
    const filename = `transaction-report-${date}-${Date.now()}.pdf`;
    const filepath = path.join(this.uploadsDir, filename);

    try {
      // Calculate category distribution for expenses only
      const categoryMap = new Map<string, number>();
      data.transactions
        .filter((tx) => tx.type === 'expense')
        .forEach((tx) => {
          const category = tx.category?.name || 'Uncategorized';
          categoryMap.set(
            category,
            (categoryMap.get(category) || 0) + tx.amount,
          );
        });

      const totalExpenses = data.summary.totalExpenses;
      const categoryEntries = Array.from(categoryMap.entries())
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount);

      // Fetch colors for all categories
      const categoryDistribution = await Promise.all(
        categoryEntries.map(async (entry) => ({
          ...entry,
          color: await this.getCategoryColor(entry.category),
        })),
      );

      // Prepare data for template
      const templateData = {
        title: 'TRANSACTION REPORT',
        subtitle: 'Income & Expenses',
        dateRange:
          data.transactions.length > 0
            ? `${new Date(data.transactions[data.transactions.length - 1].date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} - ${new Date(data.transactions[0].date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
            : 'No data',
        generatedDate: new Date().toLocaleString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        summaryCards: [
          {
            label: 'TOTAL INCOME',
            value: `Rs ${this.formatAmount(data.summary.totalIncome)}`,
          },
          {
            label: 'TOTAL EXPENSES',
            value: `Rs ${this.formatAmount(data.summary.totalExpenses)}`,
          },
          {
            label: 'NET SAVINGS',
            value: `Rs ${this.formatAmount(data.summary.netSavings)}`,
          },
          {
            label: 'TRANSACTIONS',
            value: data.transactions.length.toString(),
          },
        ],
        transactions: data.transactions.map((tx, index) => ({
          index: index + 1,
          date: new Date(tx.date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: '2-digit',
          }),
          category: tx.category?.name || 'Uncategorized',
          description: tx.description,
          amount: tx.amount,
        })),
        categoryDistribution,
      };

      // Generate HTML
      const html = generateExpenseReportHTML(templateData);

      // Launch puppeteer and generate PDF
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      await page.pdf({
        path: filepath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        },
        preferCSSPageSize: true,
      });

      await browser.close();

      const duration = Date.now() - startTime;
      this.logger.log(
        `Generated transaction report: ${filename} (${duration}ms)`,
      );
      return filename;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error generating transaction report: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Generate PDF for group report with simplified debts
   */
  async generateGroupReport(data: GroupExportData): Promise<string> {
    const startTime = Date.now();
    const date = new Date().toISOString().split('T')[0];
    const filename = `group-${data.group.name.replace(/\s+/g, '-')}-${date}-${Date.now()}.pdf`;
    const filepath = path.join(this.uploadsDir, filename);

    try {
      // Member colors
      const memberColors = [
        '#7c3aed', // purple
        '#10b981', // green
        '#dc2626', // red
        '#f59e0b', // amber
        '#ec4899', // pink
        '#8b5cf6', // violet
      ];

      // Create user ID to name and color mapping
      const userMap = new Map<string, { name: string; color: string }>();
      let colorIndex = 0;

      data.expenses.forEach((exp) => {
        if (!userMap.has(exp.paidBy.id)) {
          userMap.set(exp.paidBy.id, {
            name: exp.paidBy.name,
            color: memberColors[colorIndex % memberColors.length],
          });
          colorIndex++;
        }
        exp.splits.forEach((split) => {
          if (!userMap.has(split.user.id)) {
            userMap.set(split.user.id, {
              name: split.user.name,
              color: memberColors[colorIndex % memberColors.length],
            });
            colorIndex++;
          }
        });
      });

      // Calculate member balances
      const balanceMap = new Map<
        string,
        { totalSpent: number; totalOwed: number }
      >();

      data.expenses.forEach((exp) => {
        // Track what each person paid
        if (!balanceMap.has(exp.paidBy.id)) {
          balanceMap.set(exp.paidBy.id, { totalSpent: 0, totalOwed: 0 });
        }
        balanceMap.get(exp.paidBy.id)!.totalSpent += exp.amount;

        // Track what each person owes
        exp.splits.forEach((split) => {
          if (!balanceMap.has(split.user.id)) {
            balanceMap.set(split.user.id, { totalSpent: 0, totalOwed: 0 });
          }
          balanceMap.get(split.user.id)!.totalOwed += split.amountOwed;
        });
      });

      // Format member balances
      const memberBalances = Array.from(balanceMap.entries())
        .map(([userId, stats]) => {
          const user = userMap.get(userId)!;
          return {
            name: user.name,
            totalSpent: stats.totalSpent,
            totalOwed: stats.totalOwed,
            balance: stats.totalSpent - stats.totalOwed,
            color: user.color,
          };
        })
        .sort((a, b) => b.balance - a.balance);

      // Calculate category distribution
      const categoryMap = new Map<string, number>();
      data.expenses.forEach((exp) => {
        const category = exp.category?.name || 'Uncategorized';
        categoryMap.set(
          category,
          (categoryMap.get(category) || 0) + exp.amount,
        );
      });

      const totalAmount = data.statistics?.totalAmount || 0;
      const categoryEntries = Array.from(categoryMap.entries())
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount);

      // Fetch colors for all categories
      const categoryDistribution = await Promise.all(
        categoryEntries.map(async (entry) => ({
          ...entry,
          color: await this.getCategoryColor(entry.category),
        })),
      );

      // Prepare data for template
      const templateData = {
        title: `${data.group.name.toUpperCase()} - GROUP REPORT`,
        subtitle: `${data.group.memberCount} Members • ${data.group.currency}`,
        dateRange:
          data.expenses.length > 0
            ? `${new Date(data.expenses[0].expenseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} - ${new Date(data.expenses[data.expenses.length - 1].expenseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
            : 'No data',
        generatedDate: new Date().toLocaleString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        groupStats: {
          totalSpending: `${data.group.currency} ${this.formatAmount(totalAmount)}`,
          totalExpenses: data.statistics?.totalExpenses || 0,
          totalMembers: data.group.memberCount,
          averagePerMember: `${data.group.currency} ${this.formatAmount(totalAmount / data.group.memberCount)}`,
        },
        memberBalances,
        transactions: data.expenses.map((exp, index) => ({
          index: index + 1,
          date: new Date(exp.expenseDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: '2-digit',
          }),
          category: exp.category?.name || 'Uncategorized',
          description: exp.description,
          paidBy: exp.paidBy.name,
          amount: exp.amount,
        })),
        categoryDistribution,
      };

      // Generate HTML using group template
      const groupTemplateModule = (await import(
        path.join(__dirname, '../templates/group-report.template.js')
      )) as { generateGroupReportHTML: (data: typeof templateData) => string };
      const html = groupTemplateModule.generateGroupReportHTML(templateData);

      // Launch puppeteer and generate PDF
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      await page.pdf({
        path: filepath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        },
        preferCSSPageSize: true,
      });

      await browser.close();

      const duration = Date.now() - startTime;
      this.logger.log(`Generated group report: ${filename} (${duration}ms)`);
      return filename;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error generating group report: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Get file path for download
   */
  getFilePath(filename: string): string {
    return path.join(this.uploadsDir, filename);
  }
}
