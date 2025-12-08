import React from 'react';
import { formatCurrency } from '@/lib/utils/currency';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils/cn';

interface SimplifiedDebt {
    from: string;
    to: string;
    amount: number;
    fromUser?: {
        firstName?: string;
        lastName?: string;
        avatarUrl?: string;
    };
    toUser?: {
        firstName?: string;
        lastName?: string;
        avatarUrl?: string;
    };
}

interface SimplifiedBalanceViewProps {
    simplifiedDebts: SimplifiedDebt[];
    currentUserId: string;
    currency: 'INR' | 'USD' | 'EUR';
}

export const SimplifiedBalanceView: React.FC<SimplifiedBalanceViewProps> = ({
    simplifiedDebts,
    currentUserId,
    currency,
}) => {
    // Calculate overall balance from current user's perspective
    const youOwe = simplifiedDebts
        .filter(d => d.from === currentUserId)
        .reduce((sum, d) => sum + d.amount, 0);

    const youGetBack = simplifiedDebts
        .filter(d => d.to === currentUserId)
        .reduce((sum, d) => sum + d.amount, 0);

    const netBalance = youGetBack - youOwe;

    // People you owe (you are the debtor)
    const peopleYouOwe = simplifiedDebts.filter(d => d.from === currentUserId);

    // People who owe you (you are the creditor)
    const peopleWhoOweYou = simplifiedDebts.filter(d => d.to === currentUserId);

    return (
        <div className="space-y-6">
            {/* Overall Balance */}
            <div className="text-center pb-4 border-b border-border/50">
                <p className="text-sm text-muted-foreground mb-2">Overall Balance</p>
                {Math.abs(netBalance) < 0.01 ? (
                    <p className="text-2xl font-bold text-muted-foreground">Settled up</p>
                ) : netBalance < 0 ? (
                    <p className="text-3xl font-bold text-red-400 dark:text-red-300">
                        You owe {formatCurrency(Math.abs(netBalance), currency)}
                    </p>
                ) : (
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                        You get back {formatCurrency(netBalance, currency)}
                    </p>
                )}
            </div>

            {/* People you owe */}
            {peopleYouOwe.length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold text-red-400 dark:text-red-300 mb-3 px-1">
                        People you owe
                    </h4>
                    <div className="space-y-2">
                        {peopleYouOwe.map(debt => {
                            const name = debt.toUser
                                ? `${debt.toUser.firstName || ''} ${debt.toUser.lastName || ''}`.trim()
                                : 'Unknown';
                            return (
                                <div key={debt.to} className="flex items-center justify-between py-2 px-1">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            {debt.toUser?.avatarUrl && (
                                                <AvatarImage src={debt.toUser.avatarUrl} alt={name} />
                                            )}
                                            <AvatarFallback className="text-sm">
                                                {name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-base">{name}</p>
                                            <p className="text-sm text-red-400 dark:text-red-300">
                                                owes you
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-lg font-semibold text-red-400 dark:text-red-300">
                                        {formatCurrency(debt.amount, currency)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* People who owe you */}
            {peopleWhoOweYou.length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-3 px-1">
                        People who owe you
                    </h4>
                    <div className="space-y-2">
                        {peopleWhoOweYou.map(debt => {
                            const name = debt.fromUser
                                ? `${debt.fromUser.firstName || ''} ${debt.fromUser.lastName || ''}`.trim()
                                : 'Unknown';
                            return (
                                <div key={debt.from} className="flex items-center justify-between py-2 px-1">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            {debt.fromUser?.avatarUrl && (
                                                <AvatarImage src={debt.fromUser.avatarUrl} alt={name} />
                                            )}
                                            <AvatarFallback className="text-sm">
                                                {name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-base">{name}</p>
                                            <p className="text-sm text-green-600 dark:text-green-400">
                                                owes you
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                                        {formatCurrency(debt.amount, currency)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* All settled message */}
            {peopleYouOwe.length === 0 && peopleWhoOweYou.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">All settled up! 🎉</p>
                </div>
            )}
        </div>
    );
};
