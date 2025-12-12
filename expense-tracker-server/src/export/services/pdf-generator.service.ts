import { Injectable, Logger } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import {
  GroupExportData,
  ExpenseExportData,
  TransactionExportData,
} from '../interfaces/export-data.interface';

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
   * Generate PDF for group report
   */
  async generateGroupReport(data: GroupExportData): Promise<string> {
    const date = new Date().toISOString().split('T')[0];
    const filename = `group-${data.group.name.replace(/\s+/g, '-')}-${date}-${Date.now()}.pdf`;
    const filepath = path.join(this.uploadsDir, filename);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filepath);

        doc.pipe(stream);

        // Header
        this.addHeader(doc, 'Group Expense Report');
        doc.moveDown();

        // Group Information
        doc.fontSize(16).text('Group Information', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12);
        doc.text(`Name: ${data.group.name}`);
        if (data.group.description) {
          doc.text(`Description: ${data.group.description}`);
        }
        doc.text(`Currency: ${data.group.currency}`);
        doc.text(`Members: ${data.group.memberCount}`);
        doc.moveDown();

        // Statistics
        if (data.statistics) {
          doc.fontSize(16).text('Summary Statistics', { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(12);
          doc.text(`Total Expenses: ${data.statistics.totalExpenses}`);
          doc.text(
            `Total Amount: ${data.group.currency} ${data.statistics.totalAmount.toFixed(2)}`,
          );
          doc.text(
            `Average Expense: ${data.group.currency} ${data.statistics.averageExpense.toFixed(2)}`,
          );
          doc.moveDown();

          // Category Breakdown
          if (Object.keys(data.statistics.categoryBreakdown).length > 0) {
            doc.fontSize(14).text('Category Breakdown:', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(11);
            Object.entries(data.statistics.categoryBreakdown).forEach(
              ([category, amount]) => {
                doc.text(
                  `  • ${category}: ${data.group.currency} ${amount.toFixed(2)}`,
                );
              },
            );
            doc.moveDown();
          }
        }

        // Expenses List
        if (data.expenses.length > 0) {
          doc.addPage();
          doc.fontSize(16).text('Expense Details', { underline: true });
          doc.moveDown();

          data.expenses.forEach((expense, index) => {
            if (index > 0 && index % 5 === 0) {
              doc.addPage();
            }

            doc.fontSize(12).font('Helvetica-Bold');
            doc.text(`${expense.description}`, { continued: true });
            doc.font('Helvetica');
            doc.text(` - ${expense.currency} ${expense.amount.toFixed(2)}`, {
              align: 'left',
            });

            doc.fontSize(10);
            doc.text(
              `Date: ${new Date(expense.expenseDate).toLocaleDateString()}`,
            );
            doc.text(`Paid by: ${expense.paidBy.name}`);
            if (expense.category) {
              doc.text(`Category: ${expense.category.name}`);
            }

            if (expense.splits.length > 0) {
              doc.text('Split:');
              expense.splits.forEach((split) => {
                doc.text(
                  `  • ${split.user.name}: ${expense.currency} ${split.amountOwed.toFixed(2)}`,
                );
              });
            }

            doc.moveDown();
          });
        }

        // Footer
        this.addFooter(doc);

        doc.end();

        stream.on('finish', () => {
          this.logger.log(`Generated group report: ${filename}`);
          resolve(filename);
        });

        stream.on('error', reject);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Error generating group report: ${errorMessage}`);
        reject(error instanceof Error ? error : new Error(errorMessage));
      }
    });
  }

  /**
   * Generate PDF for expense report
   */
  async generateExpenseReport(data: ExpenseExportData): Promise<string> {
    const date = new Date().toISOString().split('T')[0];
    const filename = `expenses-${date}-${Date.now()}.pdf`;
    const filepath = path.join(this.uploadsDir, filename);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filepath);

        doc.pipe(stream);

        // Header
        this.addHeader(doc, 'Personal Expense Report');
        doc.moveDown();

        // Summary
        doc.fontSize(16).text('Summary', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12);
        doc.text(`Total Expenses: ${data.summary.totalExpenses}`);
        doc.text(`Total Amount: $${data.summary.totalAmount.toFixed(2)}`);
        doc.text(`Average Expense: $${data.summary.averageExpense.toFixed(2)}`);
        doc.moveDown(2);

        // Expenses List
        doc.fontSize(16).text('Expense Details', { underline: true });
        doc.moveDown();

        data.expenses.forEach((expense, index) => {
          if (index > 0 && index % 8 === 0) {
            doc.addPage();
          }

          doc.fontSize(12).font('Helvetica-Bold');
          doc.text(expense.description, { continued: true });
          doc.font('Helvetica');
          doc.text(` - $${expense.amount.toFixed(2)}`);

          doc.fontSize(10);
          doc.text(
            `Date: ${new Date(expense.expenseDate).toLocaleDateString()}`,
          );
          if (expense.category) {
            doc.text(`Category: ${expense.category.name}`);
          }
          doc.moveDown(0.5);
        });

        // Footer
        this.addFooter(doc);

        doc.end();

        stream.on('finish', () => {
          this.logger.log(`Generated expense report: ${filename}`);
          resolve(filename);
        });

        stream.on('error', reject);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Error generating expense report: ${errorMessage}`);
        reject(error instanceof Error ? error : new Error(errorMessage));
      }
    });
  }

  /**
   * Generate PDF for transaction report
   */
  async generateTransactionReport(
    data: TransactionExportData,
  ): Promise<string> {
    const date = new Date().toISOString().split('T')[0];
    const filename = `transactions-${date}-${Date.now()}.pdf`;
    const filepath = path.join(this.uploadsDir, filename);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filepath);

        doc.pipe(stream);

        // Header
        this.addHeader(doc, 'Transaction Report');
        doc.moveDown();

        // Summary
        doc.fontSize(16).text('Summary', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12);
        doc
          .fillColor('green')
          .text(`Total Income: $${data.summary.totalIncome.toFixed(2)}`);
        doc
          .fillColor('red')
          .text(`Total Expenses: $${data.summary.totalExpenses.toFixed(2)}`);
        doc
          .fillColor(data.summary.netSavings >= 0 ? 'green' : 'red')
          .text(`Net Savings: $${data.summary.netSavings.toFixed(2)}`);
        doc.fillColor('black'); // Reset to black
        doc.moveDown(2);

        // Transactions List
        doc.fontSize(16).text('Transaction Details', { underline: true });
        doc.moveDown();

        data.transactions.forEach((transaction, index) => {
          if (index > 0 && index % 8 === 0) {
            doc.addPage();
          }

          const isIncome = transaction.type === 'income';
          doc.fontSize(12).font('Helvetica-Bold');
          doc.fillColor(isIncome ? 'green' : 'red');
          doc.text(
            `${isIncome ? '+ ' : '- '}$${transaction.amount.toFixed(2)}`,
            { continued: true },
          );
          doc.fillColor('black').font('Helvetica');
          doc.text(` - ${transaction.description}`);

          doc.fontSize(10);
          doc.text(`Date: ${new Date(transaction.date).toLocaleDateString()}`);
          if (transaction.category) {
            doc.text(`Category: ${transaction.category.name}`);
          }
          doc.moveDown(0.5);
        });

        // Footer
        this.addFooter(doc);

        doc.end();

        stream.on('finish', () => {
          this.logger.log(`Generated transaction report: ${filename}`);
          resolve(filename);
        });

        stream.on('error', reject);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          `Error generating transaction report: ${errorMessage}`,
        );
        reject(error instanceof Error ? error : new Error(errorMessage));
      }
    });
  }

  /**
   * Get file path for download
   */
  getFilePath(filename: string): string {
    return path.join(this.uploadsDir, filename);
  }

  /**
   * Add header to PDF
   */
  private addHeader(doc: PDFKit.PDFDocument, title: string): void {
    doc.fontSize(24).font('Helvetica-Bold').text(title, { align: 'center' });
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Generated on: ${new Date().toLocaleString()}`, {
        align: 'center',
      });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();
  }

  /**
   * Add footer to PDF
   */
  private addFooter(doc: PDFKit.PDFDocument): void {
    const bottom = doc.page.height - 50;
    doc
      .fontSize(10)
      .text('Generated by EXPENZY', 50, bottom, { align: 'center' });
  }
}
