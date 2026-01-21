'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateIncome, useUpdateIncome } from '@/lib/hooks/use-income';
import { useCategories } from '@/lib/hooks/use-categories';
import type { Income, CreateIncomeDto } from '@/types';

interface IncomeModalProps {
    open: boolean;
    onClose: () => void;
    income?: Income;
}

export function IncomeModal({ open, onClose, income }: IncomeModalProps) {
    const { data: categories = [] } = useCategories('INCOME');
    const createIncome = useCreateIncome();
    const updateIncome = useUpdateIncome();

    const [formData, setFormData] = useState<CreateIncomeDto>({
        categoryId: income?.categoryId || '',
        amount: income?.amount || 0,
        currency: income?.currency || 'USD',
        source: income?.source || '',
        description: income?.description || '',
        incomeDate: income?.incomeDate || new Date().toISOString().split('T')[0],
        notes: income?.notes || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (income) {
            await updateIncome.mutateAsync({ id: income.id, data: formData });
        } else {
            await createIncome.mutateAsync(formData);
        }

        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{income ? 'Edit Income' : 'Add Income'}</DialogTitle>
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
                        <Label htmlFor="source">Source *</Label>
                        <Input
                            id="source"
                            value={formData.source}
                            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                            placeholder="e.g., Salary, Freelance, etc."
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div>
                        <Label htmlFor="date">Date *</Label>
                        <Input
                            id="date"
                            type="date"
                            value={formData.incomeDate}
                            onChange={(e) => setFormData({ ...formData, incomeDate: e.target.value })}
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
                        <Button type="submit" disabled={createIncome.isPending || updateIncome.isPending}>
                            {income ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
