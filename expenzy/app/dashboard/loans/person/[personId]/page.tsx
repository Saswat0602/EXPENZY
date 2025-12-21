'use client';

import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useCallback, useState } from 'react';
import { useConsolidatedLoans } from '@/lib/hooks/use-loans';
import { usePersonLoans } from '@/lib/hooks/use-person-loans';
import { useProfile } from '@/lib/hooks/use-profile';
import { useLayout } from '@/contexts/layout-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { UserAvatar } from '@/components/ui/user-avatar';
import { LoanTransactionItem } from '@/components/features/loans/loan-transaction-item';
import { AddLoanModal } from '@/components/modals/add-loan-modal';
import { formatCurrency } from '@/lib/utils/format';
import { ArrowLeft, FileText, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PersonLoansPage() {
    const router = useRouter();
    const params = useParams();
    const personId = params.personId as string;
    const { data: consolidatedData } = useConsolidatedLoans();
    const { data: profile } = useProfile();
    const {
        data: loansData,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = usePersonLoans(personId);
    const { setLayoutVisibility } = useLayout();
    const observerTarget = useRef<HTMLDivElement>(null);

    // Modal state
    const [showLoanModal, setShowLoanModal] = useState(false);
    const [modalLoanType, setModalLoanType] = useState<'LENT' | 'BORROWED'>('LENT');

    // Hide mobile header on mount, restore on unmount (keep bottom nav)
    useEffect(() => {
        setLayoutVisibility({ showMobileHeader: false, showBottomNav: true });
        return () => {
            setLayoutVisibility({ showMobileHeader: true, showBottomNav: true });
        };
    }, [setLayoutVisibility]);

    // Infinite scroll observer
    const handleObserver = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [target] = entries;
            if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        },
        [fetchNextPage, hasNextPage, isFetchingNextPage]
    );

    useEffect(() => {
        const element = observerTarget.current;
        if (!element) return;

        const observer = new IntersectionObserver(handleObserver, {
            threshold: 0.1,
        });

        observer.observe(element);
        return () => observer.disconnect();
    }, [handleObserver]);

    if (isLoading) {
        return (
            <PageWrapper>
                <LoadingSkeleton count={5} />
            </PageWrapper>
        );
    }

    // Get person summary from consolidated data
    const personSummary = consolidatedData?.personSummaries?.find(p => p.personId === personId);

    // Flatten all pages of loans
    const allLoans = loansData?.pages?.flatMap((page: any) => page.data) || [];
    const currentUserId = profile?.id || '';

    if (!personSummary && allLoans.length === 0) {
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

    // Get person info from summary or first loan
    const person = personSummary
        ? { username: personSummary.personName, avatarUrl: personSummary.personAvatar, avatar: null }
        : (allLoans[0]?.lenderUserId === personId ? allLoans[0].lender : allLoans[0].borrower);

    const netAmount = personSummary?.totalAmount || 0;
    const isLent = personSummary?.loanType === 'lent';
    const directAmount = personSummary?.directLoanAmount || 0;
    const groupAmount = personSummary?.groupBalanceAmount || 0;

    return (
        <PageWrapper>
            <div className="pb-20">
                {/* Mobile Back Button */}
                <div className="md:hidden -mx-4 px-4 py-3 border-b bg-background sticky top-0 z-10">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="gap-2 -ml-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </div>

                {/* Person Header - Mobile Optimized */}
                <div className="px-4 md:px-0 py-4 space-y-4">
                    <div className="flex items-start gap-3">
                        <UserAvatar
                            seed={personSummary?.personAvatarSeed || undefined}
                            style={personSummary?.personAvatarStyle || undefined}
                            fallbackUrl={personSummary?.personAvatar}
                            fallbackName={person.username}
                            size={56}
                            className="flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-bold truncate">{person.username}</h1>
                            <div className="mt-2">
                                <p className="text-xs text-muted-foreground">
                                    {isLent ? 'They owe you' : 'You owe them'}
                                </p>
                                <p className="text-2xl font-bold mt-0.5">
                                    {formatCurrency(Math.abs(netAmount), 'INR')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Breakdown - Simplified for Mobile */}
                    {personSummary && (directAmount !== 0 || groupAmount !== 0) && (
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Breakdown</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-muted/30 rounded-lg p-3">
                                    <p className="text-xs text-muted-foreground mb-1">Direct</p>
                                    <p className="text-base font-semibold">
                                        {formatCurrency(Math.abs(directAmount), 'INR')}
                                    </p>
                                </div>
                                <div className="bg-muted/30 rounded-lg p-3">
                                    <p className="text-xs text-muted-foreground mb-1">Groups</p>
                                    <p className="text-base font-semibold">
                                        {formatCurrency(Math.abs(groupAmount), 'INR')}
                                    </p>
                                </div>
                            </div>

                            {/* Group Details */}
                            {personSummary.groupDetails && personSummary.groupDetails.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    {personSummary.groupDetails.map((group) => (
                                        <div key={group.groupId} className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">{group.groupName}</span>
                                            <span className="font-medium">
                                                {formatCurrency(Math.abs(group.amount), 'INR')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Transactions List */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-base font-semibold">Transactions</h2>
                    </div>

                    <div className="space-y-0">
                        {isLoading && !allLoans.length ? (
                            <div className="p-8 text-center text-muted-foreground">
                                Loading transactions...
                            </div>
                        ) : allLoans.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                No transactions found
                            </div>
                        ) : (
                            <>
                                {allLoans.reduce((acc: React.ReactElement[], loan, index) => {
                                    const isLender = loan.lenderUserId === currentUserId;
                                    const amount = parseFloat(loan.amount);
                                    const loanDate = new Date(loan.loanDate);
                                    const year = loanDate.getFullYear();

                                    // Check if we need to add a year header
                                    const prevLoan = index > 0 ? allLoans[index - 1] : null;
                                    const prevYear = prevLoan ? new Date(prevLoan.loanDate).getFullYear() : null;

                                    if (year !== prevYear) {
                                        // Add year header
                                        acc.push(
                                            <div key={`year-${year}`} className="py-3 bg-muted/20 border-y border-border/40">
                                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                    {year}
                                                </p>
                                            </div>
                                        );
                                    }

                                    // Add transaction
                                    acc.push(
                                        <LoanTransactionItem
                                            key={loan.id}
                                            date={loanDate}
                                            description={loan.description || ''}
                                            amount={amount}
                                            currency={loan.currency as 'INR' | 'USD' | 'EUR'}
                                            isLent={isLender}
                                        />
                                    );

                                    return acc;
                                }, [])}

                                {/* Infinite scroll trigger */}
                                <div ref={observerTarget} className="h-4" />

                                {/* Loading indicator */}
                                {isFetchingNextPage && (
                                    <div className="py-4 text-center">
                                        <LoadingSkeleton count={3} />
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Action Button */}
                    <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50">
                        <Button
                            size="lg"
                            onClick={() => {
                                setModalLoanType('LENT');
                                setShowLoanModal(true);
                            }}
                            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
                        >
                            <Plus className="h-6 w-6" />
                        </Button>
                    </div>

                    {/* Add Loan Modal */}
                    <AddLoanModal
                        open={showLoanModal}
                        onClose={() => setShowLoanModal(false)}
                        prefilledPerson={{
                            id: personId,
                            name: person.username,
                        }}
                        defaultLoanType={modalLoanType}
                        currentBalance={netAmount}
                    />
                </div>
            </div>
        </PageWrapper>
    );
}
