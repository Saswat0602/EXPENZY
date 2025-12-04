/**
 * Balance calculation utilities for group expenses
 */

import type { GroupExpense } from '@/types/group';
import type { Split } from '@/types/split';

export interface MemberBalance {
    userId: string;
    userName: string;
    userEmail: string;
    balance: number; // Positive = gets back, Negative = owes
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
 * @param currentUserId - Current user's ID for reference
 * @returns Array of member balances
 */
export function calculateMemberBalances(
    expenses: GroupExpense[],
    currentUserId: string
): Map<string, MemberBalance> {
    const balances = new Map<string, MemberBalance>();

    expenses.forEach((expense) => {
        const { paidById, amount, currency, splits = [] } = expense;

        // Initialize payer if not exists
        if (!balances.has(paidById)) {
            balances.set(paidById, {
                userId: paidById,
                userName: 'Unknown',
                userEmail: '',
                balance: 0,
                currency,
            });
        }

        // Payer gets credited the full amount
        const payerBalance = balances.get(paidById)!;
        payerBalance.balance += amount;

        // Each split participant owes their share
        splits.forEach((split) => {
            if (!balances.has(split.userId)) {
                balances.set(split.userId, {
                    userId: split.userId,
                    userName: split.user?.name || 'Unknown',
                    userEmail: split.user?.email || '',
                    balance: 0,
                    currency,
                });
            }

            const memberBalance = balances.get(split.userId)!;
            memberBalance.balance -= split.amount;
            memberBalance.userName = split.user?.name || memberBalance.userName;
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
