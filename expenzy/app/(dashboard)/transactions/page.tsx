'use client';

import { useState } from 'react';
import { useExpenses } from '@/lib/hooks/use-expenses';
import { useIncome } from '@/lib/hooks/use-income';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { Plus, TrendingUp, TrendingDown, Filter, Search } from 'lucide-react';

type TransactionType = 'all' | 'expense' | 'income';

export default function TransactionsPage() {
    const [type, setType] = useState<TransactionType>('all');
    const [search, setSearch] = useState('');

    const { data: expenses = [], isLoading: expensesLoading } = useExpenses();
    const { data: income = [], isLoading: incomeLoading } = useIncome();

    const isLoading = expensesLoading || incomeLoading;

    // Combine and sort transactions
    const allTransactions = [
        ...expenses.map(e => ({ ...e, type: 'expense' as const })),
        ...income.map(i => ({ ...i, type: 'income' as const, description: i.source })),
    ].sort((a, b) => {
        const dateA = 'expenseDate' in a ? new Date(a.expenseDate) : new Date(a.incomeDate);
        const dateB = 'expenseDate' in b ? new Date(b.expenseDate) : new Date(b.incomeDate);
        return dateB.getTime() - dateA.getTime();
    });

    // Filter transactions
    const filteredTransactions = allTransactions.filter(t => {
        if (type !== 'all' && t.type !== type) return false;
        if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Transactions</h1>
                    <p className="text-muted-foreground">Track your income and expenses</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">Add Transaction</span>
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>

                {/* Type Filter */}
                <div className="flex gap-2 bg-muted p-1 rounded-lg">
                    {(['all', 'expense', 'income'] as TransactionType[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => setType(t)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${type === t
                                    ? 'bg-background shadow-sm'
                                    : 'hover:bg-background/50'
                                }`}
                        >
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Transactions List */}
            <div className="bg-card border border-border rounded-lg divide-y divide-border">
                {isLoading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        No transactions found
                    </div>
                ) : (
                    filteredTransactions.map((transaction) => {
                        const date = 'expenseDate' in transaction ? transaction.expenseDate : transaction.incomeDate;
                        const isIncome = transaction.type === 'income';

                        return (
                            <div
                                key={transaction.id}
                                className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isIncome
                                                ? 'bg-success/10 text-success'
                                                : 'bg-destructive/10 text-destructive'
                                            }`}
                                    >
                                        {isIncome ? (
                                            <TrendingUp className="w-6 h-6" />
                                        ) : (
                                            <TrendingDown className="w-6 h-6" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{transaction.description}</p>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span>{transaction.category?.name || 'Uncategorized'}</span>
                                            <span>•</span>
                                            <span>{formatDate(date)}</span>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p
                                            className={`text-lg font-semibold ${isIncome ? 'text-success' : 'text-destructive'
                                                }`}
                                        >
                                            {isIncome ? '+' : '-'}
                                            {formatCurrency(transaction.amount)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {transaction.currency}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
