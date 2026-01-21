'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useConsolidatedLoans } from '@/lib/hooks/use-loans';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/layout/page-header';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { VirtualList } from '@/components/shared/virtual-list';
import { PersonLoanCard } from '@/components/features/loans/person-loan-card';
import { LoanStatisticsCards } from '@/components/features/loans/loan-statistics';
import { GroupLoanCard } from '@/components/features/loans/group-loan-card';
import { AddLoanModal } from '@/components/modals/add-loan-modal';
import { Plus, Search, HandCoins } from 'lucide-react';
import type { PersonLoanSummary, GroupLoan } from '@/types/loan';

export default function LoansPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, isLoading } = useConsolidatedLoans();

    // Filter person summaries based on tab and search
    const filteredPersons = useMemo(() => {
        const personSummaries = data?.personSummaries || [];
        let persons = personSummaries;

        // Filter by tab
        if (activeTab === 'lent') {
            persons = persons.filter((person) => person.loanType === 'lent');
        } else if (activeTab === 'borrowed') {
            persons = persons.filter((person) => person.loanType === 'borrowed');
        }

        // Filter by search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            persons = persons.filter((person) =>
                person.personName.toLowerCase().includes(query)
            );
        }

        return persons;
    }, [data, activeTab, searchQuery]);

    const groupLoans = data?.groupLoans || [];
    const statistics = data?.statistics;

    const handlePersonClick = (personId: string) => {
        router.push(`/dashboard/loans/person/${personId}`);
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
            <div className="space-y-4 md:space-y-6">
                {/* Header */}
                <PageHeader
                    title="Loans"
                    description="Track money you've lent and borrowed"
                />

                {/* Statistics */}
                {statistics && <LoanStatisticsCards statistics={statistics} />}

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search loans by person..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="lent">Lent</TabsTrigger>
                        <TabsTrigger value="borrowed">Borrowed</TabsTrigger>
                        <TabsTrigger value="groups">Groups</TabsTrigger>
                    </TabsList>

                    {/* All Loans */}
                    <TabsContent value="all" className="space-y-4 mt-4">
                        {filteredPersons.length === 0 ? (
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
                                    data: filteredPersons.slice((page - 1) * 50, page * 50),
                                    hasMore: page * 50 < filteredPersons.length,
                                    total: filteredPersons.length,
                                })}
                                renderItem={(person: PersonLoanSummary) => (
                                    <PersonLoanCard
                                        person={person}
                                        onClick={() => handlePersonClick(person.personId)}
                                    />
                                )}
                                getItemKey={(person: PersonLoanSummary) => person.personId}
                                dependencies={[filteredPersons]}
                                itemsPerPage={50}
                            />
                        )}
                    </TabsContent>

                    {/* Lent Loans */}
                    <TabsContent value="lent" className="space-y-4 mt-4">
                        {filteredPersons.length === 0 ? (
                            <EmptyState
                                icon={HandCoins}
                                title="No loans lent"
                                description="Track money you've lent to others"
                            />
                        ) : (
                            <VirtualList
                                fetchData={async (page) => ({
                                    data: filteredPersons.slice((page - 1) * 50, page * 50),
                                    hasMore: page * 50 < filteredPersons.length,
                                    total: filteredPersons.length,
                                })}
                                renderItem={(person: PersonLoanSummary) => (
                                    <PersonLoanCard
                                        person={person}
                                        onClick={() => handlePersonClick(person.personId)}
                                    />
                                )}
                                getItemKey={(person: PersonLoanSummary) => person.personId}
                                dependencies={[filteredPersons]}
                                itemsPerPage={50}
                            />
                        )}
                    </TabsContent>

                    {/* Borrowed Loans */}
                    <TabsContent value="borrowed" className="space-y-4 mt-4">
                        {filteredPersons.length === 0 ? (
                            <EmptyState
                                icon={HandCoins}
                                title="No loans borrowed"
                                description="Track money you've borrowed from others"
                            />
                        ) : (
                            <VirtualList
                                fetchData={async (page) => ({
                                    data: filteredPersons.slice((page - 1) * 50, page * 50),
                                    hasMore: page * 50 < filteredPersons.length,
                                    total: filteredPersons.length,
                                })}
                                renderItem={(person: PersonLoanSummary) => (
                                    <PersonLoanCard
                                        person={person}
                                        onClick={() => handlePersonClick(person.personId)}
                                    />
                                )}
                                getItemKey={(person: PersonLoanSummary) => person.personId}
                                dependencies={[filteredPersons]}
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

                {/* Floating Action Button (Mobile) */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="md:hidden fixed bottom-20 right-4 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center"
                    aria-label="Add loan"
                >
                    <Plus className="h-6 w-6" />
                </button>
            </div>
        </PageWrapper>
    );
}
