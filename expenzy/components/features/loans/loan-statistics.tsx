'use client';

import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/format';
import { cn } from '@/lib/utils';
import type { LoanStatistics } from '@/types/loan';

interface LoanStatisticsProps {
    statistics: LoanStatistics;
}

export function LoanStatisticsCards({ statistics }: LoanStatisticsProps) {
    const stats = [
        {
            label: 'Lent',
            value: statistics.totalLentOutstanding,
            color: 'text-foreground',
        },
        {
            label: 'Borrowed',
            value: statistics.totalBorrowedOutstanding,
            color: 'text-foreground',
        },
        {
            label: 'Net Position',
            value: statistics.netPosition,
            color: statistics.netPosition >= 0 ? 'text-green-600' : 'text-red-600',
        },
    ];

    return (
        <div className="grid grid-cols-3 gap-3">
            {stats.map((stat) => (
                <Card key={stat.label} className="p-4">
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className={cn('text-lg md:text-xl font-bold', stat.color)}>
                            {formatCurrency(stat.value)}
                        </p>
                    </div>
                </Card>
            ))}
        </div>
    );
}
