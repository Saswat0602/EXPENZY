'use client';

import { MobileActionMenu, createEditAction, createDeleteAction } from '@/components/shared/mobile-action-menu';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDeleteExpense } from '@/lib/hooks/use-expenses';
import { useDeleteIncome } from '@/lib/hooks/use-income';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { Plus, Search, Repeat } from 'lucide-react';
import { CategoryIcon, formatCategoryName } from '@/lib/categorization/category-icons';
import { TransactionModal } from '@/components/modals/transaction-modal';
import { ConfirmationModal } from '@/components/modals/confirmation-modal';
import { VirtualList } from '@/components/shared/virtual-list';
import { PageHeader } from '@/components/layout/page-header';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { TransactionExportButton } from '@/components/features/transaction-export-button';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { ROUTES } from '@/lib/routes';
import type { Expense } from '@/types/expense';
import type { Income } from '@/types/income';

type TransactionType = 'expense' | 'income';
type Transaction = (Expense | Income) & { type: TransactionType };

const ITEMS_PER_PAGE = 20;

export default function TransactionsPage() {
    const router = useRouter();
    const [type, setType] = useState<TransactionType>('expense');
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
    const [deleteItem, setDeleteItem] = useState<Transaction | null>(null);

    const deleteExpense = useDeleteExpense();
    const deleteIncome = useDeleteIncome();

    // Fetch function for VirtualList
    const fetchTransactions = async (page: number) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', ITEMS_PER_PAGE.toString());
        if (search) params.append('search', search);

        if (type === 'expense') {
            const url = `${API_ENDPOINTS.EXPENSES.BASE}?${params.toString()}`;
            const response = await apiClient.getRaw<{
                data: Expense[];
                meta: {
                    total: number;
                    page: number;
                    limit: number;
                    totalPages: number;
                    hasNext: boolean;
                    hasPrevious: boolean;
                };
            }>(url);

            return {
                data: response.data.map(item => ({ ...item, type: 'expense' as const })),
                hasMore: response.meta.hasNext,
                total: response.meta.total,
            };
        } else {
            // Income - fetch all for now (backend doesn't have pagination)
            const url = `${API_ENDPOINTS.INCOME.BASE}?${params.toString()}`;
            const response = await apiClient.get<Income[]>(url);

            // Ensure we have an array
            const dataArray = Array.isArray(response) ? response : [];

            // Client-side pagination for income
            const startIdx = (page - 1) * ITEMS_PER_PAGE;
            const endIdx = startIdx + ITEMS_PER_PAGE;
            const paginatedData = dataArray.slice(startIdx, endIdx);

            return {
                data: paginatedData.map(item => ({ ...item, type: 'income' as const })),
                hasMore: endIdx < dataArray.length,
                total: dataArray.length,
            };
        }
    };

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

        return (
            <div className="bg-card border border-border rounded-lg p-4 hover:bg-accent/5 transition-colors">
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
                            {formatCurrency(transaction.amount)}
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
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                <span className="hidden sm:inline">Add Transaction</span>
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

                {/* Virtual List */}
                <VirtualList
                    fetchData={fetchTransactions}
                    renderItem={renderTransactionCard}
                    getItemKey={(item) => item.id}
                    dependencies={[type, search]}
                    itemsPerPage={ITEMS_PER_PAGE}
                    enableDesktopPagination={true}
                />
            </div>
        </PageWrapper>
    );
}
