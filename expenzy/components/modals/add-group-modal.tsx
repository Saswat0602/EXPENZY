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
import { Home, Briefcase, Plane, Users, Folder } from 'lucide-react';

interface AddGroupModalProps {
    open: boolean;
    onClose: () => void;
}

const GROUP_CATEGORIES = [
    { value: 'home', label: 'Home', icon: Home, color: 'text-blue-500' },
    { value: 'office', label: 'Office', icon: Briefcase, color: 'text-purple-500' },
    { value: 'trip', label: 'Trip', icon: Plane, color: 'text-green-500' },
    { value: 'friends', label: 'Friends', icon: Users, color: 'text-orange-500' },
    { value: 'other', label: 'Other', icon: Folder, color: 'text-gray-500' },
];

export function AddGroupModal({ open, onClose }: AddGroupModalProps) {
    const createGroup = useCreateGroup();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue,
    } = useForm({
        resolver: zodResolver(createGroupSchema),
        defaultValues: {
            groupType: 'other' as const,
        },
    });

    const selectedCategory = watch('groupType');

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

                    {/* Category Selection */}
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {GROUP_CATEGORIES.map((category) => {
                                const Icon = category.icon;
                                const isSelected = selectedCategory === category.value;
                                return (
                                    <button
                                        key={category.value}
                                        type="button"
                                        onClick={() => setValue('groupType', category.value as 'home' | 'office' | 'trip' | 'friends' | 'other')}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all min-w-[80px] ${isSelected
                                            ? 'border-primary bg-primary/10'
                                            : 'border-border hover:border-primary/50 hover:bg-accent'
                                            }`}
                                    >
                                        <Icon className={`w-6 h-6 ${category.color}`} />
                                        <span className="text-xs font-medium">{category.label}</span>
                                    </button>
                                );
                            })}
                        </div>
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
