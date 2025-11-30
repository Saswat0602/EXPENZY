'use client';

import { useState } from 'react';
import { useLentLoans, useBorrowedLoans, useDeleteLoan } from '@/lib/hooks/use-loans';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { HandCoins, Plus, Trash2, DollarSign } from 'lucide-react';
import { AddLoanModal } from '@/components/modals/add-loan-modal';

interface LoanCardProps {
    id: string;
    borrower?: { name: string };
    lender?: { name: string };
    description?: string;
    amount: number;
    status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID';
    totalPaid: number;
    remainingAmount: number;
    dueDate?: string;
}

export default function LoansPage() {
    const [activeTab, setActiveTab] = useState('lent');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: lentLoans = [], isLoading: lentLoading } = useLentLoans();
    const { data: borrowedLoans = [], isLoading: borrowedLoading } = useBorrowedLoans();
    const deleteLoan = useDeleteLoan();

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this loan?')) {
            await deleteLoan.mutateAsync(id);
        }
    };

    const renderLoanCard = (loan: LoanCardProps) => {
        const progress = (loan.totalPaid / loan.amount) * 100;
        const statusColor: Record<string, string> = {
            PENDING: 'bg-yellow-500',
            PARTIALLY_PAID: 'bg-blue-500',
            PAID: 'bg-green-500',
        };

        return (
            <Card key={loan.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="font-semibold text-lg">
                            {activeTab === 'lent' ? loan.borrower?.name : loan.lender?.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {loan.description || 'No description'}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(loan.id)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">
                            {formatCurrency(loan.amount)}
                        </span>
                        <Badge className={statusColor[loan.status]}>
                            {loan.status.replace('_', ' ')}
                        </Badge>
                    </div>

                    {loan.status !== 'PAID' && (
                        <>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Paid</span>
                                    <span className="font-medium">
                                        {formatCurrency(loan.totalPaid)} / {formatCurrency(loan.amount)}
                                    </span>
                                </div>
                                <Progress value={progress} className="h-2" />
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Remaining</span>
                                <span className="font-semibold text-destructive">
                                    {formatCurrency(loan.remainingAmount)}
                                </span>
                            </div>
                        </>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t">
                        <span className="text-sm text-muted-foreground">
                            {loan.dueDate ? `Due ${formatDate(loan.dueDate)}` : 'No due date'}
                        </span>
                        {loan.status !== 'PAID' && (
                            <Button size="sm">
                                <DollarSign className="w-4 h-4 mr-1" />
                                Record Payment
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Loans</h1>
                    <p className="text-muted-foreground">Track money you&apos;ve lent and borrowed</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Loan
                </Button>
            </div>

            <AddLoanModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="lent">Money I Lent</TabsTrigger>
                    <TabsTrigger value="borrowed">Money I Borrowed</TabsTrigger>
                </TabsList>

                <TabsContent value="lent" className="space-y-4">
                    {lentLoading ? (
                        <LoadingSkeleton count={3} />
                    ) : lentLoans.length === 0 ? (
                        <EmptyState
                            icon={HandCoins}
                            title="No loans lent"
                            description="Track money you've lent to others"
                            action={{
                                label: 'Add Loan',
                                onClick: () => { },
                            }}
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {lentLoans.map(renderLoanCard)}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="borrowed" className="space-y-4">
                    {borrowedLoading ? (
                        <LoadingSkeleton count={3} />
                    ) : borrowedLoans.length === 0 ? (
                        <EmptyState
                            icon={HandCoins}
                            title="No loans borrowed"
                            description="Track money you've borrowed from others"
                            action={{
                                label: 'Add Loan',
                                onClick: () => { },
                            }}
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {borrowedLoans.map(renderLoanCard)}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
