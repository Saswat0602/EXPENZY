import { Injectable } from '@nestjs/common';

interface MemberBalance {
  userId: string;
  totalPaid: number;
  totalOwed: number;
  balance: number;
}

interface BalanceCacheEntry {
  balances: Map<string, MemberBalance>;
  timestamp: number;
  expenseCount: number;
}

interface ExpenseCountCacheEntry {
  count: number;
  timestamp: number;
}

@Injectable()
export class GroupCacheService {
  private readonly BALANCE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly EXPENSE_COUNT_CACHE_TTL = 60 * 1000; // 1 minute

  private balanceCache = new Map<string, BalanceCacheEntry>();
  private expenseCountCache = new Map<string, ExpenseCountCacheEntry>();

  /**
   * Get cached balance for a group
   */
  getCachedBalance(
    groupId: string,
    currentExpenseCount: number,
  ): Map<string, MemberBalance> | null {
    const cached = this.balanceCache.get(groupId);

    if (
      cached &&
      cached.expenseCount === currentExpenseCount &&
      Date.now() - cached.timestamp < this.BALANCE_CACHE_TTL
    ) {
      return cached.balances;
    }

    return null;
  }

  /**
   * Set balance cache for a group
   */
  setCachedBalance(
    groupId: string,
    balances: Map<string, MemberBalance>,
    expenseCount: number,
  ): void {
    this.balanceCache.set(groupId, {
      balances,
      timestamp: Date.now(),
      expenseCount,
    });
  }

  /**
   * Get cached expense count for a group
   */
  getCachedExpenseCount(groupId: string): number | null {
    const cached = this.expenseCountCache.get(groupId);

    if (
      cached &&
      Date.now() - cached.timestamp < this.EXPENSE_COUNT_CACHE_TTL
    ) {
      return cached.count;
    }

    return null;
  }

  /**
   * Set expense count cache for a group
   */
  setCachedExpenseCount(groupId: string, count: number): void {
    this.expenseCountCache.set(groupId, {
      count,
      timestamp: Date.now(),
    });
  }

  /**
   * Invalidate all caches for a group
   */
  invalidateGroupCaches(groupId: string): void {
    this.balanceCache.delete(groupId);
    this.expenseCountCache.delete(groupId);
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    this.balanceCache.clear();
    this.expenseCountCache.clear();
  }
}
