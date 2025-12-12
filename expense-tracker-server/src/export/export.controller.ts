import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Res,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { ExportService } from './export.service';
import {
  ExportGroupDto,
  ExportExpensesDto,
  ExportTransactionsDto,
} from './dto/export.dto';
import * as fs from 'fs';

/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
// The above eslint-disable is for CurrentUser decorator which has type inference issues but is actually type-safe

@Controller('export')
@UseGuards(JwtAuthGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) { }

  /**
   * Export group report as PDF
   */
  @Post('group/:id')
  async exportGroup(
    @Param('id') groupId: string,

    @CurrentUser() user: JwtPayload,
    @Query() options: ExportGroupDto,
  ): Promise<{ filename: string; downloadUrl: string }> {
    const filename = await this.exportService.exportGroup(
      groupId,
      user.userId,
      options,
    );

    return {
      filename,
      downloadUrl: `/export/download/${filename}`,
    };
  }

  /**
   * Export personal expenses as PDF
   */
  @Post('expenses')
  async exportExpenses(
    @CurrentUser() user: JwtPayload,
    @Query() options: ExportExpensesDto,
  ): Promise<{ filename: string; downloadUrl: string }> {
    const filename = await this.exportService.exportExpenses(
      user.userId,
      options,
    );

    return {
      filename,
      downloadUrl: `/export/download/${filename}`,
    };
  }

  /**
   * Export transactions (income + expenses) as PDF
   */
  @Post('transactions')
  async exportTransactions(
    @CurrentUser() user: JwtPayload,
    @Query() options: ExportTransactionsDto,
  ): Promise<{ filename: string; downloadUrl: string }> {
    const filename = await this.exportService.exportTransactions(
      user.userId,
      options,
    );

    return {
      filename,
      downloadUrl: `/export/download/${filename}`,
    };
  }

  /**
   * Download generated PDF
   */
  @Get('download/:filename')
  downloadFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ): void {
    const filepath = this.exportService.getFilePath(filename);

    if (!fs.existsSync(filepath)) {
      throw new NotFoundException('File not found or has expired');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const fileStream = fs.createReadStream(filepath);
    fileStream.pipe(res);
  }
}
