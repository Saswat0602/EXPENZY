'use client';

import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/format';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react';
import type { LoanStatistics } from '@/types/loan';

interface LoanStatisticsProps {
    statistics: LoanStatistics;
}

export function LoanStatisticsCards({ statistics }: LoanStatisticsProps) {
    const stats = [
        {
            label: 'Lent',
            value: statistics.totalLent,
            outstanding: statistics.totalLentOutstanding,
            icon: TrendingUp,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            label: 'Borrowed',
            value: statistics.totalBorrowed,
            outstanding: statistics.totalBorrowedOutstanding,
            icon: TrendingDown,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
        },
        {
            label: 'Net Position',
            value: statistics.netPosition,
            icon: DollarSign,
            color: statistics.netPosition >= 0 ? 'text-green-600' : 'text-red-600',
            bgColor: statistics.netPosition >= 0 ? 'bg-green-50' : 'bg-red-50',
        },
        {
            label: 'Overdue',
            value: statistics.overdueAmount,
            icon: AlertCircle,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            show: statistics.overdueAmount > 0,
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => {
                if (stat.show === false) return null;

                const Icon = stat.icon;

                return (
                    <Card key={stat.label} className="p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                                <p className="text-xl font-bold">{formatCurrency(stat.value)}</p>
                                {stat.outstanding !== undefined && stat.outstanding > 0 && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formatCurrency(stat.outstanding)} outstanding
                                    </p>
                                )}
                            </div>
                            <div className={`p-2 rounded-full ${stat.bgColor}`}>
                                <Icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
