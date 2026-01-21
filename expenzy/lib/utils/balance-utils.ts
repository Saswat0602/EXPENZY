/**
 * Balance calculation utilities for group expenses
 */

import type { GroupExpense } from '@/types/split';

export interface MemberBalance {
    userId: string;
    userName: string;
    userEmail: string;
    balance: number;
    currency: string;
}

export interface SettlementSuggestion {
    from: string;
    to: string;
    amount: number;
    currency: string;
}

/**
 * Calculate balances for all members in a group
 * @param expenses - Array of group expenses with splits
 * @returns Map of member balances
 */
export function calculateMemberBalances(
    expenses: GroupExpense[],
): Map<string, MemberBalance> {
    const balances = new Map<string, MemberBalance>();

    expenses.forEach((expense) => {
        const { paidByUserId, currency, splits = [] } = expense;
        const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount;

        // Initialize payer if not exists
        if (!balances.has(paidByUserId)) {
            balances.set(paidByUserId, {
                userId: paidByUserId,
                userName: 'Unknown',
                userEmail: '',
                balance: 0,
                currency,
            });
        }

        // Payer gets credited the full amount
        const payerBalance = balances.get(paidByUserId)!;
        payerBalance.balance += amount;

        // Each split participant owes their share
        splits.forEach((split) => {
            if (!balances.has(split.userId)) {
                balances.set(split.userId, {
                    userId: split.userId,
                    userName: split.user?.username || 'Unknown',
                    userEmail: split.user?.email || '',
                    balance: 0,
                    currency,
                });
            }

            const memberBalance = balances.get(split.userId)!;
            memberBalance.balance -= (typeof split.amountOwed === 'string' ? parseFloat(split.amountOwed) : split.amountOwed);
            memberBalance.userName = split.user?.username || memberBalance.userName;
            memberBalance.userEmail = split.user?.email || memberBalance.userEmail;
        });
    });

    return balances;
}

/**
 * Get current user's balance in the group
 * @param balances - Map of member balances
 * @param userId - User ID to get balance for
 * @returns User's balance or 0 if not found
 */
export function getUserBalance(
    balances: Map<string, MemberBalance>,
    userId: string
): number {
    return balances.get(userId)?.balance || 0;
}

/**
 * Calculate what the current user lent or borrowed for a single expense
 * 
 * Logic:
 * - yourShare = amount you owe from the split
 * - youPaid = total amount if you're the payer, else 0
 * - youLent = max(0, youPaid - yourShare) → GREEN
 * - youBorrowed = max(0, yourShare - youPaid) → RED
 */
export function calculateUserExpenseBalance(
    expense: GroupExpense,
    currentUserId: string
): {
    youPaid: number;
    yourShare: number;
    youLent: number;
    youBorrowed: number;
    displayText: string;
    displayColor: 'green' | 'red' | 'neutral';
} {
    const amount = typeof expense.amount === 'string'
        ? parseFloat(expense.amount)
        : Number(expense.amount);

    const isPayer = expense.paidByUserId === currentUserId;
    const youPaid = isPayer ? amount : 0;

    // Find user's split
    const yourSplit = expense.splits?.find(s => s.userId === currentUserId);
    const yourShare = yourSplit
        ? (typeof yourSplit.amountOwed === 'string'
            ? parseFloat(yourSplit.amountOwed)
            : Number(yourSplit.amountOwed))
        : 0;

    // Calculate lent/borrowed
    const youLent = Math.max(0, youPaid - yourShare);
    const youBorrowed = Math.max(0, yourShare - youPaid);

    // Determine display
    let displayText = '';
    let displayColor: 'green' | 'red' | 'neutral' = 'neutral';

    if (youLent > 0) {
        displayText = `you lent ₹${youLent.toFixed(2)}`;
        displayColor = 'green';
    } else if (youBorrowed > 0) {
        displayText = `you borrowed ₹${youBorrowed.toFixed(2)}`;
        displayColor = 'red';
    } else if (yourShare > 0) {
        displayText = 'settled';
        displayColor = 'neutral';
    } else {
        displayText = 'not involved';
        displayColor = 'neutral';
    }

    return {
        youPaid,
        yourShare,
        youLent,
        youBorrowed,
        displayText,
        displayColor,
    };
}

/**
 * Format balance with +/- prefix and currency
 * @param amount - Balance amount
 * @param currency - Currency code
 * @returns Formatted balance string
 */
export function formatBalance(amount: number, currency: string = 'INR'): string {
    const absAmount = Math.abs(amount);
    const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : '€';

    if (amount === 0) {
        return 'settled up';
    }

    return `${symbol}${absAmount.toFixed(2)}`;
}

/**
 * Get color class based on balance amount
 * @param amount - Balance amount
 * @returns Tailwind color class
 */
export function getBalanceColor(amount: number): string {
    if (amount > 0) return 'text-success'; // Gets back money
    if (amount < 0) return 'text-destructive'; // Owes money
    return 'text-muted-foreground'; // Settled up
}

/**
 * Get balance text (owes/gets back)
 * @param amount - Balance amount
 * @returns Balance description
 */
export function getBalanceText(amount: number): string {
    if (amount > 0) return 'gets back';
    if (amount < 0) return 'owes';
    return 'settled up';
}

/**
 * Generate consistent color for group avatar based on group name
 * @param groupName - Name of the group
 * @returns Tailwind background color class
 */
export function generateGroupColor(groupName: string): string {
    const colors = [
        'bg-red-500',
        'bg-orange-500',
        'bg-amber-500',
        'bg-yellow-500',
        'bg-lime-500',
        'bg-green-500',
        'bg-emerald-500',
        'bg-teal-500',
        'bg-cyan-500',
        'bg-sky-500',
        'bg-blue-500',
        'bg-indigo-500',
        'bg-violet-500',
        'bg-purple-500',
        'bg-fuchsia-500',
        'bg-pink-500',
        'bg-rose-500',
    ];

    // Generate hash from group name
    let hash = 0;
    for (let i = 0; i < groupName.length; i++) {
        hash = groupName.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index];
}

/**
 * Get initials from group name
 * @param name - Group name
 * @returns Initials (max 2 characters)
 */
export function getGroupInitials(name: string): string {
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[1][0]).toUpperCase();
}

/**
 * Calculate settlement suggestions to minimize transactions
 * @param balances - Map of member balances
 * @returns Array of settlement suggestions
 */
export function calculateSettlements(
    balances: Map<string, MemberBalance>
): SettlementSuggestion[] {
    const settlements: SettlementSuggestion[] = [];

    // Separate debtors and creditors
    const debtors = Array.from(balances.values()).filter((b) => b.balance < 0);
    const creditors = Array.from(balances.values()).filter((b) => b.balance > 0);

    // Sort by absolute balance
    debtors.sort((a, b) => a.balance - b.balance);
    creditors.sort((a, b) => b.balance - a.balance);

    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];
        const debt = Math.abs(debtor.balance);
        const credit = creditor.balance;

        const settleAmount = Math.min(debt, credit);

        settlements.push({
            from: debtor.userId,
            to: creditor.userId,
            amount: settleAmount,
            currency: debtor.currency,
        });

        debtor.balance += settleAmount;
        creditor.balance -= settleAmount;

        if (Math.abs(debtor.balance) < 0.01) i++;
        if (Math.abs(creditor.balance) < 0.01) j++;
    }

    return settlements;
}

/**
 * Calculate member-wise balances from current user's perspective
 * @param balances - Array of balance objects from API
 * @param currentUserId - Current user's ID
 * @param members - Array of group members
 * @returns Array of member balances from current user's perspective
 */
export function calculateMemberWiseBalances(
    balances: Array<{ userId: string; balance: number }>,
    currentUserId: string,
    members: Array<{
        userId: string | null;
        user?: {
            firstName?: string | null;
            lastName?: string | null;
            avatarUrl?: string | null;
        } | null
    }>
): Array<{ userId: string; name: string; avatarUrl?: string; balance: number }> {
    return balances
        .filter(b => b.userId !== currentUserId)
        .map(b => {
            const member = members.find(m => m.userId === b.userId);
            const firstName = member?.user?.firstName || '';
            const lastName = member?.user?.lastName || '';
            const name = `${firstName} ${lastName}`.trim() || 'Unknown';
            const avatarUrl = member?.user?.avatarUrl || undefined;

            // From current user's perspective:
            // If balance > 0, that member gets back money (so they lent to you, you owe them)
            // If balance < 0, that member owes money (so you lent to them, they owe you)
            // We need to flip the sign for display from current user's perspective
            return {
                userId: b.userId,
                name,
                avatarUrl,
                balance: -b.balance, // Flip sign for current user's perspective
            };
        })
        .filter(b => Math.abs(b.balance) > 0.01);
}
