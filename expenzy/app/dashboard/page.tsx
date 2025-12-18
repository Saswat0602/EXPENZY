'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboardSummary } from '@/lib/hooks/use-analytics';
import { useSavingsGoals } from '@/lib/hooks/use-savings';
import { EmptyState } from '@/components/shared/empty-state';
import { formatCurrency, formatPercentage, formatDate } from '@/lib/utils/format';
import {
    Wallet,
    PiggyBank,
    ArrowUpRight,
    ArrowDownRight,
    Target,
    Plus,
    TrendingUp,
    ChevronRight,
    Sparkles,
    LucideIcon
} from 'lucide-react';
import { CategoryIcon, formatCategoryName } from '@/lib/categorization/category-icons';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ROUTES } from '@/lib/routes';
import { TransactionModal } from '@/components/modals/transaction-modal';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { cn } from '@/lib/utils/cn';

// Simplified Stat Card Component with global CSS colors
interface StatCardProps {
    title: string;
    value: string;
    subtitle?: string;
    icon: LucideIcon;
    variant: 'primary' | 'success' | 'destructive' | 'info';
}

const StatCard = ({ title, value, subtitle, icon: Icon, variant }: StatCardProps) => {
    const variantStyles = {
        primary: 'border-border bg-card',
        success: 'border-success/20 bg-success/5',
        destructive: 'border-destructive/20 bg-destructive/5',
        info: 'border-info/20 bg-info/5',
    };

    const iconStyles = {
        primary: 'bg-primary/10 text-primary',
        success: 'bg-success/10 text-success',
        destructive: 'bg-destructive/10 text-destructive',
        info: 'bg-info/10 text-info',
    };

    const valueStyles = {
        primary: 'text-foreground',
        success: 'text-success',
        destructive: 'text-destructive',
        info: 'text-info',
    };

    return (
        <div className={cn(
            'relative overflow-hidden rounded-lg sm:rounded-xl border p-3 sm:p-4 lg:p-5 transition-all hover:shadow-md',
            variantStyles[variant]
        )}>
            <div className={cn('p-1.5 sm:p-2 rounded-lg w-fit mb-2 sm:mb-3', iconStyles[variant])}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">{title}</p>
            <p className={cn('text-lg sm:text-xl lg:text-2xl font-bold tracking-tight', valueStyles[variant])}>
                {value}
            </p>
            {subtitle && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
        </div>
    );
};

// Section Header Component
interface SectionHeaderProps {
    icon: LucideIcon;
    title: string;
    actionLabel?: string;
    onAction?: () => void;
}

const SectionHeader = ({ icon: Icon, title, actionLabel, onAction }: SectionHeaderProps) => (
    <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold">{title}</h2>
        </div>
        {actionLabel && onAction && (
            <Button
                variant="ghost"
                size="sm"
                onClick={onAction}
                className="hover:bg-primary/10 h-8 text-xs sm:text-sm"
            >
                {actionLabel}
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
            </Button>
        )}
    </div>
);

export default function DashboardPage() {
    const router = useRouter();
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

    // Fetch year-to-date data instead of just current month
    const { data: dashboard, isLoading: dashboardLoading } = useDashboardSummary({ period: 'year' });
    const { data: savingsGoals = [], isLoading: savingsLoading } = useSavingsGoals();

    if (dashboardLoading) {
        return (
            <PageWrapper>
                <div className="space-y-3 sm:space-y-4">
                    <div className="h-32 sm:h-40 bg-muted animate-pulse rounded-lg sm:rounded-xl" />
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-24 sm:h-32 bg-muted animate-pulse rounded-lg sm:rounded-xl" />
                        ))}
                    </div>
                </div>
            </PageWrapper>
        );
    }

    const summary = dashboard?.summary || {
        totalIncome: 0,
        totalExpenses: 0,
        netSavings: 0,
        savingsRate: 0,
    };

    // Calculate total balance as net savings (income - expenses)
    const totalBalance = summary.netSavings;

    return (
        <PageWrapper>
            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                {/* Hero Section - Compact */}
                <div className="relative overflow-hidden rounded-lg sm:rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-4 sm:p-5 lg:p-6">
                    <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-primary/10 rounded-full blur-2xl" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-accent/10 rounded-full blur-2xl" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                            <span className="text-xs sm:text-sm font-medium text-primary">Financial Overview</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">Welcome back!</h1>
                        <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                            Here&apos;s what&apos;s happening with your money
                        </p>

                        <Button
                            onClick={() => setIsTransactionModalOpen(true)}
                            className="w-full sm:w-auto shadow-lg shadow-primary/20"
                            size="default"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Transaction
                        </Button>
                    </div>
                </div>

                <TransactionModal
                    open={isTransactionModalOpen}
                    onClose={() => setIsTransactionModalOpen(false)}
                    mode="add"
                />

                {/* Summary Cards - Mobile First */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                    <StatCard
                        title="Total Balance"
                        value={formatCurrency(totalBalance)}
                        icon={Wallet}
                        variant="primary"
                    />
                    <StatCard
                        title="Income"
                        value={formatCurrency(summary.totalIncome)}
                        icon={ArrowUpRight}
                        variant="success"
                    />
                    <StatCard
                        title="Expenses"
                        value={formatCurrency(summary.totalExpenses)}
                        icon={ArrowDownRight}
                        variant="destructive"
                    />
                    <StatCard
                        title="Net Savings"
                        value={formatCurrency(summary.netSavings)}
                        subtitle={`${formatPercentage(summary.savingsRate)} savings rate`}
                        icon={PiggyBank}
                        variant="info"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                    {/* Savings Goals Widget */}
                    <div className="rounded-lg sm:rounded-xl border bg-card p-4 sm:p-5">
                        <SectionHeader
                            icon={Target}
                            title="Savings Goals"
                            actionLabel="View All"
                            onAction={() => router.push(ROUTES.SAVINGS)}
                        />

                        {savingsLoading ? (
                            <div className="space-y-3">
                                {[...Array(2)].map((_, i) => (
                                    <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                                ))}
                            </div>
                        ) : savingsGoals.length === 0 ? (
                            <EmptyState
                                icon={Target}
                                title="No savings goals yet"
                                description="Create your first savings goal"
                                action={{
                                    label: 'Create Goal',
                                    onClick: () => router.push(ROUTES.SAVINGS),
                                }}
                            />
                        ) : (
                            <div className="space-y-3 sm:space-y-4">
                                {savingsGoals.slice(0, 3).map((goal) => {
                                    const progress = (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100;
                                    return (
                                        <div key={goal.id} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm sm:text-base font-semibold truncate pr-2">{goal.name}</span>
                                                <span className="text-xs sm:text-sm font-medium text-primary">{formatPercentage(progress)}</span>
                                            </div>
                                            <Progress value={Math.min(progress, 100)} className="h-2" />
                                            <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
                                                <span>{formatCurrency(goal.currentAmount)}</span>
                                                <span>{formatCurrency(goal.targetAmount)}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Recent Transactions */}
                    <div className="rounded-lg sm:rounded-xl border bg-card p-4 sm:p-5">
                        <SectionHeader
                            icon={TrendingUp}
                            title="Recent Transactions"
                            actionLabel="View All"
                            onAction={() => router.push(ROUTES.TRANSACTIONS)}
                        />

                        {dashboard?.recentTransactions && dashboard.recentTransactions.length > 0 ? (
                            <div className="space-y-1 sm:space-y-2">
                                {dashboard.recentTransactions.slice(0, 5).map((transaction) => (
                                    <div
                                        key={transaction.id}
                                        className="group flex items-center gap-3 p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-all cursor-pointer"
                                        onClick={() => router.push(ROUTES.TRANSACTIONS)}
                                    >
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-muted transition-transform group-hover:scale-110">
                                            <CategoryIcon
                                                iconName={transaction.category?.icon}
                                                color={transaction.category?.color}
                                                className="w-4 h-4 sm:w-5 sm:h-5"
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm sm:text-base font-semibold truncate group-hover:text-primary transition-colors">
                                                {transaction.description}
                                            </p>
                                            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                                                <span className="truncate">
                                                    {transaction.category?.name ? formatCategoryName(transaction.category.name) : 'Other'}
                                                </span>
                                                <span>•</span>
                                                <span>{formatDate(transaction.date)}</span>
                                            </div>
                                        </div>

                                        <p className="text-sm sm:text-base font-bold tabular-nums flex-shrink-0">
                                            {formatCurrency(transaction.amount)}
                                        </p>
                                    </div>
                                ))}
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
                    </div>
                </div>

                {/* Top Categories */}
                <div className="rounded-lg sm:rounded-xl border bg-card p-4 sm:p-5">
                    <h2 className="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4">Top Spending Categories</h2>
                    {dashboard?.topCategories && dashboard.topCategories.length > 0 ? (
                        <div className="space-y-3">
                            {dashboard.topCategories.map((category) => (
                                <div key={category.categoryId} className="p-3 sm:p-4 rounded-lg bg-muted/30 space-y-2 transition-all hover:bg-muted/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                                <CategoryIcon
                                                    iconName={category.categoryIcon}
                                                    color={category.categoryColor}
                                                    className="w-5 h-5"
                                                />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm sm:text-base">
                                                    {category.categoryName ? formatCategoryName(category.categoryName) : 'Other'}
                                                </p>
                                                <p className="text-xs sm:text-sm text-muted-foreground">
                                                    {category.transactionCount} transactions
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-sm sm:text-base lg:text-lg font-bold ml-2">
                                            {formatCurrency(category.totalAmount)}
                                        </span>
                                    </div>
                                    <Progress
                                        value={Math.min(
                                            (category.totalAmount / (summary.totalExpenses || 1)) * 100,
                                            100
                                        )}
                                        className="h-2"
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 sm:py-12">
                            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-muted mb-3">
                                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                            </div>
                            <p className="text-sm sm:text-base text-muted-foreground">No category data yet</p>
                        </div>
                    )}
                </div>
            </div>
        </PageWrapper>
    );
}