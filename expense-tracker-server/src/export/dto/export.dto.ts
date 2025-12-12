import { IsOptional, IsDateString, IsBoolean, IsEnum } from 'class-validator';

export class ExportGroupDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  includeCharts?: boolean = true;

  @IsOptional()
  @IsBoolean()
  includeStatistics?: boolean = true;
}

export class ExportExpensesDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(['pdf', 'excel'])
  format?: 'pdf' | 'excel' = 'pdf';
}

export class ExportTransactionsDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(['pdf', 'excel'])
  format?: 'pdf' | 'excel' = 'pdf';
}
