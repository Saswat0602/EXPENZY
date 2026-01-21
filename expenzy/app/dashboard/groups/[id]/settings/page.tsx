'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGroup, useDeleteGroup, useLeaveGroup } from '@/lib/hooks/use-groups';
import { useLayout } from '@/contexts/layout-context';
import { ArrowLeft, Pencil, LogOut, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { GroupMemberList } from '@/components/features/groups/group-member-list';
import { EditGroupModal } from '@/components/modals/edit-group-modal';
import { ConfirmationModal } from '@/components/modals/confirmation-modal';
import { Skeleton } from '@/components/ui/skeleton';
import { GroupIcon } from '@/components/ui/group-icon';

export default function GroupSettingsPage() {
    const params = useParams();
    const router = useRouter();
    const groupId = params.id as string;
    const { setLayoutVisibility } = useLayout();

    const { data: group, isLoading } = useGroup(groupId);
    const deleteGroup = useDeleteGroup();
    const leaveGroup = useLeaveGroup();

    const [showEditGroup, setShowEditGroup] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

    // Hide mobile navigation on mount, restore on unmount
    useEffect(() => {
        setLayoutVisibility({ showMobileHeader: false, showBottomNav: false });
        return () => {
            setLayoutVisibility({ showMobileHeader: true, showBottomNav: true });
        };
    }, [setLayoutVisibility]);

    // Get current user ID from localStorage
    const getCurrentUserId = () => {
        if (typeof window === 'undefined') return '';
        const userStr = localStorage.getItem('user');
        if (!userStr) return '';
        try {
            const user = JSON.parse(userStr);
            return user.id || '';
        } catch {
            return '';
        }
    };

    const currentUserId = getCurrentUserId();
    const isAdmin = group?.members?.some(m => m.userId === currentUserId && m.role?.toUpperCase() === 'ADMIN') || false;

    // Debug logging
    useEffect(() => {
        if (group) {
            console.log('Admin Check Debug:');
            console.log('- currentUserId:', currentUserId);
            console.log('- isAdmin:', isAdmin);
            console.log('- group.members:', group.members);
            console.log('- group.createdByUserId:', group.createdByUserId);
        }
    }, [group, currentUserId, isAdmin]);

    const handleDelete = async () => {
        try {
            await deleteGroup.mutateAsync(groupId);
            router.push('/dashboard/groups');
        } catch {
            // Error toast is already shown by the hook
        } finally {
            setShowDeleteConfirm(false);
        }
    };

    const handleLeave = async () => {
        try {
            await leaveGroup.mutateAsync(groupId);
            router.push('/dashboard/groups');
        } catch {
            // Error toast is already shown by the hook
        } finally {
            setShowLeaveConfirm(false);
        }
    };

    if (isLoading) {
        return (
            <PageWrapper>
                <div className="space-y-6">
                    <Skeleton className="h-12 w-full" />
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
            <div className="space-y-6 max-w-2xl pb-6">
                {/* Mobile Header with Back Button */}
                <div className="md:hidden sticky top-0 z-10 bg-background border-b px-4 -mx-4 mb-4">
                    <div className="flex items-center gap-3 py-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/dashboard/groups/${groupId}`)}
                            className="h-10 w-10"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-lg font-semibold">Group settings</h1>
                    </div>
                </div>

                {/* Desktop Header - Hidden on mobile */}
                <div className="hidden md:flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/dashboard/groups/${groupId}`)}
                        className="h-10 w-10"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-semibold">Group settings</h1>
                </div>

                {/* Group Icon and Name Section */}
                <div className="flex items-center gap-4 py-4">
                    <GroupIcon
                        seed={group.iconSeed}
                        provider={group.iconProvider as 'jdenticon' | undefined}
                        fallbackUrl={group.imageUrl}
                        size={64}
                    />
                    <div className="flex-1">
                        <h2 className="text-lg font-medium">{group.name}</h2>
                        <p className="text-sm text-muted-foreground">{group.description || 'Other'}</p>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            console.log('Edit button clicked, isAdmin:', isAdmin);
                            setShowEditGroup(true);
                        }}
                        disabled={!isAdmin}
                        className="h-10 w-10"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                </div>

                <div className="border-t border-border" />

                {/* Member List */}
                <GroupMemberList
                    groupId={groupId}
                    members={group.members || []}
                    currentUserId={currentUserId}
                    isAdmin={isAdmin}
                    memberBalances={new Map()}
                    currency={group.currency}
                />

                <div className="border-t border-border" />

                {/* Actions Section */}
                <div className="space-y-2">
                    <button
                        type="button"
                        className="w-full flex items-center gap-3 py-3 text-left rounded-lg transition-colors text-destructive hover:text-destructive/80"
                        onClick={() => {
                            console.log('Leave button clicked');
                            setShowLeaveConfirm(true);
                        }}
                    >
                        <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                            <LogOut className="h-5 w-5" />
                        </div>
                        <span className="text-base font-medium">Leave group</span>
                    </button>

                    {isAdmin && (
                        <button
                            type="button"
                            className="w-full flex items-center gap-3 py-3 text-left rounded-lg transition-colors text-destructive hover:text-destructive/80"
                            onClick={() => {
                                console.log('Delete button clicked');
                                setShowDeleteConfirm(true);
                            }}
                        >
                            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                                <Trash2 className="h-5 w-5" />
                            </div>
                            <span className="text-base font-medium">Delete group</span>
                        </button>
                    )}
                </div>

                {/* Modals */}
                <EditGroupModal
                    open={showEditGroup}
                    onClose={() => setShowEditGroup(false)}
                    groupId={groupId}
                    initialName={group.name}
                    initialDescription={group.description || ''}
                />

                <ConfirmationModal
                    open={showDeleteConfirm}
                    onClose={() => setShowDeleteConfirm(false)}
                    onConfirm={handleDelete}
                    title="Delete Group"
                    description={`Are you sure you want to delete "${group.name}"? This action cannot be undone and all group data will be permanently deleted.`}
                    confirmText="Delete Group"
                    cancelText="Cancel"
                    variant="destructive"
                />

                <ConfirmationModal
                    open={showLeaveConfirm}
                    onClose={() => setShowLeaveConfirm(false)}
                    onConfirm={handleLeave}
                    title="Leave Group"
                    description={`Are you sure you want to leave "${group.name}"? You will no longer have access to this group's expenses and data.`}
                    confirmText="Leave Group"
                    cancelText="Cancel"
                    variant="destructive"
                />
            </div>
        </PageWrapper>
    );
}
