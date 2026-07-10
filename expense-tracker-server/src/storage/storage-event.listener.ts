import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ExpenseDeletedEvent } from '../events/expense-deleted.event';

@Injectable()
export class StorageEventListener {
  private readonly logger = new Logger(StorageEventListener.name);

  @OnEvent('expense.deleted')
  handleExpenseDeletedEvent(event: ExpenseDeletedEvent) {
    if (event.receiptUrl) {
      // Simulate external storage cleanup
      this.logger.log(`Archiving/deleting orphaned receipt at: ${event.receiptUrl}`);
      // TODO: Implement actual S3/local file deletion logic here
    }
  }
}
