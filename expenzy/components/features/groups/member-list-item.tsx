import React from 'react';
import { MoreVertical, Crown } from 'lucide-react';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils/cn';
import { formatBalance, getBalanceColor, getBalanceText } from '@/lib/utils/balance-utils';

interface MemberListItemProps {
    userId: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'MEMBER';
    balance?: number;
    currency?: string;
    isCurrentUser?: boolean;
    isAdmin?: boolean;
    avatarSeed?: string;
    avatarStyle?: string;
    avatar?: string;
    onRemove?: () => void;
    onChangeRole?: (newRole: 'ADMIN' | 'MEMBER') => void;
    className?: string;
}

export const MemberListItem: React.FC<MemberListItemProps> = ({
    name,
    email,
    role,
    balance = 0,
    currency = 'INR',
    isCurrentUser = false,
    isAdmin = false,
    avatarSeed,
    avatarStyle,
    avatar,
    onRemove,
    onChangeRole,
    className,
}) => {
    const balanceText = getBalanceText(balance);
    const balanceColor = getBalanceColor(balance);
    const formattedBalance = formatBalance(balance, currency);

    return (
        <div
            className={cn(
                'flex items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-lg',
                className
            )}
        >
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <UserAvatar
                    seed={avatarSeed}
                    style={avatarStyle as 'adventurer' | 'adventurer-neutral' | 'thumbs' | 'fun-emoji' | undefined}
                    fallbackUrl={avatar}
                    size={40}
                    className="shrink-0"
                />

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">
                            {name}
                            {isCurrentUser && (
                                <span className="text-muted-foreground ml-1">(you)</span>
                            )}
                        </p>
                        {role?.toUpperCase() === 'ADMIN' && (
                            <Crown className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{email}</p>
                </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
                {balance !== 0 ? (
                    <div className="text-right">
                        <p className={cn('text-sm font-semibold', balanceColor)}>
                            {formattedBalance}
                        </p>
                        <p className="text-xs text-muted-foreground">{balanceText}</p>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">settled up</p>
                )}

                {/* Show menu for: 1) Admin viewing other members, OR 2) Current user (to leave) */}
                {((isAdmin && !isCurrentUser && (onRemove || onChangeRole)) || (isCurrentUser && onRemove)) && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {isCurrentUser ? (
                                <DropdownMenuItem
                                    onClick={onRemove}
                                    className="text-destructive"
                                >
                                    Leave group
                                </DropdownMenuItem>
                            ) : (
                                <>
                                    {onChangeRole && (
                                        <DropdownMenuItem
                                            onClick={() =>
                                                onChangeRole(role?.toUpperCase() === 'ADMIN' ? 'MEMBER' : 'ADMIN')
                                            }
                                        >
                                            {role?.toUpperCase() === 'ADMIN' ? 'Remove admin' : 'Make admin'}
                                        </DropdownMenuItem>
                                    )}
                                    {onRemove && (
                                        <DropdownMenuItem
                                            onClick={onRemove}
                                            className="text-destructive"
                                        >
                                            Remove from group
                                        </DropdownMenuItem>
                                    )}
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </div>
    );
};
