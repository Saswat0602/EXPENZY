'use client';

import { useState } from 'react';
import { useBudgets, useBudgetPerformance } from '@/lib/hooks/use-budget';
import { formatCurrency, formatPercentage } from '@/lib/utils/format';
import { Plus, Wallet, AlertCircle, CheckCircle } from 'lucide-react';
import { AddBudgetModal } from '@/components/modals/add-budget-modal';
import { PageHeader } from '@/components/layout/page-header';
import { PageWrapper } from '@/components/layout/page-wrapper';

export default function BudgetPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: budgets = [], isLoading: budgetsLoading } = useBudgets();
    const { data: performance, isLoading: performanceLoading } = useBudgetPerformance();

    const isLoading = budgetsLoading || performanceLoading;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'on_track':
                return <CheckCircle className="w-5 h-5 text-success" />;
            case 'warning':
                return <AlertCircle className="w-5 h-5 text-warning" />;
            case 'exceeded':
                return <AlertCircle className="w-5 h-5 text-destructive" />;
            default:
                return <Wallet className="w-5 h-5 text-muted-foreground" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'on_track':
                return 'text-success';
            case 'warning':
                return 'text-warning';
            case 'exceeded':
                return 'text-destructive';
            default:
                return 'text-muted-foreground';
        }
    };

    return (
        <PageWrapper>
            <div className="space-y-6">
                <PageHeader
                    title="Budgets"
                    description="Manage your spending limits"
                    action={
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="hidden sm:inline">Create Budget</span>
                        </button>
                    }
                />

                <AddBudgetModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-card border border-border rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-5 h-5 text-success" />
                            <span className="text-sm text-muted-foreground">On Track</span>
                        </div>
                        <p className="text-2xl font-bold">
                            {performance?.budgets.filter(b => b.status === 'on_track').length || 0}
                        </p>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-5 h-5 text-warning" />
                            <span className="text-sm text-muted-foreground">Warning</span>
                        </div>
                        <p className="text-2xl font-bold">
                            {performance?.budgets.filter(b => b.status === 'warning').length || 0}
                        </p>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-5 h-5 text-destructive" />
                            <span className="text-sm text-muted-foreground">Exceeded</span>
                        </div>
                        <p className="text-2xl font-bold">
                            {performance?.budgets.filter(b => b.status === 'exceeded').length || 0}
                        </p>
                    </div>
                </div>

                {/* Budgets List */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        </div>
                    ) : budgets.length === 0 ? (
                        <div className="bg-card border border-border rounded-lg p-12 text-center">
                            <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No budgets yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Create your first budget to start tracking your spending
                            </p>
                            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                                Create Budget
                            </button>
                        </div>
                    ) : (
                        budgets.map((budget) => {
                            const utilization = (Number(budget.spentAmount) / Number(budget.amount)) * 100;
                            const remaining = Number(budget.amount) - Number(budget.spentAmount);

                            let status: 'on_track' | 'warning' | 'exceeded' = 'on_track';
                            if (utilization >= 100) status = 'exceeded';
                            else if (utilization >= 80) status = 'warning';

                            return (
                                <div key={budget.id} className="bg-card border border-border rounded-lg p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            {getStatusIcon(status)}
                                            <div>
                                                <h3 className="font-semibold">
                                                    {budget.category?.name || 'General Budget'}
                                                </h3>
                                                <p className="text-sm text-muted-foreground capitalize">
                                                    {budget.periodType}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground">
                                                {formatCurrency(budget.spentAmount)} / {formatCurrency(budget.amount)}
                                            </p>
                                            <p className={`text-sm font-medium ${getStatusColor(status)}`}>
                                                {formatPercentage(utilization)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="space-y-2">
                                        <div className="w-full bg-muted rounded-full h-3">
                                            <div
                                                className={`h-3 rounded-full transition-all ${status === 'exceeded'
                                                    ? 'bg-destructive'
                                                    : status === 'warning'
                                                        ? 'bg-warning'
                                                        : 'bg-success'
                                                    }`}
                                                style={{ width: `${Math.min(utilization, 100)}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Remaining: {formatCurrency(Math.max(remaining, 0))}
                                            </span>
                                            {budget.alertThreshold && (
                                                <span className="text-muted-foreground">
                                                    Alert at {budget.alertThreshold}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </PageWrapper>
    );
}
