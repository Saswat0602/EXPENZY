'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCategories } from '@/lib/hooks/use-categories';
import { useCreateExpense } from '@/lib/hooks/use-expenses';
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

const expenseSchema = z.object({
    amount: z.string().min(1, 'Amount is required').refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: 'Amount must be a positive number',
    }),
    description: z.string().min(1, 'Description is required').max(200, 'Description too long'),
    categoryId: z.string().min(1, 'Category is required'),
    expenseDate: z.date(),
    notes: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface AddTransactionModalProps {
    open: boolean;
    onClose: () => void;
}

export function AddTransactionModal({ open, onClose }: AddTransactionModalProps) {
    const { data: categories = [], isLoading: categoriesLoading } = useCategories('expense');
    const createExpense = useCreateExpense();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<ExpenseFormData>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            expenseDate: new Date(),
        },
    });

    const selectedDate = watch('expenseDate');
    const selectedCategory = watch('categoryId');

    const onSubmit = async (data: ExpenseFormData) => {
        try {
            await createExpense.mutateAsync({
                amount: Number(data.amount),
                description: data.description,
                categoryId: data.categoryId,
                expenseDate: data.expenseDate.toISOString(),
                notes: data.notes,
            });
            reset();
            onClose();
        } catch (error) {
            console.error('Failed to create expense:', error);
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Transaction</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount *</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...register('amount')}
                            className={errors.amount ? 'border-destructive' : ''}
                        />
                        {errors.amount && (
                            <p className="text-sm text-destructive">{errors.amount.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Input
                            id="description"
                            placeholder="e.g., Lunch at restaurant"
                            {...register('description')}
                            className={errors.description ? 'border-destructive' : ''}
                        />
                        {errors.description && (
                            <p className="text-sm text-destructive">{errors.description.message}</p>
                        )}
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                            value={selectedCategory}
                            onValueChange={(value) => setValue('categoryId', value)}
                        >
                            <SelectTrigger className={errors.categoryId ? 'border-destructive' : ''}>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categoriesLoading ? (
                                    <SelectItem value="loading" disabled>
                                        Loading...
                                    </SelectItem>
                                ) : categories.length === 0 ? (
                                    <SelectItem value="empty" disabled>
                                        No categories available
                                    </SelectItem>
                                ) : (
                                    categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: category.color }}
                                                />
                                                <span>{category.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        {errors.categoryId && (
                            <p className="text-sm text-destructive">{errors.categoryId.message}</p>
                        )}
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <Label>Date *</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start text-left font-normal',
                                        !selectedDate && 'text-muted-foreground'
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => date && setValue('expenseDate', date)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Add any additional notes..."
                            rows={3}
                            {...register('notes')}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end pt-4">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createExpense.isPending}>
                            {createExpense.isPending ? 'Adding...' : 'Add Transaction'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
