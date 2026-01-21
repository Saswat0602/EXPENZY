'use client';

import { useState } from 'react';
import { Download, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useExportGroupReport } from '@/lib/hooks/use-export';
import type { ExportGroupOptions } from '@/types/export';

interface GroupExportButtonProps {
    groupId: string;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
}

// Helper function to get date ranges
function getDateRange(range: string): { startDate: string; endDate: string } {
    const today = new Date();
    const endDate = today.toISOString().split('T')[0];
    let startDate = '';

    switch (range) {
        case 'last7days':
            startDate = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0];
            break;
        case 'lastMonth': {
            const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
            startDate = lastMonth.toISOString().split('T')[0];
            return { startDate, endDate: lastMonthEnd.toISOString().split('T')[0] };
        }
        case 'currentMonth': {
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            startDate = monthStart.toISOString().split('T')[0];
            break;
        }
        case 'currentQuarter': {
            const quarter = Math.floor(today.getMonth() / 3);
            const quarterStart = new Date(today.getFullYear(), quarter * 3, 1);
            startDate = quarterStart.toISOString().split('T')[0];
            break;
        }
        case 'currentYear': {
            const yearStart = new Date(today.getFullYear(), 0, 1);
            startDate = yearStart.toISOString().split('T')[0];
            break;
        }
    }

    return { startDate, endDate };
}

export function GroupExportButton({
    groupId,
    variant = 'outline',
    size = 'default',
    className,
}: GroupExportButtonProps) {
    const [open, setOpen] = useState(false);
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();

    const exportMutation = useExportGroupReport();

    const handleExport = async () => {
        const options: ExportGroupOptions = {
            groupId,
            includeStatistics: true,
        };

        // Add date filters if provided
        if (startDate) {
            options.startDate = startDate.toISOString().split('T')[0];
        }
        if (endDate) {
            options.endDate = endDate.toISOString().split('T')[0];
        }

        await exportMutation.mutateAsync(options);
        setOpen(false);

        // Reset form
        setStartDate(undefined);
        setEndDate(undefined);
    };

    const handleQuickExport = async (range?: string) => {
        const options: ExportGroupOptions = {
            groupId,
            includeStatistics: true,
        };

        if (range) {
            const dates = getDateRange(range);
            options.startDate = dates.startDate;
            options.endDate = dates.endDate;
        }

        await exportMutation.mutateAsync(options);
        setOpen(false);
        setStartDate(undefined);
        setEndDate(undefined);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant={variant}
                    size={size}
                    className={className}
                    disabled={exportMutation.isPending}
                >
                    <Download className="h-4 w-4 mr-2" />
                    {exportMutation.isPending ? 'Exporting...' : 'Export PDF'}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Export Group Report</DialogTitle>
                    <DialogDescription>
                        Export group expenses and balances as a PDF report.
                    </DialogDescription>
                </DialogHeader>

                {/* Quick Filters */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Quick Filters</Label>
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickExport('last7days')}
                            disabled={exportMutation.isPending}
                        >
                            Last 7 Days
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickExport('lastMonth')}
                            disabled={exportMutation.isPending}
                        >
                            Last Month
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickExport('currentMonth')}
                            disabled={exportMutation.isPending}
                        >
                            Current Month
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickExport('currentQuarter')}
                            disabled={exportMutation.isPending}
                        >
                            Current Quarter
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickExport('currentYear')}
                            disabled={exportMutation.isPending}
                            className="col-span-2"
                        >
                            Current Year
                        </Button>
                    </div>
                </div>

                {/* Custom Date Range */}
                <div className="space-y-3 pt-4 border-t">
                    <Label className="text-sm font-medium">Custom Date Range</Label>
                    <div className="grid gap-3">
                        {/* Start Date */}
                        <div className="space-y-2">
                            <Label className="text-sm">Start Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'w-full justify-start text-left font-normal',
                                            !startDate && 'text-muted-foreground'
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={startDate}
                                        onSelect={setStartDate}
                                        disabled={(date) => date > new Date()}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* End Date */}
                        <div className="space-y-2">
                            <Label className="text-sm">End Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'w-full justify-start text-left font-normal',
                                            !endDate && 'text-muted-foreground'
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={endDate}
                                        onSelect={setEndDate}
                                        disabled={(date) => date > new Date() || (startDate ? date < startDate : false)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                    <Button
                        variant="outline"
                        onClick={() => handleQuickExport()}
                        disabled={exportMutation.isPending}
                        className="flex-1"
                    >
                        Export All
                    </Button>
                    <Button
                        onClick={handleExport}
                        disabled={exportMutation.isPending || (!startDate && !endDate)}
                        className="flex-1"
                    >
                        {exportMutation.isPending ? 'Exporting...' : 'Export Custom'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
