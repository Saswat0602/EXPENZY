'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateReminder } from '@/lib/hooks/use-reminders';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

const reminderSchema = z.object({
    type: z.enum(['payment', 'subscription', 'loan', 'custom']),
    title: z.string().min(1, 'Title is required'),
    message: z.string().min(1, 'Message is required'),
    reminderDate: z.string(),
    actionUrl: z.string().optional(),
    actionLabel: z.string().optional(),
});

type ReminderInput = z.infer<typeof reminderSchema>;

interface AddReminderModalProps {
    open: boolean;
    onClose: () => void;
}

export function AddReminderModal({ open, onClose }: AddReminderModalProps) {
    const createReminder = useCreateReminder();
    const [reminderDate, setReminderDate] = useState<Date>();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue,
    } = useForm<ReminderInput>({
        resolver: zodResolver(reminderSchema),
        defaultValues: {
            type: 'payment',
        },
    });

    const reminderType = watch('type');

    const onSubmit = async (data: ReminderInput) => {
        try {
            await createReminder.mutateAsync({
                ...data,
                reminderDate: reminderDate ? reminderDate.toISOString() : new Date().toISOString(),
            });
            reset();
            setReminderDate(undefined);
            onClose();
        } catch (error) {
            console.error('Failed to create reminder:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create Reminder</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Type */}
                    <div className="space-y-2">
                        <Label>Reminder Type *</Label>
                        <Select
                            value={reminderType}
                            onValueChange={(value) => setValue('type', value as ReminderInput['type'])}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="payment">Payment</SelectItem>
                                <SelectItem value="subscription">Subscription</SelectItem>
                                <SelectItem value="loan">Loan</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            placeholder="e.g., Rent Payment Due"
                            {...register('title')}
                            className={errors.title ? 'border-destructive' : ''}
                        />
                        {errors.title && (
                            <p className="text-sm text-destructive">{errors.title.message}</p>
                        )}
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                            id="message"
                            placeholder="Reminder details..."
                            rows={3}
                            {...register('message')}
                            className={errors.message ? 'border-destructive' : ''}
                        />
                        {errors.message && (
                            <p className="text-sm text-destructive">{errors.message.message}</p>
                        )}
                    </div>

                    {/* Reminder Date */}
                    <div className="space-y-2">
                        <Label>Reminder Date *</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {reminderDate ? format(reminderDate, 'PPP') : 'Pick a date'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={reminderDate} onSelect={setReminderDate} />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Action URL (Optional) */}
                    <div className="space-y-2">
                        <Label htmlFor="actionUrl">Action URL (Optional)</Label>
                        <Input
                            id="actionUrl"
                            placeholder="/expenses/123"
                            {...register('actionUrl')}
                        />
                    </div>

                    {/* Action Label (Optional) */}
                    <div className="space-y-2">
                        <Label htmlFor="actionLabel">Action Label (Optional)</Label>
                        <Input
                            id="actionLabel"
                            placeholder="View Details"
                            {...register('actionLabel')}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createReminder.isPending}>
                            {createReminder.isPending ? 'Creating...' : 'Create Reminder'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
