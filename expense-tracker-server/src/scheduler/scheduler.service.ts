import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { RecurringExpensesService } from '../expenses/recurring-expenses.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private recurringExpensesService: RecurringExpensesService,
  ) { }

  /**
   * Process recurring expenses - runs daily at 1:00 AM
   * Creates new expense entries for recurring patterns that are due
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async processRecurringExpenses() {
    this.logger.log('Processing recurring expenses...');

    try {
      const createdCount =
        await this.recurringExpensesService.processRecurringExpenses();
      this.logger.log(`Created ${createdCount} recurring expense entries`);
    } catch (error) {
      this.logger.error('Error processing recurring expenses:', error);
    }
  }

  /**
   * Process recurring income - runs daily at 1:00 AM
   * Creates new income entries for recurring patterns that are due
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async processRecurringIncome() {
    this.logger.log('Processing recurring income...');

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find all active recurring income
      const recurringIncomes = await this.prisma.income.findMany({
        where: {
          isRecurring: true,
          deletedAt: null,
          recurringPattern: {
            isActive: true,
            OR: [{ endDate: null }, { endDate: { gte: today } }],
          },
        },
        include: {
          recurringPattern: true,
        },
      });

      let createdCount = 0;

      for (const income of recurringIncomes) {
        if (!income.recurringPattern) continue;

        const pattern = income.recurringPattern;
        const shouldCreate = this.shouldCreateRecurringEntry(
          pattern,
          income.incomeDate,
          today,
        );

        if (shouldCreate) {
          // Create new income entry
          await this.prisma.income.create({
            data: {
              userId: income.userId,
              categoryId: income.categoryId,
              amount: income.amount,
              currency: income.currency,
              source: income.source,
              description: income.description,
              incomeDate: today,
              paymentMethod: income.paymentMethod,
              isRecurring: true,
              recurringPatternId: income.recurringPatternId,
              notes: `Auto-created from recurring pattern`,
            },
          });

          createdCount++;
        }
      }

      this.logger.log(`Created ${createdCount} recurring income entries`);
    } catch (error) {
      this.logger.error('Error processing recurring income:', error);
    }
  }

  /**
   * Send recurring expense reminders - runs daily at 2:00 AM
   * Creates notifications for upcoming recurring expenses
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async sendRecurringExpenseReminders() {
    this.logger.log('Sending recurring expense reminders...');

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find recurring expenses due in the next 3 days
      const upcomingRecurringExpenses = await this.prisma.expense.findMany({
        where: {
          isRecurring: true,
          deletedAt: null,
          recurringPattern: {
            isActive: true,
            nextOccurrence: {
              gte: today,
              lte: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
            },
          },
        },
        include: {
          recurringPattern: true,
          category: true,
          user: true,
        },
      });

      let notificationCount = 0;

      for (const expense of upcomingRecurringExpenses) {
        if (!expense.recurringPattern) continue;

        const daysUntilDue = Math.ceil(
          (expense.recurringPattern.nextOccurrence.getTime() -
            today.getTime()) /
          (1000 * 60 * 60 * 24),
        );

        // Create notification
        await this.prisma.notification.create({
          data: {
            userId: expense.userId,
            type: 'recurring_expense_reminder',
            title: 'Upcoming Recurring Expense',
            message: `Your recurring expense "${expense.description}" is due in ${daysUntilDue} day(s) for ${expense.currency} ${Number(expense.amount)}`,
            relatedEntityType: 'expense',
            relatedEntityId: expense.id,
            priority: 'normal',
            category: 'expense',
          },
        });

        notificationCount++;
      }

      this.logger.log(
        `Created ${notificationCount} recurring expense reminders`,
      );
    } catch (error) {
      this.logger.error('Error sending recurring expense reminders:', error);
    }
  }



  /**
   * Check budget alerts - runs every 6 hours
   * Creates notifications when budgets exceed threshold
   */
  @Cron(CronExpression.EVERY_6_HOURS)
  async checkBudgetAlerts() {
    this.logger.log('Checking budget alerts...');

    try {
      const activeBudgets = await this.prisma.budget.findMany({
        where: {
          isActive: true,
          alertThreshold: { not: null },
        },
        include: { category: true },
      });

      let alertCount = 0;

      for (const budget of activeBudgets) {
        const utilization =
          Number(budget.amount) > 0
            ? (Number(budget.spentAmount) / Number(budget.amount)) * 100
            : 0;

        const threshold = Number(budget.alertThreshold || 80);

        if (utilization >= threshold) {
          // Check if alert already sent recently (within last 24 hours)
          const recentAlert = await this.prisma.notification.findFirst({
            where: {
              userId: budget.userId,
              type: 'budget_alert',
              relatedEntityId: budget.id,
              createdAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
              },
            },
          });

          if (!recentAlert) {
            await this.prisma.notification.create({
              data: {
                userId: budget.userId,
                type: 'budget_alert',
                title: 'Budget Alert',
                message: `Your ${budget.category?.name || 'budget'} has reached ${utilization.toFixed(1)}% of the allocated amount`,
                relatedEntityType: 'budget',
                relatedEntityId: budget.id,
                priority: utilization >= 100 ? 'high' : 'normal',
                category: 'budget',
              },
            });

            alertCount++;
          }
        }
      }

      this.logger.log(`Created ${alertCount} budget alerts`);
    } catch (error) {
      this.logger.error('Error checking budget alerts:', error);
    }
  }

  /**
   * Helper method to determine if a recurring entry should be created
   */
  private shouldCreateRecurringEntry(
    pattern: {
      frequency: string;
      interval: number;
      dayOfWeek?: number | null;
      dayOfMonth?: number | null;
    },
    lastDate: Date,
    today: Date,
  ): boolean {
    const daysSinceLastEntry = Math.floor(
      (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    switch (pattern.frequency) {
      case 'daily':
        return daysSinceLastEntry >= pattern.interval;

      case 'weekly':
        if (pattern.dayOfWeek !== null && pattern.dayOfWeek !== undefined) {
          return (
            today.getDay() === pattern.dayOfWeek &&
            daysSinceLastEntry >= 7 * pattern.interval
          );
        }
        return daysSinceLastEntry >= 7 * pattern.interval;

      case 'monthly':
        if (pattern.dayOfMonth !== null && pattern.dayOfMonth !== undefined) {
          return (
            today.getDate() === pattern.dayOfMonth &&
            daysSinceLastEntry >= 28 * pattern.interval
          );
        }
        return daysSinceLastEntry >= 30 * pattern.interval;

      case 'yearly':
        return daysSinceLastEntry >= 365 * pattern.interval;

      default:
        return false;
    }
  }


}
