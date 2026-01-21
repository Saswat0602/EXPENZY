import { Income, Category, RecurringPattern } from '@prisma/client';

export type IncomeWithRelations = Income & {
  category?: Category | null;
  recurringPattern?: RecurringPattern | null;
};

export class IncomeResponseDto {
  id: string;
  userId: string;
  categoryId: string | null;
  amount: string;
  currency: string;
  source: string;
  description: string | null;
  incomeDate: Date;
  isRecurring: boolean;
  recurringPatternId: string | null;
  paymentMethod: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  category?: Category | null;
  recurringPattern?: RecurringPattern | null;

  constructor(income: IncomeWithRelations) {
    this.id = income.id;
    this.userId = income.userId;
    this.categoryId = income.categoryId;
    this.amount = income.amount.toString();
    this.currency = income.currency;
    this.source = income.source;
    this.description = income.description;
    this.incomeDate = income.incomeDate;
    this.isRecurring = income.isRecurring;
    this.recurringPatternId = income.recurringPatternId;
    this.paymentMethod = income.paymentMethod;
    this.notes = income.notes;
    this.createdAt = income.createdAt;
    this.updatedAt = income.updatedAt;
    this.deletedAt = income.deletedAt;
    this.category = income.category;
    this.recurringPattern = income.recurringPattern;
  }
}
