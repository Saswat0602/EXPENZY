'use client';

import { useSavingsGoals, useDeleteSavingsGoal } from '@/lib/hooks/use-savings';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { formatCurrency, formatDate, formatPercentage } from '@/lib/utils/format';
import { Plus, Target, Trash2, Edit, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function SavingsGoalsPage() {
    const { data: goals = [], isLoading } = useSavingsGoals();
    const deleteGoal = useDeleteSavingsGoal();

    const handleDelete = async (id: string) => {
        try {
            await deleteGoal.mutateAsync(id);
            toast.success('Savings goal deleted');
        } catch {
            toast.error('Failed to delete savings goal');
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <LoadingSkeleton count={3} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Savings Goals</h1>
                    <p className="text-muted-foreground">Track your progress towards financial goals</p>
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Goal
                </Button>
            </div>

            {/* Goals Grid */}
            {goals.length === 0 ? (
                <EmptyState
                    icon={Target}
                    title="No savings goals yet"
                    description="Create your first savings goal to start tracking your progress"
                    action={{
                        label: 'Create Goal',
                        onClick: () => { },
                    }}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map((goal) => {
                        const progress = (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100;
                        const remaining = Number(goal.targetAmount) - Number(goal.currentAmount);

                        return (
                            <div
                                key={goal.id}
                                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
                            >
                                {/* Goal Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-12 h-12 rounded-full flex items-center justify-center"
                                            style={{ backgroundColor: goal.color || '#10b981' + '20' }}
                                        >
                                            <Target
                                                className="w-6 h-6"
                                                style={{ color: goal.color || '#10b981' }}
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{goal.name}</h3>
                                            {goal.category && (
                                                <p className="text-sm text-muted-foreground">{goal.category}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm">
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(goal.id)}
                                            disabled={deleteGoal.isPending}
                                        >
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Description */}
                                {goal.description && (
                                    <p className="text-sm text-muted-foreground mb-4">{goal.description}</p>
                                )}

                                {/* Progress */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Progress</span>
                                        <span className="font-semibold">{formatPercentage(Math.min(progress, 100))}</span>
                                    </div>
                                    <Progress value={Math.min(progress, 100)} className="h-2" />
                                </div>

                                {/* Amounts */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Current</span>
                                        <span className="font-semibold">{formatCurrency(goal.currentAmount)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Target</span>
                                        <span className="font-semibold">{formatCurrency(goal.targetAmount)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Remaining</span>
                                        <span className="font-semibold text-primary">{formatCurrency(remaining)}</span>
                                    </div>
                                </div>

                                {/* Deadline */}
                                {goal.deadline && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <TrendingUp className="w-4 h-4" />
                                        <span>Deadline: {formatDate(goal.deadline)}</span>
                                    </div>
                                )}

                                {/* Status Badge */}
                                {goal.isCompleted && (
                                    <div className="mt-4 px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium text-center">
                                        ✓ Completed
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
