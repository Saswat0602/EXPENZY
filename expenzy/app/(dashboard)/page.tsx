'use client';

import { useDashboardSummary } from '@/lib/hooks/use-analytics';
import { formatCurrency, formatPercentage } from '@/lib/utils/format';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function DashboardPage() {
    const { data: dashboard, isLoading, error } = useDashboardSummary({ period: 'month' });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Failed to load dashboard data</p>
            </div>
        );
    }

    const summary = dashboard?.summary;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">Overview of your finances</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Balance */}
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Total Balance</span>
                        <Wallet className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold">{formatCurrency(summary?.totalBalance || 0)}</p>
                </div>

                {/* Total Income */}
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Income</span>
                        <ArrowUpRight className="w-5 h-5 text-success" />
                    </div>
                    <p className="text-2xl font-bold text-success">
                        {formatCurrency(summary?.totalIncome || 0)}
                    </p>
                </div>

                {/* Total Expenses */}
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Expenses</span>
                        <ArrowDownRight className="w-5 h-5 text-destructive" />
                    </div>
                    <p className="text-2xl font-bold text-destructive">
                        {formatCurrency(summary?.totalExpenses || 0)}
                    </p>
                </div>

                {/* Net Savings */}
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Net Savings</span>
                        <PiggyBank className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold">{formatCurrency(summary?.netSavings || 0)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {formatPercentage(summary?.savingsRate || 0)} savings rate
                    </p>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
                {dashboard?.recentTransactions && dashboard.recentTransactions.length > 0 ? (
                    <div className="space-y-3">
                        {dashboard.recentTransactions.slice(0, 5).map((transaction) => (
                            <div
                                key={transaction.id}
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === 'income'
                                                ? 'bg-success/10 text-success'
                                                : 'bg-destructive/10 text-destructive'
                                            }`}
                                    >
                                        {transaction.type === 'income' ? (
                                            <TrendingUp className="w-5 h-5" />
                                        ) : (
                                            <TrendingDown className="w-5 h-5" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium">{transaction.description}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {transaction.category?.name || 'Uncategorized'}
                                        </p>
                                    </div>
                                </div>
                                <p
                                    className={`font-semibold ${transaction.type === 'income' ? 'text-success' : 'text-destructive'
                                        }`}
                                >
                                    {transaction.type === 'income' ? '+' : '-'}
                                    {formatCurrency(transaction.amount)}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-8">No transactions yet</p>
                )}
            </div>

            {/* Top Categories */}
            <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Top Spending Categories</h2>
                {dashboard?.topCategories && dashboard.topCategories.length > 0 ? (
                    <div className="space-y-3">
                        {dashboard.topCategories.map((category) => (
                            <div key={category.categoryId} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{category.categoryName}</span>
                                    <span className="text-sm text-muted-foreground">
                                        {formatCurrency(category.totalAmount)}
                                    </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div
                                        className="bg-primary h-2 rounded-full transition-all"
                                        style={{
                                            width: `${Math.min(
                                                (category.totalAmount / (summary?.totalExpenses || 1)) * 100,
                                                100
                                            )}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-8">No category data yet</p>
                )}
            </div>
        </div>
    );
}
