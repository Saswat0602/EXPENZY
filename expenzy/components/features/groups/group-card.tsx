import React from 'react';
import { Users } from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { GroupAvatar } from './group-avatar';
import { BalanceSummary } from './balance-summary';
import { cn } from '@/lib/utils/cn';

interface GroupCardProps {
    id: string;
    name: string;
    icon?: 'home' | 'trip' | 'couple' | 'friends' | 'work' | 'shopping' | 'other';
    memberCount: number;
    balance: number;
    currency?: string;
    onClick?: () => void;
    className?: string;
}

export const GroupCard: React.FC<GroupCardProps> = ({
    id,
    name,
    icon,
    memberCount,
    balance,
    currency = 'INR',
    onClick,
    className,
}) => {
    return (
        <GlassCard
            className={cn('cursor-pointer', className)}
            onClick={onClick}
            padding="md"
        >
            <div className="flex items-start gap-4">
                <GroupAvatar name={name} icon={icon} size="lg" />

                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 truncate">{name}</h3>

                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                        <Users className="h-4 w-4" />
                        <span>
                            {memberCount} {memberCount === 1 ? 'member' : 'members'}
                        </span>
                    </div>

                    <BalanceSummary balance={balance} currency={currency} />
                </div>
            </div>
        </GlassCard>
    );
};
