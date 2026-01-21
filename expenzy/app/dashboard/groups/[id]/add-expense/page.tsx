'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useGroup, useGroupMembers } from '@/lib/hooks/use-groups';
import { useCreateGroupExpense, useUpdateGroupExpense, useGroupExpense } from '@/lib/hooks/use-group-expenses';
import { useCategories } from '@/lib/hooks/use-categories';
import { useProfile } from '@/lib/hooks/use-profile';
import { useLayout } from '@/contexts/layout-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Check, ChevronDown, Sparkles, CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { getIconByName } from '@/lib/categorization/category-icons';
import { useKeywordMatcher, CategoryMatch } from '@/lib/categorization/keyword-matcher';
import { CategorySelector } from '@/components/shared/category-selector';
import { useCalculatorInput } from '@/lib/hooks/use-calculator-input';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';
import type { SplitType, ParticipantInput } from '@/types/split';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MemberAvatar } from '@/components/features/groups/member-avatar';

const SPLIT_TYPES: { value: SplitType; label: string; description: string }[] = [
    { value: 'equal', label: 'Equally', description: 'Split the total amount equally' },
    { value: 'exact', label: 'Unequally', description: 'Enter exact amounts for each person' },
    { value: 'percentage', label: 'By percentages', description: 'Split by percentage shares' },
    { value: 'shares', label: 'By shares', description: 'Split by share ratios' },
];

export default function AddExpensePage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const groupId = params.id as string;
    const expenseId = searchParams.get('expenseId');
    const isEditMode = !!expenseId;
    const { setLayoutVisibility } = useLayout();

    const { data: group } = useGroup(groupId);
    const { data: members = [] } = useGroupMembers(groupId);
    const { data: existingExpense } = useGroupExpense(groupId, expenseId || '');
    const { data: categories = [] } = useCategories();
    const { data: profile } = useProfile();
    const createExpense = useCreateGroupExpense();
    const updateExpense = useUpdateGroupExpense();
    const { matchAll, isReady } = useKeywordMatcher();

    const currentUserId = profile?.id || '';
    const acceptedMembers = members.filter((m) => m.inviteStatus === 'accepted');
    const expenseCategories = categories.filter(c => c.type.toLowerCase() === 'expense');

    // Detect mobile
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Hide mobile navigation on mount, restore on unmount
    useEffect(() => {
        setLayoutVisibility({ showMobileHeader: false, showBottomNav: false });
        return () => {
            setLayoutVisibility({ showMobileHeader: true, showBottomNav: true });
        };
    }, [setLayoutVisibility]);

    const [description, setDescription] = useState('');
    const calculatorInput = useCalculatorInput('');
    const [categoryId, setCategoryId] = useState<string>('');
    const [categoryMatches, setCategoryMatches] = useState<CategoryMatch[]>([]);
    const [selectedMatchCategory, setSelectedMatchCategory] = useState<string | null>(null);
    const [manuallySelected, setManuallySelected] = useState(false);
    const [paidBy, setPaidBy] = useState('');
    const [splitType, setSplitType] = useState<SplitType>('equal');
    const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
        acceptedMembers.map((m) => m.userId).filter((id): id is string => id !== null)
    );
    const [showSplitTypeModal, setShowSplitTypeModal] = useState(false);
    const [showPaidByModal, setShowPaidByModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    // For exact amounts
    const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});
    // For percentages
    const [percentages, setPercentages] = useState<Record<string, string>>({});
    // For shares
    const [shares, setShares] = useState<Record<string, string>>({});
    // Expense date
    const [expenseDate, setExpenseDate] = useState<Date>(() => new Date());

    // Set paidBy when currentUserId is available (only once)
    useEffect(() => {
        if (currentUserId && !paidBy) {
            setPaidBy(currentUserId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUserId]);

    // Pre-fill form when editing (only once when expense loads)
    useEffect(() => {
        if (isEditMode && existingExpense) {
            setDescription(existingExpense.description);
            calculatorInput.setValue(existingExpense.amount.toString());
            setCategoryId(existingExpense.category?.id || '');
            setPaidBy(existingExpense.paidByUserId);
            setSplitType(existingExpense.splitType as SplitType);

            // Set participants from splits
            const participants = existingExpense.splits?.map(s => s.userId) || [];
            setSelectedParticipants(participants);

            // Pre-fill split amounts based on type
            if (existingExpense.splitType === 'exact') {
                const amounts: Record<string, string> = {};
                existingExpense.splits?.forEach(split => {
                    amounts[split.userId] = split.amountOwed.toString();
                });
                setExactAmounts(amounts);
            } else if (existingExpense.splitType === 'percentage') {
                const pcts: Record<string, string> = {};
                existingExpense.splits?.forEach(split => {
                    if (split.percentage) {
                        pcts[split.userId] = split.percentage.toString();
                    }
                });
                setPercentages(pcts);
            } else if (existingExpense.splitType === 'shares') {
                const shrs: Record<string, string> = {};
                existingExpense.splits?.forEach(split => {
                    if (split.shares) {
                        shrs[split.userId] = split.shares.toString();
                    }
                });
                setShares(shrs);
            }

            // Set expense date if available
            if (existingExpense.expenseDate) {
                setExpenseDate(new Date(existingExpense.expenseDate));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [existingExpense?.id]);

    // Auto-detect category from description with multi-match support
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            // Don't auto-detect if:
            // 1. In edit mode
            // 2. User manually selected a category
            // 3. Description is empty
            // 4. Matcher not ready
            if (!description.trim() || isEditMode || !isReady || manuallySelected) {
                if (!manuallySelected) {
                    setCategoryMatches([]);
                }
                return;
            }

            const matches = matchAll(description);
            setCategoryMatches(matches);

            if (matches.length === 1) {
                // Single match - auto-select
                const category = expenseCategories.find(
                    c => c.name.toLowerCase() === matches[0].category.toLowerCase() ||
                        c.name.toLowerCase().includes(matches[0].category.toLowerCase())
                );
                if (category) {
                    setCategoryId(category.id);
                    setSelectedMatchCategory(matches[0].category);
                }
            } else if (matches.length > 1) {
                // Multiple matches - don't reset if user already selected one
                if (!selectedMatchCategory || !matches.find(m => m.category === selectedMatchCategory)) {
                    setSelectedMatchCategory(null);
                }
            }
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [description, expenseCategories, matchAll, isEditMode, isReady, selectedMatchCategory, manuallySelected]);

    const handleSubmit = async () => {
        if (!description.trim()) {
            toast.error('Please enter a description');
            return;
        }

        const finalAmount = calculatorInput.result.calculatedValue || parseFloat(calculatorInput.value);
        if (!calculatorInput.value || isNaN(finalAmount) || finalAmount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (!paidBy) {
            toast.error('Please select who paid for this expense');
            return;
        }

        if (selectedParticipants.length === 0) {
            toast.error('Please select at least one participant');
            return;
        }

        // Validate based on split type
        if (splitType === 'exact') {
            const total = selectedParticipants.reduce(
                (sum, userId) => sum + (parseFloat(exactAmounts[userId] || '0')),
                0
            );
            if (Math.abs(total - finalAmount) > 0.01) {
                toast.error(`Amounts must add up to ₹${finalAmount}`);
                return;
            }
        } else if (splitType === 'percentage') {
            const total = selectedParticipants.reduce(
                (sum, userId) => sum + (parseFloat(percentages[userId] || '0')),
                0
            );
            if (Math.abs(total - 100) > 0.01) {
                toast.error('Percentages must add up to 100%');
                return;
            }
        }

        try {
            let participants: ParticipantInput[] = [];

            if (splitType === 'equal') {
                const perPerson = finalAmount / selectedParticipants.length;
                participants = selectedParticipants.map((userId) => ({
                    userId,
                    amount: perPerson,
                }));
            } else if (splitType === 'exact') {
                participants = selectedParticipants.map((userId) => ({
                    userId,
                    amount: parseFloat(exactAmounts[userId] || '0'),
                }));
            } else if (splitType === 'percentage') {
                participants = selectedParticipants.map((userId) => ({
                    userId,
                    amount: (finalAmount * parseFloat(percentages[userId] || '0')) / 100,
                    percentage: parseFloat(percentages[userId] || '0'),
                }));
            } else if (splitType === 'shares') {
                const totalShares = selectedParticipants.reduce(
                    (sum, userId) => sum + parseFloat(shares[userId] || '1'),
                    0
                );
                participants = selectedParticipants.map((userId) => ({
                    userId,
                    amount: (finalAmount * parseFloat(shares[userId] || '1')) / totalShares,
                    shares: parseFloat(shares[userId] || '1'),
                }));
            }

            if (isEditMode && expenseId) {
                await updateExpense.mutateAsync({
                    groupId,
                    expenseId,
                    data: {
                        description: description.trim(),
                        amount: finalAmount,
                        splitType,
                        participants,
                        categoryId: categoryId || undefined,
                        expenseDate: expenseDate.toISOString().split('T')[0],
                    },
                });
            } else {
                await createExpense.mutateAsync({
                    groupId,
                    data: {
                        description: description.trim(),
                        amount: finalAmount,
                        paidByUserId: paidBy,
                        splitType,
                        participants,
                        expenseDate: expenseDate.toISOString().split('T')[0],
                        categoryId: categoryId || undefined,
                        currency: group?.currency || 'INR',
                    },
                });
            }

            router.push(`/dashboard/groups/${groupId}`);
        } catch {
            // Error handled by mutation
        }
    };

    const toggleParticipant = (userId: string) => {
        setSelectedParticipants((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    const getMemberName = (userId: string) => {
        if (userId === currentUserId) return 'You';
        const member = acceptedMembers.find((m) => m.userId === userId);
        if (!member?.user) return 'Unknown';
        return `${member.user.firstName} ${member.user.lastName}`.trim() || member.user.email;
    };

    const getCalculatedAmount = (userId: string) => {
        const finalAmount = calculatorInput.result.calculatedValue || parseFloat(calculatorInput.value);
        if (!calculatorInput.value || isNaN(finalAmount) || !selectedParticipants.includes(userId)) return '0.00';

        if (splitType === 'equal') {
            return (finalAmount / selectedParticipants.length).toFixed(2);
        } else if (splitType === 'exact') {
            return parseFloat(exactAmounts[userId] || '0').toFixed(2);
        } else if (splitType === 'percentage') {
            const pct = parseFloat(percentages[userId] || '0');
            return ((finalAmount * pct) / 100).toFixed(2);
        } else if (splitType === 'shares') {
            const totalShares = selectedParticipants.reduce(
                (sum, id) => sum + parseFloat(shares[id] || '1'),
                0
            );
            const userShares = parseFloat(shares[userId] || '1');
            return ((finalAmount * userShares) / totalShares).toFixed(2);
        }
        return '0.00';
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background border-b px-4">
                <div className="flex items-center justify-between py-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/dashboard/groups/${groupId}`)}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-lg font-semibold">{isEditMode ? 'Edit expense' : 'Add expense'}</h1>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSubmit}
                        disabled={createExpense.isPending || updateExpense.isPending}
                    >
                        <Check className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <div className="p-4 space-y-6 pb-6">
                {/* Description */}
                <div className="flex items-center gap-3">
                    <div
                        onClick={() => {
                            setShowCategoryModal(true);
                        }}
                        className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-muted/80 transition-colors relative"
                    >
                        {categoryId ? (() => {
                            const category = expenseCategories.find(c => c.id === categoryId);
                            const CategoryIcon = category?.icon ? getIconByName(category.icon) : getIconByName('Receipt');
                            return (
                                <>
                                    <CategoryIcon
                                        className="h-6 w-6"
                                        style={{ color: category?.color || 'currentColor' }}
                                    />
                                    {selectedMatchCategory && categoryMatches.length === 1 && (
                                        <Sparkles className="h-3 w-3 text-primary absolute -top-1 -right-1" />
                                    )}
                                </>
                            );
                        })() : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div className="flex-1">
                        <Input
                            placeholder="Enter a description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="border-0 border-b rounded-none px-0 focus-visible:ring-0 text-base"
                        />
                        {/* Multiple category matches selector */}
                        {categoryMatches.length > 1 && description.length >= 3 && (
                            <div className="mt-2">
                                <CategorySelector
                                    matches={categoryMatches}
                                    selectedCategory={selectedMatchCategory || undefined}
                                    onSelect={(category) => {
                                        const matchingCategory = expenseCategories.find(c =>
                                            c.name.toLowerCase() === category.toLowerCase() ||
                                            c.name.toLowerCase().includes(category.toLowerCase())
                                        );
                                        if (matchingCategory) {
                                            setCategoryId(matchingCategory.id);
                                            setSelectedMatchCategory(category);
                                        }
                                    }}
                                    categories={expenseCategories}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Amount */}
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-semibold text-muted-foreground">₹</span>
                    </div>
                    <div className="flex-1 relative">
                        <Input
                            type="text"
                            placeholder="0.00"
                            value={calculatorInput.value}
                            onChange={calculatorInput.handleChange}
                            className="border-0 border-b rounded-none px-0 focus-visible:ring-0 text-2xl font-semibold pr-24"
                        />
                        {calculatorInput.result.isExpression && calculatorInput.result.calculatedValue !== null && (
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 text-lg font-semibold text-green-600 dark:text-green-400">
                                = {calculatorInput.result.calculatedValue.toFixed(2)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start text-left font-normal border-0 border-b rounded-none px-0 focus-visible:ring-0',
                                        !expenseDate && 'text-muted-foreground'
                                    )}
                                >
                                    {expenseDate ? format(expenseDate, 'dd/MM/yyyy') : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={expenseDate}
                                    onSelect={(date) => date && setExpenseDate(date)}
                                    disabled={(date) => date > new Date()}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>


                {/* Paid by & Split type */}
                <div className="flex items-center gap-2 text-sm flex-wrap">
                    <span className="text-muted-foreground">Paid by</span>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowPaidByModal(true)}
                        className="rounded-full"
                    >
                        {getMemberName(paidBy)}
                    </Button>
                    <span className="text-muted-foreground">and split</span>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowSplitTypeModal(true)}
                        className="rounded-full gap-1"
                    >
                        {SPLIT_TYPES.find((t) => t.value === splitType)?.label || 'equally'}
                        <ChevronDown className="h-3 w-3" />
                    </Button>
                </div>

                {/* Participants */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">
                        {splitType === 'equal' && 'Split equally'}
                        {splitType === 'exact' && 'Enter exact amounts'}
                        {splitType === 'percentage' && 'Enter percentages'}
                        {splitType === 'shares' && 'Enter shares'}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        {splitType === 'equal' && 'Select which people owe an equal share.'}
                        {splitType === 'exact' && 'Enter the exact amount each person owes.'}
                        {splitType === 'percentage' && 'Enter the percentage each person owes (must total 100%).'}
                        {splitType === 'shares' && 'Enter the share ratio for each person.'}
                    </p>

                    <div className="space-y-2">
                        {acceptedMembers.filter(m => m.userId !== null).map((member) => {
                            const userId = member.userId!; // Non-null assertion is safe after filter
                            const isSelected = selectedParticipants.includes(userId);
                            const memberName = getMemberName(userId);

                            return (
                                <div
                                    key={userId}
                                    className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-muted transition-colors"
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <MemberAvatar
                                            name={memberName}
                                            avatarSeed={member.user?.avatarSeed}
                                            avatarStyle={member.user?.avatarStyle}
                                            isSelected={isSelected}
                                            onClick={() => toggleParticipant(userId)}
                                            size="md"
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-medium">{memberName}</span>
                                            {isSelected && splitType !== 'exact' && (
                                                <span className="text-sm text-muted-foreground">
                                                    ₹{getCalculatedAmount(userId)}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {isSelected && splitType !== 'equal' && (
                                        <div className="flex items-center gap-2">
                                            {splitType === 'percentage' && (
                                                <div className="flex items-center gap-1">
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        value={percentages[userId] || ''}
                                                        onChange={(e) =>
                                                            setPercentages((prev) => ({
                                                                ...prev,
                                                                [userId]: e.target.value,
                                                            }))
                                                        }
                                                        className="w-20 text-right"
                                                        min="0"
                                                        max="100"
                                                    />
                                                    <span className="text-sm text-muted-foreground">%</span>
                                                </div>
                                            )}
                                            {splitType === 'exact' && (
                                                <Input
                                                    type="number"
                                                    placeholder="0.00"
                                                    value={exactAmounts[userId] || ''}
                                                    onChange={(e) =>
                                                        setExactAmounts((prev) => ({
                                                            ...prev,
                                                            [userId]: e.target.value,
                                                        }))
                                                    }
                                                    className="w-24 text-right"
                                                    min="0"
                                                    step="0.01"
                                                />
                                            )}
                                            {splitType === 'shares' && (
                                                <Input
                                                    type="number"
                                                    placeholder="1"
                                                    value={shares[userId] || '1'}
                                                    onChange={(e) =>
                                                        setShares((prev) => ({
                                                            ...prev,
                                                            [userId]: e.target.value,
                                                        }))
                                                    }
                                                    className="w-20 text-right"
                                                    min="0"
                                                    step="0.1"
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Summary */}
                    {calculatorInput.value && selectedParticipants.length > 0 && (() => {
                        const finalAmount = calculatorInput.result.calculatedValue || parseFloat(calculatorInput.value);
                        if (isNaN(finalAmount)) return null;
                        return (
                            <div className="space-y-2">
                                {/* Equal split summary */}
                                {splitType === 'equal' && (
                                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                        <span className="text-sm font-medium">
                                            {selectedParticipants.length} {selectedParticipants.length === 1 ? 'person' : 'people'}
                                        </span>
                                        <span className="text-sm font-medium">
                                            ₹{(finalAmount / selectedParticipants.length).toFixed(2)}/person
                                        </span>
                                    </div>
                                )}

                                {/* Exact amounts summary */}
                                {splitType === 'exact' && (() => {
                                    const totalEntered = selectedParticipants.reduce(
                                        (sum, userId) => sum + parseFloat(exactAmounts[userId] || '0'),
                                        0
                                    );
                                    const remaining = finalAmount - totalEntered;
                                    const isValid = Math.abs(remaining) < 0.01;

                                    return (
                                        <div className={`p-3 rounded-lg border-2 ${isValid
                                            ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
                                            : 'bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800'
                                            }`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium">Total entered</span>
                                                <span className="text-sm font-semibold">₹{totalEntered.toFixed(2)}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">
                                                    {remaining > 0 ? 'Remaining' : remaining < 0 ? 'Over by' : 'Balanced'}
                                                </span>
                                                <span className={`text-sm font-semibold ${isValid ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                                                    }`}>
                                                    ₹{Math.abs(remaining).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Percentage summary */}
                                {splitType === 'percentage' && (() => {
                                    const totalPercentage = selectedParticipants.reduce(
                                        (sum, userId) => sum + parseFloat(percentages[userId] || '0'),
                                        0
                                    );
                                    const remaining = 100 - totalPercentage;
                                    const isValid = Math.abs(remaining) < 0.01;

                                    return (
                                        <div className={`p-3 rounded-lg border-2 ${isValid
                                            ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
                                            : 'bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800'
                                            }`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium">Total percentage</span>
                                                <span className="text-sm font-semibold">{totalPercentage.toFixed(1)}%</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">
                                                    {remaining > 0 ? 'Remaining' : remaining < 0 ? 'Over by' : 'Complete'}
                                                </span>
                                                <span className={`text-sm font-semibold ${isValid ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                                                    }`}>
                                                    {Math.abs(remaining).toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Shares summary */}
                                {splitType === 'shares' && (
                                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                        <span className="text-sm font-medium">
                                            {selectedParticipants.length} {selectedParticipants.length === 1 ? 'person' : 'people'}
                                        </span>
                                        <span className="text-sm font-medium">
                                            Total: {selectedParticipants.reduce(
                                                (sum, userId) => sum + parseFloat(shares[userId] || '1'),
                                                0
                                            ).toFixed(1)} shares
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Split Type Modal */}
            <Dialog open={showSplitTypeModal} onOpenChange={setShowSplitTypeModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Choose split type</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                        {SPLIT_TYPES.map((type) => (
                            <div
                                key={type.value}
                                onClick={() => {
                                    setSplitType(type.value);
                                    setShowSplitTypeModal(false);
                                }}
                                className="p-4 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                            >
                                <div className="font-medium">{type.label}</div>
                                <div className="text-sm text-muted-foreground">{type.description}</div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Paid By Modal */}
            <Dialog open={showPaidByModal} onOpenChange={setShowPaidByModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Who paid?</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                        {acceptedMembers.filter(m => m.userId !== null).map((member) => {
                            const userId = member.userId!; // Non-null assertion is safe after filter
                            return (
                                <div
                                    key={userId}
                                    onClick={() => {
                                        setPaidBy(userId);
                                        setShowPaidByModal(false);
                                    }}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                                >
                                    <MemberAvatar
                                        name={getMemberName(userId)}
                                        avatarSeed={member.user?.avatarSeed}
                                        avatarStyle={member.user?.avatarStyle}
                                        size="md"
                                        showCheckmark={false}
                                    />
                                    <span className="font-medium">{getMemberName(userId)}</span>
                                    {paidBy === userId && <Check className="h-5 w-5 ml-auto text-primary" />}
                                </div>
                            );
                        })}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Category Modal - Mobile (Sheet) */}
            {isMobile ? (
                <Sheet open={showCategoryModal} onOpenChange={setShowCategoryModal}>
                    <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl px-4 pt-4">
                        <SheetHeader className="text-left mb-4">
                            <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto mb-3" />
                            <SheetTitle className="text-xl font-bold">Choose category</SheetTitle>
                        </SheetHeader>
                        <div className="overflow-y-auto h-[calc(85vh-100px)] pb-4 -mx-4 px-4">
                            <div className="space-y-1.5">
                                {expenseCategories.map((category) => {
                                    const CategoryIcon = category.icon ? getIconByName(category.icon) : getIconByName('Receipt');
                                    const isSelected = categoryId === category.id;
                                    return (
                                        <div
                                            key={category.id}
                                            onClick={() => {
                                                setCategoryId(category.id);
                                                setSelectedMatchCategory(null);
                                                setManuallySelected(true);
                                                setShowCategoryModal(false);
                                            }}
                                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all active:scale-[0.98] ${isSelected
                                                ? 'bg-primary/10 border border-primary'
                                                : 'bg-muted/30 hover:bg-muted/50'
                                                }`}
                                        >
                                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-primary/20' : 'bg-background'
                                                }`}>
                                                <CategoryIcon
                                                    className="h-5 w-5"
                                                    style={{ color: category.color || (isSelected ? 'hsl(var(--primary))' : 'currentColor') }}
                                                />
                                            </div>
                                            <span className={`text-base font-medium flex-1 ${isSelected ? 'text-primary' : 'text-foreground'
                                                }`}>
                                                {category.name}
                                            </span>
                                            {isSelected && (
                                                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            ) : (
                <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">Choose category</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-3 gap-2.5 max-h-[60vh] overflow-y-auto py-2">
                            {expenseCategories.map((category) => {
                                const CategoryIcon = category.icon ? getIconByName(category.icon) : getIconByName('Receipt');
                                const isSelected = categoryId === category.id;
                                return (
                                    <div
                                        key={category.id}
                                        onClick={() => {
                                            setCategoryId(category.id);
                                            setSelectedMatchCategory(null);
                                            setManuallySelected(true);
                                            setShowCategoryModal(false);
                                        }}
                                        className={`p-3 rounded-lg hover:bg-muted cursor-pointer transition-all flex flex-col items-center gap-2 ${isSelected
                                            ? 'bg-primary/10 border-2 border-primary'
                                            : 'border border-border hover:border-primary/30'
                                            }`}
                                    >
                                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${isSelected ? 'bg-primary/20' : 'bg-muted'
                                            }`}>
                                            <CategoryIcon
                                                className="h-5 w-5"
                                                style={{ color: category.color || (isSelected ? 'hsl(var(--primary))' : 'currentColor') }}
                                            />
                                        </div>
                                        <span className={`text-xs text-center font-medium line-clamp-2 ${isSelected ? 'text-primary' : 'text-foreground'
                                            }`}>
                                            {category.name}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
