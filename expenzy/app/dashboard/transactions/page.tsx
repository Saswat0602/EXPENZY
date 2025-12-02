'use client';

import { useState } from 'react';
import { useExpenses } from '@/lib/hooks/use-expenses';
import { useIncome } from '@/lib/hooks/use-income';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { Plus, TrendingUp, TrendingDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { AddTransactionModal } from '@/components/modals/add-transaction-modal';
import { Button } from '@/components/ui/button';
import {
    ITEMS_PER_PAGE,
    type TransactionType,
    type Transaction,
    calculatePaginationMeta,
    getDisplayTransactions,
    getDisplayIndices,
    getPageNumbers,
    combineTransactions,
} from '@/lib/utils/transaction-helpers';
import { PageHeader } from '@/components/layout/page-header';

export default function TransactionsPage() {
    const [type, setType] = useState<TransactionType>('all');
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // Get current year date range
    const currentYear = new Date().getFullYear();
    const startDate = `${currentYear}-01-01`;
    const endDate = `${currentYear}-12-31`;

    // Fetch expenses with server-side pagination ONLY for expense-only view
    // For 'all' and 'income', fetch ALL expenses without limit
    const { data: expensesResponse, isLoading: expensesLoading } = useExpenses({
        page: type === 'expense' ? currentPage : undefined,
        limit: type === 'expense' ? ITEMS_PER_PAGE : undefined,
        startDate,
        endDate,
        search: search || undefined,
    });

    const { data: income, isLoading: incomeLoading } = useIncome();

    const isLoading = expensesLoading || incomeLoading;

    // Extract data
    const expenses = expensesResponse?.data || [];
    const expensesMeta = expensesResponse?.meta;
    const incomeArray = Array.isArray(income) ? income : [];

    // Combine transactions based on type filter
    const allTransactions = combineTransactions(type, expenses, incomeArray);

    // Calculate pagination metadata
    const { totalPages, totalCount } = calculatePaginationMeta(
        type,
        expensesMeta,
        allTransactions.length,
        currentPage
    );

    // Get transactions to display
    const displayTransactions = getDisplayTransactions(
        type,
        allTransactions,
        currentPage,
        type === 'expense' && !!expensesMeta
    );

    // Calculate display indices
    const { startIndex, endIndex } = getDisplayIndices(currentPage, totalCount);

    // Debug logging
    console.log('=== Pagination Debug ===');
    console.log('Type:', type);
    console.log('Current Page:', currentPage);
    console.log('Total Count:', totalCount);
    console.log('Total Pages:', totalPages);
    console.log('All Transactions Length:', allTransactions.length);
    console.log('Display Transactions Length:', displayTransactions.length);
    console.log('Expenses Meta:', expensesMeta);
    console.log('========================');

    // Event handlers
    const handleFilterChange = (newType: TransactionType) => {
        setType(newType);
        setCurrentPage(1);
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Get page numbers for pagination UI
    const pageNumbers = getPageNumbers(currentPage, totalPages);

    return (
        <div className="space-y-6">
            {/* Header */}
            <PageHeader
                title="Transactions"
                description={`Track your ${currentYear} income and expenses`}
                action={
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="hidden sm:inline">Add Transaction</span>
                    </button>
                }
            />

            <AddTransactionModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>

                {/* Type Filter */}
                <div className="flex gap-2 bg-muted p-1 rounded-lg">
                    {(['all', 'expense', 'income'] as TransactionType[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => handleFilterChange(t)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${type === t
                                ? 'bg-background shadow-sm'
                                : 'hover:bg-background/50'
                                }`}
                        >
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results count */}
            {!isLoading && totalCount > 0 && (
                <p className="text-sm text-muted-foreground">
                    Showing {startIndex + 1}-{endIndex} of {totalCount} transactions
                </p>
            )}

            {/* Transactions List */}
            <div className="bg-card border border-border rounded-lg divide-y divide-border">
                {isLoading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                    </div>
                ) : displayTransactions.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        No transactions found for {currentYear}
                    </div>
                ) : (
                    displayTransactions.map((transaction) => {
                        const date = 'expenseDate' in transaction ? transaction.expenseDate : transaction.incomeDate;
                        const isIncome = transaction.type === 'income';

                        return (
                            <div
                                key={transaction.id}
                                className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isIncome
                                            ? 'bg-success/10 text-success'
                                            : 'bg-destructive/10 text-destructive'
                                            }`}
                                    >
                                        {isIncome ? (
                                            <TrendingUp className="w-6 h-6" />
                                        ) : (
                                            <TrendingDown className="w-6 h-6" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{transaction.description}</p>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span>{transaction.category?.name || 'Uncategorized'}</span>
                                            <span>•</span>
                                            <span>{formatDate(date)}</span>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p
                                            className={`text-lg font-semibold ${isIncome ? 'text-success' : 'text-destructive'
                                                }`}
                                        >
                                            {isIncome ? '+' : '-'}
                                            {formatCurrency(transaction.amount)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
                <>
                    {/* Desktop Pagination */}
                    <div className="hidden md:flex items-center justify-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </Button>

                        {pageNumbers.map((page, index) => (
                            page === '...' ? (
                                <span key={`ellipsis-${index}`} className="px-2">...</span>
                            ) : (
                                <Button
                                    key={page}
                                    variant={currentPage === page ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handlePageChange(page as number)}
                                    className="min-w-[40px]"
                                >
                                    {page}
                                </Button>
                            )
                        ))}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Mobile Show More */}
                    <div className="md:hidden flex flex-col items-center gap-2">
                        {currentPage < totalPages && (
                            <Button
                                variant="outline"
                                onClick={() => handlePageChange(currentPage + 1)}
                                className="w-full"
                            >
                                Show More ({totalCount - endIndex} remaining)
                            </Button>
                        )}
                        <p className="text-sm text-muted-foreground text-center">
                            Page {currentPage} of {totalPages}
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
