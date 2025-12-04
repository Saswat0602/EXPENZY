import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCategories } from '@/lib/hooks/use-categories';
import { useCreateExpense } from '@/lib/hooks/use-expenses';
import { useCreateIncome } from '@/lib/hooks/use-income';
import { useKeywordMatcher, CategoryMatch } from '@/lib/categorization/keyword-matcher';
import { CategoryIcon, getCategoryLabel } from '@/lib/categorization/category-icons';
import { CategorySelector } from '@/components/shared/category-selector';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';

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

interface AddTransactionModalProps {
    open: boolean;
    onClose: () => void;
}

export function AddTransactionModal({ open, onClose }: AddTransactionModalProps) {
    const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');

    const { data: categories = [] } = useCategories(transactionType);
    const createExpense = useCreateExpense();
    const createIncome = useCreateIncome();

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
    const description = useWatch({ control, name: 'description' });
    const selectedCategoryId = useWatch({ control, name: 'categoryId' });

    // Keyword Matcher Integration with Multi-Category Support
    const { matchAll, isReady } = useKeywordMatcher();
    const [categoryMatches, setCategoryMatches] = useState<CategoryMatch[]>([]);
    const [selectedMatchCategory, setSelectedMatchCategory] = useState<string | null>(null);

    // Auto-detect categories based on description (min 3 chars) with debouncing
    useEffect(() => {
        // Debounce timer - wait 300ms after user stops typing
        const debounceTimer = setTimeout(() => {
            if (isReady && description && description.length >= 3 && transactionType === 'expense') {
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
                } else { // This now covers matches.length > 1
                    // Multiple matches - user needs to choose
                    // Don't reset if user has already selected one
                    if (!selectedMatchCategory || !matches.find(m => m.category === selectedMatchCategory)) {
                        setSelectedMatchCategory(null);
                    }
                }
            } else {
                setCategoryMatches([]);
                // Don't reset selectedMatchCategory if user manually selected something
            }
        }, 300); // 300ms debounce delay

        // Cleanup function to cancel timer if description changes before delay completes
        return () => clearTimeout(debounceTimer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [description, isReady, matchAll, transactionType, categories]);

    const handleTypeChange = (type: 'income' | 'expense') => {
        setTransactionType(type);
        setValue('type', type);
        setValue('categoryId', ''); // Reset category when type changes
    };

    const onSubmit = async (data: TransactionFormData) => {
        try {
            if (data.type === 'expense') {
                await createExpense.mutateAsync({
                    amount: Number(data.amount),
                    description: data.description,
                    categoryId: data.categoryId,
                    expenseDate: data.date.toISOString(),
                });
            } else {
                await createIncome.mutateAsync({
                    amount: Number(data.amount),
                    source: data.description,
                    categoryId: data.categoryId,
                    incomeDate: data.date.toISOString(),
                });
            }
            reset();
            setTransactionType('expense');
            onClose();
        } catch (error) {
            console.error('Failed to create transaction:', error);
        }
    };

    const handleClose = () => {
        reset();
        setTransactionType('expense');
        onClose();
    };

    const isPending = createExpense.isPending || createIncome.isPending;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Transaction</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Transaction Type Selector */}
                    <div className="space-y-2">
                        <Label>Type *</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => handleTypeChange('expense')}
                                className={cn(
                                    'flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all',
                                    transactionType === 'expense'
                                        ? 'border-destructive bg-destructive/10 text-destructive'
                                        : 'border-border hover:border-destructive/50'
                                )}
                            >
                                <TrendingDown className="w-5 h-5" />
                                <span className="font-medium">Expense</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleTypeChange('income')}
                                className={cn(
                                    'flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all',
                                    transactionType === 'income'
                                        ? 'border-success bg-success/10 text-success'
                                        : 'border-border hover:border-success/50'
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

                    {/* Description with Auto-detected Category */}
                    <div className="space-y-2">
                        <Label htmlFor="description">
                            {transactionType === 'expense' ? 'Description' : 'Source'} *
                        </Label>
                        <div className="relative">
                            <Input
                                id="description"
                                placeholder={
                                    transactionType === 'expense'
                                        ? 'e.g., Lunch at restaurant, Uber ride, Buy chicken'
                                        : 'e.g., Salary, Freelance work'
                                }
                                {...register('description')}
                                className={cn(
                                    errors.description ? 'border-destructive' : '',
                                    selectedMatchCategory && categoryMatches.length === 1 && transactionType === 'expense' ? 'pr-12' : ''
                                )}
                            />
                            {/* Auto-detected Category Icon (single match only) */}
                            {selectedMatchCategory && categoryMatches.length === 1 && transactionType === 'expense' && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    <CategoryIcon
                                        category={selectedMatchCategory}
                                        className="w-5 h-5"
                                    />
                                </div>
                            )}
                        </div>
                        {errors.description && (
                            <p className="text-sm text-destructive">{errors.description.message}</p>
                        )}

                        {/* Single Category Match - Show label */}
                        {selectedMatchCategory && categoryMatches.length === 1 && transactionType === 'expense' && description && description.length >= 3 && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <span>Category:</span>
                                <span className="font-medium">{getCategoryLabel(selectedMatchCategory)}</span>
                            </p>
                        )}

                        {/* Multiple Category Matches - Show selector */}
                        {categoryMatches.length > 1 && transactionType === 'expense' && description && description.length >= 3 && (
                            <CategorySelector
                                matches={categoryMatches}
                                selectedCategory={selectedMatchCategory || undefined}
                                onSelect={(categoryKey) => {
                                    setSelectedMatchCategory(categoryKey);
                                    // Find matching backend category and set it
                                    const matchingCategory = categories.find(c =>
                                        c.name.toLowerCase() === categoryKey.toLowerCase() ||
                                        c.name.toLowerCase().includes(categoryKey.toLowerCase())
                                    );
                                    if (matchingCategory) {
                                        setValue('categoryId', matchingCategory.id);
                                    }
                                }}
                            />
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
                            {isPending ? 'Adding...' : 'Add Transaction'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
