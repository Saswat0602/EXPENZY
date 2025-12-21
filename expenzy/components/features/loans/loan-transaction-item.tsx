'use client';

import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils/format';

interface LoanTransactionItemProps {
    date: Date;
    description: string;
    amount: number;
    currency: 'INR' | 'USD' | 'EUR';
    isLent: boolean;
}

export function LoanTransactionItem({
    date,
    description,
    amount,
    currency,
    isLent,
}: LoanTransactionItemProps) {
    const loanDate = new Date(date);
    const dayMonth = loanDate.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit'
    });

    return (
        <div className="flex items-center gap-3 py-3 hover:bg-muted/30 transition-colors border-b border-border/40 last:border-0">
            {/* Date */}
            <div className="flex flex-col items-center w-12 flex-shrink-0">
                <span className="text-xs text-muted-foreground font-medium">
                    {dayMonth.split(' ')[0]}
                </span>
                <span className="text-lg font-bold">
                    {dayMonth.split(' ')[1]}
                </span>
            </div>

            {/* Description & Amount */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">
                            {description || (isLent ? 'Loan given' : 'Loan received')}
                        </p>
                    </div>

                    {/* Amount */}
                    <div className="text-right flex-shrink-0">
                        <p className={cn(
                            'text-base font-bold whitespace-nowrap',
                            isLent ? 'text-green-600' : 'text-red-600'
                        )}>
                            {formatCurrency(amount, currency)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {isLent ? 'you lent' : 'borrowed'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
