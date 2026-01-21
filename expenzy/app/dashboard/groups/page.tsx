'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useGroups } from '@/lib/hooks/use-groups';
import { Button } from '@/components/ui/button';
import { UserPlus, Plus } from 'lucide-react';
import { AddGroupModal } from '@/components/modals/add-group-modal';
import { PageHeader } from '@/components/layout/page-header';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { GroupCard } from '@/components/features/groups/group-card';
import { EmptyState } from '@/components/shared/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

export default function GroupsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: groups = [], isLoading } = useGroups();
    const router = useRouter();

    // Calculate balances for each group
    // Note: groupExpenses is no longer returned from the API for performance
    // Balance calculation should be done via the balances endpoint
    const groupsWithBalances = useMemo(() => {
        return groups.map((group) => ({
            ...group,
            userBalance: 0, // TODO: Fetch from balances endpoint
        }));
    }, [groups]);

    const handleGroupClick = (groupId: string) => {
        router.push(`/dashboard/groups/${groupId}`);
    };

    return (
        <PageWrapper>
            <div className="space-y-6">
                {/* Header */}
                <PageHeader
                    title="Groups"
                    description="Split expenses with friends and family"
                />

                <AddGroupModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />

                {/* Overall Balance Summary */}
                {!isLoading && groups.length > 0 && (
                    <div className="bg-gradient-to-br from-primary/5 via-background to-primary/5 rounded-xl p-4 sm:p-6 border border-border">
                        <div className="text-center">
                            <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
                                Total across all groups
                            </p>
                            <p className="text-2xl sm:text-3xl font-bold break-words">
                                {(() => {
                                    const totalBalance = groupsWithBalances.reduce(
                                        (sum, group) => sum + group.userBalance,
                                        0
                                    );
                                    const absAmount = Math.abs(totalBalance);

                                    if (totalBalance === 0) {
                                        return <span className="text-muted-foreground">All settled up</span>;
                                    }

                                    return (
                                        <span className={totalBalance > 0 ? 'text-success' : 'text-destructive'}>
                                            <span className="block sm:inline">{totalBalance > 0 ? 'You get back' : 'You owe'}</span>
                                            <span className="block sm:inline sm:ml-1">₹{absAmount.toFixed(2)}</span>
                                        </span>
                                    );
                                })()}
                            </p>
                        </div>
                    </div>
                )}

                {/* Groups List */}
                <div className="space-y-4">
                    {isLoading ? (
                        // Loading skeleton
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="p-6 border border-border rounded-xl">
                                    <div className="flex items-start gap-4">
                                        <Skeleton className="h-16 w-16 rounded-full" />
                                        <div className="flex-1 space-y-3">
                                            <Skeleton className="h-6 w-48" />
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-4 w-40" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : groups.length === 0 ? (
                        // Empty state
                        <EmptyState
                            icon={UserPlus}
                            title="No groups yet"
                            description="Create a group to split expenses with friends, roommates, or travel companions"
                            action={
                                <Button onClick={() => setIsModalOpen(true)} size="lg">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Your First Group
                                </Button>
                            }
                        />
                    ) : (
                        // Group cards
                        groupsWithBalances.map((group) => (
                            <GroupCard
                                key={group.id}
                                id={group.id}
                                name={group.name}
                                icon="friends"
                                groupType={group.groupType}
                                description={group.description}
                                memberCount={group._count?.members || 0}
                                balance={group.userBalance}
                                currency="INR"
                                iconSeed={group.iconSeed}
                                iconProvider={group.iconProvider}
                                imageUrl={group.imageUrl}
                                onClick={() => handleGroupClick(group.id)}
                            />
                        ))
                    )}
                </div>

                {/* Floating Action Button (Mobile) */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="md:hidden fixed bottom-20 right-4 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center"
                    aria-label="Create group"
                >
                    <Plus className="h-6 w-6" />
                </button>
            </div>
        </PageWrapper>
    );
}
