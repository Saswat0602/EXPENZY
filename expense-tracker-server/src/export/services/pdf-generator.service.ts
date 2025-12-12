import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
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

  constructor() {
    // Ensure uploads directory exists
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  /**
   * Category colors matching the design
   */
  private readonly categoryColors: Record<string, string> = {
    fuel: '#f59e0b',
    food: '#ef4444',
    shopping: '#ec4899',
    health: '#10b981',
    transport: '#3b82f6',
    entertainment: '#8b5cf6',
    utilities: '#6366f1',
    groceries: '#14b8a6',
    beverages: '#f97316',
    default: '#6b7280',
  };

  private getCategoryColor(category: string): string {
    const key = category.toLowerCase();
    return this.categoryColors[key] || this.categoryColors.default;
  }

  /**
   * Generate PDF for expense report with professional design
   */
  async generateExpenseReport(data: ExpenseExportData): Promise<string> {
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
      const categoryDistribution = Array.from(categoryMap.entries())
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: (amount / totalAmount) * 100,
          color: this.getCategoryColor(category),
        }))
        .sort((a, b) => b.amount - a.amount);

      // Prepare data for template
      const templateData = {
        title: 'EXPENSE REPORT',
        subtitle: 'Monthly Report',
        dateRange:
          data.expenses.length > 0
            ? `${new Date(data.expenses[data.expenses.length - 1].expenseDate).toLocaleDateString()} - ${new Date(data.expenses[0].expenseDate).toLocaleDateString()}`
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
            value: `Rs ${data.summary.totalAmount.toLocaleString()}`,
          },
          {
            label: 'TRANSACTIONS',
            value: data.summary.totalExpenses.toString(),
          },
          {
            label: 'AVERAGE PER DAY',
            value: `Rs ${Math.round(data.summary.averageExpense).toLocaleString()}`,
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
      });

      await browser.close();

      this.logger.log(`Generated expense report: ${filename}`);
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
      const categoryDistribution = Array.from(categoryMap.entries())
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: (amount / totalExpenses) * 100,
          color: this.getCategoryColor(category),
        }))
        .sort((a, b) => b.amount - a.amount);

      // Prepare data for template
      const templateData = {
        title: 'TRANSACTION REPORT',
        subtitle: 'Income & Expenses',
        dateRange:
          data.transactions.length > 0
            ? `${new Date(data.transactions[data.transactions.length - 1].date).toLocaleDateString()} - ${new Date(data.transactions[0].date).toLocaleDateString()}`
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
            value: `Rs ${data.summary.totalIncome.toLocaleString()}`,
          },
          {
            label: 'TOTAL EXPENSES',
            value: `Rs ${data.summary.totalExpenses.toLocaleString()}`,
          },
          {
            label: 'NET SAVINGS',
            value: `Rs ${data.summary.netSavings.toLocaleString()}`,
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
      });

      await browser.close();

      this.logger.log(`Generated transaction report: ${filename}`);
      return filename;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error generating transaction report: ${errorMessage}`);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  /**
   * Generate PDF for group report
   */
  async generateGroupReport(data: GroupExportData): Promise<string> {
    const date = new Date().toISOString().split('T')[0];
    const filename = `group-${data.group.name.replace(/\s+/g, '-')}-${date}-${Date.now()}.pdf`;
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

      const totalAmount = data.statistics?.totalAmount || 0;
      const categoryDistribution = Array.from(categoryMap.entries())
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: (amount / totalAmount) * 100,
          color: this.getCategoryColor(category),
        }))
        .sort((a, b) => b.amount - a.amount);

      // Prepare data for template
      const templateData = {
        title: `${data.group.name.toUpperCase()} - GROUP REPORT`,
        subtitle: `${data.group.memberCount} Members`,
        dateRange:
          data.expenses.length > 0
            ? `${new Date(data.expenses[data.expenses.length - 1].expenseDate).toLocaleDateString()} - ${new Date(data.expenses[0].expenseDate).toLocaleDateString()}`
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
            value: `${data.group.currency} ${(data.statistics?.totalAmount || 0).toLocaleString()}`,
          },
          {
            label: 'TOTAL EXPENSES',
            value: (data.statistics?.totalExpenses || 0).toString(),
          },
          {
            label: 'AVERAGE EXPENSE',
            value: `${data.group.currency} ${Math.round(data.statistics?.averageExpense || 0).toLocaleString()}`,
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
          description: `${exp.description} (by ${exp.paidBy.name})`,
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
      });

      await browser.close();

      this.logger.log(`Generated group report: ${filename}`);
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
