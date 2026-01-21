'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAddLoanAdjustment } from '@/lib/hooks/use-loans';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { LoanAdjustmentRequest } from '@/types/loan';

interface LoanAdjustmentModalProps {
    open: boolean;
    onClose: () => void;
    loanId: string;
    maxAmount?: number;
}

export function LoanAdjustmentModal({
    open,
    onClose,
    loanId,
    maxAmount,
}: LoanAdjustmentModalProps) {
    const [adjustmentType, setAdjustmentType] = useState<
        'payment' | 'increase' | 'decrease' | 'waive'
    >('payment');

    const { register, handleSubmit, reset, formState: { errors } } = useForm<LoanAdjustmentRequest>();
    const addAdjustment = useAddLoanAdjustment();

    const onSubmit = async (data: LoanAdjustmentRequest) => {
        try {
            await addAdjustment.mutateAsync({
                loanId,
                data: {
                    ...data,
                    adjustmentType,
                    paymentDate: adjustmentType === 'payment' ? new Date().toISOString() : undefined,
                },
            });
            reset();
            onClose();
        } catch (error) {
            console.error('Failed to add adjustment:', error);
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const tabConfig = {
        payment: {
            title: 'Record Payment',
            description: 'Record a payment made towards this loan',
        },
        increase: {
            title: 'Increase Loan',
            description: 'Add additional amount to the loan',
        },
        decrease: {
            title: 'Decrease Loan',
            description: 'Reduce the loan amount (partial forgiveness)',
        },
        waive: {
            title: 'Waive Loan',
            description: 'Completely forgive the remaining debt',
        },
    };

    const currentTab = tabConfig[adjustmentType];

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{currentTab.title}</DialogTitle>
                    <DialogDescription>{currentTab.description}</DialogDescription>
                </DialogHeader>

                <Tabs value={adjustmentType} onValueChange={(v) => setAdjustmentType(v as typeof adjustmentType)}>
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="payment">Payment</TabsTrigger>
                        <TabsTrigger value="increase">Increase</TabsTrigger>
                        <TabsTrigger value="decrease">Decrease</TabsTrigger>
                        <TabsTrigger value="waive">Waive</TabsTrigger>
                    </TabsList>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                        <TabsContent value="payment" className="space-y-4">
                            <div>
                                <Label htmlFor="amount">Payment Amount *</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    {...register('amount', {
                                        required: 'Amount is required',
                                        min: { value: 0.01, message: 'Amount must be positive' },
                                        max: maxAmount ? { value: maxAmount, message: `Cannot exceed ${maxAmount}` } : undefined,
                                    })}
                                />
                                {errors.amount && (
                                    <p className="text-sm text-destructive mt-1">{errors.amount.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="paymentMethod">Payment Method</Label>
                                <Select {...register('paymentMethod')}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="upi">UPI</SelectItem>
                                        <SelectItem value="card">Card</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Add any notes about this payment..."
                                    {...register('notes')}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="increase" className="space-y-4">
                            <div>
                                <Label htmlFor="amount">Increase Amount *</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    {...register('amount', {
                                        required: 'Amount is required',
                                        min: { value: 0.01, message: 'Amount must be positive' },
                                    })}
                                />
                                {errors.amount && (
                                    <p className="text-sm text-destructive mt-1">{errors.amount.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="reason">Reason *</Label>
                                <Input
                                    id="reason"
                                    placeholder="e.g., Additional funds needed"
                                    {...register('reason', { required: 'Reason is required' })}
                                />
                                {errors.reason && (
                                    <p className="text-sm text-destructive mt-1">{errors.reason.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Add any additional details..."
                                    {...register('notes')}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="decrease" className="space-y-4">
                            <div>
                                <Label htmlFor="amount">Decrease Amount *</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    {...register('amount', {
                                        required: 'Amount is required',
                                        min: { value: 0.01, message: 'Amount must be positive' },
                                    })}
                                />
                                {errors.amount && (
                                    <p className="text-sm text-destructive mt-1">{errors.amount.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="reason">Reason *</Label>
                                <Input
                                    id="reason"
                                    placeholder="e.g., Partial debt forgiveness"
                                    {...register('reason', { required: 'Reason is required' })}
                                />
                                {errors.reason && (
                                    <p className="text-sm text-destructive mt-1">{errors.reason.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Add any additional details..."
                                    {...register('notes')}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="waive" className="space-y-4">
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                    This will completely forgive the remaining debt and mark the loan as waived.
                                    This action cannot be undone.
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="reason">Reason *</Label>
                                <Input
                                    id="reason"
                                    placeholder="e.g., Gift to friend"
                                    {...register('reason', { required: 'Reason is required' })}
                                />
                                {errors.reason && (
                                    <p className="text-sm text-destructive mt-1">{errors.reason.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Add any additional details..."
                                    {...register('notes')}
                                />
                            </div>
                        </TabsContent>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={addAdjustment.isPending}>
                                {addAdjustment.isPending ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </form>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
