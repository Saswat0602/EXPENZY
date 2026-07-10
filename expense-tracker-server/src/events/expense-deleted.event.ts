export class ExpenseDeletedEvent {
  constructor(
    public readonly expenseId: string,
    public readonly receiptUrl?: string | null,
  ) {}
}
