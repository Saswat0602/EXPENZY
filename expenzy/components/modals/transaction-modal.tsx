'use client';

import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCategories } from '@/lib/hooks/use-categories';
import { useCreateExpense, useUpdateExpense } from '@/lib/hooks/use-expenses';
import { useCreateIncome, useUpdateIncome } from '@/lib/hooks/use-income';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';
import type { Expense } from '@/types/expense';
import type { Income } from '@/types/income';

const transactionSchema = z.object({
    type: z.enum(['income', 'expense']),
    amount: z.string().min(1, 'Amount is required').refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: 'Amount must be a positive number',
    }),
    description: z.string().min(1, 'Description is required').max(200, 'Description too long'),
    categoryId: z.string().min(1, 'Category is required'),
    date: z.date(),
    notes: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionModalProps {
    open: boolean;
    onClose: () => void;
    mode: 'add' | 'edit';
    transaction?: (Expense | Income) & { type: 'expense' | 'income' };
}

export function TransactionModal({ open, onClose, mode, transaction }: TransactionModalProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        control,
        reset,
    } = useForm<TransactionFormData>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            type: 'expense',
            date: new Date(),
        },
    });

    const selectedDate = useWatch({ control, name: 'date' });
    const selectedCategory = useWatch({ control, name: 'categoryId' });
    const selectedType = useWatch({ control, name: 'type' }) || 'expense';

    const { data: categories = [], isLoading: categoriesLoading } = useCategories(selectedType);
    const createExpense = useCreateExpense();
    const createIncome = useCreateIncome();
    const updateExpense = useUpdateExpense();
    const updateIncome = useUpdateIncome();

    // Pre-populate form in edit mode
    useEffect(() => {
        if (mode === 'edit' && transaction && open) {
            const date = transaction.type === 'expense'
                ? (transaction as Expense).expenseDate
                : (transaction as Income).incomeDate;

            const description = transaction.type === 'expense'
                ? (transaction as Expense).description
                : (transaction as Income).source;

            // Set all form values at once
            setValue('type', transaction.type);
            setValue('amount', transaction.amount.toString());
            setValue('description', description);
            setValue('categoryId', transaction.categoryId);
            setValue('date', new Date(date));
            setValue('notes', transaction.notes || '');
        }
    }, [mode, transaction, open, setValue]);

    const handleTypeChange = (type: 'income' | 'expense') => {
        setValue('type', type);
        setValue('categoryId', ''); // Reset category when type changes
    };

    const onSubmit = async (data: TransactionFormData) => {
        try {
            if (mode === 'add') {
                if (data.type === 'expense') {
                    await createExpense.mutateAsync({
                        amount: Number(data.amount),
                        description: data.description,
                        categoryId: data.categoryId,
                        expenseDate: data.date.toISOString(),
                        notes: data.notes,
                    });
                } else {
                    await createIncome.mutateAsync({
                        amount: Number(data.amount),
                        source: data.description,
                        categoryId: data.categoryId,
                        incomeDate: data.date.toISOString(),
                        notes: data.notes,
                    });
                }
            } else {
                // Edit mode
                if (!transaction) return;

                if (data.type === 'expense') {
                    await updateExpense.mutateAsync({
                        id: transaction.id,
                        data: {
                            amount: Number(data.amount),
                            description: data.description,
                            categoryId: data.categoryId,
                            expenseDate: data.date.toISOString(),
                            notes: data.notes,
                        },
                    });
                } else {
                    await updateIncome.mutateAsync({
                        id: transaction.id,
                        data: {
                            amount: Number(data.amount),
                            source: data.description,
                            categoryId: data.categoryId,
                            incomeDate: data.date.toISOString(),
                            notes: data.notes,
                        },
                    });
                }
            }
            reset();
            onClose();
        } catch (error) {
            console.error('Failed to save transaction:', error);
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const isPending = createExpense.isPending || createIncome.isPending ||
        updateExpense.isPending || updateIncome.isPending;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{mode === 'add' ? 'Add' : 'Edit'} Transaction</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Transaction Type Selector */}
                    <div className="space-y-2">
                        <Label>Type *</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => handleTypeChange('expense')}
                                disabled={mode === 'edit'}
                                className={cn(
                                    'flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all',
                                    selectedType === 'expense'
                                        ? 'border-destructive bg-destructive/10 text-destructive'
                                        : 'border-border hover:border-destructive/50',
                                    mode === 'edit' && 'opacity-50 cursor-not-allowed'
                                )}
                            >
                                <TrendingDown className="w-5 h-5" />
                                <span className="font-medium">Expense</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleTypeChange('income')}
                                disabled={mode === 'edit'}
                                className={cn(
                                    'flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all',
                                    selectedType === 'income'
                                        ? 'border-success bg-success/10 text-success'
                                        : 'border-border hover:border-success/50',
                                    mode === 'edit' && 'opacity-50 cursor-not-allowed'
                                )}
                            >
                                <TrendingUp className="w-5 h-5" />
                                <span className="font-medium">Income</span>
                            </button>
                        </div>
                    </div>

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
                        <Label htmlFor="description">
                            {selectedType === 'expense' ? 'Description' : 'Source'} *
                        </Label>
                        <Input
                            id="description"
                            placeholder={
                                selectedType === 'expense'
                                    ? 'e.g., Lunch at restaurant'
                                    : 'e.g., Salary, Freelance work'
                            }
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
                            key={selectedType} // Force re-render when type changes
                            value={selectedCategory || ''}
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
                                                {category.color && (
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: category.color }}
                                                    />
                                                )}
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
                                    onSelect={(date) => date && setValue('date', date)}
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
                        <Button type="submit" disabled={isPending}>
                            {isPending ? (mode === 'add' ? 'Adding...' : 'Updating...') : (mode === 'add' ? 'Add Transaction' : 'Update Transaction')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
