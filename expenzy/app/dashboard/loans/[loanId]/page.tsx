'use client';

import { useRouter } from 'next/navigation';
import { useLoan, useLoanAdjustments, useDeleteLoan } from '@/lib/hooks/use-loans';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import {
    ArrowLeft,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Ban,
    Trash2,
    Calendar,
} from 'lucide-react';
import type { LoanAdjustment } from '@/types/loan';

interface PageProps {
    params: {
        loanId: string;
    };
}

export default function LoanDetailPage({ params }: PageProps) {
    const router = useRouter();
    const { loanId } = params;

    const { data: loan, isLoading } = useLoan(loanId);
    const { data: adjustments = [] } = useLoanAdjustments(loanId);
    const deleteLoan = useDeleteLoan();

    const currentUserId =
        typeof window !== 'undefined' ? localStorage.getItem('userId') || '' : '';

    if (isLoading) {
        return (
            <PageWrapper>
                <LoadingSkeleton count={5} />
            </PageWrapper>
        );
    }

    if (!loan) {
        return (
            <PageWrapper>
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Loan not found</p>
                </div>
            </PageWrapper>
        );
    }

    const isLender = loan.lenderUserId === currentUserId;
    const otherUser = isLender ? loan.borrower : loan.lender;
    const amount = parseFloat(loan.amount);
    const amountPaid = parseFloat(loan.amountPaid);
    const amountRemaining = parseFloat(loan.amountRemaining);
    const progress = amount > 0 ? (amountPaid / amount) * 100 : 0;

    const statusConfig = {
        active: { color: 'bg-yellow-500', label: 'Active' },
        paid: { color: 'bg-green-500', label: 'Paid' },
        waived: { color: 'bg-blue-500', label: 'Waived' },
        cancelled: { color: 'bg-gray-500', label: 'Cancelled' },
    };

    const status = statusConfig[loan.status] || statusConfig.active;

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this loan?')) {
            await deleteLoan.mutateAsync(loanId);
            router.push('/dashboard/loans');
        }
    };

    const adjustmentIcons = {
        payment: DollarSign,
        increase: TrendingUp,
        decrease: TrendingDown,
        waive: Ban,
    };

    return (
        <PageWrapper>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleDelete}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                </div>

                {/* Loan Summary Card */}
                <Card className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage
                                    src={otherUser.avatarUrl || otherUser.avatar || undefined}
                                    alt={otherUser.username}
                                />
                                <AvatarFallback>
                                    {otherUser.username.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-2xl font-bold">{otherUser.username}</h1>
                                <p className="text-sm text-muted-foreground">
                                    {isLender ? 'Owes you' : 'You owe'}
                                </p>
                            </div>
                        </div>
                        <Badge className={status.color}>{status.label}</Badge>
                    </div>

                    {loan.description && (
                        <p className="text-muted-foreground mb-4">{loan.description}</p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                            <p className="text-xl font-bold">
                                {formatCurrency(amount, loan.currency as 'INR' | 'USD' | 'EUR')}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Paid</p>
                            <p className="text-xl font-bold text-green-600">
                                {formatCurrency(amountPaid, loan.currency as 'INR' | 'USD' | 'EUR')}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Remaining</p>
                            <p className="text-xl font-bold text-red-600">
                                {formatCurrency(amountRemaining, loan.currency as 'INR' | 'USD' | 'EUR')}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Progress</p>
                            <p className="text-xl font-bold">{Math.round(progress)}%</p>
                        </div>
                    </div>

                    {loan.status === 'active' && (
                        <Progress value={progress} className="h-2 mb-4" />
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Loan Date: {formatDate(loan.loanDate)}</span>
                        </div>
                        {loan.dueDate && (
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>Due: {formatDate(loan.dueDate)}</span>
                            </div>
                        )}
                        {loan.lastPaymentDate && (
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                <span>Last Payment: {formatDate(loan.lastPaymentDate)}</span>
                            </div>
                        )}
                    </div>

                    {loan.group && (
                        <div className="mt-4 pt-4 border-t">
                            <p className="text-sm text-muted-foreground">
                                From group: {loan.group.icon} {loan.group.name}
                            </p>
                        </div>
                    )}
                </Card>

                {/* Actions - TODO: Implement adjustment modal */}
                {/* {loan.status === 'active' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={() => setIsAdjustmentModalOpen(true)}
              className="w-full"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Add Payment
            </Button>
            <Button variant="outline" className="w-full">
              <TrendingUp className="h-4 w-4 mr-2" />
              Increase
            </Button>
            <Button variant="outline" className="w-full">
              <TrendingDown className="h-4 w-4 mr-2" />
              Decrease
            </Button>
            <Button variant="outline" className="w-full">
              <Ban className="h-4 w-4 mr-2" />
              Waive
            </Button>
          </div>
        )} */}

                {/* Transaction History */}
                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
                    {adjustments.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No transactions yet
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {adjustments.map((adjustment: LoanAdjustment) => {
                                const Icon = adjustmentIcons[adjustment.adjustmentType];
                                return (
                                    <div
                                        key={adjustment.id}
                                        className="flex items-start gap-4 p-4 rounded-lg border"
                                    >
                                        <div className="p-2 rounded-full bg-muted">
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="font-semibold capitalize">
                                                    {adjustment.adjustmentType}
                                                </p>
                                                <p className="font-bold">
                                                    {formatCurrency(
                                                        parseFloat(adjustment.amount),
                                                        adjustment.currency as 'INR' | 'USD' | 'EUR'
                                                    )}
                                                </p>
                                            </div>
                                            {adjustment.notes && (
                                                <p className="text-sm text-muted-foreground mb-1">
                                                    {adjustment.notes}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span>By {adjustment.creator.username}</span>
                                                <span>{formatDate(adjustment.createdAt)}</span>
                                                {adjustment.paymentMethod && (
                                                    <span>via {adjustment.paymentMethod}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>
            </div>
        </PageWrapper>
    );
}
