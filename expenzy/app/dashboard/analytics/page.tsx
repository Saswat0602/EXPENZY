'use client';

import { useState } from 'react';
import { useSpendingTrends, useCategoryBreakdown, useCashFlow } from '@/lib/hooks/use-analytics';
import { formatCurrency } from '@/lib/utils/format';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';
import type { AnalyticsPeriod } from '@/types';
import { PageHeader } from '@/components/layout/page-header';
import { PageWrapper } from '@/components/layout/page-wrapper';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function AnalyticsPage() {
    const [period, setPeriod] = useState<AnalyticsPeriod>('month');

    const { data: trends, isLoading: trendsLoading } = useSpendingTrends({ period });
    const { data: breakdown, isLoading: breakdownLoading } = useCategoryBreakdown({ period });
    const { data: cashFlow, isLoading: cashFlowLoading } = useCashFlow({ period });

    const isLoading = trendsLoading || breakdownLoading || cashFlowLoading;

    return (
        <PageWrapper>
            <div className="space-y-6">
                {/* Header */}
                <PageHeader
                    title="Analytics"
                    description="Insights into your spending"
                    action={
                        <Select
                            value={period}
                            onValueChange={(value) => setPeriod(value as AnalyticsPeriod)}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="week">This Week</SelectItem>
                                <SelectItem value="month">This Month</SelectItem>
                                <SelectItem value="quarter">This Quarter</SelectItem>
                                <SelectItem value="year">This Year</SelectItem>
                            </SelectContent>
                        </Select>
                    }
                />

                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                ) : (
                    <>
                        {/* Spending Trends */}
                        <div className="bg-card border border-border rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="w-5 h-5 text-primary" />
                                <h2 className="text-lg font-semibold">Spending Trends</h2>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Total Expenses</span>
                                    <span className="font-semibold">{formatCurrency(trends?.totalExpenses || 0)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Average Daily</span>
                                    <span className="font-semibold">{formatCurrency(trends?.averageDaily || 0)}</span>
                                </div>
                            </div>
                            {/* Simple bar visualization */}
                            <div className="mt-4 space-y-2">
                                {trends?.trend.slice(0, 7).map((day) => (
                                    <div key={day.date} className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground w-20">{day.date.slice(5)}</span>
                                        <div className="flex-1 bg-muted rounded-full h-2">
                                            <div
                                                className="bg-primary h-2 rounded-full"
                                                style={{
                                                    width: `${Math.min((day.amount / (trends.totalExpenses / 7)) * 100, 100)}%`,
                                                }}
                                            />
                                        </div>
                                        <span className="text-xs font-medium w-16 text-right">
                                            {formatCurrency(day.amount)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Category Breakdown */}
                        <div className="bg-card border border-border rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <PieChart className="w-5 h-5 text-primary" />
                                <h2 className="text-lg font-semibold">Category Breakdown</h2>
                            </div>
                            <div className="space-y-4">
                                {breakdown?.breakdown.slice(0, 5).map((category) => (
                                    <div key={category.categoryId} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{category.categoryName}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {category.transactionCount} transactions
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">{formatCurrency(category.totalAmount)}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {category.percentage.toFixed(1)}%
                                                </p>
                                            </div>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div
                                                className="bg-primary h-2 rounded-full transition-all"
                                                style={{ width: `${category.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Cash Flow */}
                        <div className="bg-card border border-border rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <BarChart3 className="w-5 h-5 text-primary" />
                                <h2 className="text-lg font-semibold">Cash Flow</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-sm text-muted-foreground">Total Income</p>
                                    <p className="text-xl font-bold text-success">
                                        {formatCurrency(cashFlow?.summary.totalIncome || 0)}
                                    </p>
                                </div>
                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-sm text-muted-foreground">Total Expense</p>
                                    <p className="text-xl font-bold text-destructive">
                                        {formatCurrency(cashFlow?.summary.totalExpense || 0)}
                                    </p>
                                </div>
                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-sm text-muted-foreground">Net Cash Flow</p>
                                    <p className="text-xl font-bold">
                                        {formatCurrency(cashFlow?.summary.netCashFlow || 0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </PageWrapper>
    );
}
