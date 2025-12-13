'use client';

import { useState } from 'react';
import { useRecurringExpenses } from '@/lib/hooks/use-recurring-expenses';
import { AddRecurringExpenseModal } from '@/components/modals/add-recurring-expense-modal';
import { RecurringExpensesList } from '@/components/features/recurring-expenses-list';
import { PageHeader } from '@/components/layout/page-header';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { Button } from '@/components/ui/button';
import { Plus, Repeat } from 'lucide-react';

export default function RecurringExpensesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: recurringExpenses = [], isLoading } = useRecurringExpenses();

    return (
        <PageWrapper>
            <div className="space-y-6">
                {/* Header */}
                <PageHeader
                    title="Recurring Expenses"
                    description="Manage expenses that repeat automatically"
                    action={
                        <Button onClick={() => setIsModalOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Recurring Expense
                        </Button>
                    }
                />

                {/* Modal */}
                <AddRecurringExpenseModal
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />

                {/* Content */}
                {isLoading ? (
                    <LoadingSkeleton count={3} />
                ) : recurringExpenses.length === 0 ? (
                    <EmptyState
                        icon={Repeat}
                        title="No recurring expenses"
                        description="Set up expenses that repeat automatically, like rent, subscriptions, or monthly bills"
                        action={{
                            label: 'Add Recurring Expense',
                            onClick: () => setIsModalOpen(true),
                        }}
                    />
                ) : (
                    <RecurringExpensesList />
                )}
            </div>
        </PageWrapper>
    );
}
