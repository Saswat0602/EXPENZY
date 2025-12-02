'use client';

import { useState } from 'react';
import { useSubscriptions, useDeleteSubscription } from '@/lib/hooks/use-subscriptions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { AddSubscriptionModal } from '@/components/modals/add-subscription-modal';
import { ConfirmationModal } from '@/components/modals/confirmation-modal';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { Plus, Calendar, Trash2, Edit, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { PageWrapper } from '@/components/layout/page-wrapper';

export default function SubscriptionsPage() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [subscriptionToDelete, setSubscriptionToDelete] = useState<string | null>(null);

    const { data: subscriptions = [], isLoading } = useSubscriptions();
    const deleteSubscription = useDeleteSubscription();

    const handleDeleteClick = (id: string) => {
        setSubscriptionToDelete(id);
        setDeleteModalOpen(true);
    };


    const getFrequencyLabel = (frequency: string) => {
        switch (frequency) {
            case 'daily':
                return 'Daily';
            case 'weekly':
                return 'Weekly';
            case 'monthly':
                return 'Monthly';
            case 'yearly':
                return 'Yearly';
            default:
                return frequency;
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <LoadingSkeleton count={3} />
            </div>
        );
    }

    // Calculate total monthly cost
    const totalMonthlyCost = subscriptions.reduce((sum, sub) => {
        if (!sub.isActive) return sum;
        const amount = Number(sub.amount);
        switch (sub.billingCycle) {
            case 'daily':
                return sum + amount * 30;
            case 'weekly':
                return sum + amount * 4;
            case 'monthly':
                return sum + amount;
            case 'yearly':
                return sum + amount / 12;
            default:
                return sum;
        }
    }, 0);

    return (
        <PageWrapper>
            <div className="space-y-6">
                {/* Header */}
                <PageHeader
                    title="Subscriptions"
                    description="Manage your recurring subscriptions"
                    action={
                        <Button onClick={() => setIsAddModalOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Subscription
                        </Button>
                    }
                />

                {/* Summary Card */}
                {subscriptions.length > 0 && (
                    <div className="bg-card border border-border rounded-lg p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Total Monthly Cost</p>
                                <p className="text-2xl font-bold">{formatCurrency(totalMonthlyCost)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Active Subscriptions</p>
                                <p className="text-2xl font-bold">
                                    {subscriptions.filter((s) => s.isActive).length}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Total Subscriptions</p>
                                <p className="text-2xl font-bold">{subscriptions.length}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Subscriptions List */}
                {subscriptions.length === 0 ? (
                    <EmptyState
                        icon={Calendar}
                        title="No subscriptions yet"
                        description="Add your first subscription to start tracking recurring payments"
                        action={{
                            label: 'Add Subscription',
                            onClick: () => setIsAddModalOpen(true),
                        }}
                    />
                ) : (
                    <div className="space-y-4">
                        {subscriptions.map((subscription) => (
                            <div
                                key={subscription.id}
                                className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold">{subscription.name}</h3>
                                            {subscription.isActive && (
                                                <Badge className="bg-success/10 text-success">
                                                    Active
                                                </Badge>
                                            )}
                                        </div>

                                        {subscription.description && (
                                            <p className="text-sm text-muted-foreground mb-4">
                                                {subscription.description}
                                            </p>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Amount</p>
                                                <p className="font-semibold">{formatCurrency(subscription.amount)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Billing Cycle</p>
                                                <p className="font-semibold">{getFrequencyLabel(subscription.billingCycle)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Next Billing Date</p>
                                                <p className="font-semibold">{formatDate(subscription.nextBillingDate)}</p>
                                            </div>
                                        </div>

                                        {subscription.startDate && (
                                            <div className="mt-4 text-sm text-muted-foreground">
                                                Started: {formatDate(subscription.startDate)}
                                            </div>
                                        )}

                                        {subscription.reminderDays && subscription.reminderDays > 0 && (
                                            <div className="mt-2 flex items-center gap-2 text-sm text-warning">
                                                <AlertCircle className="w-4 h-4" />
                                                <span>Reminder {subscription.reminderDays} days before renewal</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 ml-4">
                                        <Button variant="ghost" size="sm">
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteClick(subscription.id)}
                                        >
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modals */}
                <AddSubscriptionModal
                    open={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                />

                <ConfirmationModal
                    open={deleteModalOpen}
                    onClose={() => {
                        setDeleteModalOpen(false);
                        setSubscriptionToDelete(null);
                    }}
                    onConfirm={async () => {
                        if (subscriptionToDelete) {
                            await deleteSubscription.mutateAsync(subscriptionToDelete);
                        }
                    }}
                    title="Delete Subscription"
                    description="Are you sure you want to delete this subscription? This action cannot be undone."
                    confirmText="Delete"
                    isLoading={deleteSubscription.isPending}
                />
            </div>
        </PageWrapper>
    );
}
