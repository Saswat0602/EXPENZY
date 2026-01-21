'use client';

import { useState } from 'react';
import { useRecurringExpenses, useDeleteRecurringExpense, type RecurringExpense } from '@/lib/hooks/use-recurring-expenses';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConfirmationModal } from '@/components/modals/confirmation-modal';
import { Repeat, Trash2, Calendar, Clock, X } from 'lucide-react';
import { format } from 'date-fns';

export function RecurringExpensesList() {
    const { data: patterns, isLoading } = useRecurringExpenses();
    const deletePattern = useDeleteRecurringExpense();
    const [selectedPattern, setSelectedPattern] = useState<RecurringExpense | null>(null);
    const [patternToDelete, setPatternToDelete] = useState<RecurringExpense | null>(null);

    const getFrequencyLabel = (frequency: string, interval: number) => {
        const freq = frequency.toLowerCase();
        if (interval === 1) {
            return freq.charAt(0).toUpperCase() + freq.slice(1);
        }
        return `Every ${interval} ${freq === 'daily' ? 'days' : freq === 'weekly' ? 'weeks' : freq === 'monthly' ? 'months' : 'years'}`;
    };

    const handleDelete = () => {
        if (patternToDelete) {
            deletePattern.mutate(patternToDelete.id);
            setPatternToDelete(null);
        }
    };

    if (isLoading) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">Loading recurring patterns...</p>
            </div>
        );
    }

    if (!patterns || patterns.length === 0) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center py-8">
                        <Repeat className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">No recurring expense patterns yet</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {patterns.map((pattern: RecurringExpense) => (
                    <Card
                        key={pattern.id}
                        className="cursor-pointer hover:border-primary transition-colors"
                        onClick={() => setSelectedPattern(pattern)}
                    >
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Repeat className="h-5 w-5" />
                                        {getFrequencyLabel(pattern.frequency, pattern.interval)}
                                    </CardTitle>
                                    <CardDescription>
                                        {pattern.isActive ? (
                                            <Badge variant="default" className="bg-green-500">Active</Badge>
                                        ) : (
                                            <Badge variant="secondary">Inactive</Badge>
                                        )}
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPatternToDelete(pattern);
                                    }}
                                    disabled={deletePattern.isPending}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-muted-foreground">Started</p>
                                        <p className="font-medium">{format(new Date(pattern.startDate), 'PPP')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-muted-foreground">Next Occurrence</p>
                                        <p className="font-medium">{format(new Date(pattern.nextOccurrence), 'PPP')}</p>
                                    </div>
                                </div>
                            </div>
                            {pattern.endDate && (
                                <div className="mt-4 pt-4 border-t">
                                    <p className="text-sm text-muted-foreground">
                                        Ends on {format(new Date(pattern.endDate), 'PPP')}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Details Modal */}
            {selectedPattern && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
                    <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-semibold">Recurring Pattern Details</h2>
                                <p className="text-sm text-muted-foreground">
                                    {getFrequencyLabel(selectedPattern.frequency, selectedPattern.interval)}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedPattern(null)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium mb-1">Status</p>
                                {selectedPattern.isActive ? (
                                    <Badge variant="default" className="bg-green-500">Active</Badge>
                                ) : (
                                    <Badge variant="secondary">Inactive</Badge>
                                )}
                            </div>

                            <div>
                                <p className="text-sm font-medium mb-1">Frequency</p>
                                <p className="text-sm text-muted-foreground">
                                    {getFrequencyLabel(selectedPattern.frequency, selectedPattern.interval)}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-medium mb-1">Start Date</p>
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(selectedPattern.startDate), 'PPP')}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-medium mb-1">Next Occurrence</p>
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(selectedPattern.nextOccurrence), 'PPP')}
                                </p>
                            </div>

                            {selectedPattern.endDate && (
                                <div>
                                    <p className="text-sm font-medium mb-1">End Date</p>
                                    <p className="text-sm text-muted-foreground">
                                        {format(new Date(selectedPattern.endDate), 'PPP')}
                                    </p>
                                </div>
                            )}

                            {selectedPattern.dayOfWeek !== undefined && (
                                <div>
                                    <p className="text-sm font-medium mb-1">Day of Week</p>
                                    <p className="text-sm text-muted-foreground">
                                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][selectedPattern.dayOfWeek]}
                                    </p>
                                </div>
                            )}

                            {selectedPattern.dayOfMonth !== undefined && (
                                <div>
                                    <p className="text-sm font-medium mb-1">Day of Month</p>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedPattern.dayOfMonth}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <Button variant="outline" onClick={() => setSelectedPattern(null)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                open={!!patternToDelete}
                onClose={() => setPatternToDelete(null)}
                onConfirm={handleDelete}
                title="Delete Recurring Pattern"
                description={`Are you sure you want to delete this ${patternToDelete ? getFrequencyLabel(patternToDelete.frequency, patternToDelete.interval).toLowerCase() : ''} recurring pattern? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
            />
        </>
    );
}
