'use client';

import { useRouter } from 'next/navigation';
import { useDashboardSummary } from '@/lib/hooks/use-analytics';
import { useSavingsGoals } from '@/lib/hooks/use-savings';
import { useUpcomingSubscriptions } from '@/lib/hooks/use-subscriptions';
import { StatCard } from '@/components/shared/stat-card';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { formatCurrency, formatPercentage, formatDate } from '@/lib/utils/format';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    PiggyBank,
    ArrowUpRight,
    ArrowDownRight,
    Target,
    Calendar,
    Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ROUTES } from '@/lib/routes';

export default function DashboardPage() {
    const router = useRouter();
    const { data: dashboard, isLoading: dashboardLoading } = useDashboardSummary({ period: 'month' });
    const { data: savingsGoals = [], isLoading: savingsLoading } = useSavingsGoals();
    const { data: upcomingSubscriptions = [], isLoading: subscriptionsLoading } = useUpcomingSubscriptions();

    if (dashboardLoading) {
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

    const summary = dashboard?.summary;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">Overview of your finances</p>
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Transaction
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Balance"
                    value={formatCurrency(summary?.totalBalance || 0)}
                    icon={Wallet}
                />
                <StatCard
                    title="Income"
                    value={formatCurrency(summary?.totalIncome || 0)}
                    icon={ArrowUpRight}
                    className="border-l-4 border-l-success"
                />
                <StatCard
                    title="Expenses"
                    value={formatCurrency(summary?.totalExpenses || 0)}
                    icon={ArrowDownRight}
                    className="border-l-4 border-l-destructive"
                />
                <StatCard
                    title="Net Savings"
                    value={formatCurrency(summary?.netSavings || 0)}
                    description={`${formatPercentage(summary?.savingsRate || 0)} savings rate`}
                    icon={PiggyBank}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Savings Goals Widget */}
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary" />
                            Savings Goals
                        </h2>
                        <Button variant="ghost" size="sm" onClick={() => router.push(ROUTES.SAVINGS)}>
                            View All
                        </Button>
                    </div>

                    {savingsLoading ? (
                        <LoadingSkeleton count={2} />
                    ) : savingsGoals.length === 0 ? (
                        <EmptyState
                            icon={Target}
                            title="No savings goals yet"
                            description="Create your first savings goal to start tracking progress"
                            action={{
                                label: 'Create Goal',
                                onClick: () => { },
                            }}
                        />
                    ) : (
                        <div className="space-y-4">
                            {savingsGoals.slice(0, 3).map((goal) => {
                                const progress = (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100;
                                return (
                                    <div key={goal.id} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{goal.name}</span>
                                            <span className="text-sm text-muted-foreground">
                                                {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                                            </span>
                                        </div>
                                        <Progress value={Math.min(progress, 100)} className="h-2" />
                                        <p className="text-xs text-muted-foreground">
                                            {formatPercentage(progress)} complete
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Upcoming Subscriptions Widget */}
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            Upcoming Subscriptions
                        </h2>
                        <Button variant="ghost" size="sm" onClick={() => router.push(ROUTES.SUBSCRIPTIONS)}>View All</Button>
                    </div>

                    {subscriptionsLoading ? (
                        <LoadingSkeleton count={2} />
                    ) : upcomingSubscriptions.length === 0 ? (
                        <EmptyState
                            icon={Calendar}
                            title="No subscriptions"
                            description="Add subscriptions to track recurring payments"
                            action={{
                                label: 'Add Subscription',
                                onClick: () => { },
                            }}
                        />
                    ) : (
                        <div className="space-y-3">
                            {upcomingSubscriptions.slice(0, 5).map((sub) => (
                                <div
                                    key={sub.id}
                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                                >
                                    <div>
                                        <p className="font-medium">{sub.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Next: {formatDate(sub.nextBillingDate)}
                                        </p>
                                    </div>
                                    <p className="font-semibold">{formatCurrency(sub.amount)}</p>
                                </div>
                            ))}
                        </div>
                    )}
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
                    <EmptyState
                        title="No transactions yet"
                        description="Start tracking your finances by adding your first transaction"
                        action={{
                            label: 'Add Transaction',
                            onClick: () => { },
                        }}
                    />
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
                                <Progress
                                    value={Math.min(
                                        (category.totalAmount / (summary?.totalExpenses || 1)) * 100,
                                        100
                                    )}
                                    className="h-2"
                                />
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
