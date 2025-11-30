'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateLoan } from '@/lib/hooks/use-loans';
import { createLoanSchema, type CreateLoanInput } from '@/lib/validations/schemas';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';

interface AddLoanModalProps {
    open: boolean;
    onClose: () => void;
}

export function AddLoanModal({ open, onClose }: AddLoanModalProps) {
    const [loanType, setLoanType] = useState<'LENT' | 'BORROWED'>('LENT');
    const createLoan = useCreateLoan();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<CreateLoanInput>({
        resolver: zodResolver(createLoanSchema),
        defaultValues: {
            type: 'LENT',
        },
    });

    const dueDate = watch('dueDate');

    const onSubmit = async (data: CreateLoanInput) => {
        try {
            await createLoan.mutateAsync({
                ...data,
                type: loanType,
                dueDate: data.dueDate?.toISOString(),
            });
            reset();
            onClose();
        } catch (error) {
            console.error('Failed to create loan:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Loan</DialogTitle>
                </DialogHeader>

                <Tabs value={loanType} onValueChange={(v: any) => setLoanType(v)}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="LENT">Money I Lent</TabsTrigger>
                        <TabsTrigger value="BORROWED">Money I Borrowed</TabsTrigger>
                    </TabsList>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                        <TabsContent value="LENT" className="space-y-4 mt-0">
                            {/* Borrower Email */}
                            <div className="space-y-2">
                                <Label htmlFor="borrowerEmail">Borrower Email *</Label>
                                <Input
                                    id="borrowerEmail"
                                    type="email"
                                    placeholder="borrower@example.com"
                                    {...register('borrowerEmail')}
                                    className={errors.borrowerEmail ? 'border-destructive' : ''}
                                />
                                {errors.borrowerEmail && (
                                    <p className="text-sm text-destructive">{errors.borrowerEmail.message}</p>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="BORROWED" className="space-y-4 mt-0">
                            {/* Lender Email */}
                            <div className="space-y-2">
                                <Label htmlFor="lenderEmail">Lender Email *</Label>
                                <Input
                                    id="lenderEmail"
                                    type="email"
                                    placeholder="lender@example.com"
                                    {...register('lenderEmail')}
                                    className={errors.lenderEmail ? 'border-destructive' : ''}
                                />
                                {errors.lenderEmail && (
                                    <p className="text-sm text-destructive">{errors.lenderEmail.message}</p>
                                )}
                            </div>
                        </TabsContent>

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

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <Input
                                id="description"
                                placeholder="e.g., Rent payment, Emergency loan"
                                {...register('description')}
                                className={errors.description ? 'border-destructive' : ''}
                            />
                            {errors.description && (
                                <p className="text-sm text-destructive">{errors.description.message}</p>
                            )}
                        </div>

                        {/* Due Date */}
                        <div className="space-y-2">
                            <Label>Due Date (Optional)</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'w-full justify-start text-left font-normal',
                                            !dueDate && 'text-muted-foreground'
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dueDate ? format(dueDate, 'PPP') : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={dueDate}
                                        onSelect={(date) => setValue('dueDate', date)}
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
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createLoan.isPending}>
                                {createLoan.isPending ? 'Adding...' : 'Add Loan'}
                            </Button>
                        </div>
                    </form>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
