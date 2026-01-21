import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';

export class UpdateUserSettingsDto {
  @IsEnum(['light', 'dark', 'system'])
  @IsOptional()
  theme?: 'light' | 'dark' | 'system';

  @IsString()
  @IsOptional()
  language?: string;

  @IsString()
  @IsOptional()
  dateFormat?: string;

  @IsEnum(['12h', '24h'])
  @IsOptional()
  timeFormat?: '12h' | '24h';

  @IsEnum([
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ])
  @IsOptional()
  weekStartDay?:
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday';

  @IsString()
  @IsOptional()
  defaultView?: string;

  @IsEnum(['small', 'medium', 'large'])
  @IsOptional()
  textSize?: 'small' | 'medium' | 'large';

  @IsBoolean()
  @IsOptional()
  notificationEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  pushNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  budgetAlerts?: boolean;

  @IsBoolean()
  @IsOptional()
  subscriptionReminders?: boolean;

  @IsBoolean()
  @IsOptional()
  loanReminders?: boolean;

  @IsEnum(['pdf', 'csv', 'excel'])
  @IsOptional()
  exportFormat?: 'pdf' | 'csv' | 'excel';

  @IsBoolean()
  @IsOptional()
  biometricEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  autoBackup?: boolean;
}
