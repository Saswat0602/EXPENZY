'use client';

import { useMemo, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGroup, useGroupMembers } from '@/lib/hooks/use-groups';
import { useSimplifiedDebts } from '@/lib/hooks/use-group-balances';
import { useGroupStatistics } from '@/lib/hooks/use-group-statistics';
import { useProfile } from '@/lib/hooks/use-profile';
import { useLayout } from '@/contexts/layout-context';
import { Plus, Receipt, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { GroupHeader } from '@/components/features/groups/group-header';
import { SimplifiedDebtsCard } from '@/components/features/groups/simplified-debts-card';
import { SettleUpBar } from '@/components/features/groups/settle-up-bar';
import { GroupStatisticsModal } from '@/components/features/groups/group-statistics-modal';
import { ExpenseDetailModal } from '@/components/features/groups/expense-detail-modal';
import { Skeleton } from '@/components/ui/skeleton';
import { VirtualList } from '@/components/shared/virtual-list';
import { formatCurrency } from '@/lib/utils/currency';
import { getIconByName } from '@/lib/categorization/category-icons';
import { calculateUserExpenseBalance } from '@/lib/utils/balance-utils';
import type { GroupExpense } from '@/types/split';

// Hook to detect mobile
function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile;
}

export default function GroupDetailPage() {
    const params = useParams();
    const router = useRouter();
    const groupId = params.id as string;
    const { setLayoutVisibility } = useLayout();
    const isMobile = useIsMobile();

    const { data: group, isLoading: groupLoading } = useGroup(groupId);
    const { data: members = [] } = useGroupMembers(groupId);
    const { data: simplifiedDebts = [] } = useSimplifiedDebts(groupId);
    const { data: statistics } = useGroupStatistics(groupId);
    const { data: profile } = useProfile();

    // Modal state
    const [selectedExpense, setSelectedExpense] = useState<GroupExpense | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isStatisticsModalOpen, setIsStatisticsModalOpen] = useState(false);

    // Hide mobile header on mount, restore on unmount (keep bottom nav)
    useEffect(() => {
        setLayoutVisibility({ showMobileHeader: false, showBottomNav: true });
        return () => {
            setLayoutVisibility({ showMobileHeader: true, showBottomNav: true });
        };
    }, [setLayoutVisibility]);

    // Get current user ID from profile
    const currentUserId = profile?.id || '';

    // Handle expense click
    const handleExpenseClick = (expense: GroupExpense) => {
        setSelectedExpense(expense);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedExpense(null), 300);
    };

    const acceptedMembers = members.filter((m) => m.inviteStatus === 'accepted');

    // Group expenses by month
    const groupedExpenses = useMemo(() => {
        if (!group?.groupExpenses) return [];

        const expenses = [...group.groupExpenses].sort((a, b) =>
            new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime()
        );

        type GroupedExpense = {
            monthName: string;
            expenses: typeof group.groupExpenses;
        };

        const grouped = expenses.reduce((acc, expense) => {
            const date = new Date(expense.expenseDate);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

            if (!acc[monthKey]) {
                acc[monthKey] = {
                    monthName,
                    expenses: []
                };
            }
            acc[monthKey].expenses.push(expense);
            return acc;
        }, {} as Record<string, GroupedExpense>);

        return Object.values(grouped);
    }, [group]);

    if (groupLoading) {
        return (
            <PageWrapper>
                <div className="space-y-6">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </PageWrapper>
        );
    }

    if (!group) {
        return (
            <PageWrapper>
                <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">Group not found</p>
                    <Button onClick={() => router.push('/dashboard/groups')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Groups
                    </Button>
                </div>
            </PageWrapper>
        );
    }

    const renderExpenseItem = (monthGroup: { monthName: string; expenses: NonNullable<typeof group>['groupExpenses'] }) => (
        <div key={monthGroup.monthName} className="space-y-2">
            {/* Month Header */}
            <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 py-3">
                <h3 className="text-base font-semibold text-muted-foreground uppercase tracking-wide">
                    {monthGroup.monthName}
                </h3>
            </div>

            {/* Expenses for this month */}
            <div className="space-y-0">
                {(monthGroup.expenses || []).map((expense) => {
                    const CategoryIcon = expense.category?.icon
                        ? getIconByName(expense.category.icon)
                        : Receipt;
                    const expenseDate = new Date(expense.expenseDate);
                    const dayMonth = expenseDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: '2-digit'
                    });

                    const paidByName = expense.paidBy
                        ? `${expense.paidBy.firstName} ${expense.paidBy.lastName}`.trim()
                        : 'Unknown';
                    const isPaidByYou = expense.paidByUserId === currentUserId;

                    // Calculate lent/borrowed
                    const balance = calculateUserExpenseBalance(expense, currentUserId);

                    return (
                        <div
                            key={expense.id}
                            onClick={() => handleExpenseClick(expense)}
                            className="flex items-center gap-3 py-3 px-0 hover:bg-muted/30 -mx-4 px-4 transition-colors cursor-pointer active:bg-muted/50"
                        >
                            {/* Date */}
                            <div className="flex flex-col items-center w-14 flex-shrink-0">
                                <span className="text-sm text-muted-foreground">
                                    {dayMonth.split(' ')[0]}
                                </span>
                                <span className="text-xl font-semibold">
                                    {dayMonth.split(' ')[1]}
                                </span>
                            </div>

                            {/* Category Icon */}
                            <div className="flex-shrink-0">
                                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                                    <CategoryIcon className="h-6 w-6 text-muted-foreground" />
                                </div>
                            </div>

                            {/* Description and Payment Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate text-base">
                                    {expense.description}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {isPaidByYou ? 'You' : paidByName} paid {formatCurrency(Number(expense.amount), expense.currency as 'INR' | 'USD' | 'EUR')}
                                </p>
                            </div>

                            {/* Lent/Borrowed Amount */}
                            {balance.displayText !== 'not involved' && balance.displayText !== 'settled' && (
                                <div className="text-right flex-shrink-0">
                                    <p className={`text-sm font-medium ${balance.youLent > 0
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-red-400 dark:text-red-300'
                                        }`}>
                                        {balance.youLent > 0 ? 'you lent' : 'you borrowed'}
                                    </p>
                                    <p className={`text-base font-semibold ${balance.youLent > 0
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-red-400 dark:text-red-300'
                                        }`}>
                                        {formatCurrency(
                                            balance.youLent > 0 ? balance.youLent : balance.youBorrowed,
                                            expense.currency as 'INR' | 'USD' | 'EUR'
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <PageWrapper>
            <div className="space-y-6 pb-24 lg:pb-6">
                {/* Back Button - Hidden on mobile, GroupHeader has its own back button */}
                <Button
                    variant="ghost"
                    onClick={() => router.push('/dashboard/groups')}
                    className="mb-2 hidden lg:flex"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Groups
                </Button>

                {/* Header */}
                <GroupHeader
                    groupId={groupId}
                    name={group.name}
                    description={group.description}
                    iconSeed={group.iconSeed}
                    iconProvider={group.iconProvider}
                    imageUrl={group.imageUrl}
                    memberCount={acceptedMembers.length}
                />

                {/* Action Bar - Both Mobile and Desktop at top */}
                <SettleUpBar
                    onSettleUp={() => {
                        // TODO: Implement settle up flow
                        console.log('Settle up clicked');
                    }}
                    onViewStatistics={() => setIsStatisticsModalOpen(true)}
                    onExport={() => {
                        // TODO: Implement export
                        console.log('Export clicked');
                    }}
                    isMobile={isMobile}
                />

                {/* Simplified Debts Card */}
                <SimplifiedDebtsCard
                    debts={simplifiedDebts}
                    currentUserId={currentUserId}
                    currency={group.currency as 'INR' | 'USD' | 'EUR'}
                />

                {/* Expenses List - Splitwise Style */}
                <div className="space-y-4">


                    {!group.groupExpenses || group.groupExpenses.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                            <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="font-medium">No expenses yet</p>
                            <p className="text-sm mt-1">Add an expense to get started</p>
                        </div>
                    ) : (
                        <VirtualList
                            fetchData={async (page) => {
                                // Since data is already loaded, just paginate locally
                                const itemsPerPage = 20;
                                const start = (page - 1) * itemsPerPage;
                                const end = start + itemsPerPage;
                                const paginatedData = groupedExpenses.slice(start, end);

                                return {
                                    data: paginatedData,
                                    hasMore: end < groupedExpenses.length,
                                    total: groupedExpenses.length,
                                };
                            }}
                            renderItem={renderExpenseItem}
                            getItemKey={(item) => item.monthName}
                            itemsPerPage={20}
                            enableDesktopPagination={false}
                            dependencies={[groupedExpenses]}
                        />
                    )}
                </div>

                {/* Floating Add Expense Button (Mobile) */}
                <div className="fixed bottom-20 right-4 lg:hidden z-10">
                    <Button
                        size="lg"
                        className="h-14 w-14 rounded-full shadow-lg"
                        onClick={() => router.push(`/dashboard/groups/${groupId}/add-expense`)}
                    >
                        <Plus className="h-6 w-6" />
                    </Button>
                </div>

                {/* Desktop Add Expense Button */}
                <div className="hidden lg:block">
                    <Button
                        size="lg"
                        className="w-full"
                        onClick={() => router.push(`/dashboard/groups/${groupId}/add-expense`)}
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Expense
                    </Button>
                </div>

                {/* Expense Detail Modal */}
                <ExpenseDetailModal
                    expense={selectedExpense}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    currentUserId={currentUserId}
                    groupId={groupId}
                    isMobile={isMobile}
                />

                {/* Statistics Modal */}
                <GroupStatisticsModal
                    isOpen={isStatisticsModalOpen}
                    onClose={() => setIsStatisticsModalOpen(false)}
                    statistics={statistics}
                    simplifiedDebts={simplifiedDebts}
                    currentUserId={currentUserId}
                    isMobile={isMobile}
                    currency={group.currency as 'INR' | 'USD' | 'EUR'}
                />


            </div>
        </PageWrapper>
    );
}
