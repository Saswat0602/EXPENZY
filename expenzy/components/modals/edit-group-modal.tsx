'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateGroup } from '@/lib/hooks/use-groups';
import { updateGroupSchema, type UpdateGroupInput } from '@/lib/validations/schemas';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface EditGroupModalProps {
    open: boolean;
    onClose: () => void;
    groupId: string;
    initialName: string;
    initialDescription?: string;
}

export function EditGroupModal({ open, onClose, groupId, initialName, initialDescription }: EditGroupModalProps) {
    const updateGroup = useUpdateGroup();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<UpdateGroupInput>({
        resolver: zodResolver(updateGroupSchema),
        defaultValues: {
            name: initialName,
            description: initialDescription || '',
        },
    });

    const onSubmit = async (data: UpdateGroupInput) => {
        try {
            await updateGroup.mutateAsync({
                id: groupId,
                data: {
                    name: data.name,
                    description: data.description || undefined,
                },
            });
            reset();
            onClose();
        } catch (error) {
            console.error('Failed to update group:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] max-w-[95vw]">
                <DialogHeader>
                    <DialogTitle>Edit Group</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Group Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Group Name *</Label>
                        <Input
                            id="name"
                            placeholder="e.g., Roommates, Trip to Goa"
                            {...register('name')}
                            className={errors.name ? 'border-destructive' : ''}
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            placeholder="What is this group for?"
                            rows={3}
                            {...register('description')}
                        />
                        {errors.description && (
                            <p className="text-sm text-destructive">{errors.description.message}</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={updateGroup.isPending}>
                            {updateGroup.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
