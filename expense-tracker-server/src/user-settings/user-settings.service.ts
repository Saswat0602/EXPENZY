import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';
import { UserSettings } from '@prisma/client';

@Injectable()
export class UserSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreate(userId: string): Promise<UserSettings> {
    let settings = await this.prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await this.prisma.userSettings.create({
        data: { userId },
      });
    }

    return settings;
  }

  async update(
    userId: string,
    updateUserSettingsDto: UpdateUserSettingsDto,
  ): Promise<UserSettings> {
    await this.getOrCreate(userId);

    return this.prisma.userSettings.update({
      where: { userId },
      data: {
        ...(updateUserSettingsDto.theme && {
          theme: updateUserSettingsDto.theme,
        }),
        ...(updateUserSettingsDto.language && {
          language: updateUserSettingsDto.language,
        }),
        ...(updateUserSettingsDto.dateFormat && {
          dateFormat: updateUserSettingsDto.dateFormat,
        }),
        ...(updateUserSettingsDto.timeFormat && {
          timeFormat: updateUserSettingsDto.timeFormat,
        }),
        ...(updateUserSettingsDto.weekStartDay && {
          weekStartDay: updateUserSettingsDto.weekStartDay,
        }),
        ...(updateUserSettingsDto.defaultView && {
          defaultView: updateUserSettingsDto.defaultView,
        }),
        ...(updateUserSettingsDto.textSize && {
          textSize: updateUserSettingsDto.textSize,
        }),
        ...(updateUserSettingsDto.notificationEnabled !== undefined && {
          notificationEnabled: updateUserSettingsDto.notificationEnabled,
        }),
        ...(updateUserSettingsDto.emailNotifications !== undefined && {
          emailNotifications: updateUserSettingsDto.emailNotifications,
        }),
        ...(updateUserSettingsDto.pushNotifications !== undefined && {
          pushNotifications: updateUserSettingsDto.pushNotifications,
        }),
        ...(updateUserSettingsDto.budgetAlerts !== undefined && {
          budgetAlerts: updateUserSettingsDto.budgetAlerts,
        }),
        ...(updateUserSettingsDto.subscriptionReminders !== undefined && {
          subscriptionReminders: updateUserSettingsDto.subscriptionReminders,
        }),
        ...(updateUserSettingsDto.loanReminders !== undefined && {
          loanReminders: updateUserSettingsDto.loanReminders,
        }),
        ...(updateUserSettingsDto.exportFormat && {
          exportFormat: updateUserSettingsDto.exportFormat,
        }),
        ...(updateUserSettingsDto.biometricEnabled !== undefined && {
          biometricEnabled: updateUserSettingsDto.biometricEnabled,
        }),
        ...(updateUserSettingsDto.autoBackup !== undefined && {
          autoBackup: updateUserSettingsDto.autoBackup,
        }),
      },
    });
  }
}
