'use client';

import { useMemo, useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGroup, useGroupMembers } from '@/lib/hooks/use-groups';
import { useInfiniteGroupExpenses } from '@/lib/hooks/use-group-expenses';
import { useSimplifiedDebts } from '@/lib/hooks/use-group-balances';
import { useGroupStatistics } from '@/lib/hooks/use-group-statistics';
import { useProfile } from '@/lib/hooks/use-profile';
import { useLayout } from '@/contexts/layout-context';
import { Plus, Receipt, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { GroupHeader } from '@/components/features/groups/group-header';
import { SimplifiedDebtsCard } from '@/components/features/groups/simplified-debts-card';
import { GroupStatisticsModal } from '@/components/features/groups/group-statistics-modal';
import { ExpenseDetailModal } from '@/components/features/groups/expense-detail-modal';
import { SettleUpModal } from '@/components/features/groups/settle-up-modal';
import { GroupExportButton } from '@/components/features/groups/group-export-button';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
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

    // Infinite scroll for expenses
    const {
        data: expensesData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: expensesLoading,
    } = useInfiniteGroupExpenses(groupId);

    // Intersection observer for infinite scroll
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const handleObserver = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [target] = entries;
            if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        },
        [fetchNextPage, hasNextPage, isFetchingNextPage]
    );

    useEffect(() => {
        const element = loadMoreRef.current;
        if (!element) return;

        const option = { threshold: 0 };
        const observer = new IntersectionObserver(handleObserver, option);
        observer.observe(element);

        return () => observer.disconnect();
    }, [handleObserver]);

    // Modal state
    const [selectedExpense, setSelectedExpense] = useState<GroupExpense | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isStatisticsModalOpen, setIsStatisticsModalOpen] = useState(false);
    const [isSettleUpModalOpen, setIsSettleUpModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

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

    // Flatten and group expenses by month from infinite query
    const groupedExpenses = useMemo(() => {
        if (!expensesData?.pages) return [];

        // Flatten all pages
        let allExpenses = expensesData.pages.flatMap((page) => page.data);

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            allExpenses = allExpenses.filter((expense) => {
                const description = expense.description?.toLowerCase() || '';
                const category = expense.category?.name?.toLowerCase() || '';
                const paidBy = `${expense.paidBy?.firstName} ${expense.paidBy?.lastName}`.toLowerCase();
                return description.includes(query) || category.includes(query) || paidBy.includes(query);
            });
        }

        type GroupedExpense = {
            monthName: string;
            expenses: typeof allExpenses;
        };

        const grouped = allExpenses.reduce((acc, expense) => {
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
    }, [expensesData, searchQuery]);

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
        <div key={monthGroup.monthName} className="space-y-0">
            {/* Month Header */}
            <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 py-2 -mx-4 px-4">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
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
                            className="flex items-center gap-3 py-2.5 hover:bg-muted/30 -mx-4 px-4 transition-colors cursor-pointer active:bg-muted/50 border-b border-border/50 last:border-0"
                        >
                            {/* Date */}
                            <div className="flex flex-col items-center w-10 flex-shrink-0">
                                <span className="text-xs text-muted-foreground">
                                    {dayMonth.split(' ')[0]}
                                </span>
                                <span className="text-base font-semibold">
                                    {dayMonth.split(' ')[1]}
                                </span>
                            </div>

                            {/* Category Icon */}
                            <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center">
                                    <CategoryIcon className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>

                            {/* Description and Payment Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate text-sm">
                                    {expense.description}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {isPaidByYou ? 'You' : paidByName} paid {formatCurrency(Number(expense.amount), expense.currency as 'INR' | 'USD' | 'EUR')}
                                </p>
                            </div>

                            {/* Lent/Borrowed Amount */}
                            {balance.displayText !== 'not involved' && balance.displayText !== 'settled' && (
                                <div className="text-right flex-shrink-0">
                                    <p className="text-xs text-muted-foreground mb-0.5">
                                        {balance.youLent > 0 ? 'you lent' : 'you borrowed'}
                                    </p>
                                    <p className={`text-sm font-semibold ${balance.youLent > 0
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-red-500 dark:text-red-400'
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
            <div className="space-y-0 pb-24 lg:pb-6">


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

                {/* Action Bar - Desktop */}
                <div className="hidden md:flex gap-2 py-3 border-b border-border">
                    <Button
                        onClick={() => router.push(`/dashboard/groups/${groupId}/add-expense`)}
                        size="sm"
                        variant="default"
                        className="h-9"
                    >
                        <Plus className="h-4 w-4 mr-1.5" />
                        Add Expense
                    </Button>
                    <Button
                        onClick={() => setIsSettleUpModalOpen(true)}
                        size="sm"
                        variant="outline"
                        className="h-9"
                    >
                        Settle up
                    </Button>
                    <Button
                        onClick={() => setIsStatisticsModalOpen(true)}
                        variant="outline"
                        size="sm"
                        className="h-9"
                    >
                        <Receipt className="h-4 w-4 mr-1.5" />
                        Statistics
                    </Button>
                    <GroupExportButton
                        groupId={groupId}
                        variant="outline"
                        size="sm"
                    />
                </div>

                {/* Action Bar - Mobile */}
                <div className="md:hidden flex gap-2 py-3 border-b border-border">
                    <Button
                        onClick={() => setIsSettleUpModalOpen(true)}
                        size="sm"
                        variant="outline"
                        className="h-9 flex-1"
                    >
                        Settle up
                    </Button>
                    <Button
                        onClick={() => setIsStatisticsModalOpen(true)}
                        variant="outline"
                        size="sm"
                        className="h-9 flex-1"
                    >
                        <Receipt className="h-4 w-4 mr-1.5" />
                        Stats
                    </Button>
                    <GroupExportButton
                        groupId={groupId}
                        variant="outline"
                        size="sm"
                    />
                </div>

                {/* Simplified Debts Card */}
                <SimplifiedDebtsCard
                    debts={simplifiedDebts}
                    currentUserId={currentUserId}
                    currency={group.currency as 'INR' | 'USD' | 'EUR'}
                />

                {/* Search Bar */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search expenses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                    />
                </div>

                {/* Expenses List - Infinite Scroll */}
                <div className="pt-2">
                    {expensesLoading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : groupedExpenses.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                            <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="font-medium">No expenses yet</p>
                            <p className="text-sm mt-1">Add an expense to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-0">
                            {groupedExpenses.map((monthGroup) => renderExpenseItem(monthGroup))}

                            {/* Load more trigger */}
                            {hasNextPage && (
                                <div
                                    ref={loadMoreRef}
                                    className="flex justify-center py-4"
                                >
                                    {isFetchingNextPage && (
                                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                    )}
                                </div>
                            )}
                        </div>
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

                {/* Settle Up Modal */}
                <SettleUpModal
                    isOpen={isSettleUpModalOpen}
                    onClose={() => setIsSettleUpModalOpen(false)}
                    groupId={groupId}
                    debts={simplifiedDebts}
                    currency={group.currency as 'INR' | 'USD' | 'EUR'}
                    isMobile={isMobile}
                />


            </div>
        </PageWrapper>
    );
}
