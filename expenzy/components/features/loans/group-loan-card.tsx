'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency } from '@/lib/utils/format';
import type { GroupLoan } from '@/types/loan';
import { ArrowRight } from 'lucide-react';

interface GroupLoanCardProps {
    groupLoan: GroupLoan;
    onConvert?: () => void;
}

export function GroupLoanCard({ groupLoan, onConvert }: GroupLoanCardProps) {
    const isOwedToMe = groupLoan.type === 'owed_to_me';

    return (
        <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-10 w-10">
                        <AvatarImage
                            src={groupLoan.otherUserAvatar || undefined}
                            alt={groupLoan.otherUserName}
                        />
                        <AvatarFallback>
                            {groupLoan.otherUserName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                            {groupLoan.otherUserName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                            {groupLoan.groupIcon} {groupLoan.groupName}
                        </p>
                    </div>
                </div>
                <Badge variant={isOwedToMe ? 'default' : 'secondary'} className="text-xs">
                    {isOwedToMe ? 'Owes You' : 'You Owe'}
                </Badge>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <p className="text-lg font-bold">
                        {formatCurrency(groupLoan.amount, groupLoan.currency as 'INR' | 'USD' | 'EUR')}
                    </p>
                    <p className="text-xs text-muted-foreground">From group expenses</p>
                </div>

                {groupLoan.canConvertToLoan && onConvert && (
                    <Button size="sm" variant="outline" onClick={onConvert}>
                        Convert
                        <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                )}
            </div>
        </Card>
    );
}
