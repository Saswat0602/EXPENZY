// Export types for PDF generation
export interface ExportOptions {
    startDate?: string;
    endDate?: string;
    includeStatistics?: boolean;
}

export interface ExportResponse {
    filename: string;
    downloadUrl: string;
}

export interface ExportGroupOptions extends ExportOptions {
    groupId: string;
}

export interface ExportExpenseOptions extends ExportOptions {
    // Additional options for personal expense export
    userId?: string;
}

export interface ExportTransactionOptions extends ExportOptions {
    // Additional options for transaction export
    accountId?: string;
    type?: 'expense' | 'income';
}

// Alias for consistency
export type ExportTransactionsOptions = ExportTransactionOptions;
