'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GroupExpense } from '@/types/split';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatCurrency } from '@/lib/utils/currency';
import { calculateUserExpenseBalance } from '@/lib/utils/balance-utils';
import { CategoryIcon } from '@/lib/categorization/category-icons';
import { useDeleteGroupExpense } from '@/lib/hooks/use-group-expenses';
import { Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { UserAvatar } from '@/components/ui/user-avatar';

interface ExpenseDetailModalProps {
    expense: GroupExpense | null;
    isOpen: boolean;
    onClose: () => void;
    currentUserId: string;
    groupId: string;
    isMobile?: boolean;
}

export function ExpenseDetailModal({
    expense,
    isOpen,
    onClose,
    currentUserId,
    groupId,
    isMobile = false,
}: ExpenseDetailModalProps) {
    const router = useRouter();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const deleteExpense = useDeleteGroupExpense();


    if (!expense) return null;

    const balance = calculateUserExpenseBalance(expense, currentUserId);
    const categoryIconName = expense.category?.icon || 'MoreHorizontal';
    const isPaidByYou = expense.paidByUserId === currentUserId;
    const paidByName = expense.paidBy
        ? `${expense.paidBy.firstName} ${expense.paidBy.lastName}`.trim()
        : 'Unknown';

    const handleEdit = () => {
        onClose();
        router.push(`/dashboard/groups/${groupId}/add-expense?expenseId=${expense.id}`);
    };

    const handleDelete = async () => {
        try {
            await deleteExpense.mutateAsync({ groupId, expenseId: expense.id });
            toast.success('Expense deleted successfully');
            onClose();
        } catch {
            // Error handled by mutation
        }
    };

    const content = (
        <div className="space-y-4">
            {/* Header Section - Compact */}
            <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CategoryIcon
                        iconName={categoryIconName}
                        color={expense.category?.color}
                        className="h-6 w-6"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold truncate">{expense.description}</h3>
                    <p className="text-2xl font-bold text-primary">
                        {formatCurrency(Number(expense.amount), expense.currency as 'INR' | 'USD' | 'EUR')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(expense.expenseDate), 'MMM dd, yyyy')}
                    </p>
                </div>
            </div>

            {/* Payer Info - Compact */}
            <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1 uppercase">Paid by</p>
                <p className="text-sm font-semibold">
                    {isPaidByYou ? 'You' : paidByName} paid {formatCurrency(Number(expense.amount), expense.currency as 'INR' | 'USD' | 'EUR')}
                </p>
            </div>

            {/* Your Balance - Compact */}
            {balance.displayText !== 'not involved' && balance.displayText !== 'settled' && (
                <div className={`rounded-lg p-3 ${balance.youLent > 0
                    ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50'
                    : 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50'
                    }`}>
                    <p className={`text-xs font-bold mb-1 uppercase ${balance.youLent > 0
                        ? 'text-green-700 dark:text-green-400'
                        : 'text-red-700 dark:text-red-400'
                        }`}>
                        {balance.youLent > 0 ? 'You lent' : 'You borrowed'}
                    </p>
                    <p className={`text-2xl font-bold ${balance.youLent > 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                        }`}>
                        {formatCurrency(
                            balance.youLent > 0 ? balance.youLent : balance.youBorrowed,
                            expense.currency as 'INR' | 'USD' | 'EUR'
                        )}
                    </p>
                </div>
            )}

            {/* Participants - Compact */}
            <div>
                <p className="text-xs font-bold text-muted-foreground mb-2 uppercase">Split with</p>
                <div className="space-y-1.5">
                    {expense.splits?.map((split) => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const userData = split.user as any;
                        return (
                            <div key={split.id} className="flex items-center justify-between py-2 px-3 bg-muted/20 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <UserAvatar
                                        seed={userData?.avatarSeed}
                                        style={userData?.avatarStyle}
                                        fallbackName={split.user?.firstName || 'Unknown'}
                                        size={32}
                                    />
                                    <span className="text-sm font-medium">
                                        {split.userId === currentUserId
                                            ? 'You'
                                            : `${split.user?.firstName || 'Unknown'} ${split.user?.lastName || ''}`.trim()}
                                    </span>
                                </div>
                                <span className="text-sm font-bold">
                                    {formatCurrency(Number(split.amountOwed), expense.currency as 'INR' | 'USD' | 'EUR')}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>



            {/* Actions - Compact */}
            <div className="flex gap-2 pt-1">
                <Button
                    variant="outline"
                    size="default"
                    className="flex-1 h-10 text-sm font-medium"
                    onClick={handleEdit}
                >
                    <Pencil className="h-4 w-4 mr-1.5" />
                    Edit
                </Button>
                <Button
                    variant="destructive"
                    size="default"
                    className="flex-1 h-10 text-sm font-medium"
                    onClick={() => setShowDeleteDialog(true)}
                >
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    Delete
                </Button>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="max-w-[90vw] rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl">Delete expense?</AlertDialogTitle>
                        <AlertDialogDescription className="text-base">
                            This will permanently delete &quot;{expense.description}&quot; and cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                        <AlertDialogCancel className="h-12 text-base font-semibold rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="h-12 text-base font-semibold rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deleteExpense.isPending}
                        >
                            {deleteExpense.isPending ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );

    // Mobile: Use Sheet
    if (isMobile) {
        return (
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent
                    side="bottom"
                    className="h-[85vh] rounded-t-3xl px-4 pt-4"
                >
                    <SheetHeader className="text-left mb-4">
                        <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto mb-3" />
                        <SheetTitle className="sr-only">Expense Details</SheetTitle>
                    </SheetHeader>
                    <div className="overflow-y-auto h-[calc(85vh-80px)] pb-4 -mx-4 px-4">
                        {content}
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    // Desktop: Use Dialog
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[420px]">
                <DialogHeader>
                    <DialogTitle className="sr-only">Expense Details</DialogTitle>
                </DialogHeader>
                {content}
            </DialogContent>
        </Dialog>
    );
}
