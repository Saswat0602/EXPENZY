'use client';

import { useState } from 'react';
import { useExpenses, useDeleteExpense } from '@/lib/hooks/use-expenses';
import { useIncome, useDeleteIncome } from '@/lib/hooks/use-income';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { Plus, Search, ChevronLeft, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import { TransactionModal } from '@/components/modals/transaction-modal';
import { ConfirmationModal } from '@/components/modals/confirmation-modal';
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
import type { Expense } from '@/types/expense';
import type { Income } from '@/types/income';

export default function TransactionsPage() {
    const [type, setType] = useState<TransactionType>('expense');
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [editTransaction, setEditTransaction] = useState<((Expense | Income) & { type: 'expense' | 'income' }) | null>(null);
    const [deleteItem, setDeleteItem] = useState<Transaction | null>(null);

    const deleteExpense = useDeleteExpense();
    const deleteIncome = useDeleteIncome();

    // Get current year date range
    const currentYear = new Date().getFullYear();
    const startDate = `${currentYear}-01-01`;
    const endDate = `${currentYear}-12-31`;

    // Fetch expenses ONLY when type is 'expense'
    const { data: expensesResponse, isLoading: expensesLoading } = useExpenses({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        startDate,
        endDate,
        search: search || undefined,
    }, { enabled: type === 'expense' });

    // Fetch income ONLY when type is 'income'
    const { data: income, isLoading: incomeLoading } = useIncome({
        startDate,
        endDate,
        search: search || undefined,
    }, { enabled: type === 'income' });

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

    const handleEdit = (transaction: Transaction) => {
        setEditTransaction({
            ...transaction,
            type: transaction.type,
        } as (Expense | Income) & { type: 'expense' | 'income' });
    };

    const handleDelete = (transaction: Transaction) => {
        setDeleteItem(transaction);
    };

    const confirmDelete = async () => {
        if (!deleteItem) return;

        if (deleteItem.type === 'expense') {
            await deleteExpense.mutateAsync(deleteItem.id);
        } else {
            await deleteIncome.mutateAsync(deleteItem.id);
        }
        setDeleteItem(null);
    };

    // Get page numbers for pagination UI
    const pageNumbers = getPageNumbers(currentPage, totalPages);

    const deleteDescription = deleteItem
        ? (deleteItem.type === 'income'
            ? (deleteItem as Income).source
            : (deleteItem as Expense).description)
        : '';

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

            <TransactionModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mode="add"
            />

            <TransactionModal
                open={!!editTransaction}
                onClose={() => setEditTransaction(null)}
                mode="edit"
                transaction={editTransaction || undefined}
            />

            <ConfirmationModal
                open={!!deleteItem}
                onClose={() => setDeleteItem(null)}
                onConfirm={confirmDelete}
                title="Delete Transaction"
                description="Are you sure you want to delete this transaction? This action cannot be undone."
                confirmText="Delete"
                isLoading={deleteExpense.isPending || deleteIncome.isPending}
            >
                {deleteItem && (
                    <div className="bg-muted p-4 rounded-lg space-y-1">
                        <p className="font-medium">{deleteDescription}</p>
                        <p className="text-lg font-semibold">
                            ₹ {formatCurrency(deleteItem.amount)}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">
                            {deleteItem.type}
                        </p>
                    </div>
                )}
            </ConfirmationModal>

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
                <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-lg w-full sm:w-auto">
                    {(['expense', 'income'] as TransactionType[]).map((t) => (
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

            {/* Transactions List - Card Design */}
            <div className="space-y-2">
                {isLoading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
                    </div>
                ) : displayTransactions.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                        <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                            <Search className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-lg font-medium mb-1">No transactions found</p>
                        <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    displayTransactions.map((transaction) => {
                        const date = 'expenseDate' in transaction ? transaction.expenseDate : transaction.incomeDate;
                        const description = transaction.type === 'income'
                            ? (transaction as Income).source
                            : (transaction as Expense).description;
                        const categoryColor = transaction.category?.color || '#6B7280';

                        return (
                            <div
                                key={transaction.id}
                                className="bg-card border border-border rounded-lg p-4 hover:bg-accent/5 transition-colors"
                            >
                                <div className="flex items-start gap-3">
                                    {/* Category Color Dot */}
                                    <div
                                        className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5"
                                        style={{ backgroundColor: categoryColor }}
                                    />

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-base mb-1 truncate">
                                            {description}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span>{transaction.category?.name || 'Other'}</span>
                                            <span>•</span>
                                            <span>{formatDate(date)}</span>
                                        </div>
                                    </div>

                                    {/* Amount and Actions */}
                                    <div className="flex items-start gap-3 flex-shrink-0">
                                        <p className="font-semibold text-base tabular-nums">
                                            ₹ {formatCurrency(transaction.amount)}
                                        </p>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleEdit(transaction)}
                                                className="p-1.5 hover:bg-muted rounded-md transition-colors"
                                                aria-label="Edit transaction"
                                            >
                                                <Edit2 className="w-4 h-4 text-muted-foreground" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(transaction)}
                                                className="p-1.5 hover:bg-destructive/10 rounded-md transition-colors"
                                                aria-label="Delete transaction"
                                            >
                                                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                                            </button>
                                        </div>
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
