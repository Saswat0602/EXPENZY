import React, { useState } from 'react';
import { UserPlus, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MemberListItem } from './member-list-item';
import { AddMemberModal } from './add-member-modal';
import { useRemoveGroupMember } from '@/lib/hooks/use-groups';
import type { GroupMember } from '@/types/group';
import { Skeleton } from '@/components/ui/skeleton';

interface GroupMemberListProps {
    groupId: string;
    members: GroupMember[];
    currentUserId: string;
    isAdmin: boolean;
    isLoading?: boolean;
    memberBalances?: Map<string, number>;
    currency?: string;
}

export const GroupMemberList: React.FC<GroupMemberListProps> = ({
    groupId,
    members,
    currentUserId,
    isAdmin,
    isLoading = false,
    memberBalances = new Map(),
    currency = 'INR',
}) => {
    const [showAddMember, setShowAddMember] = useState(false);
    const removeMember = useRemoveGroupMember();

    const handleRemoveMember = async (memberId: string) => {
        if (confirm('Are you sure you want to remove this member?')) {
            await removeMember.mutateAsync({ groupId, memberId });
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48" />
                        </div>
                        <Skeleton className="h-4 w-20" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Group Members</h3>
                {isAdmin && (
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAddMember(true)}
                        >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add people
                        </Button>
                        <Button variant="outline" size="sm">
                            <LinkIcon className="h-4 w-4 mr-2" />
                            Invite link
                        </Button>
                    </div>
                )}
            </div>

            <div className="space-y-1">
                {members.map((member) => (
                    <MemberListItem
                        key={member.id}
                        userId={member.userId}
                        name={member.user?.name || 'Unknown'}
                        email={member.user?.email || ''}
                        role={member.role}
                        balance={memberBalances.get(member.userId) || 0}
                        currency={currency}
                        isCurrentUser={member.userId === currentUserId}
                        isAdmin={isAdmin}
                        onRemove={
                            isAdmin && member.userId !== currentUserId
                                ? () => handleRemoveMember(member.id)
                                : undefined
                        }
                    />
                ))}
            </div>

            <AddMemberModal
                groupId={groupId}
                open={showAddMember}
                onOpenChange={setShowAddMember}
            />
        </div>
    );
};
