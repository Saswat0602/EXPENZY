'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCategories } from '@/lib/hooks/use-categories';
import { useCreateBudget } from '@/lib/hooks/use-budget';
import { createBudgetSchema, type CreateBudgetInput } from '@/lib/validations/schemas';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';

interface AddBudgetModalProps {
    open: boolean;
    onClose: () => void;
}

export function AddBudgetModal({ open, onClose }: AddBudgetModalProps) {
    const { data: categories = [] } = useCategories('expense');
    const createBudget = useCreateBudget();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        control,
        reset,
    } = useForm<CreateBudgetInput>({
        resolver: zodResolver(createBudgetSchema),
        defaultValues: {
            periodType: 'monthly',
            startDate: new Date(),
        },
    });

    const periodType = useWatch({ control, name: 'periodType' });
    const startDate = useWatch({ control, name: 'startDate' });

    const onSubmit = async (data: CreateBudgetInput) => {
        try {
            await createBudget.mutateAsync({
                categoryId: data.categoryId,
                amount: data.amount,
                periodType: data.periodType,
                startDate: data.startDate.toISOString(),
                endDate: data.endDate ? data.endDate.toISOString() : undefined,
                alertThreshold: data.alertThreshold,
            });
            reset();
            onClose();
        } catch (error) {
            console.error('Failed to create budget:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create Budget</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Category */}
                    <div className="space-y-2">
                        <Label>Category *</Label>
                        <Select onValueChange={(value) => setValue('categoryId', value)}>
                            <SelectTrigger className={errors.categoryId ? 'border-destructive' : ''}>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: category.color }}
                                            />
                                            <span>{category.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.categoryId && (
                            <p className="text-sm text-destructive">{errors.categoryId.message}</p>
                        )}
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="amount">Budget Amount *</Label>
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

                    {/* Period Type */}
                    <div className="space-y-2">
                        <Label>Period *</Label>
                        <Select
                            value={periodType}
                            onValueChange={(value) => setValue('periodType', value as CreateBudgetInput['periodType'])}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                        </Select>
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
                                        !startDate && 'text-muted-foreground'
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
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Alert Threshold */}
                    <div className="space-y-2">
                        <Label htmlFor="alertThreshold">Alert Threshold (%) - Optional</Label>
                        <Input
                            id="alertThreshold"
                            type="number"
                            min="0"
                            max="100"
                            placeholder="80"
                            {...register('alertThreshold', { valueAsNumber: true })}
                        />
                        <p className="text-xs text-muted-foreground">
                            Get notified when spending reaches this percentage
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createBudget.isPending}>
                            {createBudget.isPending ? 'Creating...' : 'Create Budget'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
