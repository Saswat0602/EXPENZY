'use client';

import { Button } from '@/components/ui/button';
import { TrendingUp, Download, HandCoins } from 'lucide-react';

interface SettleUpBarProps {
    onSettleUp: () => void;
    onViewStatistics: () => void;
    onExport: () => void;
}

export function SettleUpBar({
    onSettleUp,
    onViewStatistics,
    onExport,
}: SettleUpBarProps) {
    return (
        <div className="flex gap-2 py-3 border-b border-border">
            <Button
                onClick={onSettleUp}
                size="sm"
                variant="default"
                className="h-9"
            >
                <HandCoins className="h-4 w-4 mr-1.5" />
                Settle up
            </Button>
            <Button
                onClick={onViewStatistics}
                variant="outline"
                size="sm"
                className="h-9"
            >
                <TrendingUp className="h-4 w-4 mr-1.5" />
                Statistics
            </Button>
            <Button
                onClick={onExport}
                variant="outline"
                size="sm"
                className="h-9"
            >
                <Download className="h-4 w-4 mr-1.5" />
                Export
            </Button>
        </div>
    );
}
