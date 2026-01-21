import { cn } from '@/lib/utils/cn';

interface PageWrapperProps {
    children: React.ReactNode;
    maxWidth?: 'full' | '7xl' | '6xl' | '5xl' | '4xl';
    noPadding?: boolean;
    className?: string;
}

export function PageWrapper({
    children,
    maxWidth = '7xl',
    noPadding = false,
    className,
}: PageWrapperProps) {
    const maxWidthClasses = {
        full: 'max-w-full',
        '7xl': 'max-w-7xl',
        '6xl': 'max-w-6xl',
        '5xl': 'max-w-5xl',
        '4xl': 'max-w-4xl',
    };

    return (
        <div
            className={cn(
                'w-full mx-auto',
                maxWidthClasses[maxWidth],
                !noPadding && 'px-4 py-4 md:px-4 md:py-6',
                !noPadding && 'pb-6 md:pb-6', // Extra bottom padding on mobile for bottom nav
                className
            )}
        >
            {children}
        </div>
    );
}
