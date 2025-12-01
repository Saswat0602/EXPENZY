'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateSavingsGoal } from '@/lib/hooks/use-savings';
import { createSavingsGoalSchema, type CreateSavingsGoalInput } from '@/lib/validations/savings.schema';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';

interface AddSavingsGoalModalProps {
    open: boolean;
    onClose: () => void;
}

const PRIORITY_OPTIONS = [
    { value: 'low', label: 'Low', color: '#6b7280' },
    { value: 'medium', label: 'Medium', color: '#f59e0b' },
    { value: 'high', label: 'High', color: '#ef4444' },
];

const COLOR_OPTIONS = [
    '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444',
    '#14b8a6', '#06b6d4', '#6366f1', '#a855f7', '#d946ef', '#f43f5e',
];

export function AddSavingsGoalModal({ open, onClose }: AddSavingsGoalModalProps) {
    const createSavingsGoal = useCreateSavingsGoal();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<CreateSavingsGoalInput>({
        resolver: zodResolver(createSavingsGoalSchema),
        defaultValues: {
            priority: 'medium',
            color: '#10b981',
        },
    });

    const targetDate = watch('targetDate');
    const priority = watch('priority');
    const selectedColor = watch('color');

    const onSubmit = async (data: CreateSavingsGoalInput) => {
        try {
            await createSavingsGoal.mutateAsync({
                name: data.name,
                description: data.description,
                targetAmount: data.targetAmount,
                currency: data.currency,
                targetDate: data.targetDate?.toISOString(),
                priority: data.priority,
                icon: data.icon,
                color: data.color,
            });
            reset();
            onClose();
        } catch (error) {
            console.error('Failed to create savings goal:', error);
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Savings Goal</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Goal Name *</Label>
                        <Input
                            id="name"
                            placeholder="e.g., Emergency Fund, Vacation, New Car"
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
                            placeholder="Describe your savings goal..."
                            rows={3}
                            {...register('description')}
                            className={errors.description ? 'border-destructive' : ''}
                        />
                        {errors.description && (
                            <p className="text-sm text-destructive">{errors.description.message}</p>
                        )}
                    </div>

                    {/* Target Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="targetAmount">Target Amount *</Label>
                        <Input
                            id="targetAmount"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...register('targetAmount', { valueAsNumber: true })}
                            className={errors.targetAmount ? 'border-destructive' : ''}
                        />
                        {errors.targetAmount && (
                            <p className="text-sm text-destructive">{errors.targetAmount.message}</p>
                        )}
                    </div>

                    {/* Target Date */}
                    <div className="space-y-2">
                        <Label>Target Date (Optional)</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start text-left font-normal',
                                        !targetDate && 'text-muted-foreground',
                                        errors.targetDate && 'border-destructive'
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {targetDate ? format(targetDate, 'PPP') : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={targetDate}
                                    onSelect={(date) => setValue('targetDate', date)}
                                    disabled={(date) => date < new Date()}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        {errors.targetDate && (
                            <p className="text-sm text-destructive">{errors.targetDate.message}</p>
                        )}
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                        <Label>Priority (Optional)</Label>
                        <Select
                            value={priority}
                            onValueChange={(value: any) => setValue('priority', value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {PRIORITY_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: option.color }}
                                            />
                                            <span>{option.label}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Color Picker */}
                    <div className="space-y-2">
                        <Label>Color (Optional)</Label>
                        <div className="grid grid-cols-6 gap-2">
                            {COLOR_OPTIONS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setValue('color', color)}
                                    className={cn(
                                        'w-10 h-10 rounded-full transition-all',
                                        selectedColor === color
                                            ? 'ring-2 ring-offset-2 ring-primary scale-110'
                                            : 'hover:scale-105'
                                    )}
                                    style={{ backgroundColor: color }}
                                    aria-label={`Select color ${color}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Icon (Optional) */}
                    <div className="space-y-2">
                        <Label htmlFor="icon">Icon (Optional)</Label>
                        <Input
                            id="icon"
                            placeholder="e.g., 🎯, 💰, 🏠, ✈️"
                            {...register('icon')}
                        />
                        <p className="text-xs text-muted-foreground">
                            Enter an emoji to represent your goal
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end pt-4">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createSavingsGoal.isPending}>
                            {createSavingsGoal.isPending ? 'Creating...' : 'Create Goal'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
