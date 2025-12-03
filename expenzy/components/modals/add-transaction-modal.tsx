import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCategories } from '@/lib/hooks/use-categories';
import { useCreateExpense } from '@/lib/hooks/use-expenses';
import { useCreateIncome } from '@/lib/hooks/use-income';
import { useKeywordMatcher } from '@/lib/categorization/keyword-matcher';
import { CategoryIcon, getCategoryLabel } from '@/lib/categorization/category-icons';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';

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

interface AddTransactionModalProps {
    open: boolean;
    onClose: () => void;
}

export function AddTransactionModal({ open, onClose }: AddTransactionModalProps) {
    const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');

    const { data: categories = [], isLoading: categoriesLoading } = useCategories(transactionType);
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
    const selectedCategory = useWatch({ control, name: 'categoryId' });
    const description = useWatch({ control, name: 'description' });

    // Keyword Matcher Integration
    const { match, isReady } = useKeywordMatcher();
    const [suggestedCategoryKey, setSuggestedCategoryKey] = useState<string | null>(null);

    // Auto-detect category based on description
    useEffect(() => {
        if (isReady && description && transactionType === 'expense') {
            const matchedKey = match(description);
            setSuggestedCategoryKey(matchedKey);

            if (matchedKey) {
                // Find matching category ID from backend categories
                const matchingCategory = categories.find(c =>
                    c.name.toLowerCase() === matchedKey.toLowerCase() ||
                    c.name.toLowerCase().includes(matchedKey.toLowerCase())
                );

                if (matchingCategory) {
                    setValue('categoryId', matchingCategory.id);
                }
            }
        } else {
            setSuggestedCategoryKey(null);
        }
    }, [description, isReady, match, transactionType, categories, setValue]);

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

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">
                            {transactionType === 'expense' ? 'Description' : 'Source'} *
                        </Label>
                        <Input
                            id="description"
                            placeholder={
                                transactionType === 'expense'
                                    ? 'e.g., Lunch at restaurant'
                                    : 'e.g., Salary, Freelance work'
                            }
                            {...register('description')}
                            className={errors.description ? 'border-destructive' : ''}
                        />
                        {errors.description && (
                            <p className="text-sm text-destructive">{errors.description.message}</p>
                        )}

                        {/* Instant Suggestion Badge */}
                        {suggestedCategoryKey && transactionType === 'expense' && (
                            <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-secondary/30 border border-secondary/50 animate-in fade-in slide-in-from-top-1">
                                <Sparkles className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm text-muted-foreground">
                                    Suggested:
                                </span>
                                <Badge
                                    variant="secondary"
                                    className="flex items-center gap-1"
                                >
                                    <CategoryIcon
                                        category={suggestedCategoryKey}
                                        className="h-3 w-3"
                                    />
                                    {getCategoryLabel(suggestedCategoryKey)}
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                            key={transactionType} // Force re-render when type changes
                            value={selectedCategory || ''}
                            onValueChange={(value) => setValue('categoryId', value)}
                        >
                            <SelectTrigger className={errors.categoryId ? 'border-destructive' : ''}>
                                <SelectValue placeholder="Select category">
                                    {selectedCategory && categories.find(c => c.id === selectedCategory) && (
                                        <div className="flex items-center gap-2">
                                            <CategoryIcon
                                                category={categories.find(c => c.id === selectedCategory)?.name.toLowerCase() || ''}
                                                className="h-4 w-4"
                                            />
                                            <span>
                                                {getCategoryLabel(categories.find(c => c.id === selectedCategory)?.name.toLowerCase() || '')}
                                            </span>
                                        </div>
                                    )}
                                </SelectValue>
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
                                                <CategoryIcon
                                                    category={category.name.toLowerCase()}
                                                    className="h-4 w-4"
                                                />
                                                <span>{getCategoryLabel(category.name.toLowerCase())}</span>
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
                            {isPending ? 'Adding...' : 'Add Transaction'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
