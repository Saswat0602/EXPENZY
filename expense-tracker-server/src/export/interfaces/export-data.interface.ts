export interface ExportOptions {
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  includeCharts?: boolean;
  includeStatistics?: boolean;
  format?: 'pdf' | 'excel';
}

export interface GroupExportData {
  group: {
    id: string;
    name: string;
    description?: string;
    currency: string;
    memberCount: number;
  };
  expenses: Array<{
    id: string;
    description: string;
    amount: number;
    currency: string;
    expenseDate: Date;
    paidBy: {
      name: string;
      email: string;
    };
    category?: {
      name: string;
      icon?: string;
    };
    splits: Array<{
      user: { name: string };
      amountOwed: number;
    }>;
  }>;
  statistics?: {
    totalExpenses: number;
    totalAmount: number;
    averageExpense: number;
    categoryBreakdown: Record<string, number>;
  };
}

export interface ExpenseExportData {
  expenses: Array<{
    id: string;
    description: string;
    amount: number;
    currency: string;
    expenseDate: Date;
    category?: {
      name: string;
    };
  }>;
  summary: {
    totalExpenses: number;
    totalAmount: number;
    averageExpense: number;
  };
}

export interface TransactionExportData {
  transactions: Array<{
    id: string;
    type: 'income' | 'expense';
    description: string;
    amount: number;
    currency: string;
    date: Date;
    category?: {
      name: string;
    };
  }>;
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
  };
}
