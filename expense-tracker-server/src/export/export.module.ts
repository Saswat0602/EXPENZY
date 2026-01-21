import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { PdfGeneratorService } from './services/pdf-generator.service';
import { FileCleanupService } from './services/file-cleanup.service';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot()],
  controllers: [ExportController],
  providers: [ExportService, PdfGeneratorService, FileCleanupService],
  exports: [ExportService],
})
export class ExportModule {}
