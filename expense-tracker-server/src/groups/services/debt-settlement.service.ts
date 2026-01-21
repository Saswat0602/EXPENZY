import { Injectable } from '@nestjs/common';

export interface MemberBalance {
  userId: string;
  totalPaid: number;
  totalOwed: number;
  balance: number; // positive = gets back, negative = owes
}

export interface SimplifiedDebt {
  from: string;
  to: string;
  amount: number;
}

/**
 * Service for simplifying debts using the greedy algorithm
 * This is the same approach used by Splitwise to minimize transactions
 */
@Injectable()
export class DebtSettlementService {
  /**
   * Simplify debts to minimize number of transactions using greedy algorithm
   *
   * Algorithm:
   * 1. Separate people into creditors (positive balance) and debtors (negative balance)
   * 2. Sort both groups by balance amount (largest first)
   * 3. Match largest debtor with largest creditor
   * 4. Settle as much as possible between them
   * 5. Move to next pair
   *
   * Time Complexity: O(n log n) where n = number of people
   * Space Complexity: O(n)
   *
   * Example:
   * Alice: +$90 (receives), Bob: +$40 (receives), Carol: -$20 (pays), Dave: -$60 (pays)
   * Result: Dave → Alice: $60, Carol → Bob: $20
   *
   * @param balances Map of userId to MemberBalance
   * @returns Array of simplified debts showing who pays whom
   */
  simplifyDebts(balances: Map<string, MemberBalance>): SimplifiedDebt[] {
    const settlements: SimplifiedDebt[] = [];

    // Separate debtors (negative balance) and creditors (positive balance)
    const debtors = Array.from(balances.values())
      .filter((b) => b.balance < 0)
      .map((b) => ({ ...b, balance: Math.abs(b.balance) }))
      .sort((a, b) => b.balance - a.balance); // Sort descending

    const creditors = Array.from(balances.values())
      .filter((b) => b.balance > 0)
      .sort((a, b) => b.balance - a.balance); // Sort descending

    let i = 0;
    let j = 0;

    // Greedy matching: pair largest debtor with largest creditor
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      // Settle the minimum of what debtor owes and creditor is owed
      const settleAmount = Math.min(debtor.balance, creditor.balance);

      // Only create settlement if amount is significant (> 1 cent)
      if (settleAmount > 0.01) {
        settlements.push({
          from: debtor.userId,
          to: creditor.userId,
          amount: Math.round(settleAmount * 100) / 100, // Round to 2 decimal places
        });
      }

      // Update remaining balances
      debtor.balance -= settleAmount;
      creditor.balance -= settleAmount;

      // Move to next debtor/creditor if current one is settled
      if (debtor.balance < 0.01) i++;
      if (creditor.balance < 0.01) j++;
    }

    return settlements;
  }

  /**
   * Validate that simplified debts are correct
   * The sum of all debts should equal the sum of all credits
   */
  validateSimplifiedDebts(
    balances: Map<string, MemberBalance>,
    simplifiedDebts: SimplifiedDebt[],
  ): boolean {
    const totalCredits = Array.from(balances.values())
      .filter((b) => b.balance > 0)
      .reduce((sum, b) => sum + b.balance, 0);

    const totalDebts = simplifiedDebts.reduce(
      (sum, debt) => sum + debt.amount,
      0,
    );

    // Allow small rounding difference (1 cent)
    return Math.abs(totalCredits - totalDebts) < 0.01;
  }
}
