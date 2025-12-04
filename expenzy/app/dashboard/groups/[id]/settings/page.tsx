'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGroup, useUpdateGroup, useDeleteGroup } from '@/lib/hooks/use-groups';
import { ArrowLeft, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { GlassCard } from '@/components/shared/glass-card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function GroupSettingsPage() {
    const params = useParams();
    const router = useRouter();
    const groupId = params.id as string;

    const { data: group, isLoading } = useGroup(groupId);
    const updateGroup = useUpdateGroup();
    const deleteGroup = useDeleteGroup();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [hasChanges, setHasChanges] = useState(false);

    // Initialize form when group data loads
    useState(() => {
        if (group) {
            setName(group.name);
            setDescription(group.description || '');
        }
    });

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error('Group name is required');
            return;
        }

        try {
            await updateGroup.mutateAsync({
                id: groupId,
                data: {
                    name: name.trim(),
                    description: description.trim() || undefined,
                },
            });
            setHasChanges(false);
            toast.success('Group updated successfully');
        } catch (error) {
            toast.error('Failed to update group');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
            return;
        }

        try {
            await deleteGroup.mutateAsync(groupId);
            toast.success('Group deleted successfully');
            router.push('/dashboard/groups');
        } catch (error) {
            toast.error('Failed to delete group');
        }
    };

    const handleNameChange = (value: string) => {
        setName(value);
        setHasChanges(true);
    };

    const handleDescriptionChange = (value: string) => {
        setDescription(value);
        setHasChanges(true);
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
            <div className="space-y-6 max-w-2xl">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/dashboard/groups/${groupId}`)}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Group Settings</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage your group details
                        </p>
                    </div>
                </div>

                {/* Group Details */}
                <GlassCard>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Group Details</h3>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Group Name</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => handleNameChange(e.target.value)}
                                        placeholder="Enter group name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <Textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => handleDescriptionChange(e.target.value)}
                                        placeholder="Add a description for your group"
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>

                        {hasChanges && (
                            <div className="flex gap-3">
                                <Button
                                    onClick={handleSave}
                                    disabled={updateGroup.isPending}
                                    className="flex-1"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {updateGroup.isPending ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setName(group.name);
                                        setDescription(group.description || '');
                                        setHasChanges(false);
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </div>
                </GlassCard>

                {/* Danger Zone */}
                <GlassCard className="border-destructive/50">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-destructive mb-1">
                                Danger Zone
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Once you delete a group, there is no going back. Please be certain.
                            </p>
                        </div>

                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteGroup.isPending}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {deleteGroup.isPending ? 'Deleting...' : 'Delete Group'}
                        </Button>
                    </div>
                </GlassCard>
            </div>
        </PageWrapper>
    );
}
