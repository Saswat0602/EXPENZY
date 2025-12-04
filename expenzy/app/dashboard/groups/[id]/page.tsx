'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGroup, useGroupMembers } from '@/lib/hooks/use-groups';
import { Plus, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { GroupHeader } from '@/components/features/groups/group-header';
import { BalanceSummary } from '@/components/features/groups/balance-summary';
import { GroupMemberList } from '@/components/features/groups/group-member-list';
import { GlassCard } from '@/components/shared/glass-card';
import { Skeleton } from '@/components/ui/skeleton';
import { calculateMemberBalances, getUserBalance } from '@/lib/utils/balance-utils';
import { formatDate } from '@/lib/utils/format';
import { formatCurrency } from '@/lib/utils/currency';

export default function GroupDetailPage() {
    const params = useParams();
    const router = useRouter();
    const groupId = params.id as string;

    const { data: group, isLoading: groupLoading } = useGroup(groupId);
    const { data: members = [], isLoading: membersLoading } = useGroupMembers(groupId);

    // Get current user ID from localStorage
    const currentUserId = typeof window !== 'undefined'
        ? localStorage.getItem('userId') || ''
        : '';

    // Calculate balances
    const { balances, userBalance, memberBalances } = useMemo(() => {
        if (!group) return { balances: new Map(), userBalance: 0, memberBalances: new Map() };

        const expenses = group.expenses || [];
        const calculatedBalances = calculateMemberBalances(expenses, currentUserId);
        const balance = getUserBalance(calculatedBalances, currentUserId);

        // Create a map of userId to balance for easy lookup
        const memberBalanceMap = new Map<string, number>();
        members.forEach((member) => {
            memberBalanceMap.set(member.userId, calculatedBalances.get(member.userId)?.balance || 0);
        });

        return {
            balances: calculatedBalances,
            userBalance: balance,
            memberBalances: memberBalanceMap,
        };
    }, [group, members, currentUserId]);

    // Check if current user is admin
    const isAdmin = members.some(
        (member) => member.userId === currentUserId && member.role === 'ADMIN'
    );

    if (groupLoading || membersLoading) {
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
                    <p className="text-muted-foreground">Group not found</p>
                    <Button onClick={() => router.push('/dashboard/groups')} className="mt-4">
                        Back to Groups
                    </Button>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <div className="space-y-6 pb-24 lg:pb-6">
                {/* Header */}
                <GroupHeader
                    groupId={groupId}
                    name={group.name}
                    description={group.description}
                    icon="friends"
                    memberCount={members.length}
                    isAdmin={isAdmin}
                />

                {/* Balance Summary */}
                <GlassCard className="text-center">
                    <BalanceSummary balance={userBalance} currency="INR" showLabel />
                </GlassCard>

                {/* Members List */}
                <GlassCard>
                    <GroupMemberList
                        groupId={groupId}
                        members={members}
                        currentUserId={currentUserId}
                        isAdmin={isAdmin}
                        memberBalances={memberBalances}
                        currency="INR"
                    />
                </GlassCard>

                {/* Expenses List */}
                <GlassCard>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Group Expenses</h3>
                        </div>

                        {!group.expenses || group.expenses.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p className="font-medium">No expenses yet</p>
                                <p className="text-sm mt-1">Add an expense to get started</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {group.expenses.map((expense) => (
                                    <div
                                        key={expense.id}
                                        className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{expense.description}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDate(expense.expenseDate)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">
                                                {formatCurrency(expense.amount, 'INR')}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Paid by {expense.paidById === currentUserId ? 'you' : 'member'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </GlassCard>

                {/* Floating Add Expense Button (Mobile) */}
                <div className="fixed bottom-20 right-4 lg:hidden z-10">
                    <Button
                        size="lg"
                        className="h-14 w-14 rounded-full shadow-lg"
                        onClick={() => {
                            // TODO: Open add expense modal
                            console.log('Add expense');
                        }}
                    >
                        <Plus className="h-6 w-6" />
                    </Button>
                </div>

                {/* Desktop Add Expense Button */}
                <div className="hidden lg:block">
                    <Button
                        size="lg"
                        className="w-full"
                        onClick={() => {
                            // TODO: Open add expense modal
                            console.log('Add expense');
                        }}
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Expense
                    </Button>
                </div>
            </div>
        </PageWrapper>
    );
}
