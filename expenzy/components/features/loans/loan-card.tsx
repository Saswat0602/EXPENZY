'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { UserAvatar } from '@/components/ui/user-avatar';
import { formatCurrency } from '@/lib/utils/format';
import type { Loan } from '@/types/loan';
import { cn } from '@/lib/utils';

interface LoanCardProps {
    loan: Loan;
    onClick?: () => void;
    className?: string;
}

export function LoanCard({ loan, onClick, className }: LoanCardProps) {
    // Determine if current user is lender or borrower
    const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') || '' : '';
    const isLender = loan.lenderUserId === currentUserId;
    const otherUser = isLender ? loan.borrower : loan.lender;

    const amount = parseFloat(loan.amount);
    const amountPaid = parseFloat(loan.amountPaid);
    const amountRemaining = parseFloat(loan.amountRemaining);
    const progress = amount > 0 ? (amountPaid / amount) * 100 : 0;

    const statusConfig = {
        active: { color: 'bg-yellow-500', label: 'Active' },
        paid: { color: 'bg-green-500', label: 'Paid' },
        waived: { color: 'bg-blue-500', label: 'Waived' },
        cancelled: { color: 'bg-gray-500', label: 'Cancelled' },
    };

    const status = statusConfig[loan.status] || statusConfig.active;

    return (
        <Card
            className={cn(
                'p-4 cursor-pointer hover:shadow-md transition-shadow',
                className
            )}
            onClick={onClick}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <UserAvatar
                        seed={otherUser.avatarSeed || undefined}
                        style={otherUser.avatarStyle || undefined}
                        fallbackUrl={otherUser.avatarUrl || otherUser.avatar}
                        fallbackName={otherUser.username}
                        size={40}
                    />
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{otherUser.username}</p>
                        {loan.description && (
                            <p className="text-xs text-muted-foreground truncate">
                                {loan.description}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge className={cn('text-xs', status.color)}>
                        {status.label}
                    </Badge>
                </div>
            </div>

            {/* Amount */}
            <div className="flex items-baseline justify-between mb-2">
                <span className="text-lg font-bold">
                    {formatCurrency(amount, loan.currency as 'INR' | 'USD' | 'EUR')}
                </span>
                {loan.status === 'active' && amountRemaining > 0 && (
                    <span className="text-xs text-muted-foreground">
                        {formatCurrency(amountRemaining, loan.currency as 'INR' | 'USD' | 'EUR')} left
                    </span>
                )}
            </div>

            {/* Progress Bar (only for active loans with partial payment) */}
            {loan.status === 'active' && amountPaid > 0 && (
                <div className="space-y-1">
                    <Progress value={progress} className="h-1.5" />
                    <p className="text-xs text-muted-foreground text-right">
                        {Math.round(progress)}% paid
                    </p>
                </div>
            )}

            {/* Group Badge */}
            {loan.group && (
                <div className="mt-2 pt-2 border-t">
                    <Badge variant="outline" className="text-xs">
                        {loan.group.icon} {loan.group.name}
                    </Badge>
                </div>
            )}
        </Card>
    );
}
