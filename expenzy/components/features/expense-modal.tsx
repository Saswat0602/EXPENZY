'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateExpense, useUpdateExpense } from '@/lib/hooks/use-expenses';
import { useCategories } from '@/lib/hooks/use-categories';
import type { Expense, CreateExpenseDto } from '@/types';

interface ExpenseModalProps {
    open: boolean;
    onClose: () => void;
    expense?: Expense;
}

export function ExpenseModal({ open, onClose, expense }: ExpenseModalProps) {
    const { data: categories = [] } = useCategories('EXPENSE');
    const createExpense = useCreateExpense();
    const updateExpense = useUpdateExpense();

    const [formData, setFormData] = useState<CreateExpenseDto>({
        categoryId: expense?.categoryId || '',
        amount: expense?.amount || 0,
        currency: expense?.currency || 'USD',
        description: expense?.description || '',
        expenseDate: expense?.expenseDate || new Date().toISOString().split('T')[0],
        notes: expense?.notes || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (expense) {
            await updateExpense.mutateAsync({ id: expense.id, data: formData });
        } else {
            await createExpense.mutateAsync(formData);
        }

        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{expense ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="category">Category *</Label>
                        <Select
                            value={formData.categoryId}
                            onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="amount">Amount *</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="description">Description *</Label>
                        <Input
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="date">Date *</Label>
                        <Input
                            id="date"
                            type="date"
                            value={formData.expenseDate}
                            onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                        />
                    </div>


                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createExpense.isPending || updateExpense.isPending}>
                            {expense ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
