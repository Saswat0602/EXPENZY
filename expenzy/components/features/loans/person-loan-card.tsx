'use client';

import { Card } from '@/components/ui/card';
import { UserAvatar } from '@/components/ui/user-avatar';
import { formatCurrency } from '@/lib/utils/format';
import type { PersonLoanSummary } from '@/types/loan';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface PersonLoanCardProps {
    person: PersonLoanSummary;
    onClick?: () => void;
    className?: string;
}

export function PersonLoanCard({ person, onClick, className }: PersonLoanCardProps) {
    const isLent = person.loanType === 'lent';

    return (
        <Card
            className={cn(
                'p-3 md:p-4 cursor-pointer hover:shadow-md transition-all',
                isLent
                    ? 'border-l-4 border-l-green-500 hover:bg-green-50/50'
                    : 'border-l-4 border-l-red-500 hover:bg-red-50/50',
                className
            )}
            onClick={onClick}
        >
            <div className="flex items-center justify-between gap-3">
                {/* Left side - Avatar and Info */}
                <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                    <UserAvatar
                        seed={person.personAvatarSeed || undefined}
                        style={person.personAvatarStyle || undefined}
                        fallbackUrl={person.personAvatar}
                        fallbackName={person.personName}
                        size={48}
                        className="flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm md:text-base truncate">{person.personName}</p>
                        <p className="text-xs text-muted-foreground">
                            Direct: {formatCurrency(Math.abs(person.directLoanAmount), person.currency as 'INR' | 'USD' | 'EUR')} •
                            Groups: {formatCurrency(Math.abs(person.groupBalanceAmount), person.currency as 'INR' | 'USD' | 'EUR')}
                        </p>
                    </div>
                </div>

                {/* Right side - Amount and Arrow */}
                <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                    <div className="text-right">
                        <p className={cn(
                            'text-base md:text-lg font-bold',
                            isLent ? 'text-green-600' : 'text-red-600'
                        )}>
                            {formatCurrency(person.totalAmount, person.currency as 'INR' | 'USD' | 'EUR')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {isLent ? 'Lent' : 'Borrowed'}
                        </p>
                    </div>
                    <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground flex-shrink-0" />
                </div>
            </div>
        </Card>
    );
}
