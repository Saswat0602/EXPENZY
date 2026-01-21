'use client';

import { useAccounts, useDeleteAccount, useTotalBalance } from '@/lib/hooks/use-accounts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { formatCurrency } from '@/lib/utils/format';
import { Wallet, Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { PageWrapper } from '@/components/layout/page-wrapper';

export default function AccountsPage() {
    const { data: accounts = [], isLoading } = useAccounts();
    const { data: totalBalanceData } = useTotalBalance();
    const deleteAccount = useDeleteAccount();

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this account?')) {
            await deleteAccount.mutateAsync(id);
        }
    };

    if (isLoading) {
        return <LoadingSkeleton count={3} />;
    }

    return (
        <PageWrapper>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Accounts</h1>
                        <p className="text-muted-foreground">Manage your financial accounts</p>
                    </div>
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Account
                    </Button>
                </div>

                {totalBalanceData && (
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
                                <p className="text-3xl font-bold">
                                    {formatCurrency(totalBalanceData.totalBalance)}
                                </p>
                            </div>
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <Wallet className="w-8 h-8 text-primary" />
                            </div>
                        </div>
                    </Card>
                )}

                {accounts.length === 0 ? (
                    <EmptyState
                        icon={Wallet}
                        title="No accounts yet"
                        description="Add accounts to track your balances across different sources"
                        action={{
                            label: 'Add Account',
                            onClick: () => { },
                        }}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {accounts.map((account) => (
                            <Card key={account.id} className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-semibold text-lg">{account.name}</h3>
                                        <Badge variant="secondary" className="text-xs mt-1">
                                            {account.type.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(account.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Balance</span>
                                        <span className={`text-xl font-bold ${account.balance >= 0 ? 'text-success' : 'text-destructive'}`}>
                                            {formatCurrency(account.balance)}
                                        </span>
                                    </div>

                                    {account.balance >= 0 ? (
                                        <div className="flex items-center gap-1 text-success text-sm">
                                            <TrendingUp className="w-4 h-4" />
                                            <span>Positive balance</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-destructive text-sm">
                                            <TrendingDown className="w-4 h-4" />
                                            <span>Negative balance</span>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </PageWrapper>
    );
}
