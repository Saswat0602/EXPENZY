'use client';

import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Wallet, PieChart } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { useMemo } from 'react';
import type { Expense } from '@/types/expense';
import type { Income } from '@/types/income';

interface TransactionStatsProps {
    expenses: Expense[];
    incomes: Income[];
    currency?: 'INR' | 'USD' | 'EUR';
}

export function TransactionStats({ expenses, incomes, currency = 'INR' }: TransactionStatsProps) {
    const stats = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Filter this month's transactions
        const thisMonthExpenses = expenses.filter((exp) => {
            const date = new Date(exp.expenseDate);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        const thisMonthIncomes = incomes.filter((inc) => {
            const date = new Date(inc.incomeDate);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        const totalExpenses = thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const totalIncome = thisMonthIncomes.reduce((sum, inc) => sum + inc.amount, 0);
        const netBalance = totalIncome - totalExpenses;

        // Top categories
        const categoryTotals = thisMonthExpenses.reduce((acc, exp) => {
            const categoryName = exp.category?.name || 'Uncategorized';
            acc[categoryName] = (acc[categoryName] || 0) + exp.amount;
            return acc;
        }, {} as Record<string, number>);

        const topCategories = Object.entries(categoryTotals)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([name, amount]) => ({ name, amount }));

        return {
            totalExpenses,
            totalIncome,
            netBalance,
            topCategories,
        };
    }, [expenses, incomes]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Total Expenses */}
            <Card className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">Total Expenses</p>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {formatCurrency(stats.totalExpenses, currency)}
                        </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                        <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                </div>
            </Card>

            {/* Total Income */}
            <Card className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">Total Income</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(stats.totalIncome, currency)}
                        </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                </div>
            </Card>

            {/* Net Balance */}
            <Card className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">Net Balance</p>
                        <p
                            className={`text-2xl font-bold ${stats.netBalance >= 0
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                                }`}
                        >
                            {formatCurrency(Math.abs(stats.netBalance), currency)}
                        </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                </div>
            </Card>

            {/* Top Categories */}
            <Card className="p-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                        <PieChart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground mb-1">Top Categories</p>
                        {stats.topCategories.length > 0 ? (
                            <div className="space-y-0.5">
                                {stats.topCategories.map((cat, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-xs">
                                        <span className="truncate">{cat.name}</span>
                                        <span className="font-medium ml-2">
                                            {formatCurrency(cat.amount, currency)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground">No expenses yet</p>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
}
