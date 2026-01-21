import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new reminder
   */
  async create(dto: CreateReminderDto, userId: string) {
    const reminderDate = new Date(dto.reminderDate);

    // Create a notification that will be sent at the reminder date
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type: `${dto.type}_reminder`,
        title: dto.title,
        message: dto.message,
        relatedEntityType: dto.relatedEntityType,
        relatedEntityId: dto.relatedEntityId,
        actionUrl: dto.actionUrl,
        actionLabel: dto.actionLabel,
        category: dto.type,
        priority: 'normal',
        // Set expiresAt to 7 days after reminder date
        expiresAt: new Date(reminderDate.getTime() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    this.logger.log(`Created reminder for user ${userId}: ${dto.title}`);
    return notification;
  }

  /**
   * Find all reminders for a user
   */
  async findAll(userId: string) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        type: {
          endsWith: '_reminder',
        },
        isRead: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Find a specific reminder
   */
  async findOne(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id,
        userId,
        type: {
          endsWith: '_reminder',
        },
      },
    });

    if (!notification) {
      throw new NotFoundException(`Reminder with ID ${id} not found`);
    }

    return notification;
  }

  /**
   * Update a reminder
   */
  async update(id: string, dto: UpdateReminderDto, userId: string) {
    const notification = await this.findOne(id, userId);

    const updateData: Record<string, unknown> = {};

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.message !== undefined) updateData.message = dto.message;
    if (dto.relatedEntityType !== undefined)
      updateData.relatedEntityType = dto.relatedEntityType;
    if (dto.relatedEntityId !== undefined)
      updateData.relatedEntityId = dto.relatedEntityId;
    if (dto.actionUrl !== undefined) updateData.actionUrl = dto.actionUrl;
    if (dto.actionLabel !== undefined) updateData.actionLabel = dto.actionLabel;

    if (dto.reminderDate !== undefined) {
      const reminderDate = new Date(dto.reminderDate);
      updateData.expiresAt = new Date(
        reminderDate.getTime() + 7 * 24 * 60 * 60 * 1000,
      );
    }

    return this.prisma.notification.update({
      where: { id: notification.id },
      data: updateData,
    });
  }

  /**
   * Delete a reminder
   */
  async remove(id: string, userId: string) {
    const notification = await this.findOne(id, userId);

    await this.prisma.notification.delete({
      where: { id: notification.id },
    });

    return { message: 'Reminder deleted successfully' };
  }

  /**
   * Mark reminder as read
   */
  async markAsRead(id: string, userId: string) {
    const notification = await this.findOne(id, userId);

    return this.prisma.notification.update({
      where: { id: notification.id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Process due reminders - called by cron job
   * This method sends notifications for reminders that are due
   */
  async processDueReminders(): Promise<number> {
    const now = new Date();

    // Find all unread reminders that are due (expiresAt is in the future but created recently)
    const dueReminders = await this.prisma.notification.findMany({
      where: {
        type: {
          endsWith: '_reminder',
        },
        isRead: false,
        createdAt: {
          lte: now,
        },
        expiresAt: {
          gte: now,
        },
      },
    });

    this.logger.log(`Found ${dueReminders.length} due reminders to process`);

    // In a real application, you would send emails or push notifications here
    // For now, we just log them
    for (const reminder of dueReminders) {
      this.logger.log(
        `Reminder due for user ${reminder.userId}: ${reminder.title}`,
      );
    }

    return dueReminders.length;
  }
}
