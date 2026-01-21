import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum EntityType {
  EXPENSE = 'expense',
  GROUP_EXPENSE = 'group_expense',
  INCOME = 'income',
}

export class CreateAttachmentDto {
  @ApiProperty({ description: 'Entity type', enum: EntityType })
  @IsNotEmpty()
  @IsEnum(EntityType)
  entityType: EntityType;

  @ApiProperty({ description: 'Entity ID' })
  @IsNotEmpty()
  @IsString()
  entityId: string;

  @ApiProperty({ description: 'File name' })
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @ApiProperty({ description: 'File URL' })
  @IsNotEmpty()
  @IsString()
  fileUrl: string;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @ApiPropertyOptional({ description: 'MIME type' })
  @IsOptional()
  @IsString()
  mimeType?: string;
}
