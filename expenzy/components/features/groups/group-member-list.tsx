import React, { useState } from 'react';
import { UserPlus, Link as LinkIcon } from 'lucide-react';
import { MemberListItem } from './member-list-item';
import { AddMemberModal } from './add-member-modal';
import { ConfirmationModal } from '@/components/modals/confirmation-modal';
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
    const [memberToRemove, setMemberToRemove] = useState<{ id: string; name: string } | null>(null);
    const removeMember = useRemoveGroupMember();

    const handleRemoveMember = async (memberId: string, memberName: string) => {
        setMemberToRemove({ id: memberId, name: memberName });
    };

    const confirmRemoveMember = async () => {
        if (memberToRemove) {
            await removeMember.mutateAsync({ groupId, memberId: memberToRemove.id });
            setMemberToRemove(null);
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
            <h3 className="text-lg font-semibold">Group Members</h3>

            {isAdmin && (
                <div className="space-y-2">
                    <button
                        type="button"
                        className="w-full flex items-center gap-3 py-3 text-left hover:bg-muted/30 rounded-lg transition-colors"
                        onClick={() => setShowAddMember(true)}
                    >
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <UserPlus className="h-5 w-5" />
                        </div>
                        <span className="text-base">Add people to group</span>
                    </button>

                    <button
                        type="button"
                        className="w-full flex items-center gap-3 py-3 text-left hover:bg-muted/30 rounded-lg transition-colors"
                    >
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <LinkIcon className="h-5 w-5" />
                        </div>
                        <span className="text-base">Invite via link</span>
                    </button>
                </div>
            )}

            <div className="space-y-1">
                {members.map((member) => {
                    // For accepted members with user accounts, show name; for pending invites, show email
                    const fullName = member.user
                        ? `${member.user.firstName || ''} ${member.user.lastName || ''}`.trim() || member.user.username
                        : member.invitedEmail || 'Unknown';

                    return (
                        <MemberListItem
                            key={member.id}
                            userId={member.userId ?? ''}
                            name={fullName}
                            email={member.user?.email || member.invitedEmail || ''}
                            role={member.role}
                            balance={memberBalances.get(member.userId) || 0}
                            currency={currency}
                            isCurrentUser={member.userId === currentUserId}
                            isAdmin={isAdmin}
                            avatarSeed={member.user?.avatarSeed}
                            avatarStyle={member.user?.avatarStyle}
                            avatar={member.user?.avatar}
                            showBalance={false}
                            onRemove={
                                // Admin can remove others, or current user can leave
                                (isAdmin && member.userId !== currentUserId) || member.userId === currentUserId
                                    ? () => handleRemoveMember(member.id, fullName)
                                    : undefined
                            }
                        />
                    );
                })}
            </div>

            <AddMemberModal
                groupId={groupId}
                open={showAddMember}
                onOpenChange={setShowAddMember}
            />

            <ConfirmationModal
                open={!!memberToRemove}
                onClose={() => setMemberToRemove(null)}
                onConfirm={confirmRemoveMember}
                title="Remove Member"
                description={`Are you sure you want to remove ${memberToRemove?.name || 'this member'} from the group? This action cannot be undone.`}
                confirmText="Remove"
                cancelText="Cancel"
                variant="destructive"
            />
        </div>
    );
};
