'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useDeleteGroupExpense } from '@/lib/hooks/use-group-expenses';
import { formatCurrency, getSplitTypeLabel } from '@/lib/utils/split-utils';
import type { GroupExpense } from '@/types/split';

interface ExpenseCardProps {
    expense: GroupExpense;
    groupId: string;
    currentUserId: string;
}

export function ExpenseCard({ expense, groupId, currentUserId }: ExpenseCardProps) {
    const deleteExpense = useDeleteGroupExpense();

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this expense?')) {
            return;
        }

        try {
            await deleteExpense.mutateAsync({ groupId, expenseId: expense.id });
        } catch {
            // Error handled by mutation
        }
    };

    const userSplit = expense.splits.find((s) => s.userId === currentUserId);
    const isPayer = expense.paidByUserId === currentUserId;
    const canEdit = isPayer; // Only payer can edit/delete

    // Calculate user's involvement
    const userAmount = userSplit ? parseFloat(userSplit.amountOwed) : 0;
    const paidAmount = parseFloat(expense.amount);

    let userStatus = '';
    let statusColor = '';

    if (isPayer && userAmount === paidAmount) {
        userStatus = 'You paid';
        statusColor = 'text-muted-foreground';
    } else if (isPayer) {
        userStatus = `You lent ₹${(paidAmount - userAmount).toFixed(2)}`;
        statusColor = 'text-green-600';
    } else if (userAmount > 0) {
        userStatus = `You owe ₹${userAmount.toFixed(2)}`;
        statusColor = 'text-red-600';
    } else {
        userStatus = 'Not involved';
        statusColor = 'text-muted-foreground';
    }

    return (
        <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    {/* Date */}
                    <div className="text-xs text-muted-foreground mb-1">
                        {new Date(expense.expenseDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                        })}
                    </div>

                    {/* Description */}
                    <h4 className="font-semibold text-base mb-1 truncate">{expense.description}</h4>

                    {/* Paid by */}
                    <div className="text-sm text-muted-foreground mb-2">
                        Paid by{' '}
                        <span className="font-medium">
                            {isPayer ? 'you' : expense.paidBy.username}
                        </span>
                        {' • '}
                        <span className="text-xs">{getSplitTypeLabel(expense.splitType)}</span>
                    </div>

                    {/* User status */}
                    <div className={`text-sm font-medium ${statusColor}`}>{userStatus}</div>

                    {/* Notes */}
                    {expense.notes && (
                        <div className="text-xs text-muted-foreground mt-2 italic">
                            {expense.notes}
                        </div>
                    )}
                </div>

                {/* Amount and Actions */}
                <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                        <div className="text-lg font-bold">
                            {formatCurrency(parseFloat(expense.amount))}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {expense.splits.length} {expense.splits.length === 1 ? 'person' : 'people'}
                        </div>
                    </div>

                    {canEdit && (
                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDelete}
                                disabled={deleteExpense.isPending}
                                className="h-8 w-8 p-0"
                            >
                                <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Split details - expandable */}
            {expense.splits.length > 0 && (
                <details className="mt-3 pt-3 border-t">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                        View split details
                    </summary>
                    <div className="mt-2 space-y-1">
                        {expense.splits.map((split) => (
                            <div
                                key={split.id}
                                className="flex justify-between text-sm py-1"
                            >
                                <span className={split.userId === currentUserId ? 'font-medium' : ''}>
                                    {split.user?.username || 'Unknown'}
                                    {split.userId === currentUserId && ' (you)'}
                                </span>
                                <span className="text-muted-foreground">
                                    ₹{parseFloat(split.amountOwed).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                </details>
            )}
        </Card>
    );
}
