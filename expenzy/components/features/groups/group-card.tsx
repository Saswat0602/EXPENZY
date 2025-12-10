import React from 'react';
import { Users, Home, Briefcase, Plane, Folder } from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { GroupAvatar } from './group-avatar';
import { cn } from '@/lib/utils/cn';
import { formatCurrency } from '@/lib/utils/currency';

interface GroupCardProps {
    id: string;
    name: string;
    icon?: 'home' | 'trip' | 'couple' | 'friends' | 'work' | 'shopping' | 'other';
    groupType?: string;
    description?: string;
    memberCount: number;
    balance: number;
    currency?: string;
    iconSeed?: string;
    iconProvider?: string;
    imageUrl?: string;
    onClick?: () => void;
    className?: string;
}

const GROUP_TYPE_CONFIG = {
    home: { icon: Home, label: 'Home', color: 'text-blue-500' },
    office: { icon: Briefcase, label: 'Office', color: 'text-purple-500' },
    trip: { icon: Plane, label: 'Trip', color: 'text-green-500' },
    friends: { icon: Users, label: 'Friends', color: 'text-orange-500' },
    other: { icon: Folder, label: 'Other', color: 'text-gray-500' },
};

export const GroupCard: React.FC<GroupCardProps> = ({
    name,
    groupType = 'other',
    description,
    memberCount,
    balance,
    currency = 'INR',
    iconSeed,
    iconProvider,
    imageUrl,
    onClick,
    className,
}) => {
    const typeConfig = GROUP_TYPE_CONFIG[groupType as keyof typeof GROUP_TYPE_CONFIG] || GROUP_TYPE_CONFIG.other;
    const TypeIcon = typeConfig.icon;

    return (
        <GlassCard
            className={cn('cursor-pointer', className)}
            onClick={onClick}
            padding="md"
        >
            <div className="flex items-start gap-4">
                <GroupAvatar
                    name={name}
                    iconSeed={iconSeed}
                    iconProvider={iconProvider}
                    imageUrl={imageUrl}
                    size="lg"
                />

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg truncate">{name}</h3>
                        <div className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/50', typeConfig.color)}>
                            <TypeIcon className="h-3 w-3" />
                            <span className="text-xs font-medium">{typeConfig.label}</span>
                        </div>
                    </div>

                    {description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                            {description}
                        </p>
                    )}

                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                        <Users className="h-4 w-4" />
                        <span>
                            {memberCount} {memberCount === 1 ? 'member' : 'members'}
                        </span>
                    </div>

                    {/* Simple balance display */}
                    <div className="text-sm">
                        {Math.abs(balance) < 0.01 ? (
                            <span className="text-muted-foreground">Settled up</span>
                        ) : balance > 0 ? (
                            <span className="text-green-600 dark:text-green-400 font-medium">
                                You get back {formatCurrency(balance, currency as 'INR' | 'USD' | 'EUR')}
                            </span>
                        ) : (
                            <span className="text-red-400 dark:text-red-300 font-medium">
                                You owe {formatCurrency(Math.abs(balance), currency as 'INR' | 'USD' | 'EUR')}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </GlassCard>
    );
};
