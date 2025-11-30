'use client';

import { useState } from 'react';
import { useGroups, useDeleteGroup } from '@/lib/hooks/use-groups';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { Users, Plus, Trash2, Settings } from 'lucide-react';
import { formatDate } from '@/lib/utils/format';
import { AddGroupModal } from '@/components/modals/add-group-modal';

export default function GroupsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: groups = [], isLoading } = useGroups();
    const deleteGroup = useDeleteGroup();

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this group?')) {
            await deleteGroup.mutateAsync(id);
        }
    };

    if (isLoading) {
        return <LoadingSkeleton count={3} />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Groups</h1>
                    <p className="text-muted-foreground">Manage shared expenses with groups</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Group
                </Button>
            </div>

            <AddGroupModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />

            {/* Groups List */}
            {groups.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title="No groups yet"
                    description="Create a group to split expenses with friends and family"
                    action={{
                        label: 'Create Group',
                        onClick: () => { },
                    }}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groups.map((group) => (
                        <Card key={group.id} className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Users className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{group.name}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {group._count?.members || 0} members
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(group.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            {group.description && (
                                <p className="text-sm text-muted-foreground mb-4">
                                    {group.description}
                                </p>
                            )}

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Created {formatDate(group.createdAt)}
                                </span>
                                <Button variant="ghost" size="sm">
                                    <Settings className="w-4 h-4" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
