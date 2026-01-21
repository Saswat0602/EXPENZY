import { PrismaClient } from '@prisma/client';

type SeedUser = { id: string };
type CategoryLookup = Record<string, { id: string; name: string; type: string }>;

const ROOMMATE_EXPENSE_TEMPLATES = [
    {
        description: 'Monthly rent',
        categoryKey: 'GROUP:rent',
        baseAmount: 3600,
        variance: 250,
        splitType: 'equal' as const,
    },
    {
        description: 'Electricity bill',
        categoryKey: 'GROUP:utilities',
        baseAmount: 1250,
        variance: 180,
        splitType: 'percentage' as const,
        percentageOptions: [
            [40, 35, 25],
            [45, 30, 25],
            [50, 30, 20],
        ],
    },
    {
        description: 'Weekly groceries',
        categoryKey: 'GROUP:groceries',
        baseAmount: 950,
        variance: 220,
        splitType: 'exact' as const,
        weightOptions: [
            [3, 2, 1],
            [2, 2, 1],
            [4, 3, 2],
        ],
    },
    {
        description: 'Household supplies',
        categoryKey: 'GROUP:household',
        baseAmount: 720,
        variance: 140,
        splitType: 'equal' as const,
    },
    {
        description: 'Internet & cable',
        categoryKey: 'GROUP:internet_cable',
        baseAmount: 1450,
        variance: 120,
        splitType: 'equal' as const,
    },
    {
        description: 'Cleaning service',
        categoryKey: 'GROUP:cleaning',
        baseAmount: 650,
        variance: 150,
        splitType: 'percentage' as const,
        percentageOptions: [
            [34, 33, 33],
            [40, 30, 30],
            [45, 30, 25],
        ],
    },
    {
        description: 'Furniture upgrade',
        categoryKey: 'GROUP:furniture',
        baseAmount: 2100,
        variance: 420,
        splitType: 'percentage' as const,
        percentageOptions: [
            [45, 35, 20],
            [50, 25, 25],
            [40, 40, 20],
        ],
    },
    {
        description: 'Repairs & maintenance',
        categoryKey: 'GROUP:repairs',
        baseAmount: 1150,
        variance: 260,
        splitType: 'exact' as const,
        weightOptions: [
            [2, 1, 1],
            [3, 2, 1],
            [4, 2, 2],
        ],
    },
    {
        description: 'Dinner out',
        categoryKey: 'GROUP:dining',
        baseAmount: 1650,
        variance: 480,
        splitType: 'exact' as const,
        weightOptions: [
            [1, 1, 1],
            [3, 2, 1],
            [4, 3, 2],
        ],
    },
    {
        description: 'Movie or game night',
        categoryKey: 'GROUP:entertainment',
        baseAmount: 780,
        variance: 190,
        splitType: 'percentage' as const,
        percentageOptions: [
            [33, 33, 34],
            [50, 25, 25],
            [40, 35, 25],
        ],
    },
    {
        description: 'Shared transport',
        categoryKey: 'GROUP:transportation',
        baseAmount: 480,
        variance: 140,
        splitType: 'equal' as const,
        participantCount: 2,
    },
];

function randomItem<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
}

function randomAmount(base: number, variance: number) {
    const swing = Math.floor(Math.random() * (variance * 2 + 1)) - variance;
    const candidate = base + swing;
    return Math.max(candidate, Math.max(250, Math.floor(base * 0.6)));
}

function randomDateBetween(start: Date, end: Date) {
    const startTime = start.getTime();
    const endTime = end.getTime();
    const time = startTime + Math.random() * (endTime - startTime);
    const date = new Date(time);
    date.setHours(0, 0, 0, 0);
    return date;
}

function pickParticipants(members: SeedUser[], count: number) {
    const shuffled = [...members].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.max(1, Math.min(count, members.length)));
}

function distributeEqual(totalAmount: number, count: number) {
    const totalCents = Math.round(totalAmount * 100);
    const baseShare = Math.floor(totalCents / count);
    let remainder = totalCents - baseShare * count;

    return Array.from({ length: count }, () => {
        const extra = remainder > 0 ? 1 : 0;
        if (remainder > 0) {
            remainder -= 1;
        }
        return (baseShare + extra) / 100;
    });
}

function distributeByWeights(totalAmount: number, weights: number[]) {
    const totalCents = Math.round(totalAmount * 100);
    const weightSum = weights.reduce((acc, weight) => acc + weight, 0);
    let allocated = 0;

    return weights.map((weight, index) => {
        if (index === weights.length - 1) {
            return (totalCents - allocated) / 100;
        }
        const shareCents = Math.round((totalCents * weight) / weightSum);
        allocated += shareCents;
        return shareCents / 100;
    });
}

function buildSplitRows(params: {
    totalAmount: number;
    splitType: 'equal' | 'percentage' | 'exact';
    participants: SeedUser[];
    payer: SeedUser;
    weightOptions?: number[][];
    percentageOptions?: number[][];
}) {
    const { totalAmount, splitType, participants, payer, percentageOptions, weightOptions } = params;
    const participantCount = participants.length;
    let amounts: number[] = [];

    if (splitType === 'equal') {
        amounts = distributeEqual(totalAmount, participantCount);
    } else if (splitType === 'percentage') {
        const percentages =
            percentageOptions && percentageOptions.length > 0
                ? randomItem(percentageOptions)
                : Array(participantCount).fill(100 / participantCount);
        amounts = distributeByWeights(totalAmount, percentages);
    } else {
        const weights =
            weightOptions && weightOptions.length > 0 ? randomItem(weightOptions) : Array(participantCount).fill(1);
        amounts = distributeByWeights(totalAmount, weights);
    }

    const isSettled = Math.random() < 0.35;

    const splits = participants.map((participant, index) => {
        const amountOwed = amounts[index];
        const hasPaid = isSettled ? true : participant.id === payer.id;
        const amountPaid = isSettled ? amountOwed : participant.id === payer.id ? totalAmount : 0;

        return {
            userId: participant.id,
            amountOwed,
            amountPaid,
            isPaid: hasPaid,
        };
    });

    return { splits, isSettled };
}

export async function seedTransactions(
    prisma: PrismaClient,
    users: { user1: SeedUser; user2: SeedUser; user3: SeedUser },
    group: { id: string },
    categoryLookup: CategoryLookup,
) {
    const { user1, user2, user3 } = users;
    const members = [user1, user2, user3];

    console.log('💸 Seeding personal expenses...');

    // Personal expenses for user1
    const expenseData = [
        {
            userId: user1.id,
            categoryKey: 'EXPENSE:food',
            amount: 450,
            description: 'Lunch at Italian Restaurant',
            date: new Date('2025-11-25'),
            paymentMethod: 'credit_card',
        },
        {
            userId: user1.id,
            categoryKey: 'EXPENSE:dining_out',
            amount: 850,
            description: 'Dinner with friends',
            date: new Date('2025-11-28'),
            paymentMethod: 'upi',
        },
        {
            userId: user1.id,
            categoryKey: 'EXPENSE:groceries',
            amount: 2500,
            description: 'Weekly groceries',
            date: new Date('2025-11-20'),
            paymentMethod: 'debit_card',
        },
        {
            userId: user1.id,
            categoryKey: 'EXPENSE:transport',
            amount: 250,
            description: 'Uber to office',
            date: new Date('2025-11-26'),
            paymentMethod: 'debit_card',
        },
        {
            userId: user1.id,
            categoryKey: 'EXPENSE:fuel',
            amount: 3000,
            description: 'Petrol for car',
            date: new Date('2025-11-15'),
            paymentMethod: 'cash',
        },
        {
            userId: user1.id,
            categoryKey: 'EXPENSE:bills',
            amount: 1200,
            description: 'Monthly electricity bill',
            date: new Date('2025-11-01'),
            paymentMethod: 'bank_transfer',
        },
        {
            userId: user1.id,
            categoryKey: 'EXPENSE:utilities',
            amount: 800,
            description: 'Water bill',
            date: new Date('2025-11-05'),
            paymentMethod: 'upi',
        },
        {
            userId: user1.id,
            categoryKey: 'EXPENSE:entertainment',
            amount: 600,
            description: 'Movie tickets',
            date: new Date('2025-11-22'),
            paymentMethod: 'credit_card',
        },
        {
            userId: user1.id,
            categoryKey: 'EXPENSE:shopping',
            amount: 4500,
            description: 'New clothes',
            date: new Date('2025-11-18'),
            paymentMethod: 'credit_card',
        },
        {
            userId: user1.id,
            categoryKey: 'EXPENSE:electronics',
            amount: 15000,
            description: 'Wireless headphones',
            date: new Date('2025-11-10'),
            paymentMethod: 'credit_card',
        },
        {
            userId: user1.id,
            categoryKey: 'EXPENSE:health',
            amount: 1500,
            description: 'Doctor consultation',
            date: new Date('2025-11-12'),
            paymentMethod: 'cash',
        },
        {
            userId: user1.id,
            categoryKey: 'EXPENSE:fitness_sports',
            amount: 3000,
            description: 'Gym membership',
            date: new Date('2025-11-01'),
            paymentMethod: 'upi',
        },
        {
            userId: user1.id,
            categoryKey: 'EXPENSE:subscriptions',
            amount: 199,
            description: 'Netflix subscription',
            date: new Date('2025-11-01'),
            paymentMethod: 'credit_card',
        },
        {
            userId: user1.id,
            categoryKey: 'EXPENSE:online_services',
            amount: 299,
            description: 'Spotify Premium',
            date: new Date('2025-11-01'),
            paymentMethod: 'credit_card',
        },
        {
            userId: user1.id,
            categoryKey: 'EXPENSE:gifts',
            amount: 2000,
            description: 'Birthday gift for friend',
            date: new Date('2025-11-16'),
            paymentMethod: 'upi',
        },
        {
            userId: user2.id,
            categoryKey: 'EXPENSE:food',
            amount: 350,
            description: 'Breakfast at cafe',
            date: new Date('2025-11-27'),
            paymentMethod: 'credit_card',
        },
        {
            userId: user2.id,
            categoryKey: 'EXPENSE:shopping',
            amount: 5500,
            description: 'New shoes',
            date: new Date('2025-11-19'),
            paymentMethod: 'debit_card',
        },
    ];

    for (const expense of expenseData) {
        const category = categoryLookup[expense.categoryKey];
        if (!category) continue;

        const existingExpense = await prisma.expense.findFirst({
            where: {
                userId: expense.userId,
                description: expense.description,
                expenseDate: expense.date,
            },
        });

        if (existingExpense) {
            await prisma.expense.update({
                where: { id: existingExpense.id },
                data: {
                    amount: expense.amount,
                    paymentMethod: expense.paymentMethod,
                },
            });
        } else {
            await prisma.expense.create({
                data: {
                    userId: expense.userId,
                    categoryId: category.id,
                    amount: expense.amount,
                    currency: 'INR',
                    description: expense.description,
                    expenseDate: expense.date,
                    paymentMethod: expense.paymentMethod,
                },
            });
        }
    }

    console.log(`✅ Upserted ${expenseData.length} personal expenses`);

    // Income entries
    console.log('💰 Seeding income entries...');
    const incomeData = [
        {
            userId: user1.id,
            categoryKey: 'INCOME:salary',
            amount: 75000,
            source: 'Monthly Salary',
            description: 'November salary',
            date: new Date('2025-11-01'),
        },
        {
            userId: user1.id,
            categoryKey: 'INCOME:salary',
            amount: 75000,
            source: 'Monthly Salary',
            description: 'December salary',
            date: new Date('2025-12-01'),
        },
        {
            userId: user1.id,
            categoryKey: 'INCOME:freelance',
            amount: 25000,
            source: 'Freelance Project',
            description: 'Website development project',
            date: new Date('2025-11-15'),
        },
        {
            userId: user1.id,
            categoryKey: 'INCOME:investment',
            amount: 5000,
            source: 'Dividend',
            description: 'Stock dividend payout',
            date: new Date('2025-11-20'),
        },
        {
            userId: user2.id,
            categoryKey: 'INCOME:salary',
            amount: 65000,
            source: 'Monthly Salary',
            description: 'November salary',
            date: new Date('2025-11-01'),
        },
    ];

    for (const income of incomeData) {
        const category = categoryLookup[income.categoryKey];
        if (!category) continue;

        const existingIncome = await prisma.income.findFirst({
            where: {
                userId: income.userId,
                source: income.source,
                incomeDate: income.date,
            },
        });

        if (existingIncome) {
            await prisma.income.update({
                where: { id: existingIncome.id },
                data: {
                    amount: income.amount,
                    description: income.description,
                },
            });
        } else {
            await prisma.income.create({
                data: {
                    userId: income.userId,
                    categoryId: category.id,
                    amount: income.amount,
                    currency: 'INR',
                    source: income.source,
                    description: income.description,
                    incomeDate: income.date,
                    paymentMethod: 'bank_transfer',
                },
            });
        }
    }

    console.log(`✅ Upserted ${incomeData.length} income entries`);

    // Budgets
    console.log('💼 Seeding budgets...');
    const budgetData = [
        { categoryKey: 'EXPENSE:food', amount: 5000, spentAmount: 1300 },
        { categoryKey: 'EXPENSE:entertainment', amount: 2000, spentAmount: 600 },
        { categoryKey: 'EXPENSE:shopping', amount: 5000, spentAmount: 10000 },
        { categoryKey: 'EXPENSE:transport', amount: 4000, spentAmount: 3250 },
    ];

    for (const budget of budgetData) {
        const category = categoryLookup[budget.categoryKey];
        if (!category) continue;

        const existingBudget = await prisma.budget.findFirst({
            where: {
                userId: user1.id,
                categoryId: category.id,
                periodType: 'monthly',
                startDate: new Date('2025-11-01'),
            },
        });

        if (existingBudget) {
            await prisma.budget.update({
                where: { id: existingBudget.id },
                data: {
                    amount: budget.amount,
                    spentAmount: budget.spentAmount,
                },
            });
        } else {
            await prisma.budget.create({
                data: {
                    userId: user1.id,
                    categoryId: category.id,
                    amount: budget.amount,
                    currency: 'INR',
                    periodType: 'monthly',
                    startDate: new Date('2025-11-01'),
                    endDate: new Date('2025-11-30'),
                    spentAmount: budget.spentAmount,
                },
            });
        }
    }

    console.log(`✅ Upserted ${budgetData.length} budgets`);

    // Savings goals
    console.log('🎯 Seeding savings goals...');
    const existingSavingsGoal = await prisma.savingsGoal.findFirst({
        where: {
            userId: user1.id,
            name: 'Emergency Fund',
        },
    });

    const savingsGoal = existingSavingsGoal
        ? await prisma.savingsGoal.update({
            where: { id: existingSavingsGoal.id },
            data: {
                description: 'Build 6 months emergency fund',
                targetAmount: 10000.0,
                currentAmount: 2500.0,
                targetDate: new Date('2026-06-01'),
                priority: 'high',
            },
        })
        : await prisma.savingsGoal.create({
            data: {
                userId: user1.id,
                name: 'Emergency Fund',
                description: 'Build 6 months emergency fund',
                targetAmount: 10000.0,
                currentAmount: 2500.0,
                currency: 'INR',
                targetDate: new Date('2026-06-01'),
                priority: 'high',
            },
        });

    console.log(`✅ Upserted 1 savings goal`);

    // Savings contributions
    console.log('💰 Seeding savings contributions...');
    const existingContribution = await prisma.savingsContribution.findFirst({
        where: {
            savingsGoalId: savingsGoal.id,
            contributionDate: new Date('2025-11-01'),
        },
    });

    if (existingContribution) {
        await prisma.savingsContribution.update({
            where: { id: existingContribution.id },
            data: {
                amount: 500.0,
            },
        });
    } else {
        await prisma.savingsContribution.create({
            data: {
                savingsGoalId: savingsGoal.id,
                amount: 500.0,
                currency: 'INR',
                contributionDate: new Date('2025-11-01'),
                notes: 'Monthly contribution',
            },
        });
    }

    console.log(`✅ Upserted 1 savings contribution`);

    // Group Expenses - Generate 70 transactions for Roommates
    console.log('💰 Seeding group expenses (70 transactions)...');
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2025-12-28');
    let groupExpenseCount = 0;

    for (let i = 0; i < 70; i++) {
        const template = ROOMMATE_EXPENSE_TEMPLATES[i % ROOMMATE_EXPENSE_TEMPLATES.length];
        const category = categoryLookup[template.categoryKey];

        if (!category) {
            console.warn(`Missing category mapping for ${template.categoryKey}`);
            continue;
        }

        const participants = pickParticipants(members, template.participantCount ?? members.length);
        const payer = randomItem(participants);
        const amount = randomAmount(template.baseAmount, template.variance);
        const { splits, isSettled } = buildSplitRows({
            totalAmount: amount,
            splitType: template.splitType,
            participants,
            payer,
            weightOptions: template.weightOptions,
            percentageOptions: template.percentageOptions,
        });

        const expenseDate = randomDateBetween(startDate, endDate);
        const description = `${template.description} #${String(i + 1).padStart(3, '0')}`;

        // Check if expense already exists
        const existing = await prisma.groupExpense.findFirst({
            where: {
                groupId: group.id,
                description,
                expenseDate,
            },
        });

        if (existing) {
            // Update existing expense
            await prisma.groupExpense.update({
                where: { id: existing.id },
                data: {
                    amount,
                    isSettled,
                    splitValidationStatus: 'valid',
                },
            });

            // Delete old splits and create new ones
            await prisma.groupExpenseSplit.deleteMany({
                where: { groupExpenseId: existing.id },
            });

            await prisma.groupExpenseSplit.createMany({
                data: splits.map((split) => ({
                    groupExpenseId: existing.id,
                    ...split,
                })),
            });
        } else {
            // Create new expense
            await prisma.groupExpense.create({
                data: {
                    groupId: group.id,
                    paidByUserId: payer.id,
                    categoryId: category.id,
                    amount,
                    currency: 'INR',
                    description,
                    expenseDate,
                    splitType: template.splitType,
                    isSettled,
                    splitValidationStatus: 'valid',
                    splits: {
                        create: splits,
                    },
                },
            });
        }

        groupExpenseCount++;
    }

    console.log(`✅ Upserted ${groupExpenseCount} group expenses`);

    return { groupExpenseCount };
}
