import { Module } from '@nestjs/common';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { LoanAdjustmentService } from './services/loan-adjustment.service';
import { BalanceCalculationService } from '../groups/services/balance-calculation.service';

@Module({
  imports: [PrismaModule],
  controllers: [LoansController],
  providers: [LoansService, LoanAdjustmentService, BalanceCalculationService],
  exports: [LoansService],
})
export class LoansModule {}
