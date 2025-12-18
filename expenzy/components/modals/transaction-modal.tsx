import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCategories } from '@/lib/hooks/use-categories';
import { useCreateExpense, useUpdateExpense } from '@/lib/hooks/use-expenses';
import { useCreateIncome, useUpdateIncome } from '@/lib/hooks/use-income';
import { useKeywordMatcher, CategoryMatch } from '@/lib/categorization/keyword-matcher';
import { CategoryIcon, formatCategoryName } from '@/lib/categorization/category-icons';
import { CategorySelector } from '@/components/shared/category-selector';
import { useCalculatorInput } from '@/lib/hooks/use-calculator-input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    description: z.string().min(3, 'Description must be at least 3 characters').max(200, 'Description too long'),
    categoryId: z.string().min(1, 'Category is required'),
    date: z.date(),
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
    const selectedType = useWatch({ control, name: 'type' }) || 'expense';
    const description = useWatch({ control, name: 'description' });

    const { data: categories = [] } = useCategories(selectedType === 'expense' ? 'EXPENSE' : 'INCOME');
    const createExpense = useCreateExpense();
    const createIncome = useCreateIncome();
    const updateExpense = useUpdateExpense();
    const updateIncome = useUpdateIncome();

    // Keyword Matcher Integration with Multi-Category Support
    const { matchAll, isReady } = useKeywordMatcher();
    const [categoryMatches, setCategoryMatches] = useState<CategoryMatch[]>([]);
    const [selectedMatchCategory, setSelectedMatchCategory] = useState<string | null>(null);
    const calculatorInput = useCalculatorInput('');



    // Auto-detect categories based on description (min 3 chars) with debouncing
    useEffect(() => {
        // Debounce timer - wait 300ms after user stops typing
        const debounceTimer = setTimeout(() => {
            if (mode === 'add' && isReady && description && description.length >= 3 && selectedType === 'expense') {
                const matches = matchAll(description);
                setCategoryMatches(matches);

                if (matches.length === 1) {
                    // Single match - auto-select (includes 'other' fallback)
                    const matchingCategory = categories.find(c =>
                        c.name.toLowerCase() === matches[0].category.toLowerCase() ||
                        c.name.toLowerCase().includes(matches[0].category.toLowerCase())
                    );

                    if (matchingCategory) {
                        setValue('categoryId', matchingCategory.id);
                        setSelectedMatchCategory(matches[0].category);
                    }
                } else if (matches.length > 1) {
                    // Multiple matches - user needs to choose
                    // Don't reset if user has already selected one
                    if (!selectedMatchCategory || !matches.find(m => m.category === selectedMatchCategory)) {
                        setSelectedMatchCategory(null);
                    }
                }
            } else if (mode === 'add') {
                setCategoryMatches([]);
                // Don't reset selectedMatchCategory if user manually selected something
            }
        }, 300); // 300ms debounce delay

        // Cleanup function to cancel timer if description changes before delay completes
        return () => clearTimeout(debounceTimer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [description, isReady, matchAll, mode, selectedType, categories]);

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
            calculatorInput.setValue(transaction.amount.toString());
            setValue('description', description);
            setValue('categoryId', transaction.categoryId);
            setValue('date', new Date(date));

            // For edit mode, we can show the existing category icon if we want, 
            // but for now let's just rely on the stored categoryId
            if (transaction.type === 'expense' && transaction.category) {
                setSelectedMatchCategory(transaction.category.name.toLowerCase());
            }
        }
    }, [mode, transaction, open, setValue]);

    const handleTypeChange = (type: 'income' | 'expense') => {
        setValue('type', type);
        setValue('categoryId', ''); // Reset category when type changes
        calculatorInput.setValue(''); // Reset calculator
    };

    const onSubmit = async (data: TransactionFormData) => {
        try {
            // Get the final calculated amount
            const finalAmount = calculatorInput.result.calculatedValue || parseFloat(calculatorInput.value);

            if (isNaN(finalAmount) || finalAmount <= 0) {
                return; // Form validation will handle this
            }

            if (mode === 'add') {
                if (data.type === 'expense') {
                    await createExpense.mutateAsync({
                        amount: finalAmount,
                        description: data.description,
                        categoryId: data.categoryId,
                        expenseDate: data.date.toISOString(),
                    });
                } else {
                    await createIncome.mutateAsync({
                        amount: finalAmount,
                        source: data.description,
                        categoryId: data.categoryId,
                        incomeDate: data.date.toISOString(),
                    });
                }
            } else {
                // Edit mode
                if (!transaction) return;

                if (data.type === 'expense') {
                    await updateExpense.mutateAsync({
                        id: transaction.id,
                        data: {
                            amount: finalAmount,
                            description: data.description,
                            categoryId: data.categoryId,
                            expenseDate: data.date.toISOString(),
                        },
                    });
                } else {
                    await updateIncome.mutateAsync({
                        id: transaction.id,
                        data: {
                            amount: finalAmount,
                            source: data.description,
                            categoryId: data.categoryId,
                            incomeDate: data.date.toISOString(),
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
                        <div className="relative">
                            <Input
                                id="amount"
                                type="text"
                                placeholder="0.00"
                                value={calculatorInput.value}
                                onChange={calculatorInput.handleChange}
                                className="pr-20"
                            />
                            {calculatorInput.result.isExpression && calculatorInput.result.calculatedValue !== null && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-green-600 dark:text-green-400">
                                    = {calculatorInput.result.calculatedValue.toFixed(2)}
                                </div>
                            )}
                        </div>
                        {!calculatorInput.value && errors.amount && (
                            <p className="text-sm text-destructive">{errors.amount.message}</p>
                        )}
                    </div>

                    {/* Description with Auto-detected Category Icon */}
                    <div className="space-y-2">
                        <Label htmlFor="description">
                            {selectedType === 'expense' ? 'Description' : 'Source'} *
                        </Label>
                        <div className="relative">
                            <Input
                                id="description"
                                placeholder={
                                    selectedType === 'expense'
                                        ? 'e.g., Lunch at restaurant, Uber ride, Buy chicken'
                                        : 'e.g., Salary, Freelance work'
                                }
                                {...register('description')}
                                className={cn(
                                    errors.description ? 'border-destructive' : '',
                                    selectedMatchCategory && categoryMatches.length === 1 && selectedType === 'expense' ? 'pr-12' : ''
                                )}
                            />
                            {/* Auto-detected Category Icon (single match only) */}
                            {selectedMatchCategory && categoryMatches.length === 1 && selectedType === 'expense' && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    <CategoryIcon
                                        iconName={categories.find(c => c.name.toLowerCase() === selectedMatchCategory.toLowerCase() || c.name.toLowerCase().includes(selectedMatchCategory.toLowerCase()))?.icon}
                                        color={categories.find(c => c.name.toLowerCase() === selectedMatchCategory.toLowerCase() || c.name.toLowerCase().includes(selectedMatchCategory.toLowerCase()))?.color}
                                        className="w-5 h-5"
                                    />
                                </div>
                            )}
                        </div>
                        {errors.description && (
                            <p className="text-sm text-destructive">{errors.description.message}</p>
                        )}

                        {/* Multiple Category Matches - Show selector */}
                        {categoryMatches.length > 1 && selectedType === 'expense' && description && description.length >= 3 && (
                            <CategorySelector
                                matches={categoryMatches}
                                selectedCategory={selectedMatchCategory || undefined}
                                onSelect={(category) => {
                                    const matchingCategory = categories.find(c =>
                                        c.name.toLowerCase() === category.toLowerCase() ||
                                        c.name.toLowerCase().includes(category.toLowerCase())
                                    );
                                    if (matchingCategory) {
                                        setValue('categoryId', matchingCategory.id);
                                        setSelectedMatchCategory(category);
                                    }
                                }}
                                categories={categories}
                            />
                        )}

                        {/* Single match display */}
                        {selectedMatchCategory && categoryMatches.length <= 1 && selectedType === 'expense' && description && description.length >= 3 && (
                            <div className="flex items-center gap-2 p-2.5 rounded-md bg-muted/50 border border-border">
                                <CategoryIcon
                                    iconName={categories.find(c => c.name.toLowerCase() === selectedMatchCategory.toLowerCase() || c.name.toLowerCase().includes(selectedMatchCategory.toLowerCase()))?.icon}
                                    color={categories.find(c => c.name.toLowerCase() === selectedMatchCategory.toLowerCase() || c.name.toLowerCase().includes(selectedMatchCategory.toLowerCase()))?.color}
                                    className="w-5 h-5 flex-shrink-0"
                                />
                                <span className="text-sm font-medium text-foreground">
                                    Category: {formatCategoryName(selectedMatchCategory)}
                                </span>
                            </div>
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
