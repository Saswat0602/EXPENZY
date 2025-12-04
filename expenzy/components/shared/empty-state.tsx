'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ReactNode } from 'react';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description: string;
    action?: ReactNode | {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    const isActionObject = action && typeof action === 'object' && 'label' in action;

    return (
        <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
            {Icon && <Icon className="h-12 w-12 text-muted-foreground mb-4" />}
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">{description}</p>
            {action && (
                isActionObject ? (
                    <button
                        onClick={action.onClick}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        {action.label}
                    </button>
                ) : action
            )}
        </div>
    );
}
