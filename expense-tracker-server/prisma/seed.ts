import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { generateRandomSeed } from '../src/common/utils/avatar-utils';

const prisma = new PrismaClient();

const AVATAR_STYLES = ['adventurer', 'adventurer_neutral', 'thumbs', 'fun_emoji'];

function getRandomStyle() {
    return AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
}

async function main() {
    console.log('🌱 Starting database seeding...');

    // Clear existing data (in reverse order of dependencies)
    console.log('🧹 Cleaning existing data...');
    await prisma.savingsContribution.deleteMany();
    await prisma.savingsGoal.deleteMany();
    await prisma.income.deleteMany();
    await prisma.userSettings.deleteMany();
    await prisma.loanAdjustment.deleteMany();
    await prisma.loan.deleteMany();
    await prisma.splitParticipant.deleteMany();
    await prisma.splitExpense.deleteMany();
    await prisma.expense.deleteMany();
    await prisma.recurringPattern.deleteMany();
    await prisma.budget.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.category.deleteMany();
    await prisma.settlement.deleteMany();
    await prisma.groupExpenseSplit.deleteMany();
    await prisma.groupExpense.deleteMany();
    await prisma.groupMember.deleteMany();
    await prisma.userContact.deleteMany();
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
            defaultCurrency: 'INR',
            timezone: 'America/New_York',
            isActive: true,
            isVerified: true,
            lastLoginAt: new Date(),
            avatarSeed: generateRandomSeed(),
            avatarStyle: getRandomStyle() as any,
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
            defaultCurrency: 'INR',
            timezone: 'America/Los_Angeles',
            isActive: true,
            isVerified: true,
            lastLoginAt: new Date(),
            avatarSeed: generateRandomSeed(),
            avatarStyle: getRandomStyle() as any,
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
            avatarSeed: generateRandomSeed(),
            avatarStyle: getRandomStyle() as any,
        },
    });

    console.log(`✅ Created 3 users with avatar seeds`);

    // Create System Categories
    console.log('📁 Creating system categories...');
    const systemCategories: Array<{
        name: string;
        icon: string;
        color: string;
        type: 'EXPENSE' | 'INCOME' | 'GROUP';
    }> = [
            // Expense Categories
            { name: 'food', icon: 'Utensils', color: 'text-orange-500', type: 'EXPENSE' },
            { name: 'beverages', icon: 'Coffee', color: 'text-amber-600', type: 'EXPENSE' },
            { name: 'groceries', icon: 'ShoppingBasket', color: 'text-green-500', type: 'EXPENSE' },
            { name: 'travel', icon: 'Plane', color: 'text-blue-500', type: 'EXPENSE' },
            { name: 'bills', icon: 'Receipt', color: 'text-yellow-500', type: 'EXPENSE' },
            { name: 'entertainment', icon: 'Film', color: 'text-pink-500', type: 'EXPENSE' },
            { name: 'shopping', icon: 'ShoppingBag', color: 'text-purple-500', type: 'EXPENSE' },
            { name: 'health', icon: 'HeartPulse', color: 'text-red-500', type: 'EXPENSE' },
            { name: 'education', icon: 'GraduationCap', color: 'text-cyan-500', type: 'EXPENSE' },
            { name: 'investments', icon: 'TrendingUp', color: 'text-teal-500', type: 'EXPENSE' },
            { name: 'fees', icon: 'HandCoins', color: 'text-amber-600', type: 'EXPENSE' },
            { name: 'home', icon: 'Home', color: 'text-indigo-500', type: 'EXPENSE' },
            { name: 'fuel', icon: 'Fuel', color: 'text-slate-600', type: 'EXPENSE' },
            { name: 'personal_care', icon: 'Sparkles', color: 'text-pink-400', type: 'EXPENSE' },
            { name: 'kids_family', icon: 'Baby', color: 'text-rose-400', type: 'EXPENSE' },
            { name: 'insurance', icon: 'ShieldCheck', color: 'text-blue-600', type: 'EXPENSE' },
            { name: 'taxes', icon: 'Landmark', color: 'text-slate-700', type: 'EXPENSE' },
            { name: 'subscriptions', icon: 'PlaySquare', color: 'text-purple-600', type: 'EXPENSE' },
            { name: 'electronics', icon: 'Laptop', color: 'text-gray-600', type: 'EXPENSE' },
            { name: 'repairs_maintenance', icon: 'Wrench', color: 'text-orange-600', type: 'EXPENSE' },
            { name: 'fitness_sports', icon: 'Dumbbell', color: 'text-emerald-500', type: 'EXPENSE' },
            { name: 'charity', icon: 'HeartHandshake', color: 'text-red-400', type: 'EXPENSE' },
            { name: 'business_work', icon: 'Briefcase', color: 'text-slate-500', type: 'EXPENSE' },
            { name: 'gifts', icon: 'Gift', color: 'text-pink-500', type: 'EXPENSE' },
            { name: 'events', icon: 'PartyPopper', color: 'text-yellow-400', type: 'EXPENSE' },
            { name: 'transport', icon: 'Bus', color: 'text-blue-400', type: 'EXPENSE' },
            { name: 'rent', icon: 'KeyRound', color: 'text-indigo-600', type: 'EXPENSE' },
            { name: 'utilities', icon: 'Droplets', color: 'text-cyan-600', type: 'EXPENSE' },
            { name: 'dining_out', icon: 'ChefHat', color: 'text-orange-400', type: 'EXPENSE' },
            { name: 'online_services', icon: 'Cloud', color: 'text-sky-500', type: 'EXPENSE' },
            { name: 'loans_credit', icon: 'CreditCard', color: 'text-red-600', type: 'EXPENSE' },
            { name: 'other', icon: 'MoreHorizontal', color: 'text-gray-500', type: 'EXPENSE' },

            // Income Categories
            { name: 'salary', icon: 'Banknote', color: 'text-green-600', type: 'INCOME' },
            { name: 'freelance', icon: 'Briefcase', color: 'text-blue-600', type: 'INCOME' },
            { name: 'business', icon: 'Building', color: 'text-slate-600', type: 'INCOME' },
            { name: 'investment', icon: 'TrendingUp', color: 'text-teal-600', type: 'INCOME' },

            // Group Categories
            { name: 'rent', icon: 'KeyRound', color: 'text-indigo-600', type: 'GROUP' },
            { name: 'utilities', icon: 'Droplets', color: 'text-cyan-600', type: 'GROUP' },
            { name: 'groceries', icon: 'ShoppingBasket', color: 'text-green-500', type: 'GROUP' },
            { name: 'household', icon: 'Home', color: 'text-blue-500', type: 'GROUP' },
            { name: 'internet_cable', icon: 'Wifi', color: 'text-purple-500', type: 'GROUP' },
            { name: 'cleaning', icon: 'Sparkles', color: 'text-pink-400', type: 'GROUP' },
            { name: 'furniture', icon: 'Sofa', color: 'text-amber-600', type: 'GROUP' },
            { name: 'repairs', icon: 'Wrench', color: 'text-orange-600', type: 'GROUP' },
            { name: 'entertainment', icon: 'Film', color: 'text-pink-500', type: 'GROUP' },
            { name: 'dining', icon: 'ChefHat', color: 'text-orange-400', type: 'GROUP' },
            { name: 'transportation', icon: 'Bus', color: 'text-blue-400', type: 'GROUP' },
            { name: 'other', icon: 'MoreHorizontal', color: 'text-gray-500', type: 'GROUP' },
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

    console.log(`✅ Created ${createdSystemCategories.length} system categories`);

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

    console.log(`✅ Created 1 recurring pattern`);

    // Create Expenses
    console.log('💸 Creating expenses...');
    const expenses = await Promise.all([
        // Food & Dining
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[0].id, // food
                amount: 450,
                currency: 'INR',
                description: 'Lunch at Italian Restaurant',
                expenseDate: new Date('2025-11-25'),
                paymentMethod: 'credit_card',
            },
        }),
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[28].id, // dining_out
                amount: 850,
                currency: 'INR',
                description: 'Dinner with friends',
                expenseDate: new Date('2025-11-28'),
                paymentMethod: 'upi',
            },
        }),
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[2].id, // groceries
                amount: 2500,
                currency: 'INR',
                description: 'Weekly groceries',
                expenseDate: new Date('2025-11-20'),
                paymentMethod: 'debit_card',
            },
        }),
        // Transportation
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[25].id, // transport
                amount: 250,
                currency: 'INR',
                description: 'Uber to office',
                expenseDate: new Date('2025-11-26'),
                paymentMethod: 'debit_card',
            },
        }),
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[12].id, // fuel
                amount: 3000,
                currency: 'INR',
                description: 'Petrol for car',
                expenseDate: new Date('2025-11-15'),
                paymentMethod: 'cash',
            },
        }),
        // Bills & Utilities (Recurring)
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[4].id, // bills
                amount: 1200,
                currency: 'INR',
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
                categoryId: createdSystemCategories[27].id, // utilities
                amount: 800,
                currency: 'INR',
                description: 'Water bill',
                expenseDate: new Date('2025-11-05'),
                paymentMethod: 'upi',
            },
        }),
        // Entertainment & Shopping
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[5].id, // entertainment
                amount: 600,
                currency: 'INR',
                description: 'Movie tickets',
                expenseDate: new Date('2025-11-22'),
                paymentMethod: 'credit_card',
            },
        }),
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[6].id, // shopping
                amount: 4500,
                currency: 'INR',
                description: 'New clothes',
                expenseDate: new Date('2025-11-18'),
                paymentMethod: 'credit_card',
            },
        }),
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[18].id, // electronics
                amount: 15000,
                currency: 'INR',
                description: 'Wireless headphones',
                expenseDate: new Date('2025-11-10'),
                paymentMethod: 'credit_card',
            },
        }),
        // Health & Fitness
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[7].id, // health
                amount: 1500,
                currency: 'INR',
                description: 'Doctor consultation',
                expenseDate: new Date('2025-11-12'),
                paymentMethod: 'cash',
            },
        }),
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[20].id, // fitness_sports
                amount: 3000,
                currency: 'INR',
                description: 'Gym membership',
                expenseDate: new Date('2025-11-01'),
                paymentMethod: 'upi',
            },
        }),
        // Subscriptions & Online Services
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[17].id, // subscriptions
                amount: 199,
                currency: 'INR',
                description: 'Netflix subscription',
                expenseDate: new Date('2025-11-01'),
                paymentMethod: 'credit_card',
            },
        }),
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[29].id, // online_services
                amount: 299,
                currency: 'INR',
                description: 'Spotify Premium',
                expenseDate: new Date('2025-11-01'),
                paymentMethod: 'credit_card',
            },
        }),
        // Other
        prisma.expense.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[23].id, // gifts
                amount: 2000,
                currency: 'INR',
                description: 'Birthday gift for friend',
                expenseDate: new Date('2025-11-16'),
                paymentMethod: 'upi',
            },
        }),
        // Jane's expenses
        prisma.expense.create({
            data: {
                userId: user2.id,
                categoryId: createdSystemCategories[0].id, // food
                amount: 350,
                currency: 'INR',
                description: 'Breakfast at cafe',
                expenseDate: new Date('2025-11-27'),
                paymentMethod: 'credit_card',
            },
        }),
        prisma.expense.create({
            data: {
                userId: user2.id,
                categoryId: createdSystemCategories[6].id, // shopping
                amount: 5500,
                currency: 'INR',
                description: 'New shoes',
                expenseDate: new Date('2025-11-19'),
                paymentMethod: 'debit_card',
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
            currency: 'INR',
            splitType: 'equal',
            paidByUserId: user1.id,
            description: 'Team lunch split',
        },
    });

    console.log(`✅ Created 1 split expense`);

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
    ]);

    console.log(`✅ Created 2 split participants`);

    // Create Loans
    console.log('💵 Creating loans...');
    const loan1 = await prisma.loan.create({
        data: {
            lenderUserId: user1.id,
            borrowerUserId: user2.id,
            amount: 10000,
            currency: 'INR',
            description: 'Emergency loan',
            loanDate: new Date('2025-11-01'),
            dueDate: new Date('2025-12-31'),
            status: 'active',
            amountPaid: 4000,
            amountRemaining: 6000,
            interestRate: 0,
        },
    });

    const loan2 = await prisma.loan.create({
        data: {
            lenderUserId: user2.id,
            borrowerUserId: user1.id,
            amount: 5000,
            currency: 'INR',
            description: 'Laptop purchase loan',
            loanDate: new Date('2025-10-15'),
            dueDate: new Date('2025-12-15'),
            status: 'paid',
            amountPaid: 5000,
            amountRemaining: 0,
            interestRate: 0,
        },
    });

    const loan3 = await prisma.loan.create({
        data: {
            lenderUserId: user1.id,
            borrowerUserId: user3.id,
            amount: 15000,
            currency: 'INR',
            description: 'Business investment',
            loanDate: new Date('2025-11-20'),
            dueDate: new Date('2026-02-20'),
            status: 'active',
            amountPaid: 0,
            amountRemaining: 15000,
            interestRate: 5,
        },
    });

    console.log(`✅ Created 3 loans`);

    // Create Loan Adjustments (replaces LoanPayment)
    console.log('💳 Creating loan adjustments...');
    await Promise.all([
        // Loan 1 adjustments (John lent to Jane)
        prisma.loanAdjustment.create({
            data: {
                loanId: loan1.id,
                adjustmentType: 'payment',
                amount: 2000,
                currency: 'INR',
                paymentDate: new Date('2025-11-10'),
                paymentMethod: 'bank_transfer',
                notes: 'First installment',
                createdBy: user2.id,
            },
        }),
        prisma.loanAdjustment.create({
            data: {
                loanId: loan1.id,
                adjustmentType: 'payment',
                amount: 2000,
                currency: 'INR',
                paymentDate: new Date('2025-11-20'),
                paymentMethod: 'upi',
                notes: 'Second installment',
                createdBy: user2.id,
            },
        }),
        // Loan 2 adjustments (Jane lent to John - fully paid)
        prisma.loanAdjustment.create({
            data: {
                loanId: loan2.id,
                adjustmentType: 'payment',
                amount: 2500,
                currency: 'INR',
                paymentDate: new Date('2025-10-25'),
                paymentMethod: 'cash',
                notes: 'First payment',
                createdBy: user1.id,
            },
        }),
        prisma.loanAdjustment.create({
            data: {
                loanId: loan2.id,
                adjustmentType: 'payment',
                amount: 2500,
                currency: 'INR',
                paymentDate: new Date('2025-11-05'),
                paymentMethod: 'upi',
                notes: 'Final payment',
                createdBy: user1.id,
            },
        }),
        // Loan 3 has no payments yet (new loan)
    ]);

    console.log(`✅ Created 4 loan adjustments`);

    // Create Groups
    console.log('👥 Creating groups...');
    const group1 = await prisma.group.create({
        data: {
            name: 'Roommates',
            description: 'Shared apartment expenses',
            groupType: 'home',
            currency: 'INR',
            icon: 'home',
            color: 'blue',
            simplifyDebts: true,
            allowNonMembers: false,
            createdByUserId: user1.id,
            iconSeed: generateRandomSeed(),
            iconProvider: 'jdenticon' as any,
        },
    });

    console.log(`✅ Created 1 group`);

    // Create Group Members
    console.log('👤 Creating group members...');
    await Promise.all([
        prisma.groupMember.create({
            data: {
                groupId: group1.id,
                userId: user1.id,
                role: 'ADMIN',
                inviteStatus: 'accepted',
                joinedAt: new Date(),
            },
        }),
        prisma.groupMember.create({
            data: {
                groupId: group1.id,
                userId: user2.id,
                role: 'MEMBER',
                inviteStatus: 'accepted',
                joinedAt: new Date(),
            },
        }),
        prisma.groupMember.create({
            data: {
                groupId: group1.id,
                userId: user3.id,
                role: 'MEMBER',
                inviteStatus: 'accepted',
                joinedAt: new Date(),
            },
        }),
    ]);

    console.log(`✅ Created 3 group members`);

    // Create Group Expenses
    console.log('💰 Creating group expenses...');
    const groupExpenses = await Promise.all([
        prisma.groupExpense.create({
            data: {
                groupId: group1.id,
                paidByUserId: user1.id,
                categoryId: createdSystemCategories[12].id, // rent
                amount: 3000,
                currency: 'INR',
                description: 'Monthly rent',
                expenseDate: new Date('2025-11-01'),
                splitType: 'equal',
                splits: {
                    create: [
                        {
                            userId: user1.id,
                            amountOwed: 1000,
                            amountPaid: 3000,
                            isPaid: true,
                        },
                        {
                            userId: user2.id,
                            amountOwed: 1000,
                            amountPaid: 0,
                            isPaid: false,
                        },
                        {
                            userId: user3.id,
                            amountOwed: 1000,
                            amountPaid: 0,
                            isPaid: false,
                        },
                    ],
                },
            },
        }),
        prisma.groupExpense.create({
            data: {
                groupId: group1.id,
                paidByUserId: user2.id,
                categoryId: createdSystemCategories[13].id, // utilities
                amount: 1200,
                currency: 'INR',
                description: 'Electricity bill',
                expenseDate: new Date('2025-11-05'),
                splitType: 'equal',
                splits: {
                    create: [
                        {
                            userId: user1.id,
                            amountOwed: 400,
                            amountPaid: 0,
                            isPaid: false,
                        },
                        {
                            userId: user2.id,
                            amountOwed: 400,
                            amountPaid: 1200,
                            isPaid: true,
                        },
                        {
                            userId: user3.id,
                            amountOwed: 400,
                            amountPaid: 0,
                            isPaid: false,
                        },
                    ],
                },
            },
        }),
    ]);

    console.log(`✅ Created ${groupExpenses.length} group expenses`);

    // Create Income
    console.log('💰 Creating income entries...');
    const incomes = await Promise.all([
        prisma.income.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[32].id, // salary
                amount: 75000,
                currency: 'INR',
                source: 'Monthly Salary',
                description: 'November salary',
                incomeDate: new Date('2025-11-01'),
                paymentMethod: 'bank_transfer',
            },
        }),
        prisma.income.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[32].id, // salary
                amount: 75000,
                currency: 'INR',
                source: 'Monthly Salary',
                description: 'December salary',
                incomeDate: new Date('2025-12-01'),
                paymentMethod: 'bank_transfer',
            },
        }),
        prisma.income.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[33].id, // freelance
                amount: 25000,
                currency: 'INR',
                source: 'Freelance Project',
                description: 'Website development project',
                incomeDate: new Date('2025-11-15'),
                paymentMethod: 'upi',
            },
        }),
        prisma.income.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[35].id, // investment
                amount: 5000,
                currency: 'INR',
                source: 'Dividend',
                description: 'Stock dividend payout',
                incomeDate: new Date('2025-11-20'),
                paymentMethod: 'bank_transfer',
            },
        }),
        prisma.income.create({
            data: {
                userId: user2.id,
                categoryId: createdSystemCategories[32].id, // salary
                amount: 65000,
                currency: 'INR',
                source: 'Monthly Salary',
                description: 'November salary',
                incomeDate: new Date('2025-11-01'),
                paymentMethod: 'bank_transfer',
            },
        }),
    ]);

    console.log(`✅ Created ${incomes.length} income entries`);

    // Create Budgets
    console.log('💼 Creating budgets...');
    await Promise.all([
        prisma.budget.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[0].id, // food
                amount: 5000,
                currency: 'INR',
                periodType: 'monthly',
                startDate: new Date('2025-11-01'),
                endDate: new Date('2025-11-30'),
                spentAmount: 1300, // 26% - on track
            },
        }),
        prisma.budget.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[5].id, // entertainment
                amount: 2000,
                currency: 'INR',
                periodType: 'monthly',
                startDate: new Date('2025-11-01'),
                endDate: new Date('2025-11-30'),
                spentAmount: 600, // 30% - on track
            },
        }),
        prisma.budget.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[6].id, // shopping
                amount: 5000,
                currency: 'INR',
                periodType: 'monthly',
                startDate: new Date('2025-11-01'),
                endDate: new Date('2025-11-30'),
                spentAmount: 10000, // 200% - exceeded!
            },
        }),
        prisma.budget.create({
            data: {
                userId: user1.id,
                categoryId: createdSystemCategories[25].id, // transport
                amount: 4000,
                currency: 'INR',
                periodType: 'monthly',
                startDate: new Date('2025-11-01'),
                endDate: new Date('2025-11-30'),
                spentAmount: 3250, // 81% - warning
            },
        }),
    ]);

    console.log(`✅ Created 4 budgets`);

    // Create Savings Goals
    console.log('🎯 Creating savings goals...');
    const savingsGoals = await Promise.all([
        prisma.savingsGoal.create({
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
        }),
    ]);

    console.log(`✅ Created ${savingsGoals.length} savings goals`);

    // Create Savings Contributions
    console.log('💰 Creating savings contributions...');
    await Promise.all([
        prisma.savingsContribution.create({
            data: {
                savingsGoalId: savingsGoals[0].id,
                amount: 500.0,
                currency: 'INR',
                contributionDate: new Date('2025-11-01'),
                notes: 'Monthly contribution',
            },
        }),
    ]);

    console.log(`✅ Created 1 savings contribution`);

    // Create User Settings
    console.log('⚙️ Creating user settings...');
    await Promise.all([
        prisma.userSettings.create({
            data: {
                userId: user1.id,
                theme: 'dark',
                language: 'en',
                defaultView: 'dashboard',
                notificationEnabled: true,
                budgetAlerts: true,
                loanReminders: true,
            },
        }),
    ]);

    console.log(`✅ Created 1 user settings`);

    // Summary
    console.log('\n✨ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: 3`);
    console.log(`   - Categories: ${createdSystemCategories.length}`);
    console.log(`   - Expenses: ${expenses.length}`);
    console.log(`   - Split Expenses: 1`);
    console.log(`   - Split Participants: 2`);
    console.log(`   - Loans: 1`);
    console.log(`   - Loan Adjustments: 2`);
    console.log(`   - Groups: 1`);
    console.log(`   - Group Members: 3`);
    console.log(`   - Group Expenses: ${groupExpenses.length}`);
    console.log(`   - Income Entries: ${incomes.length}`);
    console.log(`   - Budgets: 1`);
    console.log(`   - Savings Goals: ${savingsGoals.length}`);
    console.log(`   - Savings Contributions: 1`);
    console.log(`   - User Settings: 1`);
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
