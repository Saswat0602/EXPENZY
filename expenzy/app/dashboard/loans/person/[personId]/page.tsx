'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useConsolidatedLoans } from '@/lib/hooks/use-loans';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/format';
import { ArrowLeft, Calendar, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Loan } from '@/types/loan';

export default function PersonLoansPage() {
    const router = useRouter();
    const params = useParams();
    const personId = params.personId as string;
    const { data, isLoading } = useConsolidatedLoans();

    if (isLoading) {
        return (
            <PageWrapper>
                <LoadingSkeleton count={5} />
            </PageWrapper>
        );
    }

    // Get all loans for this person
    const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') || '' : '';
    const personLoans = data?.directLoans?.filter(
        (loan) =>
            (loan.lenderUserId === personId && loan.borrowerUserId === currentUserId) ||
            (loan.borrowerUserId === personId && loan.lenderUserId === currentUserId)
    ) || [];

    if (personLoans.length === 0) {
        return (
            <PageWrapper>
                <EmptyState
                    icon={FileText}
                    title="No loans found"
                    description="No loans found with this person"
                    action={{
                        label: 'Go Back',
                        onClick: () => router.back(),
                    }}
                />
            </PageWrapper>
        );
    }

    // Get person info from first loan
    const firstLoan = personLoans[0];
    const person = firstLoan.lenderUserId === personId ? firstLoan.lender : firstLoan.borrower;

    // Calculate summary
    let totalLent = 0;
    let totalBorrowed = 0;
    let activeCount = 0;
    let paidCount = 0;

    personLoans.forEach((loan) => {
        if (loan.status === 'active') activeCount++;
        if (loan.status === 'paid') paidCount++;

        const isLender = loan.lenderUserId === currentUserId;
        const remaining = parseFloat(loan.amountRemaining);

        if (isLender) {
            totalLent += remaining;
        } else {
            totalBorrowed += remaining;
        }
    });

    const netAmount = totalLent - totalBorrowed;
    const isLent = netAmount >= 0;

    return (
        <PageWrapper>
            <div className="space-y-6">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Loans
                </Button>

                {/* Person Header */}
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage
                                    src={person.avatarUrl || person.avatar || undefined}
                                    alt={person.username}
                                />
                                <AvatarFallback className="text-lg">
                                    {person.username.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-2xl font-bold">{person.username}</h2>
                                <p className="text-sm text-muted-foreground">
                                    {activeCount} active • {paidCount} paid
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={cn(
                                'text-3xl font-bold',
                                isLent ? 'text-green-600' : 'text-red-600'
                            )}>
                                {formatCurrency(Math.abs(netAmount))}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {isLent ? 'They owe you' : 'You owe them'}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Individual Loans */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">All Loans</h3>
                    {personLoans.map((loan) => {
                        const isLender = loan.lenderUserId === currentUserId;
                        const amount = parseFloat(loan.amount);
                        const remaining = parseFloat(loan.amountRemaining);
                        const loanDate = new Date(loan.loanDate).toLocaleDateString();

                        return (
                            <Card
                                key={loan.id}
                                className={cn(
                                    'p-4 border-l-4',
                                    isLender ? 'border-l-green-500' : 'border-l-red-500'
                                )}
                            >
                                <div className="space-y-3">
                                    {/* Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            {loan.description && (
                                                <p className="font-semibold text-base mb-1">
                                                    {loan.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Calendar className="w-3 h-3" />
                                                <span>{loanDate}</span>
                                            </div>
                                        </div>
                                        <Badge
                                            className={cn(
                                                loan.status === 'active' && 'bg-yellow-500',
                                                loan.status === 'paid' && 'bg-green-500'
                                            )}
                                        >
                                            {loan.status === 'active' ? 'Active' : 'Paid'}
                                        </Badge>
                                    </div>

                                    {/* Amount */}
                                    <div className="flex items-baseline justify-between">
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                {isLender ? 'You lent' : 'You borrowed'}
                                            </p>
                                            <p className={cn(
                                                'text-xl font-bold',
                                                isLender ? 'text-green-600' : 'text-red-600'
                                            )}>
                                                {formatCurrency(amount, loan.currency as 'INR' | 'USD' | 'EUR')}
                                            </p>
                                        </div>
                                        {loan.status === 'active' && remaining > 0 && (
                                            <div className="text-right">
                                                <p className="text-xs text-muted-foreground">Remaining</p>
                                                <p className="text-lg font-semibold">
                                                    {formatCurrency(remaining, loan.currency as 'INR' | 'USD' | 'EUR')}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Group Badge */}
                                    {loan.group && (
                                        <div className="pt-2 border-t">
                                            <Badge variant="outline" className="text-xs">
                                                {loan.group.icon} {loan.group.name}
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </PageWrapper>
    );
}
