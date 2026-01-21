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
import { Home, Briefcase, Plane, Users, Folder, Shuffle } from 'lucide-react';
import { GroupIcon } from '@/components/ui/group-icon';
import { generateRandomSeed } from '@/lib/utils/avatar-utils';
import { useState, useEffect } from 'react';

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
    const [iconSeed, setIconSeed] = useState<string>('');

    // Generate new icon seed when modal opens
    useEffect(() => {
        if (open) {
            setIconSeed(generateRandomSeed());
        }
    }, [open]);

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
            await createGroup.mutateAsync({
                ...data,
                iconSeed,
                iconProvider: 'jdenticon' as const,
            });
            reset();
            onClose();
        } catch (error) {
            console.error('Failed to create group:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] w-[calc(100vw-2rem)] p-0 gap-0 max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header - Fixed */}
                <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b shrink-0">
                    <DialogHeader className="p-0">
                        <DialogTitle className="text-lg">Create Group</DialogTitle>
                    </DialogHeader>
                </div>

                {/* Scrollable Form Content */}
                <div className="overflow-y-auto flex-1">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
                        <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5 flex-1">
                            {/* Group Name */}
                            <div className="space-y-1.5 sm:space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium">
                                    Group Name *
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Roommates, Trip to Goa"
                                    {...register('name')}
                                    className={errors.name ? 'border-destructive' : ''}
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            {/* Icon Preview */}
                            <div className="space-y-1.5 sm:space-y-2">
                                <Label className="text-sm font-medium">Group Icon</Label>
                                <div className="flex items-center gap-2 px-3 py-2.5 border rounded-lg bg-muted/30">
                                    <GroupIcon seed={iconSeed} size={24} />
                                    <span className="text-sm text-muted-foreground flex-1 min-w-0 truncate">
                                        Your group&apos;s unique icon
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIconSeed(generateRandomSeed())}
                                        className="flex items-center gap-1.5 h-8 text-sm px-2.5 shrink-0"
                                    >
                                        <Shuffle className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">Change</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Category Selection */}
                            <div className="space-y-1.5 sm:space-y-2">
                                <Label className="text-sm font-medium">Category</Label>
                                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                                    {GROUP_CATEGORIES.map((category) => {
                                        const Icon = category.icon;
                                        const isSelected = selectedCategory === category.value;
                                        return (
                                            <button
                                                key={category.value}
                                                type="button"
                                                onClick={() =>
                                                    setValue(
                                                        'groupType',
                                                        category.value as
                                                        | 'home'
                                                        | 'office'
                                                        | 'trip'
                                                        | 'friends'
                                                        | 'other'
                                                    )
                                                }
                                                className={`flex flex-col items-center justify-center gap-1 sm:gap-1.5 p-2 sm:p-2.5 rounded-lg border-2 transition-all ${isSelected
                                                        ? 'border-primary bg-primary/10'
                                                        : 'border-border hover:border-primary/50 hover:bg-accent'
                                                    }`}
                                            >
                                                <Icon className={`w-5 h-5 ${category.color}`} />
                                                <span className="text-xs font-medium leading-tight text-center">
                                                    {category.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5 sm:space-y-2">
                                <Label htmlFor="description" className="text-sm font-medium">
                                    Description (Optional)
                                </Label>
                                <Textarea
                                    id="description"
                                    placeholder="What is this group for?"
                                    rows={3}
                                    {...register('description')}
                                    className="resize-none"
                                />
                                {errors.description && (
                                    <p className="text-sm text-destructive">
                                        {errors.description.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Actions - Fixed at bottom */}
                        <div className="border-t px-4 sm:px-6 py-3 sm:py-4 shrink-0 bg-background">
                            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    className="w-full sm:w-auto"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={createGroup.isPending}
                                    className="w-full sm:w-auto"
                                >
                                    {createGroup.isPending ? 'Creating...' : 'Create Group'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}