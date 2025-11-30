'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateGroup } from '@/lib/hooks/use-groups';
import { createGroupSchema, type CreateGroupInput } from '@/lib/validations/schemas';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface AddGroupModalProps {
    open: boolean;
    onClose: () => void;
}

export function AddGroupModal({ open, onClose }: AddGroupModalProps) {
    const createGroup = useCreateGroup();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<CreateGroupInput>({
        resolver: zodResolver(createGroupSchema),
    });

    const onSubmit = async (data: CreateGroupInput) => {
        try {
            await createGroup.mutateAsync(data);
            reset();
            onClose();
        } catch (error) {
            console.error('Failed to create group:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create Group</DialogTitle>
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
                        <Button type="submit" disabled={createGroup.isPending}>
                            {createGroup.isPending ? 'Creating...' : 'Create Group'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
