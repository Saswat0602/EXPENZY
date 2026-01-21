import { PrismaClient } from '@prisma/client';
import { seedUsers } from './seeds/users.seed';
import { seedCategories } from './seeds/categories.seed';
import { seedGroups } from './seeds/groups.seed';
import { seedTransactions } from './seeds/transactions.seed';
import { seedLoans } from './seeds/loans.seed';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');
    console.log('📝 Using UPSERT operations - existing data will be preserved\n');

    // Seed users and user settings
    const users = await seedUsers(prisma);

    // Seed system categories
    const categoryLookup = await seedCategories(prisma);

    // Seed groups and group members
    const { group1 } = await seedGroups(prisma, users);

    // Seed transactions (expenses, income, budgets, savings, group expenses)
    const { groupExpenseCount } = await seedTransactions(prisma, users, group1, categoryLookup);

    // Seed loans and loan adjustments
    const { loanCount, adjustmentCount } = await seedLoans(prisma, users);

    // Summary
    console.log('\n✨ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: 3`);
    console.log(`   - System Categories: 48`);
    console.log(`   - Personal Expenses: 17`);
    console.log(`   - Income Entries: 5`);
    console.log(`   - Budgets: 4`);
    console.log(`   - Savings Goals: 1`);
    console.log(`   - Savings Contributions: 1`);
    console.log(`   - Groups: 1`);
    console.log(`   - Group Members: 3`);
    console.log(`   - User Contacts: 6`);
    console.log(`   - Group Expenses (Roommates): ${groupExpenseCount}`);
    console.log(`   - Loans: ${loanCount}`);
    console.log(`   - Loan Adjustments: ${adjustmentCount}`);
    console.log(`   - User Settings: 1`);
    console.log('\n🔐 Test User Credentials:');
    console.log('   Email: john.doe@example.com');
    console.log('   Password: password123');
    console.log('\n💡 Note: Running this seed again will UPDATE existing data, not duplicate it.');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
