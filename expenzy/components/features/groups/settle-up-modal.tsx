'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProfile } from '@/lib/hooks/use-profile';
import { useSettleDebt } from '@/lib/hooks/use-group-balances';
import { formatCurrency } from '@/lib/utils/currency';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Check } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';
import { toast } from 'sonner';
import type { SimplifiedDebt } from '@/types/split';

interface SettleUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupId: string;
    debts: SimplifiedDebt[];
    currency: 'INR' | 'USD' | 'EUR';
    isMobile?: boolean;
}

export function SettleUpModal({
    isOpen,
    onClose,
    groupId,
    debts,
    currency,
    isMobile = false,
}: SettleUpModalProps) {
    const { data: profile } = useProfile();
    const settleDebt = useSettleDebt();
    const currentUserId = profile?.id || '';

    const [selectedDebt, setSelectedDebt] = useState<SimplifiedDebt | null>(null);
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState<Date>(new Date());
    const [notes, setNotes] = useState('');

    // Filter debts relevant to current user
    const userDebts = debts.filter(
        (debt) => debt.fromUserId === currentUserId || debt.toUserId === currentUserId
    );

    const handleSettle = async () => {
        if (!selectedDebt) {
            toast.error('Please select a debt to settle');
            return;
        }

        const settlementAmount = parseFloat(amount);
        if (!amount || isNaN(settlementAmount) || settlementAmount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (settlementAmount > selectedDebt.amount) {
            toast.error(`Amount cannot exceed ${formatCurrency(selectedDebt.amount, currency)}`);
            return;
        }

        try {
            await settleDebt.mutateAsync({
                groupId,
                fromUserId: selectedDebt.fromUserId,
                toUserId: selectedDebt.toUserId,
                amount: settlementAmount,
                settledAt: date.toISOString(),
                notes: notes.trim() || undefined,
            });

            toast.success('Settlement recorded successfully');
            onClose();
            // Reset form
            setSelectedDebt(null);
            setAmount('');
            setNotes('');
            setDate(new Date());
        } catch {
            // Error handled by mutation
        }
    };

    const content = (
        <div className="space-y-4">
            {/* Select Debt */}
            <div className="space-y-2">
                <Label>Select who to settle with</Label>
                <div className="space-y-2">
                    {userDebts.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <p className="font-medium">All settled up!</p>
                            <p className="text-sm mt-1">You don&apos;t owe anyone and nobody owes you</p>
                        </div>
                    ) : (
                        userDebts.map((debt) => {
                            const isSelected = selectedDebt?.fromUserId === debt.fromUserId &&
                                selectedDebt?.toUserId === debt.toUserId;
                            const isYouOwe = debt.fromUserId === currentUserId;
                            const otherUser = isYouOwe ? debt.toUser : debt.fromUser;
                            const otherUserName = otherUser
                                ? `${otherUser.firstName} ${otherUser.lastName}`.trim()
                                : 'Unknown';

                            return (
                                <div
                                    key={`${debt.fromUserId}-${debt.toUserId}`}
                                    onClick={() => {
                                        setSelectedDebt(debt);
                                        setAmount(debt.amount.toString());
                                    }}
                                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${isSelected
                                        ? 'bg-primary/10 border-2 border-primary'
                                        : 'bg-muted/20 hover:bg-muted/40 border-2 border-transparent'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <UserAvatar
                                            fallbackName={otherUserName}
                                            size={40}
                                        />
                                        <div>
                                            <p className="font-medium">{otherUserName}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {isYouOwe ? 'You owe' : 'Owes you'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold ${isYouOwe
                                            ? 'text-red-600 dark:text-red-400'
                                            : 'text-green-600 dark:text-green-400'
                                            }`}>
                                            {formatCurrency(debt.amount, currency)}
                                        </p>
                                        {isSelected && (
                                            <Check className="h-5 w-5 text-primary ml-auto mt-1" />
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Amount */}
            {selectedDebt && (
                <>
                    <div className="space-y-2">
                        <Label>Amount to settle</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                {currency === 'INR' ? '₹' : currency === 'USD' ? '$' : '€'}
                            </span>
                            <Input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="pl-8"
                                step="0.01"
                                min="0"
                                max={selectedDebt.amount}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Maximum: {formatCurrency(selectedDebt.amount, currency)}
                        </p>
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <Label>Settlement Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start text-left font-normal',
                                        !date && 'text-muted-foreground'
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={(d) => d && setDate(d)}
                                    disabled={(date) => date > new Date()}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label>Notes (optional)</Label>
                        <Input
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g., Cash payment, Bank transfer"
                            maxLength={200}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" onClick={onClose} className="flex-1">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSettle}
                            disabled={settleDebt.isPending}
                            className="flex-1"
                        >
                            {settleDebt.isPending ? 'Recording...' : 'Record Settlement'}
                        </Button>
                    </div>
                </>
            )}
        </div>
    );

    // Mobile: Use Sheet
    if (isMobile) {
        return (
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl px-4 pt-4">
                    <SheetHeader className="text-left mb-4">
                        <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto mb-3" />
                        <SheetTitle className="text-xl font-bold">Settle Up</SheetTitle>
                    </SheetHeader>
                    <div className="overflow-y-auto h-[calc(85vh-100px)] pb-4 -mx-4 px-4">
                        {content}
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    // Desktop: Use Dialog
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Settle Up</DialogTitle>
                </DialogHeader>
                {content}
            </DialogContent>
        </Dialog>
    );
}
