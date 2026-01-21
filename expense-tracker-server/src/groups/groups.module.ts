import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { SplitCalculationService } from './services/split-calculation.service';
import { BalanceCalculationService } from './services/balance-calculation.service';
import { DebtSettlementService } from './services/debt-settlement.service';
import { GroupCacheService } from './services/group-cache.service';
import { GroupExpenseService } from './services/group-expense.service';
import { GroupStatisticsService } from './services/group-statistics.service';

@Module({
  controllers: [GroupsController],
  providers: [
    GroupsService,
    SplitCalculationService,
    BalanceCalculationService,
    DebtSettlementService,
    GroupCacheService,
    GroupExpenseService,
    GroupStatisticsService,
  ],
  exports: [
    GroupsService,
    SplitCalculationService,
    BalanceCalculationService,
    DebtSettlementService,
    GroupCacheService,
    GroupExpenseService,
    GroupStatisticsService,
  ],
})
export class GroupsModule {}
