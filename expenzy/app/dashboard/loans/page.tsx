'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useConsolidatedLoans } from '@/lib/hooks/use-loans';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/layout/page-header';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { VirtualList } from '@/components/shared/virtual-list';
import { LoanCard } from '@/components/features/loans/loan-card';
import { LoanStatisticsCards } from '@/components/features/loans/loan-statistics';
import { GroupLoanCard } from '@/components/features/loans/group-loan-card';
import { AddLoanModal } from '@/components/modals/add-loan-modal';
import { Plus, Search, HandCoins } from 'lucide-react';
import type { Loan, GroupLoan } from '@/types/loan';

export default function LoansPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, isLoading } = useConsolidatedLoans();

    // Filter loans based on tab and search
    const filteredLoans = useMemo(() => {
        const directLoans = data?.directLoans || [];
        const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') || '' : '';
        let loans = directLoans;

        // Filter by tab
        if (activeTab === 'lent') {
            loans = loans.filter((loan) => loan.lenderUserId === currentUserId);
        } else if (activeTab === 'borrowed') {
            loans = loans.filter((loan) => loan.borrowerUserId === currentUserId);
        }

        // Filter by search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            loans = loans.filter(
                (loan) =>
                    loan.description?.toLowerCase().includes(query) ||
                    loan.lender.username.toLowerCase().includes(query) ||
                    loan.borrower.username.toLowerCase().includes(query)
            );
        }

        return loans;
    }, [data, activeTab, searchQuery]);

    const groupLoans = data?.groupLoans || [];
    const statistics = data?.statistics;

    const handleLoanClick = (loanId: string) => {
        router.push(`/dashboard/loans/${loanId}`);
    };

    if (isLoading) {
        return (
            <PageWrapper>
                <PageHeader title="Loans" description="Track money you've lent and borrowed" />
                <LoadingSkeleton count={5} />
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <div className="space-y-6">
                {/* Header */}
                <PageHeader
                    title="Loans"
                    description="Track money you've lent and borrowed"
                    action={
                        <Button onClick={() => setIsModalOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Loan
                        </Button>
                    }
                />

                {/* Statistics */}
                {statistics && <LoanStatisticsCards statistics={statistics} />}

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search loans by description or person..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="lent">Owe Me</TabsTrigger>
                        <TabsTrigger value="borrowed">I Owe</TabsTrigger>
                        <TabsTrigger value="groups">Groups</TabsTrigger>
                    </TabsList>

                    {/* All Loans */}
                    <TabsContent value="all" className="space-y-4 mt-4">
                        {filteredLoans.length === 0 ? (
                            <EmptyState
                                icon={HandCoins}
                                title="No loans found"
                                description="Create your first loan to get started"
                                action={{
                                    label: 'Add Loan',
                                    onClick: () => setIsModalOpen(true),
                                }}
                            />
                        ) : (
                            <VirtualList
                                fetchData={async (page) => ({
                                    data: filteredLoans.slice((page - 1) * 50, page * 50),
                                    hasMore: page * 50 < filteredLoans.length,
                                    total: filteredLoans.length,
                                })}
                                renderItem={(loan: Loan) => (
                                    <LoanCard
                                        loan={loan}
                                        
                                        onClick={() => handleLoanClick(loan.id)}
                                    />
                                )}
                                getItemKey={(loan: Loan) => loan.id}
                                dependencies={[filteredLoans]}
                                itemsPerPage={50}
                            />
                        )}
                    </TabsContent>

                    {/* Lent Loans */}
                    <TabsContent value="lent" className="space-y-4 mt-4">
                        {filteredLoans.length === 0 ? (
                            <EmptyState
                                icon={HandCoins}
                                title="No loans lent"
                                description="Track money you've lent to others"
                            />
                        ) : (
                            <VirtualList
                                fetchData={async (page) => ({
                                    data: filteredLoans.slice((page - 1) * 50, page * 50),
                                    hasMore: page * 50 < filteredLoans.length,
                                    total: filteredLoans.length,
                                })}
                                renderItem={(loan: Loan) => (
                                    <LoanCard
                                        loan={loan}
                                        
                                        onClick={() => handleLoanClick(loan.id)}
                                    />
                                )}
                                getItemKey={(loan: Loan) => loan.id}
                                dependencies={[filteredLoans]}
                                itemsPerPage={50}
                            />
                        )}
                    </TabsContent>

                    {/* Borrowed Loans */}
                    <TabsContent value="borrowed" className="space-y-4 mt-4">
                        {filteredLoans.length === 0 ? (
                            <EmptyState
                                icon={HandCoins}
                                title="No loans borrowed"
                                description="Track money you've borrowed from others"
                            />
                        ) : (
                            <VirtualList
                                fetchData={async (page) => ({
                                    data: filteredLoans.slice((page - 1) * 50, page * 50),
                                    hasMore: page * 50 < filteredLoans.length,
                                    total: filteredLoans.length,
                                })}
                                renderItem={(loan: Loan) => (
                                    <LoanCard
                                        loan={loan}
                                        
                                        onClick={() => handleLoanClick(loan.id)}
                                    />
                                )}
                                getItemKey={(loan: Loan) => loan.id}
                                dependencies={[filteredLoans]}
                                itemsPerPage={50}
                            />
                        )}
                    </TabsContent>

                    {/* Group Loans */}
                    <TabsContent value="groups" className="space-y-4 mt-4">
                        {groupLoans.length === 0 ? (
                            <EmptyState
                                icon={HandCoins}
                                title="No group debts"
                                description="Group expenses will show here as potential loans"
                            />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {groupLoans.map((groupLoan: GroupLoan) => (
                                    <GroupLoanCard
                                        key={`${groupLoan.groupId}-${groupLoan.otherUserId}`}
                                        groupLoan={groupLoan}
                                        onConvert={() => {
                                            // TODO: Open convert modal
                                            console.log('Convert group loan:', groupLoan);
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Add Loan Modal */}
                <AddLoanModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
            </div>
        </PageWrapper>
    );
}
