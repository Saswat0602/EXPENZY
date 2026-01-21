import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ExpensesModule } from '../expenses/expenses.module';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, ExpensesModule],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
