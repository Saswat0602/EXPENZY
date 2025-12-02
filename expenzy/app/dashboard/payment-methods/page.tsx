'use client';

import { usePaymentMethods, useDeletePaymentMethod } from '@/lib/hooks/use-payment-methods';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { CreditCard, Plus, Trash2, Star } from 'lucide-react';
import { PageWrapper } from '@/components/layout/page-wrapper';

export default function PaymentMethodsPage() {
    const { data: methods = [], isLoading } = usePaymentMethods();
    const deleteMethod = useDeletePaymentMethod();

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this payment method?')) {
            await deleteMethod.mutateAsync(id);
        }
    };

    if (isLoading) {
        return <LoadingSkeleton count={3} />;
    }

    return (
        <PageWrapper>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Payment Methods</h1>
                        <p className="text-muted-foreground">Manage your payment methods</p>
                    </div>
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Method
                    </Button>
                </div>

                {/* Payment Methods List */}
                {methods.length === 0 ? (
                    <EmptyState
                        icon={CreditCard}
                        title="No payment methods"
                        description="Add payment methods to track how you pay for expenses"
                        action={{
                            label: 'Add Method',
                            onClick: () => { },
                        }}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {methods.map((method) => (
                            <Card key={method.id} className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <CreditCard className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold">{method.name}</h3>
                                                {method.isDefault && (
                                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                )}
                                            </div>
                                            <Badge variant="secondary" className="text-xs">
                                                {method.type.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(method.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>

                                <p className="text-sm text-muted-foreground">
                                    {method._count?.expenses || 0} transactions
                                </p>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </PageWrapper>
    );
}
