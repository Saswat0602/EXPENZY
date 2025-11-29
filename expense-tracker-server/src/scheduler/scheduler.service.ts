import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Process recurring expenses - runs daily at 1:00 AM
   * Creates new expense entries for recurring patterns that are due
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async processRecurringExpenses() {
    this.logger.log('Processing recurring expenses...');

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find all active recurring expenses
      const recurringExpenses = await this.prisma.expense.findMany({
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

      for (const expense of recurringExpenses) {
        if (!expense.recurringPattern) continue;

        const pattern = expense.recurringPattern;
        const shouldCreate = this.shouldCreateRecurringEntry(
          pattern,
          expense.expenseDate,
          today,
        );

        if (shouldCreate) {
          // Create new expense entry
          await this.prisma.expense.create({
            data: {
              userId: expense.userId,
              categoryId: expense.categoryId,
              amount: expense.amount,
              currency: expense.currency,
              description: expense.description,
              expenseDate: today,
              paymentMethod: expense.paymentMethod,
              isRecurring: true,
              recurringPatternId: expense.recurringPatternId,
              notes: `Auto-created from recurring pattern`,
            },
          });

          createdCount++;
        }
      }

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
   * Update subscription billing dates - runs daily at 2:00 AM
   * Updates next billing date for subscriptions that have been billed
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async updateSubscriptionBillingDates() {
    this.logger.log('Updating subscription billing dates...');

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find subscriptions with billing date today or in the past
      const dueSubscriptions = await this.prisma.subscription.findMany({
        where: {
          isActive: true,
          nextBillingDate: { lte: today },
        },
      });

      let updatedCount = 0;

      for (const subscription of dueSubscriptions) {
        const nextBillingDate = this.calculateNextBillingDate(
          subscription.nextBillingDate,
          subscription.billingCycle,
        );

        await this.prisma.subscription.update({
          where: { id: subscription.id },
          data: { nextBillingDate },
        });

        updatedCount++;
      }

      this.logger.log(`Updated ${updatedCount} subscription billing dates`);
    } catch (error) {
      this.logger.error('Error updating subscription billing dates:', error);
    }
  }

  /**
   * Send subscription reminders - runs daily at 9:00 AM
   * Creates notifications for upcoming subscription renewals
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendSubscriptionReminders() {
    this.logger.log('Sending subscription reminders...');

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find subscriptions due in the next 3 days
      const upcomingSubscriptions = await this.prisma.subscription.findMany({
        where: {
          isActive: true,
          nextBillingDate: {
            gte: today,
            lte: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
          },
          reminderDays: { gte: 0 },
        },
        include: { category: true },
      });

      let notificationCount = 0;

      for (const subscription of upcomingSubscriptions) {
        const daysUntilBilling = Math.ceil(
          (subscription.nextBillingDate.getTime() - today.getTime()) /
            (1000 * 60 * 60 * 24),
        );

        if (
          subscription.reminderDays &&
          daysUntilBilling <= subscription.reminderDays
        ) {
          // Create notification
          await this.prisma.notification.create({
            data: {
              userId: subscription.userId,
              type: 'subscription_reminder',
              title: 'Upcoming Subscription Renewal',
              message: `Your ${subscription.name} subscription will renew in ${daysUntilBilling} day(s) for ${subscription.currency} ${Number(subscription.amount)}`,
              relatedEntityType: 'subscription',
              relatedEntityId: subscription.id,
              priority: 'normal',
              category: 'subscription',
            },
          });

          notificationCount++;
        }
      }

      this.logger.log(`Created ${notificationCount} subscription reminders`);
    } catch (error) {
      this.logger.error('Error sending subscription reminders:', error);
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

  /**
   * Helper method to calculate next billing date
   */
  private calculateNextBillingDate(
    currentDate: Date,
    billingCycle: string,
  ): Date {
    const nextDate = new Date(currentDate);

    switch (billingCycle) {
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }

    return nextDate;
  }
}
