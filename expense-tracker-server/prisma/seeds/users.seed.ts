import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { generateRandomSeed } from '../../src/common/utils/avatar-utils';

const AVATAR_STYLES = ['adventurer', 'adventurer_neutral', 'thumbs', 'fun_emoji'];

function getRandomStyle() {
    return AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
}

export async function seedUsers(prisma: PrismaClient) {
    console.log('👤 Seeding users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user1 = await prisma.user.upsert({
        where: { email: 'john.doe@example.com' },
        update: {
            firstName: 'John',
            lastName: 'Doe',
            phone: '+1234567890',
            defaultCurrency: 'INR',
            timezone: 'America/New_York',
            isActive: true,
            isVerified: true,
            lastLoginAt: new Date(),
        },
        create: {
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

    const user2 = await prisma.user.upsert({
        where: { email: 'jane.smith@example.com' },
        update: {
            firstName: 'Jane',
            lastName: 'Smith',
            phone: '+1234567891',
            defaultCurrency: 'INR',
            timezone: 'America/Los_Angeles',
            isActive: true,
            isVerified: true,
            lastLoginAt: new Date(),
        },
        create: {
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

    const user3 = await prisma.user.upsert({
        where: { email: 'bob.wilson@example.com' },
        update: {
            firstName: 'Bob',
            lastName: 'Wilson',
            googleId: 'google_123456789',
            defaultCurrency: 'EUR',
            timezone: 'Europe/London',
            isActive: true,
            isVerified: true,
            lastLoginAt: new Date(),
        },
        create: {
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

    console.log(`✅ Upserted 3 users`);

    // Create user settings
    console.log('⚙️ Seeding user settings...');
    await prisma.userSettings.upsert({
        where: { userId: user1.id },
        update: {
            theme: 'dark',
            language: 'en',
            defaultView: 'dashboard',
            notificationEnabled: true,
            budgetAlerts: true,
            loanReminders: true,
        },
        create: {
            userId: user1.id,
            theme: 'dark',
            language: 'en',
            defaultView: 'dashboard',
            notificationEnabled: true,
            budgetAlerts: true,
            loanReminders: true,
        },
    });

    console.log(`✅ Upserted user settings`);

    return { user1, user2, user3 };
}
