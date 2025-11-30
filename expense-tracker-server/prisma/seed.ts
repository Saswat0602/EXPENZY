import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    // Clear existing data (in reverse order of dependencies)
    console.log('🧹 Cleaning existing data...');
    await prisma.accountTransaction.deleteMany();
    await prisma.account.deleteMany();
    await prisma.savingsContribution.deleteMany();
    await prisma.savingsGoal.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.expenseTag.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.income.deleteMany();
    await prisma.incomeCategory.deleteMany();
    await prisma.paymentMethod.deleteMany();
    await prisma.userSettings.deleteMany();
    await prisma.loanPayment.deleteMany();
    await prisma.loan.deleteMany();
    await prisma.splitParticipant.deleteMany();
    await prisma.splitExpense.deleteMany();
    await prisma.expense.deleteMany();
    await prisma.recurringPattern.deleteMany();
    await prisma.budget.deleteMany();
    await prisma.monthlySummary.deleteMany();
    await prisma.yearlySummary.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.exchangeRate.deleteMany();
    await prisma.attachment.deleteMany();
    await prisma.category.deleteMany();
    await prisma.groupMember.deleteMany();
    await prisma.group.deleteMany();
    await prisma.user.deleteMany();

    // Create Users
    console.log('👤 Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user1 = await prisma.user.create({
        data: {
            email: 'john.doe@example.com',
            username: 'johndoe',
            passwordHash: hashedPassword,
            firstName: 'John',
            lastName: 'Doe',
            phone: '+1234567890',
            defaultCurrency: 'USD',
            timezone: 'America/New_York',
            isActive: true,
            isVerified: true,
            lastLoginAt: new Date(),
        },
    });

    const user2 = await prisma.user.create({
        data: {
            email: 'jane.smith@example.com',
            username: 'janesmith',
            passwordHash: hashedPassword,
            firstName: 'Jane',
            lastName: 'Smith',
            phone: '+1234567891',
            defaultCurrency: 'USD',
            timezone: 'America/Los_Angeles',
            isActive: true,
            isVerified: true,
            lastLoginAt: new Date(),
        },
    });

    const user3 = await prisma.user.create({
        data: {
            email: 'bob.wilson@example.com',
            username: 'bobwilson',
            googleId: 'google_123456789',
            firstName: 'Bob',
            lastName: 'Wilson',
            defaultCurrency: 'EUR',
            timezone: 'Europe/London',
            isActive: true,
            isVerified: true,
            lastLoginAt: new Date(),
        },
    });

    console.log(`✅ Created ${3} users`);

    // Create System Categories (Available to all users)
    console.log('📁 Creating system categories...');
    const systemCategories = [
        // Expense Categories
        { name: 'Food', icon: '🍔', color: '#ef4444', type: 'expense' },
        { name: 'Fuel', icon: '⛽', color: '#f59e0b', type: 'expense' },
        { name: 'Transport', icon: '🚗', color: '#3b82f6', type: 'expense' },
        { name: 'Shopping', icon: '🛍️', color: '#ec4899', type: 'expense' },
        { name: 'Entertainment', icon: '🎬', color: '#8b5cf6', type: 'expense' },
        { name: 'Health', icon: '❤️', color: '#10b981', type: 'expense' },
        { name: 'Bills', icon: '📄', color: '#06b6d4', type: 'expense' },
        { name: 'Education', icon: '📚', color: '#A8D8EA', type: 'expense' },
        { name: 'Travel', icon: '✈️', color: '#FFD93D', type: 'expense' },
        { name: 'Other', icon: '📌', color: '#6b7280', type: 'expense' },
        // Income Categories
        { name: 'Salary', icon: '💰', color: '#6BCF7F', type: 'income' },
        { name: 'Freelance', icon: '💼', color: '#4D96FF', type: 'income' },
        { name: 'Business', icon: '🏢', color: '#22c55e', type: 'income' },
        { name: 'Investment', icon: '📈', color: '#14b8a6', type: 'income' },
    ];

    const createdSystemCategories = await Promise.all(
        systemCategories.map((cat) =>
            prisma.category.create({
                data: {
                    ...cat,
                    isSystem: true,
                },
            }),
        ),
    );

    // Create User-specific Categories
    const userCategories = await Promise.all([
        prisma.category.create({
            data: {
                userId: user1.id,
                name: 'Gym Membership',
                icon: '💪',
                color: '#FF5722',
                type: 'expense',
                isSystem: false,
            },
        }),
        prisma.category.create({
            data: {
                userId: user1.id,
                name: 'Pet Care',
                icon: '🐕',
                color: '#8BC34A',
                type: 'expense',
                isSystem: false,
            },
        }),
        prisma.category.create({
            data: {
                userId: user2.id,
                name: 'Online Courses',
                icon: '💻',
                color: '#2196F3',
                type: 'expense',
                isSystem: false,
            },
        }),
    ]);

    console.log(
        `✅ Created ${createdSystemCategories.length + userCategories.length} categories`,
    );

    // Create Recurring Patterns
    console.log('🔄 Creating recurring patterns...');
    const recurringPattern1 = await prisma.recurringPattern.create({
        data: {
            userId: user1.id,
            frequency: 'monthly',
            interval: 1,
            dayOfMonth: 1,
            startDate: new Date('2025-01-01'),
            nextOccurrence: new Date('2025-01-01'),
            isActive: true,
        },
    });

    const recurringPattern2 = await prisma.recurringPattern.create({
        data: {
            userId: user1.id,
            frequency: 'weekly',
            interval: 1,
            dayOfWeek: 1,
            startDate: new Date('2025-01-01'),
            nextOccurrence: new Date('2025-12-30'),
            isActive: true,
        },
    });

    console.log(`✅ Created ${2} recurring patterns`);

    // Create Expenses
    console.log('💸 Creating expenses...');
    const expenses = await Promise.all([
        // User 1 expenses
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[0].id, // Food & Dining
                amount: 45.5,
                currency: 'USD',
                description: 'Lunch at Italian Restaurant',
                expenseDate: new Date('2025-11-25'),
                paymentMethod: 'credit_card',
                notes: 'Team lunch',
            },
        }),
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[1].id, // Transportation
                amount: 25.0,
                currency: 'USD',
                description: 'Uber to office',
                expenseDate: new Date('2025-11-26'),
                paymentMethod: 'debit_card',
            },
        }),
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[4].id, // Bills & Utilities
                amount: 120.0,
                currency: 'USD',
                description: 'Monthly electricity bill',
                expenseDate: new Date('2025-11-01'),
                paymentMethod: 'bank_transfer',
                isRecurring: true,
                recurringPatternId: recurringPattern1.id,
            },
        }),
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: userCategories[0].id, // Gym Membership
                amount: 50.0,
                currency: 'USD',
                description: 'Monthly gym membership',
                expenseDate: new Date('2025-11-01'),
                paymentMethod: 'credit_card',
                isRecurring: true,
                recurringPatternId: recurringPattern1.id,
            },
        }),
        // Additional 25 transactions for User 1 (John Doe)
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[0].id, // Food & Dining
                amount: 12.50,
                currency: 'INR',
                description: 'Coffee and pastry',
                expenseDate: new Date('2025-11-28'),
                paymentMethod: 'upi',
            },
        }),
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[2].id, // Shopping
                amount: 89.99,
                currency: 'INR',
                description: 'New headphones',
                expenseDate: new Date('2025-11-27'),
                paymentMethod: 'credit_card',
            },
        }),
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[1].id, // Transportation
                amount: 8.50,
                currency: 'INR',
                description: 'Metro card recharge',
                expenseDate: new Date('2025-11-26'),
                paymentMethod: 'debit_card',
            },
        }),
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[3].id, // Entertainment
                amount: 25.00,
                currency: 'INR',
                description: 'Movie tickets',
                expenseDate: new Date('2025-11-25'),
                paymentMethod: 'credit_card',
            },
        }),
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[0].id, // Food & Dining
                amount: 35.75,
                currency: 'INR',
                description: 'Dinner at Chinese restaurant',
                expenseDate: new Date('2025-11-24'),
                paymentMethod: 'upi',
            },
        }),
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[5].id, // Health
                amount: 45.00,
                currency: 'INR',
                description: 'Pharmacy - medicines',
                expenseDate: new Date('2025-11-23'),
                paymentMethod: 'cash',
            },
        }),
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[2].id, // Shopping
                amount: 120.00,
                currency: 'INR',
                description: 'Groceries',
                expenseDate: new Date('2025-11-22'),
                paymentMethod: 'debit_card',
            },
        }),
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[1].id, // Transportation
                amount: 15.00,
                currency: 'INR',
                description: 'Taxi to airport',
                expenseDate: new Date('2025-11-21'),
                paymentMethod: 'upi',
            },
        }),
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[0].id, // Food & Dining
                amount: 18.50,
                currency: 'INR',
                description: 'Breakfast at cafe',
                expenseDate: new Date('2025-11-20'),
                paymentMethod: 'credit_card',
            },
        }),
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[3].id, // Entertainment
                amount: 12.99,
                currency: 'INR',
                description: 'Spotify Premium',
                expenseDate: new Date('2025-11-19'),
                paymentMethod: 'credit_card',
            },
        }),
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[2].id, // Shopping
                amount: 65.00,
                currency: 'INR',
                description: 'New shirt',
                expenseDate: new Date('2025-11-18'),
                paymentMethod: 'debit_card',
            },
        }),
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[0].id, // Food & Dining
                amount: 28.00,
                currency: 'INR',
                description: 'Pizza delivery',
                expenseDate: new Date('2025-11-17'),
                paymentMethod: 'upi',
            },
        }),
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[6].id, // Education
                amount: 199.00,
                currency: 'INR',
                description: 'Online course subscription',
                expenseDate: new Date('2025-11-16'),
                paymentMethod: 'credit_card',
            },
        }),
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[1].id, // Transportation
                amount: 50.00,
                currency: 'INR',
                description: 'Fuel',
                expenseDate: new Date('2025-11-15'),
                paymentMethod: 'debit_card',
            },
        }),
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[0].id, // Food & Dining
                amount: 42.00,
                currency: 'INR',
                description: 'Lunch with colleagues',
                expenseDate: new Date('2025-11-14'),
                paymentMethod: 'upi',
            },
        }),
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[5].id, // Health
                amount: 150.00,
                currency: 'INR',
                description: 'Doctor consultation',
                expenseDate: new Date('2025-11-13'),
                paymentMethod: 'cash',
            },
        }),
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[2].id, // Shopping
                amount: 35.00,
                currency: 'INR',
                description: 'Books',
                expenseDate: new Date('2025-11-12'),
                paymentMethod: 'credit_card',
            },
        }),
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[3].id, // Entertainment
                amount: 45.00,
                currency: 'INR',
                description: 'Concert tickets',
                expenseDate: new Date('2025-11-11'),
                paymentMethod: 'debit_card',
            },
        }),
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[0].id, // Food & Dining
                amount: 22.50,
                currency: 'INR',
                description: 'Starbucks',
                expenseDate: new Date('2025-11-10'),
                paymentMethod: 'upi',
            },
        }),
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[4].id, // Bills & Utilities
                amount: 85.00,
                currency: 'INR',
                description: 'Internet bill',
                expenseDate: new Date('2025-11-09'),
                paymentMethod: 'bank_transfer',
            },
        }),
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[2].id, // Shopping
                amount: 150.00,
                currency: 'INR',
                description: 'Sneakers',
                expenseDate: new Date('2025-11-08'),
                paymentMethod: 'credit_card',
            },
        }),
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[0].id, // Food & Dining
                amount: 32.00,
                currency: 'INR',
                description: 'Sushi takeout',
                expenseDate: new Date('2025-11-07'),
                paymentMethod: 'upi',
            },
        }),
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[1].id, // Transportation
                amount: 12.00,
                currency: 'INR',
                description: 'Parking fee',
                expenseDate: new Date('2025-11-06'),
                paymentMethod: 'cash',
            },
        }),
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[7].id, // Travel
                amount: 350.00,
                currency: 'INR',
                description: 'Weekend hotel booking',
                expenseDate: new Date('2025-11-05'),
                paymentMethod: 'credit_card',
            },
        }),
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[0].id, // Food & Dining
                amount: 55.00,
                currency: 'INR',
                description: 'Family dinner',
                expenseDate: new Date('2025-11-04'),
                paymentMethod: 'debit_card',
            },
        }),
        // User 2 expenses
        prisma.expense.create({
            data: {
                userId: user2.id,
                categoryId: createdSystemCategories[2].id, // Shopping
                amount: 89.99,
                currency: 'USD',
                description: 'New running shoes',
                expenseDate: new Date('2025-11-20'),
                paymentMethod: 'credit_card',
            },
        }),
        prisma.expense.create({
            data: {
                userId: user2.id,
                categoryId: createdSystemCategories[3].id, // Entertainment
                amount: 15.0,
                currency: 'USD',
                description: 'Netflix subscription',
                expenseDate: new Date('2025-11-01'),
                paymentMethod: 'credit_card',
            },
        }),
        // User 3 expenses
        prisma.expense.create({
            data: {
                userId: user3.id,
                categoryId: createdSystemCategories[7].id, // Travel
                amount: 450.0,
                currency: 'EUR',
                description: 'Flight to Paris',
                expenseDate: new Date('2025-11-15'),
                paymentMethod: 'credit_card',
            },
        }),
    ]);

    console.log(`✅ Created ${expenses.length} expenses`);

    // Create Split Expenses
    console.log('💰 Creating split expenses...');
    const splitExpense1 = await prisma.splitExpense.create({
        data: {
            expenseId: expenses[0].id,
            totalAmount: 120.0,
            currency: 'USD',
            splitType: 'equal',
            paidByUserId: user1.id,
            description: 'Team lunch split',
        },
    });

    const splitExpense2 = await prisma.splitExpense.create({
        data: {
            expenseId: expenses[6].id,
            totalAmount: 300.0,
            currency: 'EUR',
            splitType: 'equal',
            paidByUserId: user3.id,
            description: 'Hotel booking in Paris',
        },
    });

    console.log(`✅ Created ${2} split expenses`);

    // Create Split Participants
    console.log('👥 Creating split participants...');
    await Promise.all([
        prisma.splitParticipant.create({
            data: {
                splitExpenseId: splitExpense1.id,
                userId: user1.id,
                amountOwed: 60.0,
                amountPaid: 120.0,
                isSettled: false,
            },
        }),
        prisma.splitParticipant.create({
            data: {
                splitExpenseId: splitExpense1.id,
                userId: user2.id,
                amountOwed: 60.0,
                amountPaid: 0,
                isSettled: false,
            },
        }),
        prisma.splitParticipant.create({
            data: {
                splitExpenseId: splitExpense2.id,
                userId: user3.id,
                amountOwed: 150.0,
                amountPaid: 300.0,
                isSettled: false,
            },
        }),
        prisma.splitParticipant.create({
            data: {
                splitExpenseId: splitExpense2.id,
                userId: user2.id,
                amountOwed: 150.0,
                amountPaid: 0,
                isSettled: false,
            },
        }),
    ]);

    console.log(`✅ Created ${4} split participants`);

    // Create Loans
    console.log('💵 Creating loans...');
    const loan1 = await prisma.loan.create({
        data: {
            lenderUserId: user1.id,
            borrowerUserId: user2.id,
            amount: 500.0,
            currency: 'USD',
            description: 'Emergency loan',
            loanDate: new Date('2025-11-01'),
            dueDate: new Date('2025-12-31'),
            status: 'active',
            amountPaid: 200.0,
            amountRemaining: 300.0,
            interestRate: 0,
        },
    });

    const loan2 = await prisma.loan.create({
        data: {
            lenderUserId: user3.id,
            borrowerUserId: user1.id,
            amount: 1000.0,
            currency: 'EUR',
            description: 'Car repair loan',
            loanDate: new Date('2025-10-15'),
            dueDate: new Date('2025-01-15'),
            status: 'active',
            amountPaid: 0,
            amountRemaining: 1000.0,
            interestRate: 2.5,
        },
    });

    console.log(`✅ Created ${2} loans`);

    // Create Loan Payments
    console.log('💳 Creating loan payments...');
    await Promise.all([
        prisma.loanPayment.create({
            data: {
                loanId: loan1.id,
                amount: 100.0,
                currency: 'USD',
                paymentDate: new Date('2025-11-10'),
                paymentMethod: 'bank_transfer',
                notes: 'First installment',
            },
        }),
        prisma.loanPayment.create({
            data: {
                loanId: loan1.id,
                amount: 100.0,
                currency: 'USD',
                paymentDate: new Date('2025-11-20'),
                paymentMethod: 'cash',
                notes: 'Second installment',
            },
        }),
    ]);

    console.log(`✅ Created ${2} loan payments`);

    // Create Budgets
    console.log('📊 Creating budgets...');
    await Promise.all([
        prisma.budget.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[0].id, // Food & Dining
                amount: 500.0,
                currency: 'USD',
                periodType: 'monthly',
                startDate: new Date('2025-11-01'),
                endDate: new Date('2025-11-30'),
                spentAmount: 45.5,
                alertThreshold: 80.0,
                isActive: true,
            },
        }),
        prisma.budget.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[1].id, // Transportation
                amount: 200.0,
                currency: 'USD',
                periodType: 'monthly',
                startDate: new Date('2025-11-01'),
                endDate: new Date('2025-11-30'),
                spentAmount: 25.0,
                alertThreshold: 75.0,
                isActive: true,
            },
        }),
        prisma.budget.create({
            data: {
                userId: user2.id,
                categoryId: createdSystemCategories[2].id, // Shopping
                amount: 300.0,
                currency: 'USD',
                periodType: 'monthly',
                startDate: new Date('2025-11-01'),
                endDate: new Date('2025-11-30'),
                spentAmount: 89.99,
                alertThreshold: 80.0,
                isActive: true,
            },
        }),
    ]);

    console.log(`✅ Created ${3} budgets`);

    // Create Monthly Summaries
    console.log('📈 Creating monthly summaries...');
    await Promise.all([
        prisma.monthlySummary.create({
            data: {
                userId: user1.id,
                year: 2024,
                month: 11,
                currency: 'USD',
                totalIncome: 5000.0,
                totalExpenses: 240.5,
                netSavings: 4759.5,
                expenseCount: 4,
                averageExpense: 60.13,
                largestExpense: 120.0,
                categoryBreakdown: {
                    'Food & Dining': 45.5,
                    Transportation: 25.0,
                    'Bills & Utilities': 120.0,
                    'Gym Membership': 50.0,
                },
            },
        }),
        prisma.monthlySummary.create({
            data: {
                userId: user2.id,
                year: 2024,
                month: 11,
                currency: 'USD',
                totalIncome: 4500.0,
                totalExpenses: 104.99,
                netSavings: 4395.01,
                expenseCount: 2,
                averageExpense: 52.5,
                largestExpense: 89.99,
                categoryBreakdown: {
                    Shopping: 89.99,
                    Entertainment: 15.0,
                },
            },
        }),
    ]);

    console.log(`✅ Created ${2} monthly summaries`);

    // Create Yearly Summaries
    console.log('📊 Creating yearly summaries...');
    await Promise.all([
        prisma.yearlySummary.create({
            data: {
                userId: user1.id,
                year: 2024,
                currency: 'USD',
                totalIncome: 60000.0,
                totalExpenses: 28500.0,
                netSavings: 31500.0,
                expenseCount: 145,
                averageMonthlyExpense: 2375.0,
                largestExpense: 1200.0,
                monthWithHighestExpense: 7,
                categoryBreakdown: {
                    'Food & Dining': 6500.0,
                    Transportation: 3200.0,
                    'Bills & Utilities': 8400.0,
                    Shopping: 4500.0,
                    Entertainment: 2400.0,
                    Healthcare: 1500.0,
                    'Gym Membership': 600.0,
                    Other: 1400.0,
                },
            },
        }),
    ]);

    console.log(`✅ Created ${1} yearly summary`);

    // Create Notifications
    console.log('🔔 Creating notifications...');
    await Promise.all([
        prisma.notification.create({
            data: {
                userId: user1.id,
                type: 'budget_alert',
                title: 'Budget Alert',
                message: 'You have reached 80% of your Food & Dining budget',
                relatedEntityType: 'budget',
                isRead: false,
            },
        }),
        prisma.notification.create({
            data: {
                userId: user2.id,
                type: 'split_reminder',
                title: 'Payment Reminder',
                message: 'You owe $60 to John Doe for Team lunch',
                relatedEntityType: 'split_expense',
                isRead: false,
            },
        }),
        prisma.notification.create({
            data: {
                userId: user1.id,
                type: 'loan_reminder',
                title: 'Loan Payment Due',
                message: 'Loan payment of $300 is due on 2024-12-31',
                relatedEntityType: 'loan',
                isRead: true,
                readAt: new Date(),
            },
        }),
    ]);

    console.log(`✅ Created ${3} notifications`);

    // Create Audit Logs
    console.log('📝 Creating audit logs...');
    await Promise.all([
        prisma.auditLog.create({
            data: {
                userId: user1.id,
                entityType: 'expense',
                entityId: expenses[0].id,
                action: 'create',
                newValues: {
                    amount: 45.5,
                    description: 'Lunch at Italian Restaurant',
                },
                ipAddress: '192.168.1.1',
                userAgent: 'Mozilla/5.0',
            },
        }),
        prisma.auditLog.create({
            data: {
                userId: user1.id,
                entityType: 'budget',
                entityId: 'budget-1',
                action: 'update',
                oldValues: {
                    amount: 400.0,
                },
                newValues: {
                    amount: 500.0,
                },
                ipAddress: '192.168.1.1',
                userAgent: 'Mozilla/5.0',
            },
        }),
    ]);

    console.log(`✅ Created ${2} audit logs`);

    // Create Exchange Rates
    console.log('💱 Creating exchange rates...');
    await Promise.all([
        prisma.exchangeRate.create({
            data: {
                baseCurrency: 'USD',
                targetCurrency: 'EUR',
                rate: 0.92,
                rateDate: new Date('2025-11-29'),
                source: 'ECB',
            },
        }),
        prisma.exchangeRate.create({
            data: {
                baseCurrency: 'USD',
                targetCurrency: 'GBP',
                rate: 0.79,
                rateDate: new Date('2025-11-29'),
                source: 'ECB',
            },
        }),
        prisma.exchangeRate.create({
            data: {
                baseCurrency: 'EUR',
                targetCurrency: 'USD',
                rate: 1.09,
                rateDate: new Date('2025-11-29'),
                source: 'ECB',
            },
        }),
        prisma.exchangeRate.create({
            data: {
                baseCurrency: 'USD',
                targetCurrency: 'INR',
                rate: 83.5,
                rateDate: new Date('2025-11-29'),
                source: 'RBI',
            },
        }),
    ]);

    console.log(`✅ Created ${4} exchange rates`);

    // Create Attachments
    console.log('📎 Creating attachments...');
    await Promise.all([
        prisma.attachment.create({
            data: {
                userId: user1.id,
                entityType: 'expense',
                entityId: expenses[0].id,
                fileName: 'receipt_restaurant.jpg',
                fileUrl: 'https://example.com/receipts/receipt_restaurant.jpg',
                fileSize: 245678,
                mimeType: 'image/jpeg',
            },
        }),
        prisma.attachment.create({
            data: {
                userId: user1.id,
                entityType: 'expense',
                entityId: expenses[2].id,
                fileName: 'electricity_bill.pdf',
                fileUrl: 'https://example.com/bills/electricity_bill.pdf',
                fileSize: 156789,
                mimeType: 'application/pdf',
            },
        }),
    ]);

    console.log(`✅ Created ${2} attachments`);

    // Create Income Categories
    console.log('💰 Creating income categories...');
    const incomeCategories = await Promise.all([
        prisma.incomeCategory.create({
            data: {
                userId: user1.id,
                name: 'Salary',
                icon: '💼',
                color: '#4CAF50',
            },
        }),
        prisma.incomeCategory.create({
            data: {
                userId: user1.id,
                name: 'Freelance',
                icon: '💻',
                color: '#2196F3',
            },
        }),
        prisma.incomeCategory.create({
            data: {
                userId: user2.id,
                name: 'Investment',
                icon: '📈',
                color: '#9C27B0',
            },
        }),
    ]);

    console.log(`✅ Created ${incomeCategories.length} income categories`);

    // Create Income
    console.log('💵 Creating income entries...');
    const incomes = await Promise.all([
        prisma.income.create({
            data: {
                userId: user1.id,
                categoryId: incomeCategories[0].id,
                source: 'Monthly Salary',
                amount: 5000.0,
                currency: 'USD',
                incomeDate: new Date('2025-11-01'),
                isRecurring: true,
                recurringPatternId: recurringPattern1.id,
            },
        }),
        prisma.income.create({
            data: {
                userId: user1.id,
                categoryId: incomeCategories[1].id,
                source: 'Web Development Project',
                amount: 1500.0,
                currency: 'USD',
                incomeDate: new Date('2025-11-15'),
                notes: 'Client project completion',
            },
        }),
        prisma.income.create({
            data: {
                userId: user2.id,
                categoryId: incomeCategories[2].id,
                source: 'Stock Dividends',
                amount: 250.0,
                currency: 'USD',
                incomeDate: new Date('2025-11-20'),
            },
        }),
    ]);

    console.log(`✅ Created ${incomes.length} income entries`);

    // Create Savings Goals
    console.log('🎯 Creating savings goals...');
    const savingsGoals = await Promise.all([
        prisma.savingsGoal.create({
            data: {
                userId: user1.id,
                name: 'Emergency Fund',
                description: 'Build 6 months emergency fund',
                targetAmount: 15000.0,
                currentAmount: 5000.0,
                currency: 'USD',
                targetDate: new Date('2025-12-31'),
                priority: 'high',
                icon: '🚨',
                color: '#F44336',
            },
        }),
        prisma.savingsGoal.create({
            data: {
                userId: user1.id,
                name: 'Vacation to Europe',
                description: 'Summer vacation 2025',
                targetAmount: 5000.0,
                currentAmount: 1200.0,
                currency: 'USD',
                targetDate: new Date('2025-06-01'),
                priority: 'medium',
                icon: '✈️',
                color: '#2196F3',
            },
        }),
        prisma.savingsGoal.create({
            data: {
                userId: user2.id,
                name: 'New Laptop',
                description: 'MacBook Pro M3',
                targetAmount: 2500.0,
                currentAmount: 800.0,
                currency: 'USD',
                priority: 'low',
                icon: '💻',
                color: '#9E9E9E',
            },
        }),
    ]);

    console.log(`✅ Created ${savingsGoals.length} savings goals`);

    // Create Savings Contributions
    console.log('💰 Creating savings contributions...');
    await Promise.all([
        prisma.savingsContribution.create({
            data: {
                savingsGoalId: savingsGoals[0].id,
                amount: 2000.0,
                currency: 'USD',
                contributionDate: new Date('2025-10-01'),
            },
        }),
        prisma.savingsContribution.create({
            data: {
                savingsGoalId: savingsGoals[0].id,
                amount: 1500.0,
                currency: 'USD',
                contributionDate: new Date('2025-11-01'),
            },
        }),
        prisma.savingsContribution.create({
            data: {
                savingsGoalId: savingsGoals[1].id,
                amount: 600.0,
                currency: 'USD',
                contributionDate: new Date('2025-11-10'),
            },
        }),
    ]);

    console.log(`✅ Created ${3} savings contributions`);

    // Create Subscriptions
    console.log('📱 Creating subscriptions...');
    const subscriptions = await Promise.all([
        prisma.subscription.create({
            data: {
                userId: user1.id,
                name: 'Netflix',
                amount: 15.99,
                currency: 'USD',
                billingCycle: 'monthly',
                categoryId: createdSystemCategories[3].id,
                startDate: new Date('2025-01-01'),
                nextBillingDate: new Date('2025-12-01'),
                reminderDays: 3,
                icon: '🎬',
                color: '#E50914',
            },
        }),
        prisma.subscription.create({
            data: {
                userId: user1.id,
                name: 'Spotify Premium',
                amount: 9.99,
                currency: 'USD',
                billingCycle: 'monthly',
                categoryId: createdSystemCategories[3].id,
                startDate: new Date('2025-01-01'),
                nextBillingDate: new Date('2025-12-01'),
                icon: '🎵',
                color: '#1DB954',
            },
        }),
        prisma.subscription.create({
            data: {
                userId: user2.id,
                name: 'Adobe Creative Cloud',
                amount: 54.99,
                currency: 'USD',
                billingCycle: 'monthly',
                startDate: new Date('2025-01-01'),
                nextBillingDate: new Date('2025-12-01'),
                icon: '🎨',
                color: '#FF0000',
            },
        }),
    ]);

    console.log(`✅ Created ${subscriptions.length} subscriptions`);

    // Create Tags
    console.log('🏷️ Creating tags...');
    const tags = await Promise.all([
        prisma.tag.create({
            data: {
                userId: user1.id,
                name: 'work',
                color: '#2196F3',
            },
        }),
        prisma.tag.create({
            data: {
                userId: user1.id,
                name: 'personal',
                color: '#4CAF50',
            },
        }),
        prisma.tag.create({
            data: {
                userId: user1.id,
                name: 'urgent',
                color: '#F44336',
            },
        }),
        prisma.tag.create({
            data: {
                userId: user2.id,
                name: 'business',
                color: '#FF9800',
            },
        }),
    ]);

    console.log(`✅ Created ${tags.length} tags`);

    // Attach tags to expenses
    console.log('🔗 Attaching tags to expenses...');
    await Promise.all([
        prisma.expenseTag.create({
            data: {
                expenseId: expenses[0].id,
                tagId: tags[0].id,
            },
        }),
        prisma.expenseTag.create({
            data: {
                expenseId: expenses[1].id,
                tagId: tags[0].id,
            },
        }),
        prisma.expenseTag.create({
            data: {
                expenseId: expenses[2].id,
                tagId: tags[1].id,
            },
        }),
    ]);

    console.log(`✅ Attached tags to expenses`);

    // Create Payment Methods
    console.log('💳 Creating payment methods...');
    const paymentMethods = await Promise.all([
        prisma.paymentMethod.create({
            data: {
                userId: user1.id,
                name: 'Chase Visa',
                type: 'credit_card',
                lastFourDigits: '4532',
                bankName: 'Chase Bank',
                isDefault: true,
                icon: '💳',
                color: '#1E88E5',
            },
        }),
        prisma.paymentMethod.create({
            data: {
                userId: user1.id,
                name: 'Debit Card',
                type: 'debit_card',
                lastFourDigits: '8765',
                bankName: 'Bank of America',
                icon: '💳',
                color: '#43A047',
            },
        }),
        prisma.paymentMethod.create({
            data: {
                userId: user2.id,
                name: 'Cash',
                type: 'cash',
                isDefault: true,
                icon: '💵',
                color: '#4CAF50',
            },
        }),
    ]);

    console.log(`✅ Created ${paymentMethods.length} payment methods`);

    // Create Accounts
    console.log('🏦 Creating accounts...');
    const accounts = await Promise.all([
        prisma.account.create({
            data: {
                userId: user1.id,
                name: 'Checking Account',
                type: 'checking',
                balance: 5000.0,
                currency: 'USD',
                bankName: 'Chase Bank',
                accountNumber: '****1234',
                includeInTotal: true,
                icon: '🏦',
                color: '#1E88E5',
            },
        }),
        prisma.account.create({
            data: {
                userId: user1.id,
                name: 'Savings Account',
                type: 'savings',
                balance: 15000.0,
                currency: 'USD',
                bankName: 'Chase Bank',
                accountNumber: '****5678',
                includeInTotal: true,
                icon: '💰',
                color: '#43A047',
            },
        }),
        prisma.account.create({
            data: {
                userId: user2.id,
                name: 'Cash Wallet',
                type: 'cash',
                balance: 500.0,
                currency: 'USD',
                includeInTotal: true,
                icon: '💵',
                color: '#4CAF50',
            },
        }),
    ]);

    console.log(`✅ Created ${accounts.length} accounts`);

    // Create Account Transactions
    console.log('💸 Creating account transactions...');
    await Promise.all([
        prisma.accountTransaction.create({
            data: {
                accountId: accounts[0].id,
                type: 'credit',
                amount: 5000.0,
                description: 'Salary deposit',
                date: new Date('2025-11-01'),
            },
        }),
        prisma.accountTransaction.create({
            data: {
                accountId: accounts[0].id,
                type: 'debit',
                amount: 500.0,
                description: 'Rent payment',
                date: new Date('2025-11-05'),
            },
        }),
        prisma.accountTransaction.create({
            data: {
                accountId: accounts[1].id,
                type: 'credit',
                amount: 2000.0,
                description: 'Monthly savings',
                date: new Date('2025-11-01'),
            },
        }),
    ]);

    console.log(`✅ Created ${3} account transactions`);

    // Create User Settings
    console.log('⚙️ Creating user settings...');
    await Promise.all([
        prisma.userSettings.create({
            data: {
                userId: user1.id,
                theme: 'dark',
                language: 'en',
                dateFormat: 'MM/DD/YYYY',
                timeFormat: '12h',
                weekStartDay: 'monday',
                notificationEnabled: true,
                emailNotifications: true,
                budgetAlerts: true,
                subscriptionReminders: true,
            },
        }),
        prisma.userSettings.create({
            data: {
                userId: user2.id,
                theme: 'light',
                language: 'en',
                dateFormat: 'DD/MM/YYYY',
                timeFormat: '24h',
                weekStartDay: 'sunday',
                notificationEnabled: true,
                pushNotifications: true,
            },
        }),
    ]);

    console.log(`✅ Created ${2} user settings`);

    console.log('\n✨ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: 3`);
    console.log(`   - Categories: ${createdSystemCategories.length + userCategories.length}`);
    console.log(`   - Expenses: ${expenses.length}`);
    console.log(`   - Split Expenses: 2`);
    console.log(`   - Split Participants: 4`);
    console.log(`   - Loans: 2`);
    console.log(`   - Loan Payments: 2`);
    console.log(`   - Budgets: 3`);
    console.log(`   - Monthly Summaries: 2`);
    console.log(`   - Yearly Summaries: 1`);
    console.log(`   - Notifications: 3`);
    console.log(`   - Audit Logs: 2`);
    console.log(`   - Exchange Rates: 4`);
    console.log(`   - Attachments: 2`);
    console.log(`   - Income Categories: ${incomeCategories.length}`);
    console.log(`   - Income Entries: ${incomes.length}`);
    console.log(`   - Savings Goals: ${savingsGoals.length}`);
    console.log(`   - Savings Contributions: 3`);
    console.log(`   - Subscriptions: ${subscriptions.length}`);
    console.log(`   - Tags: ${tags.length}`);
    console.log(`   - Payment Methods: ${paymentMethods.length}`);
    console.log(`   - Accounts: ${accounts.length}`);
    console.log(`   - Account Transactions: 3`);
    console.log(`   - User Settings: 2`);
    console.log('\n🔐 Test User Credentials:');
    console.log('   Email: john.doe@example.com');
    console.log('   Password: password123');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
