import React from 'react';
import { cn } from '@/lib/utils/cn';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    blur?: 'sm' | 'md' | 'lg';
    onClick?: () => void;
}

export const GlassCard = ({
    children,
    className = '',
    hover = true,
    padding = 'md',
    blur = 'md',
    onClick,
}: GlassCardProps) => {
    const paddingClasses = {
        none: '',
        sm: 'p-3 lg:p-4',
        md: 'p-4 lg:p-6',
        lg: 'p-5 lg:p-8',
    };

    const blurClasses = {
        sm: 'backdrop-blur-sm',
        md: 'backdrop-blur-md',
        lg: 'backdrop-blur-lg',
    };

    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-xl lg:rounded-2xl',
                'bg-card/40 border border-border/50',
                blurClasses[blur],
                'transition-all duration-300',
                hover && 'hover:bg-card/60 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5',
                onClick && 'cursor-pointer',
                paddingClasses[padding],
                className
            )}
            onClick={onClick}
        >
            {children}
        </div>
    );
};
