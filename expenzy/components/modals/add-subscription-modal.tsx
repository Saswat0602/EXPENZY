'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateSubscription } from '@/lib/hooks/use-subscriptions';
import { createSubscriptionSchema, type CreateSubscriptionInput } from '@/lib/validations/subscription.schema';
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

interface AddSubscriptionModalProps {
    open: boolean;
    onClose: () => void;
}

export function AddSubscriptionModal({ open, onClose }: AddSubscriptionModalProps) {
    const createSubscription = useCreateSubscription();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<CreateSubscriptionInput>({
        resolver: zodResolver(createSubscriptionSchema),
        defaultValues: {
            billingCycle: 'monthly',
            startDate: new Date(),
            nextBillingDate: new Date(),
        },
    });

    const billingCycle = watch('billingCycle');
    const startDate = watch('startDate');
    const nextBillingDate = watch('nextBillingDate');
    const endDate = watch('endDate');

    const onSubmit = async (data: CreateSubscriptionInput) => {
        try {
            await createSubscription.mutateAsync({
                name: data.name,
                description: data.description,
                amount: data.amount,
                currency: data.currency,
                billingCycle: data.billingCycle,
                startDate: data.startDate.toISOString(),
                nextBillingDate: data.nextBillingDate.toISOString(),
                endDate: data.endDate?.toISOString(),
                paymentMethod: data.paymentMethod,
                reminderDays: data.reminderDays,
                notes: data.notes,
            });
            reset();
            onClose();
        } catch (error) {
            console.error('Failed to create subscription:', error);
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
                    <DialogTitle>Add Subscription</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                            id="name"
                            placeholder="e.g., Netflix, Spotify"
                            {...register('name')}
                            className={errors.name ? 'border-destructive' : ''}
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            placeholder="Optional description"
                            {...register('description')}
                        />
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount *</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...register('amount', { valueAsNumber: true })}
                            className={errors.amount ? 'border-destructive' : ''}
                        />
                        {errors.amount && (
                            <p className="text-sm text-destructive">{errors.amount.message}</p>
                        )}
                    </div>

                    {/* Billing Cycle */}
                    <div className="space-y-2">
                        <Label>Billing Cycle *</Label>
                        <Select
                            value={billingCycle}
                            onValueChange={(value: any) => setValue('billingCycle', value)}
                        >
                            <SelectTrigger className={errors.billingCycle ? 'border-destructive' : ''}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.billingCycle && (
                            <p className="text-sm text-destructive">{errors.billingCycle.message}</p>
                        )}
                    </div>

                    {/* Start Date */}
                    <div className="space-y-2">
                        <Label>Start Date *</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start text-left font-normal',
                                        !startDate && 'text-muted-foreground',
                                        errors.startDate && 'border-destructive'
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={(date) => date && setValue('startDate', date)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        {errors.startDate && (
                            <p className="text-sm text-destructive">{errors.startDate.message}</p>
                        )}
                    </div>

                    {/* Next Billing Date */}
                    <div className="space-y-2">
                        <Label>Next Billing Date *</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start text-left font-normal',
                                        !nextBillingDate && 'text-muted-foreground',
                                        errors.nextBillingDate && 'border-destructive'
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {nextBillingDate ? format(nextBillingDate, 'PPP') : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={nextBillingDate}
                                    onSelect={(date) => date && setValue('nextBillingDate', date)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        {errors.nextBillingDate && (
                            <p className="text-sm text-destructive">{errors.nextBillingDate.message}</p>
                        )}
                    </div>

                    {/* End Date (Optional) */}
                    <div className="space-y-2">
                        <Label>End Date (Optional)</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start text-left font-normal',
                                        !endDate && 'text-muted-foreground',
                                        errors.endDate && 'border-destructive'
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={(date) => setValue('endDate', date)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        {errors.endDate && (
                            <p className="text-sm text-destructive">{errors.endDate.message}</p>
                        )}
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-2">
                        <Label htmlFor="paymentMethod">Payment Method (Optional)</Label>
                        <Input
                            id="paymentMethod"
                            placeholder="e.g., Credit Card, PayPal"
                            {...register('paymentMethod')}
                        />
                    </div>

                    {/* Reminder Days */}
                    <div className="space-y-2">
                        <Label htmlFor="reminderDays">Reminder Days Before (Optional)</Label>
                        <Input
                            id="reminderDays"
                            type="number"
                            min="0"
                            max="30"
                            placeholder="e.g., 3"
                            {...register('reminderDays', { valueAsNumber: true })}
                            className={errors.reminderDays ? 'border-destructive' : ''}
                        />
                        {errors.reminderDays && (
                            <p className="text-sm text-destructive">{errors.reminderDays.message}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Get notified this many days before renewal
                        </p>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Add any additional notes..."
                            rows={3}
                            {...register('notes')}
                            className={errors.notes ? 'border-destructive' : ''}
                        />
                        {errors.notes && (
                            <p className="text-sm text-destructive">{errors.notes.message}</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end pt-4">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createSubscription.isPending}>
                            {createSubscription.isPending ? 'Adding...' : 'Add Subscription'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
