'use client';

import { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import type { SplitType, ParticipantInput } from '@/types/split';
import {
    calculateEqualSplit,
    calculatePercentageSplit,
    calculateSharesSplit,
    validateExactSplits,
    validatePercentageSplits,
    calculateTotalShares,
} from '@/lib/utils/split-utils';

interface SplitConfiguratorProps {
    splitType: SplitType;
    onSplitTypeChange: (type: SplitType) => void;
    members: Array<{ id: string; username: string; email: string }>;
    amount: number;
    participants: ParticipantInput[];
    onParticipantsChange: (participants: ParticipantInput[]) => void;
}

export function SplitConfigurator({
    splitType,
    onSplitTypeChange,
    members,
    amount,
    participants,
    onParticipantsChange,
}: SplitConfiguratorProps) {
    // Initialize with all members for equal split
    useEffect(() => {
        if (splitType === 'equal' && participants.length === 0) {
            onParticipantsChange(members.map((m) => ({ userId: m.id })));
        }
    }, [splitType, members, participants.length, onParticipantsChange]);

    const renderSplitConfig = () => {
        switch (splitType) {
            case 'equal':
                return (
                    <EqualSplitConfig
                        members={members}
                        participants={participants}
                        onParticipantsChange={onParticipantsChange}
                        amount={amount}
                    />
                );
            case 'exact':
                return (
                    <ExactSplitConfig
                        members={members}
                        participants={participants}
                        onParticipantsChange={onParticipantsChange}
                        amount={amount}
                    />
                );
            case 'percentage':
                return (
                    <PercentageSplitConfig
                        members={members}
                        participants={participants}
                        onParticipantsChange={onParticipantsChange}
                        amount={amount}
                    />
                );
            case 'shares':
                return (
                    <SharesSplitConfig
                        members={members}
                        participants={participants}
                        onParticipantsChange={onParticipantsChange}
                        amount={amount}
                    />
                );
        }
    };

    return (
        <div className="space-y-4">
            {/* Split Type Selector */}
            <div>
                <Label>Split Type</Label>
                <RadioGroup
                    value={splitType}
                    onValueChange={(v) => {
                        onSplitTypeChange(v as SplitType);
                        onParticipantsChange([]);
                    }}
                    className="mt-2"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="equal" id="equal" />
                        <Label htmlFor="equal" className="font-normal cursor-pointer">
                            Equal - Split equally among people
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="exact" id="exact" />
                        <Label htmlFor="exact" className="font-normal cursor-pointer">
                            Exact - Enter exact amounts for each person
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="percentage" id="percentage" />
                        <Label htmlFor="percentage" className="font-normal cursor-pointer">
                            Percentage - Split by percentage
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="shares" id="shares" />
                        <Label htmlFor="shares" className="font-normal cursor-pointer">
                            Shares - Split by shares (e.g., 2:1:1)
                        </Label>
                    </div>
                </RadioGroup>
            </div>

            {/* Dynamic Split Configuration */}
            <div className="border-t pt-4">{renderSplitConfig()}</div>
        </div>
    );
}

// Equal Split Component
function EqualSplitConfig({
    members,
    participants,
    onParticipantsChange,
    amount,
}: {
    members: Array<{ id: string; username: string }>;
    participants: ParticipantInput[];
    onParticipantsChange: (participants: ParticipantInput[]) => void;
    amount: number;
}) {
    const toggleMember = (userId: string) => {
        const exists = participants.find((p) => p.userId === userId);
        if (exists) {
            onParticipantsChange(participants.filter((p) => p.userId !== userId));
        } else {
            onParticipantsChange([...participants, { userId }]);
        }
    };

    const perPerson = participants.length > 0 ? calculateEqualSplit(amount, participants.length) : 0;

    return (
        <div className="space-y-2">
            <Label>Select people to split with:</Label>
            <div className="space-y-2">
                {members.map((member) => {
                    const isSelected = participants.some((p) => p.userId === member.id);
                    return (
                        <Card
                            key={member.id}
                            className={`p-3 cursor-pointer transition-colors ${isSelected ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
                                }`}
                            onClick={() => toggleMember(member.id)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Checkbox checked={isSelected} />
                                    <span className="font-medium">{member.username}</span>
                                </div>
                                {isSelected && amount > 0 && (
                                    <span className="text-sm font-semibold text-primary">
                                        ₹{perPerson.toFixed(2)}
                                    </span>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>
            {participants.length > 0 && amount > 0 && (
                <div className="text-sm text-muted-foreground mt-2">
                    {participants.length} {participants.length === 1 ? 'person' : 'people'} × ₹
                    {perPerson.toFixed(2)} = ₹{amount.toFixed(2)}
                </div>
            )}
        </div>
    );
}

// Exact Split Component
function ExactSplitConfig({
    members,
    participants,
    onParticipantsChange,
    amount,
}: {
    members: Array<{ id: string; username: string }>;
    participants: ParticipantInput[];
    onParticipantsChange: (participants: ParticipantInput[]) => void;
    amount: number;
}) {
    const updateAmount = (userId: string, value: string) => {
        const numValue = parseFloat(value) || 0;
        const existing = participants.find((p) => p.userId === userId);

        if (existing) {
            onParticipantsChange(
                participants.map((p) => (p.userId === userId ? { ...p, amount: numValue } : p))
            );
        } else {
            onParticipantsChange([...participants, { userId, amount: numValue }]);
        }
    };

    const total = participants.reduce((sum, p) => sum + (p.amount || 0), 0);
    const validation = validateExactSplits(
        participants.filter((p) => p.amount && p.amount > 0).map((p) => ({ amount: p.amount! })),
        amount
    );

    return (
        <div className="space-y-3">
            <Label>Enter exact amount for each person:</Label>
            <div className="space-y-2">
                {members.map((member) => {
                    const participant = participants.find((p) => p.userId === member.id);
                    return (
                        <div key={member.id} className="flex items-center gap-3">
                            <span className="flex-1 font-medium">{member.username}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">₹</span>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={participant?.amount || ''}
                                    onChange={(e) => updateAmount(member.id, e.target.value)}
                                    placeholder="0.00"
                                    className="w-32"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="flex items-center justify-between text-sm pt-2 border-t">
                <span className="font-medium">Total:</span>
                <span className={validation.valid ? 'text-green-600' : 'text-red-600'}>
                    ₹{total.toFixed(2)} / ₹{amount.toFixed(2)}
                </span>
            </div>
            {!validation.valid && validation.error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{validation.error}</div>
            )}
        </div>
    );
}

// Percentage Split Component
function PercentageSplitConfig({
    members,
    participants,
    onParticipantsChange,
    amount,
}: {
    members: Array<{ id: string; username: string }>;
    participants: ParticipantInput[];
    onParticipantsChange: (participants: ParticipantInput[]) => void;
    amount: number;
}) {
    const updatePercentage = (userId: string, value: string) => {
        const numValue = parseFloat(value) || 0;
        const existing = participants.find((p) => p.userId === userId);

        if (existing) {
            onParticipantsChange(
                participants.map((p) => (p.userId === userId ? { ...p, percentage: numValue } : p))
            );
        } else {
            onParticipantsChange([...participants, { userId, percentage: numValue }]);
        }
    };

    const totalPercentage = participants.reduce((sum, p) => sum + (p.percentage || 0), 0);
    const validation = validatePercentageSplits(
        participants.filter((p) => p.percentage && p.percentage > 0).map((p) => ({ percentage: p.percentage! }))
    );

    return (
        <div className="space-y-3">
            <Label>Enter percentage for each person:</Label>
            <div className="space-y-2">
                {members.map((member) => {
                    const participant = participants.find((p) => p.userId === member.id);
                    const calculatedAmount =
                        participant?.percentage && amount > 0
                            ? calculatePercentageSplit(amount, participant.percentage)
                            : 0;

                    return (
                        <div key={member.id} className="flex items-center gap-3">
                            <span className="flex-1 font-medium">{member.username}</span>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={participant?.percentage || ''}
                                    onChange={(e) => updatePercentage(member.id, e.target.value)}
                                    placeholder="0"
                                    className="w-20"
                                />
                                <span className="text-sm text-muted-foreground w-8">%</span>
                                {participant?.percentage && participant.percentage > 0 && (
                                    <span className="text-sm text-muted-foreground w-24 text-right">
                                        = ₹{calculatedAmount.toFixed(2)}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="flex items-center justify-between text-sm pt-2 border-t">
                <span className="font-medium">Total:</span>
                <span className={validation.valid ? 'text-green-600' : 'text-red-600'}>
                    {totalPercentage.toFixed(2)}% / 100%
                </span>
            </div>
            {!validation.valid && validation.error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{validation.error}</div>
            )}
        </div>
    );
}

// Shares Split Component
function SharesSplitConfig({
    members,
    participants,
    onParticipantsChange,
    amount,
}: {
    members: Array<{ id: string; username: string }>;
    participants: ParticipantInput[];
    onParticipantsChange: (participants: ParticipantInput[]) => void;
    amount: number;
}) {
    const updateShares = (userId: string, value: string) => {
        const numValue = parseFloat(value) || 0;
        const existing = participants.find((p) => p.userId === userId);

        if (existing) {
            onParticipantsChange(
                participants.map((p) => (p.userId === userId ? { ...p, shares: numValue } : p))
            );
        } else {
            onParticipantsChange([...participants, { userId, shares: numValue }]);
        }
    };

    const totalShares = calculateTotalShares(participants);

    return (
        <div className="space-y-3">
            <Label>Enter shares for each person (e.g., 2:1:1):</Label>
            <div className="space-y-2">
                {members.map((member) => {
                    const participant = participants.find((p) => p.userId === member.id);
                    const calculatedAmount =
                        participant?.shares && totalShares > 0
                            ? calculateSharesSplit(amount, participant.shares, totalShares)
                            : 0;

                    return (
                        <div key={member.id} className="flex items-center gap-3">
                            <span className="flex-1 font-medium">{member.username}</span>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    value={participant?.shares || ''}
                                    onChange={(e) => updateShares(member.id, e.target.value)}
                                    placeholder="0"
                                    className="w-20"
                                />
                                <span className="text-sm text-muted-foreground w-16">shares</span>
                                {participant?.shares && participant.shares > 0 && totalShares > 0 && (
                                    <span className="text-sm text-muted-foreground w-24 text-right">
                                        = ₹{calculatedAmount.toFixed(2)}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            {totalShares > 0 && (
                <div className="text-sm text-muted-foreground pt-2 border-t">
                    Total shares: {totalShares} = ₹{amount.toFixed(2)}
                </div>
            )}
        </div>
    );
}
