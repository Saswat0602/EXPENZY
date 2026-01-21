import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateRecurringExpenseDto,
  RecurringFrequency,
} from './dto/create-recurring-expense.dto';
import { UpdateRecurringExpenseDto } from './dto/update-recurring-expense.dto';

@Injectable()
export class RecurringExpensesService {
  private readonly logger = new Logger(RecurringExpensesService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRecurringExpenseDto, userId: string) {
    const startDate = new Date(dto.startDate);
    const nextOccurrence = this.calculateNextOccurrence(
      startDate,
      dto.frequency,
      dto.interval || 1,
      dto.dayOfWeek,
      dto.dayOfMonth,
    );

    return this.prisma.recurringPattern.create({
      data: {
        userId,
        frequency: dto.frequency,
        interval: dto.interval || 1,
        dayOfWeek: dto.dayOfWeek,
        dayOfMonth: dto.dayOfMonth,
        startDate,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        nextOccurrence,
        isActive: true,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.recurringPattern.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        expenses: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            expenseDate: 'desc',
          },
          take: 5,
        },
      },
      orderBy: {
        nextOccurrence: 'asc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const pattern = await this.prisma.recurringPattern.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        expenses: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            expenseDate: 'desc',
          },
        },
      },
    });

    if (!pattern) {
      throw new NotFoundException(`Recurring pattern with ID ${id} not found`);
    }

    return pattern;
  }

  async update(id: string, dto: UpdateRecurringExpenseDto, userId: string) {
    const pattern = await this.prisma.recurringPattern.findUnique({
      where: { id },
    });

    if (!pattern) {
      throw new NotFoundException(`Recurring pattern with ID ${id} not found`);
    }

    if (pattern.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this recurring pattern',
      );
    }

    const updateData: Record<string, unknown> = {};

    if (dto.frequency !== undefined) updateData.frequency = dto.frequency;
    if (dto.interval !== undefined) updateData.interval = dto.interval;
    if (dto.dayOfWeek !== undefined) updateData.dayOfWeek = dto.dayOfWeek;
    if (dto.dayOfMonth !== undefined) updateData.dayOfMonth = dto.dayOfMonth;
    if (dto.startDate !== undefined)
      updateData.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined)
      updateData.endDate = dto.endDate ? new Date(dto.endDate) : null;

    // Recalculate next occurrence if frequency or interval changed
    if (dto.frequency || dto.interval || dto.dayOfWeek || dto.dayOfMonth) {
      const nextOccurrence = this.calculateNextOccurrence(
        dto.startDate ? new Date(dto.startDate) : pattern.startDate,
        (dto.frequency as RecurringFrequency) || pattern.frequency,
        dto.interval || pattern.interval,
        dto.dayOfWeek ?? pattern.dayOfWeek ?? undefined,
        dto.dayOfMonth ?? pattern.dayOfMonth ?? undefined,
      );
      updateData.nextOccurrence = nextOccurrence;
    }

    return this.prisma.recurringPattern.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string, userId: string) {
    const pattern = await this.prisma.recurringPattern.findUnique({
      where: { id },
    });

    if (!pattern) {
      throw new NotFoundException(`Recurring pattern with ID ${id} not found`);
    }

    if (pattern.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this recurring pattern',
      );
    }

    // Soft delete by setting isActive to false
    return this.prisma.recurringPattern.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }

  /**
   * Process all active recurring patterns and create expenses for due dates
   * This method is called by the cron job
   */
  async processRecurringExpenses(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const duePatterns = await this.prisma.recurringPattern.findMany({
      where: {
        isActive: true,
        nextOccurrence: {
          lte: today,
        },
        OR: [
          { endDate: null },
          {
            endDate: {
              gte: today,
            },
          },
        ],
      },
      include: {
        expenses: {
          where: {
            isRecurring: true,
          },
          orderBy: {
            expenseDate: 'desc',
          },
          take: 1,
        },
      },
    });

    this.logger.log(
      `Found ${duePatterns.length} recurring patterns to process`,
    );

    let createdCount = 0;

    for (const pattern of duePatterns) {
      try {
        // Get the last expense created from this pattern to copy its details
        const lastExpense = pattern.expenses[0];

        if (!lastExpense) {
          this.logger.warn(
            `No template expense found for pattern ${pattern.id}, skipping`,
          );
          continue;
        }

        // Create new expense based on the pattern
        await this.prisma.expense.create({
          data: {
            userId: pattern.userId,
            categoryId: lastExpense.categoryId,
            amount: lastExpense.amount,
            currency: lastExpense.currency,
            description: lastExpense.description,
            expenseDate: pattern.nextOccurrence,
            paymentMethod: lastExpense.paymentMethod,
            notes: lastExpense.notes,
            isRecurring: true,
            recurringPatternId: pattern.id,
          },
        });

        // Calculate next occurrence
        const nextOccurrence = this.calculateNextOccurrence(
          pattern.nextOccurrence,
          pattern.frequency,
          pattern.interval,
          pattern.dayOfWeek ?? undefined,
          pattern.dayOfMonth ?? undefined,
        );

        // Update pattern with next occurrence
        await this.prisma.recurringPattern.update({
          where: { id: pattern.id },
          data: {
            nextOccurrence,
          },
        });

        createdCount++;
        this.logger.log(
          `Created recurring expense for pattern ${pattern.id}, next occurrence: ${nextOccurrence.toISOString()}`,
        );
      } catch (error) {
        this.logger.error(
          `Error processing recurring pattern ${pattern.id}:`,
          error,
        );
      }
    }

    this.logger.log(`Created ${createdCount} recurring expenses`);
    return createdCount;
  }

  /**
   * Calculate the next occurrence date based on frequency and interval
   */
  private calculateNextOccurrence(
    fromDate: Date,
    frequency: string,
    interval: number,
    dayOfWeek?: number,
    dayOfMonth?: number,
  ): Date {
    const next = new Date(fromDate);

    switch (frequency as RecurringFrequency) {
      case RecurringFrequency.DAILY:
        next.setDate(next.getDate() + interval);
        break;

      case RecurringFrequency.WEEKLY:
        if (dayOfWeek !== undefined) {
          // Find next occurrence of the specified day of week
          const currentDay = next.getDay();
          const daysUntilTarget =
            (dayOfWeek - currentDay + 7 * interval) % (7 * interval);
          next.setDate(next.getDate() + daysUntilTarget);
        } else {
          next.setDate(next.getDate() + 7 * interval);
        }
        break;

      case RecurringFrequency.MONTHLY:
        if (dayOfMonth !== undefined) {
          next.setMonth(next.getMonth() + interval);
          next.setDate(Math.min(dayOfMonth, this.getDaysInMonth(next)));
        } else {
          next.setMonth(next.getMonth() + interval);
        }
        break;

      case RecurringFrequency.YEARLY:
        next.setFullYear(next.getFullYear() + interval);
        break;

      default:
        throw new Error(`Unknown frequency: ${frequency}`);
    }

    return next;
  }

  /**
   * Get number of days in a month
   */
  private getDaysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }
}
