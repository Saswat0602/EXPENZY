import { Injectable } from '@nestjs/common';

export interface GroupExpenseWithSplits {
  id: string;
  amount: number | string;
  paidByUserId: string | null;
  splits: Array<{
    userId: string | null;
    amountOwed: number | string;
  }>;
}

export interface UserExpenseBalance {
  youPaid: number;
  yourShare: number;
  youLent: number;
  youBorrowed: number;
  displayText: string;
  displayColor: 'green' | 'red' | 'neutral';
}

export interface MemberBalance {
  userId: string;
  totalPaid: number;
  totalOwed: number;
  balance: number; // positive = gets back, negative = owes
}

@Injectable()
export class BalanceCalculationService {
  /**
   * Calculate what the current user lent or borrowed for a single expense
   *
   * Logic:
   * - yourShare = amount you owe from the split
   * - youPaid = total amount if you're the payer, else 0
   * - youLent = max(0, youPaid - yourShare) → GREEN
   * - youBorrowed = max(0, yourShare - youPaid) → RED
   */
  calculateUserExpenseBalance(
    expense: GroupExpenseWithSplits,
    currentUserId: string,
  ): UserExpenseBalance {
    const amount =
      typeof expense.amount === 'string'
        ? parseFloat(expense.amount)
        : expense.amount;

    const isPayer = expense.paidByUserId === currentUserId;
    const youPaid = isPayer ? amount : 0;

    // Find user's split
    const yourSplit = expense.splits?.find((s) => s.userId === currentUserId);
    const yourShare = yourSplit
      ? typeof yourSplit.amountOwed === 'string'
        ? parseFloat(yourSplit.amountOwed)
        : yourSplit.amountOwed
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
   * Calculate balances for all members in a group across all expenses
   *
   * Returns a map of userId -> balance
   * Positive balance = member gets back money (they lent)
   * Negative balance = member owes money (they borrowed)
   */
  calculateGroupBalances(
    expenses: GroupExpenseWithSplits[],
  ): Map<string, MemberBalance> {
    const balances = new Map<string, MemberBalance>();

    expenses.forEach((expense) => {
      // Convert Decimal to number - Prisma returns Decimal objects
      const amount =
        typeof expense.amount === 'string'
          ? parseFloat(expense.amount)
          : Number(expense.amount); // Convert Decimal to number

      // Track payer
      if (expense.paidByUserId) {
        if (!balances.has(expense.paidByUserId)) {
          balances.set(expense.paidByUserId, {
            userId: expense.paidByUserId,
            totalPaid: 0,
            totalOwed: 0,
            balance: 0,
          });
        }
        const payerBalance = balances.get(expense.paidByUserId)!;
        payerBalance.totalPaid += amount; // Now properly adds numbers
      }

      // Track each participant's share
      expense.splits?.forEach((split) => {
        if (!split.userId) return;

        if (!balances.has(split.userId)) {
          balances.set(split.userId, {
            userId: split.userId,
            totalPaid: 0,
            totalOwed: 0,
            balance: 0,
          });
        }

        const memberBalance = balances.get(split.userId)!;
        // Convert Decimal to number - Prisma returns Decimal objects
        const owedAmount =
          typeof split.amountOwed === 'string'
            ? parseFloat(split.amountOwed)
            : Number(split.amountOwed); // Convert Decimal to number

        memberBalance.totalOwed += owedAmount; // Now properly adds numbers
      });
    });

    // Calculate final balances
    balances.forEach((member) => {
      member.balance = member.totalPaid - member.totalOwed;
    });

    return balances;
  }

  /**
   * Get a specific user's balance from the balances map
   */
  getUserBalance(balances: Map<string, MemberBalance>, userId: string): number {
    return balances.get(userId)?.balance || 0;
  }

  /**
   * Format balance for display
   */
  formatBalance(
    balance: number,
    currency: string = 'INR',
  ): {
    text: string;
    color: 'green' | 'red' | 'neutral';
  } {
    const absAmount = Math.abs(balance);
    const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : '€';

    if (balance > 0) {
      return {
        text: `gets back ${symbol}${absAmount.toFixed(2)}`,
        color: 'green',
      };
    } else if (balance < 0) {
      return {
        text: `owes ${symbol}${absAmount.toFixed(2)}`,
        color: 'red',
      };
    } else {
      return {
        text: 'settled up',
        color: 'neutral',
      };
    }
  }

  /**
   * Simplify debts to minimize number of transactions
   * Uses greedy algorithm to match debtors with creditors
   */
  simplifyDebts(
    balances: Map<string, MemberBalance>,
  ): Array<{ from: string; to: string; amount: number }> {
    const settlements: Array<{ from: string; to: string; amount: number }> = [];

    // Separate debtors (negative balance) and creditors (positive balance)
    const debtors = Array.from(balances.values())
      .filter((b) => b.balance < 0)
      .map((b) => ({ ...b, balance: Math.abs(b.balance) }))
      .sort((a, b) => b.balance - a.balance);

    const creditors = Array.from(balances.values())
      .filter((b) => b.balance > 0)
      .sort((a, b) => b.balance - a.balance);

    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      const settleAmount = Math.min(debtor.balance, creditor.balance);

      if (settleAmount > 0.01) {
        // Only create settlement if > 1 cent
        settlements.push({
          from: debtor.userId,
          to: creditor.userId,
          amount: Math.round(settleAmount * 100) / 100,
        });
      }

      debtor.balance -= settleAmount;
      creditor.balance -= settleAmount;

      if (debtor.balance < 0.01) i++;
      if (creditor.balance < 0.01) j++;
    }

    return settlements;
  }
}
