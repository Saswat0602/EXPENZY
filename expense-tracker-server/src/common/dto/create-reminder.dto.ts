import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ReminderType {
  PAYMENT = 'payment',
  SUBSCRIPTION = 'subscription',
  LOAN = 'loan',
  CUSTOM = 'custom',
}

export class CreateReminderDto {
  @ApiProperty({ description: 'Reminder type', enum: ReminderType })
  @IsNotEmpty()
  @IsEnum(ReminderType)
  type: ReminderType;

  @ApiProperty({ description: 'Reminder title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Reminder message' })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Related entity type' })
  @IsOptional()
  @IsString()
  relatedEntityType?: string;

  @ApiPropertyOptional({ description: 'Related entity ID' })
  @IsOptional()
  @IsString()
  relatedEntityId?: string;

  @ApiProperty({ description: 'Reminder date' })
  @IsNotEmpty()
  @IsDateString()
  reminderDate: string;

  @ApiPropertyOptional({ description: 'Action URL' })
  @IsOptional()
  @IsString()
  actionUrl?: string;

  @ApiPropertyOptional({ description: 'Action label' })
  @IsOptional()
  @IsString()
  actionLabel?: string;
}
