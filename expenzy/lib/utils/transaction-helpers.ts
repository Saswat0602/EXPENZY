/**
 * Helper functions for transaction page logic
 */

export const ITEMS_PER_PAGE = 20;

export type TransactionType = 'all' | 'expense' | 'income';

/**
 * Calculate pagination metadata
 */
export function calculatePaginationMeta(
    type: TransactionType,
    expensesMeta: any,
    allTransactionsLength: number,
    currentPage: number
) {
    // For expense-only view, use server pagination metadata
    if (type === 'expense' && expensesMeta) {
        return {
            totalPages: expensesMeta.totalPages,
            totalCount: expensesMeta.total,
            hasNext: expensesMeta.hasNext,
            hasPrevious: expensesMeta.hasPrevious,
        };
    }

    // For 'all' and 'income', calculate from client-side data
    const totalCount = allTransactionsLength;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    return {
        totalPages,
        totalCount,
        hasNext: currentPage < totalPages,
        hasPrevious: currentPage > 1,
    };
}

/**
 * Get display transactions based on type and pagination
 */
export function getDisplayTransactions(
    type: TransactionType,
    allTransactions: any[],
    currentPage: number,
    isServerPaginated: boolean
) {
    // For expense type with server pagination, data is already paginated
    if (type === 'expense' && isServerPaginated) {
        return allTransactions;
    }

    // For other types, slice the client-side data
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return allTransactions.slice(startIndex, endIndex);
}

/**
 * Calculate start and end indices for display
 */
export function getDisplayIndices(currentPage: number, totalCount: number) {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalCount);
    return { startIndex, endIndex };
}

/**
 * Generate page numbers for pagination UI
 */
export function getPageNumbers(currentPage: number, totalPages: number) {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
    } else {
        if (currentPage <= 3) {
            for (let i = 1; i <= 4; i++) pages.push(i);
            pages.push('...');
            pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
            pages.push(1);
            pages.push('...');
            for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            pages.push('...');
            pages.push(currentPage - 1);
            pages.push(currentPage);
            pages.push(currentPage + 1);
            pages.push('...');
            pages.push(totalPages);
        }
    }
    return pages;
}

/**
 * Combine and sort transactions
 */
export function combineTransactions(
    type: TransactionType,
    expenses: any[],
    income: any[]
) {
    if (type === 'expense') {
        return expenses.map(e => ({ ...e, type: 'expense' as const }));
    }

    if (type === 'income') {
        return income.map(i => ({
            ...i,
            type: 'income' as const,
            description: i.source
        }));
    }

    // Combine all transactions and sort by date
    const allTransactions = [
        ...expenses.map(e => ({ ...e, type: 'expense' as const })),
        ...income.map(i => ({
            ...i,
            type: 'income' as const,
            description: i.source
        })),
    ];

    return allTransactions.sort((a, b) => {
        const dateA = 'expenseDate' in a ? new Date(a.expenseDate) : new Date(a.incomeDate);
        const dateB = 'expenseDate' in b ? new Date(b.expenseDate) : new Date(b.incomeDate);
        return dateB.getTime() - dateA.getTime();
    });
}
