import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { RecurringExpensesService } from './recurring-expenses.service';
import { RecurringExpensesController } from './recurring-expenses.controller';

@Module({
  controllers: [RecurringExpensesController, ExpensesController], // Recurring MUST come first!
  providers: [ExpensesService, RecurringExpensesService],
  exports: [ExpensesService, RecurringExpensesService],
})
export class ExpensesModule {}
