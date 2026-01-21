// Utility functions for split calculations and formatting

export function calculateEqualSplit(amount: number, numPeople: number): number {
    return amount / numPeople;
}

export function calculatePercentageSplit(amount: number, percentage: number): number {
    return (amount * percentage) / 100;
}

export function calculateSharesSplit(amount: number, shares: number, totalShares: number): number {
    return (amount * shares) / totalShares;
}

export function validateExactSplits(splits: Array<{ amount: number }>, totalAmount: number): {
    valid: boolean;
    error?: string;
    difference?: number;
} {
    const sum = splits.reduce((acc, split) => acc + split.amount, 0);
    const difference = Math.abs(sum - totalAmount);

    if (difference > 0.01) {
        return {
            valid: false,
            error: `Split amounts ${sum > totalAmount ? 'exceed' : 'under'} total by ₹${difference.toFixed(2)}`,
            difference,
        };
    }

    return { valid: true };
}

export function validatePercentageSplits(splits: Array<{ percentage: number }>): {
    valid: boolean;
    error?: string;
    total?: number;
} {
    const total = splits.reduce((acc, split) => acc + split.percentage, 0);

    if (Math.abs(total - 100) > 0.01) {
        return {
            valid: false,
            error: `Percentages ${total > 100 ? 'exceed' : 'under'} 100% by ${Math.abs(total - 100).toFixed(2)}%`,
            total,
        };
    }

    return { valid: true, total };
}

export function formatCurrency(amount: number | string, currency: string = 'INR'): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (currency === 'INR') {
        return `₹${numAmount.toFixed(2)}`;
    }

    return `${currency} ${numAmount.toFixed(2)}`;
}

export function formatBalance(balance: number): {
    text: string;
    color: 'green' | 'red' | 'neutral';
    amount: string;
} {
    if (Math.abs(balance) < 0.01) {
        return {
            text: 'Settled up',
            color: 'neutral',
            amount: '₹0.00',
        };
    }

    if (balance > 0) {
        return {
            text: `You are owed`,
            color: 'green',
            amount: `₹${balance.toFixed(2)}`,
        };
    }

    return {
        text: `You owe`,
        color: 'red',
        amount: `₹${Math.abs(balance).toFixed(2)}`,
    };
}

export function getSplitTypeLabel(splitType: string): string {
    const labels: Record<string, string> = {
        equal: 'Split Equally',
        exact: 'Exact Amounts',
        percentage: 'By Percentage',
        shares: 'By Shares',
    };

    return labels[splitType] || splitType;
}

export function calculateTotalShares(participants: Array<{ shares?: number }>): number {
    return participants.reduce((sum, p) => sum + (p.shares || 0), 0);
}
