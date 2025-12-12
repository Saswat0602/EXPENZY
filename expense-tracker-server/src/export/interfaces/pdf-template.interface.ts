export interface CategoryDistribution {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface SummaryCard {
  label: string;
  value: string;
}

export interface TransactionRow {
  index: number;
  date: string;
  category: string;
  description: string;
  amount: number;
}
