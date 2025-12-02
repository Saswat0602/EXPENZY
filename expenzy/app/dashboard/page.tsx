'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboardSummary } from '@/lib/hooks/use-analytics';
import { useSavingsGoals } from '@/lib/hooks/use-savings';
import { useUpcomingSubscriptions } from '@/lib/hooks/use-subscriptions';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { GlassCard } from '@/components/shared/glass-card';
import { formatCurrency, formatPercentage, formatDate } from '@/lib/utils/format';
import {
    Wallet,
    PiggyBank,
    ArrowUpRight,
    ArrowDownRight,
    Target,
    Calendar,
    Plus,
    TrendingUp,
    ChevronRight,
    Sparkles,
    LucideIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ROUTES } from '@/lib/routes';
import { AddTransactionModal } from '@/components/modals/add-transaction-modal';
import { PageWrapper } from '@/components/layout/page-wrapper';

// Reusable Stat Card Component
interface StatCardProps {
    title: string;
    value: string;
    subtitle?: string;
    icon: LucideIcon;
    colorClass: string;
    borderColor: string;
}

const StatCard = ({ title, value, subtitle, icon: Icon, colorClass, borderColor }: StatCardProps) => (
    <GlassCard className={`p-4 lg:p-6 border ${borderColor}`}>
        <div className={`absolute top-0 right-0 w-20 lg:w-32 h-20 lg:h-32 ${colorClass}/5 rounded-full blur-xl transition-all group-hover:${colorClass}/10`} />
        <div className="relative z-10">
            <div className={`p-2 lg:p-3 rounded-lg lg:rounded-xl ${colorClass}/10 w-fit mb-3 lg:mb-4`}>
                <Icon className="w-4 lg:w-6 h-4 lg:h-6" style={{ color: `var(--color-${colorClass.replace('bg-', '')})` }} />
            </div>
            <p className="text-xs lg:text-sm text-muted-foreground mb-1">{title}</p>
            <p className={`text-xl lg:text-3xl font-bold tracking-tight ${colorClass !== 'bg-primary' ? `text-${colorClass.replace('bg-', '')}` : ''}`}>
                {value}
            </p>
            {subtitle && (
                <p className="text-xs lg:text-sm text-muted-foreground mt-1 lg:mt-2">{subtitle}</p>
            )}
        </div>
    </GlassCard>
);

// Reusable Section Header Component
interface SectionHeaderProps {
    icon: LucideIcon;
    title: string;
    actionLabel?: string;
    onAction?: () => void;
}

const SectionHeader = ({ icon: Icon, title, actionLabel, onAction }: SectionHeaderProps) => (
    <div className="flex items-center justify-between mb-4 lg:mb-6">
        <div className="flex items-center gap-2 lg:gap-3">
            <div className="p-1.5 lg:p-2 rounded-lg lg:rounded-xl bg-primary/10">
                <Icon className="w-4 lg:w-5 h-4 lg:h-5 text-primary" />
            </div>
            <h2 className="text-base lg:text-xl font-semibold">{title}</h2>
        </div>
        {actionLabel && onAction && (
            <Button
                variant="ghost"
                size="sm"
                onClick={onAction}
                className="hover:bg-primary/10 h-8 lg:h-9 text-xs lg:text-sm"
            >
                {actionLabel}
                <ChevronRight className="w-3 lg:w-4 h-3 lg:h-4 ml-1" />
            </Button>
        )}
    </div>
);

export default function DashboardPage() {
    const router = useRouter();
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const { data: dashboard, isLoading: dashboardLoading } = useDashboardSummary({ period: 'month' });
    const { data: savingsGoals = [], isLoading: savingsLoading } = useSavingsGoals();
    const { data: upcomingSubscriptions = [], isLoading: subscriptionsLoading } = useUpcomingSubscriptions();

    if (dashboardLoading) {
        return (
            <div className="space-y-4 p-4 lg:p-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-24 lg:h-40 bg-muted animate-pulse rounded-xl lg:rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    const summary = dashboard?.summary;

    return (
        <PageWrapper>
            <div className="space-y-4 lg:space-y-6">
                {/* Hero Section with Glassmorphism */}
                <GlassCard className="border-primary/20" hover={false} padding="lg">
                    <div className="absolute top-0 right-0 w-32 lg:w-64 h-32 lg:h-64 bg-primary/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-32 lg:w-64 h-32 lg:h-64 bg-accent/10 rounded-full blur-3xl" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 lg:mb-3">
                            <Sparkles className="w-4 lg:w-5 h-4 lg:h-5 text-primary" />
                            <span className="text-xs lg:text-sm font-medium text-primary">Financial Overview</span>
                        </div>
                        <h1 className="text-2xl lg:text-4xl font-bold mb-1 lg:mb-2">Welcome back!</h1>
                        <p className="text-sm lg:text-base text-muted-foreground mb-4 lg:mb-6">
                            Here's what's happening with your money
                        </p>

                        <Button
                            onClick={() => setIsTransactionModalOpen(true)}
                            className="w-full sm:w-auto shadow-lg shadow-primary/20"
                            size="default"
                        >
                            <Plus className="w-4 lg:w-5 h-4 lg:h-5 mr-2" />
                            Add Transaction
                        </Button>
                    </div>
                </GlassCard>

                <AddTransactionModal
                    open={isTransactionModalOpen}
                    onClose={() => setIsTransactionModalOpen(false)}
                />

                {/* Summary Cards - Responsive */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                    <StatCard
                        title="Total Balance"
                        value={formatCurrency(summary?.totalBalance || 0)}
                        icon={Wallet}
                        colorClass="bg-primary"
                        borderColor="border-border"
                    />
                    <StatCard
                        title="Income"
                        value={formatCurrency(summary?.totalIncome || 0)}
                        icon={ArrowUpRight}
                        colorClass="bg-success"
                        borderColor="border-success/20"
                    />
                    <StatCard
                        title="Expenses"
                        value={formatCurrency(summary?.totalExpenses || 0)}
                        icon={ArrowDownRight}
                        colorClass="bg-destructive"
                        borderColor="border-destructive/20"
                    />
                    <StatCard
                        title="Net Savings"
                        value={formatCurrency(summary?.netSavings || 0)}
                        subtitle={`${formatPercentage(summary?.savingsRate || 0)} savings rate`}
                        icon={PiggyBank}
                        colorClass="bg-info"
                        borderColor="border-info/20"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    {/* Savings Goals Widget */}
                    <GlassCard padding="md">
                        <SectionHeader
                            icon={Target}
                            title="Savings Goals"
                            actionLabel="View All"
                            onAction={() => router.push(ROUTES.SAVINGS)}
                        />

                        {savingsLoading ? (
                            <LoadingSkeleton count={2} />
                        ) : savingsGoals.length === 0 ? (
                            <EmptyState
                                icon={Target}
                                title="No savings goals yet"
                                description="Create your first savings goal"
                                action={{
                                    label: 'Create Goal',
                                    onClick: () => { },
                                }}
                            />
                        ) : (
                            <div className="space-y-3 lg:space-y-4">
                                {savingsGoals.slice(0, 3).map((goal) => {
                                    const progress = (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100;
                                    return (
                                        <div key={goal.id} className="space-y-2 lg:space-y-3 transition-all">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm lg:text-base font-semibold truncate pr-2">{goal.name}</span>
                                                <span className="text-xs lg:text-sm font-medium text-primary">{formatPercentage(progress)}</span>
                                            </div>
                                            <Progress value={Math.min(progress, 100)} className="h-1.5 lg:h-2.5" />
                                            <div className="flex items-center justify-between text-xs lg:text-sm text-muted-foreground">
                                                <span>{formatCurrency(goal.currentAmount)}</span>
                                                <span>{formatCurrency(goal.targetAmount)}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </GlassCard>

                    {/* Upcoming Subscriptions Widget */}
                    <GlassCard padding="md">
                        <SectionHeader
                            icon={Calendar}
                            title="Upcoming Subscriptions"
                            actionLabel="View All"
                            onAction={() => router.push(ROUTES.SUBSCRIPTIONS)}
                        />

                        {subscriptionsLoading ? (
                            <LoadingSkeleton count={2} />
                        ) : upcomingSubscriptions.length === 0 ? (
                            <EmptyState
                                icon={Calendar}
                                title="No subscriptions"
                                description="Add subscriptions to track payments"
                                action={{
                                    label: 'Add Subscription',
                                    onClick: () => { },
                                }}
                            />
                        ) : (
                            <div className="space-y-2">
                                {upcomingSubscriptions.slice(0, 5).map((sub) => (
                                    <div
                                        key={sub.id}
                                        className="flex items-center justify-between p-3 lg:p-4 rounded-lg lg:rounded-xl hover:bg-muted/70 backdrop-blur-sm transition-all cursor-pointer group/item"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-8 lg:w-10 h-8 lg:h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/10">
                                                <Calendar className="w-4 lg:w-5 h-4 lg:h-5 text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm lg:text-base font-semibold truncate group-hover/item:text-primary transition-colors">
                                                    {sub.name}
                                                </p>
                                                <p className="text-xs lg:text-sm text-muted-foreground">{formatDate(sub.nextBillingDate)}</p>
                                            </div>
                                        </div>
                                        <p className="font-bold text-sm lg:text-lg ml-2">{formatCurrency(sub.amount)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </GlassCard>
                </div>

                {/* Recent Transactions */}
                <GlassCard padding="md">
                    <SectionHeader
                        icon={TrendingUp}
                        title="Recent Transactions"
                        actionLabel="View All"
                        onAction={() => router.push(ROUTES.TRANSACTIONS)}
                    />

                    {dashboard?.recentTransactions && dashboard.recentTransactions.length > 0 ? (
                        <div className="space-y-2">
                            {dashboard.recentTransactions.slice(0, 5).map((transaction) => {
                                const categoryColor = transaction.category?.color || '#6B7280';

                                return (
                                    <div
                                        key={transaction.id}
                                        className="group/trans flex items-center gap-3 lg:gap-4 p-3 lg:p-4 rounded-lg lg:rounded-xl hover:bg-muted/70 backdrop-blur-sm transition-all cursor-pointer"
                                        onClick={() => router.push(ROUTES.TRANSACTIONS)}
                                    >
                                        <div
                                            className="w-8 lg:w-12 h-8 lg:h-12 rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover/trans:scale-110"
                                            style={{ backgroundColor: `${categoryColor}20` }}
                                        >
                                            <div
                                                className="w-2 lg:w-3 h-2 lg:h-3 rounded-full"
                                                style={{ backgroundColor: categoryColor }}
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm lg:text-base font-semibold truncate group-hover/trans:text-primary transition-colors">
                                                {transaction.description}
                                            </p>
                                            <div className="flex items-center gap-1.5 text-xs lg:text-sm text-muted-foreground mt-0.5 lg:mt-1">
                                                <span className="truncate">{transaction.category?.name || 'Other'}</span>
                                                <span>•</span>
                                                <span>{formatDate(transaction.date)}</span>
                                            </div>
                                        </div>

                                        <p className="text-sm lg:text-lg font-bold tabular-nums flex-shrink-0">
                                            {formatCurrency(transaction.amount)}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <EmptyState
                            title="No transactions yet"
                            description="Start tracking your finances"
                            action={{
                                label: 'Add Transaction',
                                onClick: () => setIsTransactionModalOpen(true),
                            }}
                        />
                    )}
                </GlassCard>

                {/* Top Categories */}
                <GlassCard padding="md">
                    <h2 className="text-base lg:text-xl font-semibold mb-4 lg:mb-6">Top Spending Categories</h2>
                    {dashboard?.topCategories && dashboard.topCategories.length > 0 ? (
                        <div className="space-y-3 lg:space-y-4">
                            {dashboard.topCategories.map((category, index) => (
                                <div key={category.categoryId} className="p-3 lg:p-4 rounded-lg lg:rounded-xl bg-muted/50 backdrop-blur-sm space-y-2 lg:space-y-3 transition-all hover:bg-muted/70">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 lg:gap-3">
                                            <div className="w-6 lg:w-8 h-6 lg:h-8 rounded-lg flex items-center justify-center text-xs lg:text-sm font-bold text-primary bg-primary/10">
                                                {index + 1}
                                            </div>
                                            <span className="text-sm lg:text-base font-semibold truncate">{category.categoryName}</span>
                                        </div>
                                        <span className="text-sm lg:text-lg font-bold ml-2">
                                            {formatCurrency(category.totalAmount)}
                                        </span>
                                    </div>
                                    <Progress
                                        value={Math.min(
                                            (category.totalAmount / (summary?.totalExpenses || 1)) * 100,
                                            100
                                        )}
                                        className="h-1.5 lg:h-2.5"
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 lg:py-12">
                            <div className="inline-flex items-center justify-center w-12 lg:w-16 h-12 lg:h-16 rounded-xl lg:rounded-2xl bg-muted mb-3 lg:mb-4">
                                <TrendingUp className="w-6 lg:w-8 h-6 lg:h-8 text-muted-foreground" />
                            </div>
                            <p className="text-sm lg:text-base text-muted-foreground">No category data yet</p>
                        </div>
                    )}
                </GlassCard>
            </div>
        </PageWrapper>
    );
}