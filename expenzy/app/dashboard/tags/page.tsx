'use client';

import { useTags, useDeleteTag } from '@/lib/hooks/use-tags';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { Tag, Plus, Trash2, Edit } from 'lucide-react';
import { PageWrapper } from '@/components/layout/page-wrapper';

export default function TagsPage() {
    const { data: tags = [], isLoading } = useTags();
    const deleteTag = useDeleteTag();

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this tag?')) {
            await deleteTag.mutateAsync(id);
        }
    };

    if (isLoading) {
        return <LoadingSkeleton count={3} />;
    }

    return (
        <PageWrapper>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Tags</h1>
                        <p className="text-muted-foreground">Organize your transactions with tags</p>
                    </div>
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Tag
                    </Button>
                </div>

                {/* Tags Grid */}
                {tags.length === 0 ? (
                    <EmptyState
                        icon={Tag}
                        title="No tags yet"
                        description="Create tags to organize and categorize your transactions"
                        action={{
                            label: 'Create Tag',
                            onClick: () => { },
                        }}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {tags.map((tag) => (
                            <Card key={tag.id} className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <Badge
                                        style={{
                                            backgroundColor: tag.color || '#6366f1',
                                            color: 'white',
                                        }}
                                        className="text-sm font-medium"
                                    >
                                        <Tag className="w-3 h-3 mr-1" />
                                        {tag.name}
                                    </Badge>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="sm">
                                            <Edit className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(tag.id)}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {tag._count?.expenses || 0} transactions
                                </p>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </PageWrapper>
    );
}
