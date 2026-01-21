'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateRecurringExpense } from '@/lib/hooks/use-recurring-expenses';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

const recurringExpenseSchema = z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
    interval: z.number().min(1).max(365).optional(),
    dayOfWeek: z.number().min(0).max(6).optional(),
    dayOfMonth: z.number().min(1).max(31).optional(),
    startDate: z.string(),
    endDate: z.string().optional(),
});

type RecurringExpenseInput = z.infer<typeof recurringExpenseSchema>;

interface AddRecurringExpenseModalProps {
    open: boolean;
    onClose: () => void;
}

export function AddRecurringExpenseModal({ open, onClose }: AddRecurringExpenseModalProps) {
    const createRecurring = useCreateRecurringExpense();
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue,
    } = useForm<RecurringExpenseInput>({
        resolver: zodResolver(recurringExpenseSchema),
        defaultValues: {
            frequency: 'monthly',
            interval: 1,
        },
    });

    const frequency = watch('frequency');

    const onSubmit = async (data: RecurringExpenseInput) => {
        try {
            await createRecurring.mutateAsync({
                ...data,
                startDate: startDate ? startDate.toISOString() : new Date().toISOString(),
                endDate: endDate?.toISOString(),
            });
            reset();
            onClose();
        } catch (error) {
            console.error('Failed to create recurring expense:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create Recurring Expense</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Frequency */}
                    <div className="space-y-2">
                        <Label>Frequency *</Label>
                        <Select
                            value={frequency}
                            onValueChange={(value) => setValue('frequency', value as RecurringExpenseInput['frequency'])}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Interval */}
                    <div className="space-y-2">
                        <Label htmlFor="interval">Repeat Every</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="interval"
                                type="number"
                                min="1"
                                {...register('interval', { valueAsNumber: true })}
                                className="w-20"
                            />
                            <span className="text-sm text-muted-foreground">
                                {frequency === 'daily' && 'day(s)'}
                                {frequency === 'weekly' && 'week(s)'}
                                {frequency === 'monthly' && 'month(s)'}
                                {frequency === 'yearly' && 'year(s)'}
                            </span>
                        </div>
                        {errors.interval && (
                            <p className="text-sm text-destructive">{errors.interval.message}</p>
                        )}
                    </div>

                    {/* Day of Week (for weekly) */}
                    {frequency === 'weekly' && (
                        <div className="space-y-2">
                            <Label>Day of Week</Label>
                            <Select
                                onValueChange={(value) => setValue('dayOfWeek', parseInt(value))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select day" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Sunday</SelectItem>
                                    <SelectItem value="1">Monday</SelectItem>
                                    <SelectItem value="2">Tuesday</SelectItem>
                                    <SelectItem value="3">Wednesday</SelectItem>
                                    <SelectItem value="4">Thursday</SelectItem>
                                    <SelectItem value="5">Friday</SelectItem>
                                    <SelectItem value="6">Saturday</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Day of Month (for monthly) */}
                    {frequency === 'monthly' && (
                        <div className="space-y-2">
                            <Label htmlFor="dayOfMonth">Day of Month</Label>
                            <Input
                                id="dayOfMonth"
                                type="number"
                                min="1"
                                max="31"
                                placeholder="1-31"
                                {...register('dayOfMonth', { valueAsNumber: true })}
                            />
                        </div>
                    )}

                    {/* Start Date */}
                    <div className="space-y-2">
                        <Label>Start Date *</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* End Date (Optional) */}
                    <div className="space-y-2">
                        <Label>End Date (Optional)</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {endDate ? format(endDate, 'PPP') : 'No end date'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createRecurring.isPending}>
                            {createRecurring.isPending ? 'Creating...' : 'Create Pattern'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
