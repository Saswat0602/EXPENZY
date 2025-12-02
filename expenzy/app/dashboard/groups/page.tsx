'use client';

import { useState } from 'react';
import { useGroups, useDeleteGroup } from '@/lib/hooks/use-groups';
import { Button } from '@/components/ui/button';
import { Users, Plus, Edit2, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils/format';
import { AddGroupModal } from '@/components/modals/add-group-modal';
import { ConfirmationModal } from '@/components/modals/confirmation-modal';
import { PageHeader } from '@/components/layout/page-header';

export default function GroupsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteItem, setDeleteItem] = useState<{ id: string; name: string } | null>(null);
    const { data: groups = [], isLoading } = useGroups();
    const deleteGroup = useDeleteGroup();

    const handleDelete = (group: { id: string; name: string }) => {
        setDeleteItem(group);
    };

    const confirmDelete = async () => {
        if (!deleteItem) return;
        await deleteGroup.mutateAsync(deleteItem.id);
        setDeleteItem(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <PageHeader
                title="Groups"
                description="Manage shared expenses with groups"
                action={
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Group
                    </Button>
                }
            />

            <AddGroupModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />

            <ConfirmationModal
                open={!!deleteItem}
                onClose={() => setDeleteItem(null)}
                onConfirm={confirmDelete}
                title="Delete Group"
                description="Are you sure you want to delete this group? This action cannot be undone."
                confirmText="Delete"
                isLoading={deleteGroup.isPending}
            >
                {deleteItem && (
                    <div className="bg-muted p-4 rounded-lg">
                        <p className="font-medium">{deleteItem.name}</p>
                    </div>
                )}
            </ConfirmationModal>

            {/* Groups List */}
            <div className="space-y-2">
                {isLoading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
                    </div>
                ) : groups.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                        <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                            <Users className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-lg font-medium mb-1">No groups yet</p>
                        <p className="text-sm">Create a group to split expenses with friends and family</p>
                    </div>
                ) : (
                    groups.map((group) => (
                        <div
                            key={group.id}
                            className="bg-card border border-border rounded-lg p-4 hover:bg-accent/5 transition-colors"
                        >
                            <div className="flex items-start gap-3">
                                {/* Group Icon */}
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Users className="w-5 h-5 text-primary" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-base mb-1 truncate">
                                        {group.name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                        <span>{group._count?.members || 0} members</span>
                                        <span>•</span>
                                        <span>Created {formatDate(group.createdAt)}</span>
                                    </div>
                                    {group.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {group.description}
                                        </p>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <button
                                        onClick={() => {/* TODO: Add edit functionality */ }}
                                        className="p-1.5 hover:bg-muted rounded-md transition-colors"
                                        aria-label="Edit group"
                                    >
                                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete({ id: group.id, name: group.name })}
                                        className="p-1.5 hover:bg-destructive/10 rounded-md transition-colors"
                                        aria-label="Delete group"
                                    >
                                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
