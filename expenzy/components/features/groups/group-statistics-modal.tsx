'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { formatCurrency } from '@/lib/utils/currency';
import type { GroupStatistics } from '@/lib/hooks/use-group-statistics';
import type { SimplifiedDebt } from '@/types/split';
import { TrendingUp, TrendingDown, Receipt } from 'lucide-react';

interface GroupStatisticsModalProps {
    isOpen: boolean;
    onClose: () => void;
    statistics: GroupStatistics | undefined;
    simplifiedDebts?: SimplifiedDebt[];
    currentUserId?: string;
    isMobile?: boolean;
    currency?: 'INR' | 'USD' | 'EUR';
}

export function GroupStatisticsModal({
    isOpen,
    onClose,
    statistics,
    simplifiedDebts = [],
    currentUserId,
    isMobile = false,
    currency = 'INR',
}: GroupStatisticsModalProps) {
    if (!statistics) return null;

    const content = (
        <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                        <p className="text-xs font-medium text-muted-foreground">Total Expenses</p>
                    </div>
                    <p className="text-2xl font-bold">{statistics.expenseCount}</p>
                </div>

                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Average</p>
                    <p className="text-2xl font-bold">
                        {formatCurrency(statistics.averageExpense, currency)}
                    </p>
                </div>
            </div>

            {/* Spending Breakdown */}
            <div className="space-y-3">
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <p className="text-sm font-medium text-primary">
                            Group Total
                        </p>
                    </div>
                    <p className="text-3xl font-bold text-primary">
                        {formatCurrency(statistics.totalSpending, currency)}
                    </p>
                </div>

                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="h-4 w-4 text-primary" />
                        <p className="text-sm font-medium text-primary">
                            You Paid
                        </p>
                    </div>
                    <p className="text-3xl font-bold text-primary">
                        {formatCurrency(statistics.yourTotalSpending, currency)}
                    </p>
                </div>
            </div>

            {/* Settlements - Debt Simplification */}
            <div>
                <h4 className="text-sm font-semibold mb-3">Settlements</h4>
                {simplifiedDebts.length === 0 ? (
                    <div className="p-4 rounded-lg bg-muted/30 border border-border text-center">
                        <p className="text-base font-medium text-green-600 dark:text-green-400">
                            ✓ All settled up!
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            No pending payments
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {simplifiedDebts.map((debt, index) => {
                            const isYouOwing = debt.fromUserId === currentUserId;
                            const isYouReceiving = debt.toUserId === currentUserId;

                            // Get the other person's name
                            const otherPersonName = isYouOwing
                                ? (debt.toUser
                                    ? `${debt.toUser.firstName || ''} ${debt.toUser.lastName || ''}`.trim() || debt.toUser.username
                                    : 'Unknown')
                                : (debt.fromUser
                                    ? `${debt.fromUser.firstName || ''} ${debt.fromUser.lastName || ''}`.trim() || debt.fromUser.username
                                    : 'Unknown');

                            // Create simple text
                            const displayText = isYouOwing
                                ? `You owe ${otherPersonName}`
                                : isYouReceiving
                                    ? `You lent ${otherPersonName}`
                                    : `${debt.fromUser?.firstName || 'Unknown'} owes ${debt.toUser?.firstName || 'Unknown'}`;

                            return (
                                <div
                                    key={index}
                                    className="p-3 rounded-lg bg-muted/20 border border-border hover:bg-muted/30 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-sm">{displayText}</span>
                                        <span className={`font-semibold ${isYouOwing
                                            ? 'text-red-500 dark:text-red-400'
                                            : isYouReceiving
                                                ? 'text-green-600 dark:text-green-400'
                                                : 'text-foreground'
                                            }`}>
                                            {formatCurrency(debt.amount, currency)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Category Breakdown */}
            {Object.keys(statistics.categoryBreakdown).length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold mb-3">Category Breakdown</h4>
                    <div className="space-y-2">
                        {Object.entries(statistics.categoryBreakdown)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 5)
                            .map(([category, amount]) => (
                                <div
                                    key={category}
                                    className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border"
                                >
                                    <span className="font-medium">{category}</span>
                                    <span className="font-semibold">
                                        {formatCurrency(amount, currency)}
                                    </span>
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );

    if (isMobile) {
        return (
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl px-4 pt-4">
                    <SheetHeader className="text-left mb-4">
                        <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto mb-3" />
                        <SheetTitle className="text-xl font-bold">Group Statistics</SheetTitle>
                    </SheetHeader>
                    <div className="overflow-y-auto h-[calc(85vh-80px)] pb-4 -mx-4 px-4">
                        {content}
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Group Statistics</DialogTitle>
                </DialogHeader>
                {content}
            </DialogContent>
        </Dialog>
    );
}
