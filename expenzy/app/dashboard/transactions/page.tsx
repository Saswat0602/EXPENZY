'use client';

import { MobileActionMenu, createEditAction, createDeleteAction } from '@/components/shared/mobile-action-menu';
import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDeleteExpense, useInfiniteExpenses } from '@/lib/hooks/use-expenses';
import { useDeleteIncome, useInfiniteIncome } from '@/lib/hooks/use-income';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { Plus, Search, Repeat, Loader2 } from 'lucide-react';
import { CategoryIcon, formatCategoryName } from '@/lib/categorization/category-icons';
import { TransactionModal } from '@/components/modals/transaction-modal';
import { ConfirmationModal } from '@/components/modals/confirmation-modal';
import { PageHeader } from '@/components/layout/page-header';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { TransactionExportButton } from '@/components/features/transaction-export-button';
import { TransactionFiltersComponent, type TransactionFilters } from '@/components/features/transactions/transaction-filters';
import { useCategories } from '@/lib/hooks/use-categories';
import { useExpenses } from '@/lib/hooks/use-expenses';
import { useIncome } from '@/lib/hooks/use-income';
import { ROUTES } from '@/lib/routes';
import type { Expense } from '@/types/expense';
import type { Income } from '@/types/income';

type TransactionType = 'expense' | 'income';
type Transaction = (Expense | Income) & { type: TransactionType };

export default function TransactionsPage() {
    const router = useRouter();
    const [type, setType] = useState<TransactionType>('expense');
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
    const [deleteItem, setDeleteItem] = useState<Transaction | null>(null);
    const [filters, setFilters] = useState<TransactionFilters>({
        categories: [],
        dateRange: { from: null, to: null },
        amountRange: { min: 0, max: 10000 },
        sortBy: 'date',
        sortOrder: 'desc',
    });

    const { data: categories = [] } = useCategories();

    const deleteExpense = useDeleteExpense();
    const deleteIncome = useDeleteIncome();

    // Build filters for infinite query
    const queryFilters = useMemo(() => {
        const baseFilters: {
            search?: string;
            categoryId?: string;
            startDate?: string;
            endDate?: string;
            minAmount?: number;
            maxAmount?: number;
            sortBy?: 'expenseDate' | 'amount' | 'createdAt' | 'updatedAt';
            sortOrder?: 'asc' | 'desc';
        } = {
            search: search.trim().length >= 2 ? search.trim() : undefined,
            sortBy: filters.sortBy === 'date' ? 'expenseDate' : (filters.sortBy as 'amount' | 'createdAt' | 'updatedAt'),
            sortOrder: filters.sortOrder,
        };

        // Add category filter (only first one for now)
        if (filters.categories.length > 0) {
            baseFilters.categoryId = filters.categories[0];
        }

        // Add date range
        if (filters.dateRange.from) {
            baseFilters.startDate = filters.dateRange.from.toISOString().split('T')[0];
        }
        if (filters.dateRange.to) {
            baseFilters.endDate = filters.dateRange.to.toISOString().split('T')[0];
        }

        // Add amount range
        if (filters.amountRange.min > 0) {
            baseFilters.minAmount = filters.amountRange.min;
        }
        if (filters.amountRange.max < 10000) {
            baseFilters.maxAmount = filters.amountRange.max;
        }

        return baseFilters;
    }, [search, filters]);

    // Use infinite queries based on type with enabled option
    const expensesQuery = useInfiniteExpenses(
        type === 'expense' ? (queryFilters as Record<string, unknown>) : {},
    );
    const incomeQuery = useInfiniteIncome(
        type === 'income' ? (queryFilters as Record<string, unknown>) : {},
    );

    const activeQuery = type === 'expense' ? expensesQuery : incomeQuery;

    // Flatten pages into single array
    const transactions = useMemo(() => {
        if (!activeQuery.data?.pages) return [];

        // Each page has structure: { data: [...], meta: { nextCursor, hasMore, limit } }
        const items = activeQuery.data.pages.flatMap((page: { data?: unknown[]; meta?: unknown }) => {
            // Safely extract data array, handle both cursor and offset response formats
            const pageData = page?.data || page || [];
            return Array.isArray(pageData) ? pageData : [];
        });

        return items.map((item: unknown) => ({ ...(item as object), type } as Transaction));
    }, [activeQuery.data, type]);

    // Debug infinite scroll
    useEffect(() => {
        const lastPage = activeQuery.data?.pages?.[activeQuery.data.pages.length - 1];
        console.log('Infinite Scroll Debug:', {
            hasNextPage: activeQuery.hasNextPage,
            isFetchingNextPage: activeQuery.isFetchingNextPage,
            pagesCount: activeQuery.data?.pages?.length,
            lastPageMeta: lastPage?.meta,
            totalItems: activeQuery.data?.pages?.reduce((sum: number, page: { data?: unknown[] }) => sum + (page?.data?.length || 0), 0),
        });
    }, [activeQuery.hasNextPage, activeQuery.isFetchingNextPage, activeQuery.data?.pages]);

    // Intersection observer for infinite scroll
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const handleObserver = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [target] = entries;
            if (target.isIntersecting && activeQuery.hasNextPage && !activeQuery.isFetchingNextPage) {
                console.log('Loading more transactions...');
                activeQuery.fetchNextPage();
            }
        },
        [activeQuery]
    );

    useEffect(() => {
        const element = loadMoreRef.current;
        if (!element) return;

        const option = { threshold: 0.1, rootMargin: '100px' };
        const observer = new IntersectionObserver(handleObserver, option);
        observer.observe(element);

        return () => observer.disconnect();
    }, [handleObserver]);

    // Event handlers
    const handleFilterChange = (newType: TransactionType) => {
        setType(newType);
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
    };

    const handleEdit = (transaction: Transaction) => {
        setEditTransaction(transaction);
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

    const deleteDescription = deleteItem
        ? (deleteItem.type === 'income'
            ? (deleteItem as Income).source
            : (deleteItem as Expense).description)
        : '';

    const renderTransactionCard = (transaction: Transaction) => {
        const date = transaction.type === 'expense'
            ? (transaction as Expense).expenseDate
            : (transaction as Income).incomeDate;
        const description = transaction.type === 'income'
            ? (transaction as Income).source
            : (transaction as Expense).description;

        // Handle amount - convert to number if needed
        const amount = Number(transaction.amount) || 0;

        return (
            <div key={transaction.id} className="bg-card border border-border rounded-lg p-4 hover:bg-accent/5 transition-colors">
                <div className="flex items-start gap-3">
                    {/* Category Icon */}
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CategoryIcon
                            iconName={transaction.category?.icon}
                            color={transaction.category?.color}
                            className="w-6 h-6"
                        />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-base mb-1 truncate">
                            {description}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{transaction.category?.name ? formatCategoryName(transaction.category.name) : 'Other'}</span>
                            <span>•</span>
                            <span>{formatDate(date)}</span>
                        </div>
                    </div>

                    {/* Amount and Actions */}
                    <div className="flex items-start gap-3 flex-shrink-0">
                        <p className="font-semibold text-base tabular-nums">
                            {formatCurrency(amount)}
                        </p>

                        {/* Mobile Action Menu */}
                        <MobileActionMenu
                            actions={[
                                createEditAction(() => handleEdit(transaction)),
                                createDeleteAction(() => handleDelete(transaction)),
                            ]}
                        />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <PageWrapper>
            <div className="space-y-6">
                {/* Header */}
                <PageHeader
                    title="Transactions"
                    description="Track all your income and expenses"
                    action={
                        <div className="flex items-center gap-2">
                            <TransactionExportButton variant="outline" />
                            <button
                                onClick={() => router.push(ROUTES.RECURRING_EXPENSES)}
                                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
                                title="Manage Recurring Expenses"
                            >
                                <Repeat className="w-5 h-5" />
                                <span className="hidden sm:inline">Recurring</span>
                            </button>

                        </div>
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
                            <p className="font-medium">
                                {formatCurrency(deleteItem.amount)}
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
                            placeholder="Search transactions (min 2 chars)..."
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

                    {/* Advanced Filters */}
                    <TransactionFiltersComponent
                        filters={filters}
                        onFiltersChange={setFilters}
                        categories={categories}
                        maxAmount={10000}
                    />
                </div>

                {/* Transactions List */}
                <div className="space-y-3">
                    {activeQuery.isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p className="font-medium">No transactions found</p>
                            <p className="text-sm mt-1">Try adjusting your filters or add a new transaction</p>
                        </div>
                    ) : (
                        <>
                            {transactions.map(renderTransactionCard)}

                            {/* Load more trigger */}
                            <div ref={loadMoreRef} className="py-4">
                                {activeQuery.isFetchingNextPage && (
                                    <div className="flex justify-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Floating Action Button (Mobile) */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="md:hidden fixed bottom-20 right-4 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center"
                    aria-label="Add transaction"
                >
                    <Plus className="h-6 w-6" />
                </button>
            </div>
        </PageWrapper>
    );
}
