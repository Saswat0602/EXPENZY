import React from 'react';
import { cn } from '@/lib/utils/cn';
import { formatBalance, getBalanceColor, getBalanceText } from '@/lib/utils/balance-utils';

interface BalanceSummaryProps {
    balance: number;
    currency?: string;
    className?: string;
    showLabel?: boolean;
}

export const BalanceSummary: React.FC<BalanceSummaryProps> = ({
    balance,
    currency = 'INR',
    className,
    showLabel = true,
}) => {
    const balanceText = getBalanceText(balance);
    const balanceColor = getBalanceColor(balance);
    const formattedBalance = formatBalance(balance, currency);

    if (balance === 0) {
        return (
            <div className={cn('text-sm text-muted-foreground', className)}>
                {showLabel && <span className="mr-1">Overall,</span>}
                <span className="font-medium">settled up</span>
            </div>
        );
    }

    return (
        <div className={cn('text-sm', className)}>
            {showLabel && (
                <span className="text-muted-foreground">
                    Overall, you {balanceText}{' '}
                </span>
            )}
            <span className={cn('font-semibold', balanceColor)}>
                {formattedBalance}
            </span>
        </div>
    );
};
