'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateLoan } from '@/lib/hooks/use-loans';

import { createLoanSchema, type CreateLoanInput } from '@/lib/validations/schemas';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';

interface AddLoanModalProps {
    open: boolean;
    onClose: () => void;
    prefilledPerson?: {
        id: string;
        name: string;
    };
    defaultLoanType?: 'LENT' | 'BORROWED';
    currentBalance?: number; // Current balance with this person
}

export function AddLoanModal({ open, onClose, prefilledPerson, defaultLoanType, currentBalance = 0 }: AddLoanModalProps) {
    const [loanType, setLoanType] = useState<'LENT' | 'BORROWED'>(defaultLoanType || 'LENT');
    const createLoan = useCreateLoan();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        control,
        reset,
        watch,
    } = useForm<CreateLoanInput>({
        resolver: zodResolver(createLoanSchema),
        defaultValues: {
            loanDate: new Date(),
            borrowerName: loanType === 'LENT' && prefilledPerson ? prefilledPerson.name : '',
            lenderName: loanType === 'BORROWED' && prefilledPerson ? prefilledPerson.name : '',
            amount: undefined,
        },
    });

    const amount = watch('amount');

    // Calculate new balance - fix NaN issue
    const calculateNewBalance = () => {
        const parsedAmount = parseFloat(String(amount || 0));
        if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
            return currentBalance;
        }

        // If lent: positive (they owe you more)
        // If borrowed: negative (you owe them more)
        const change = loanType === 'LENT' ? parsedAmount : -parsedAmount;
        return currentBalance + change;
    };

    const newBalance = calculateNewBalance();
    const isLent = newBalance >= 0;

    const onSubmit = async () => {
        try {
            // TODO: Update this modal to use proper user IDs instead of names
            // The new API requires lenderUserId and borrowerUserId
            console.warn('Add Loan Modal needs updating for new API');
            reset();
            onClose();
        } catch (error) {
            console.error('Failed to create loan:', error);
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
                    <DialogTitle>Add Loan</DialogTitle>
                </DialogHeader>

                <Tabs value={loanType} onValueChange={(v) => setLoanType(v as 'LENT' | 'BORROWED')}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="LENT">Money I Lent</TabsTrigger>
                        <TabsTrigger value="BORROWED">Money I Borrowed</TabsTrigger>
                    </TabsList>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                        <TabsContent value="LENT" className="space-y-4 mt-0">
                            {/* Borrower Name */}
                            <div className="space-y-2">
                                <Label htmlFor="borrowerName">Borrower Name *</Label>
                                <Input
                                    id="borrowerName"
                                    type="text"
                                    placeholder="e.g., John Doe"
                                    {...register('borrowerName')}
                                    disabled={!!prefilledPerson}
                                    className={errors.borrowerName ? 'border-destructive' : ''}
                                />
                                {errors.borrowerName && (
                                    <p className="text-sm text-destructive">{errors.borrowerName.message}</p>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="BORROWED" className="space-y-4 mt-0">
                            {/* Lender Name */}
                            <div className="space-y-2">
                                <Label htmlFor="lenderName">Lender Name *</Label>
                                <Input
                                    id="lenderName"
                                    type="text"
                                    placeholder="e.g., Jane Smith"
                                    {...register('lenderName')}
                                    disabled={!!prefilledPerson}
                                    className={errors.lenderName ? 'border-destructive' : ''}
                                />
                                {errors.lenderName && (
                                    <p className="text-sm text-destructive">{errors.lenderName.message}</p>
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
                            <Label htmlFor="description">Description (Optional)</Label>
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

                        {/* Balance Calculator - Only show if person is prefilled and valid amount */}
                        {prefilledPerson && amount && !isNaN(Number(amount)) && Number(amount) > 0 && (
                            <div className="bg-muted/30 rounded-lg p-3 border border-border/40">
                                <div className="flex justify-between items-center text-sm mb-1">
                                    <span className="text-muted-foreground">Current Balance:</span>
                                    <span className="font-semibold">
                                        ₹{Math.abs(currentBalance).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">After This:</span>
                                    <span className={`font-bold ${isLent ? 'text-green-600' : 'text-red-600'}`}>
                                        ₹{Math.abs(newBalance).toFixed(2)}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    {isLent
                                        ? `${prefilledPerson.name} will owe you`
                                        : `You will owe ${prefilledPerson.name}`}
                                </p>
                            </div>
                        )}

                        {/* Loan Date */}
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'w-full justify-start text-left font-normal'
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {watch('loanDate') && watch('loanDate') instanceof Date
                                            ? format(watch('loanDate'), 'PPP')
                                            : format(new Date(), 'PPP')}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={watch('loanDate') || new Date()}
                                        onSelect={(date) => setValue('loanDate', date || new Date())}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            {errors.loanDate && (
                                <p className="text-sm text-destructive">{errors.loanDate.message}</p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 justify-end pt-4">
                            <Button type="button" variant="outline" onClick={handleClose}>
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

