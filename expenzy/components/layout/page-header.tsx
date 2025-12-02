import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface PageHeaderProps {
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4", className)}>
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
                {description && (
                    <p className="text-muted-foreground mt-1">{description}</p>
                )}
            </div>
            {action && (
                <div className="flex-shrink-0">
                    {action}
                </div>
            )}
        </div>
    );
}
