import { PrismaClient } from '@prisma/client';
import { generateRandomSeed } from '../../src/common/utils/avatar-utils';

type SeedUser = { id: string; email: string };

export async function seedGroups(prisma: PrismaClient, users: { user1: SeedUser; user2: SeedUser; user3: SeedUser }) {
    console.log('👥 Seeding groups...');

    const { user1, user2, user3 } = users;

    const existingGroup = await prisma.group.findFirst({
        where: {
            name: 'Roommates',
            createdByUserId: user1.id,
        },
    });

    const group1 = existingGroup
        ? await prisma.group.update({
            where: { id: existingGroup.id },
            data: {
                description: 'Shared apartment expenses',
                groupType: 'home',
                currency: 'INR',
                icon: 'home',
                color: 'blue',
                simplifyDebts: true,
                allowNonMembers: false,
            },
        })
        : await prisma.group.create({
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

    console.log(`✅ Upserted 1 group`);

    // Create Group Members
    console.log('👤 Seeding group members...');
    await prisma.groupMember.upsert({
        where: {
            groupId_userId: {
                groupId: group1.id,
                userId: user1.id,
            },
        },
        update: {
            role: 'ADMIN',
            inviteStatus: 'accepted',
        },
        create: {
            groupId: group1.id,
            userId: user1.id,
            role: 'ADMIN',
            inviteStatus: 'accepted',
            joinedAt: new Date(),
        },
    });

    await prisma.groupMember.upsert({
        where: {
            groupId_userId: {
                groupId: group1.id,
                userId: user2.id,
            },
        },
        update: {
            role: 'MEMBER',
            inviteStatus: 'accepted',
        },
        create: {
            groupId: group1.id,
            userId: user2.id,
            role: 'MEMBER',
            inviteStatus: 'accepted',
            joinedAt: new Date(),
        },
    });

    await prisma.groupMember.upsert({
        where: {
            groupId_userId: {
                groupId: group1.id,
                userId: user3.id,
            },
        },
        update: {
            role: 'MEMBER',
            inviteStatus: 'accepted',
        },
        create: {
            groupId: group1.id,
            userId: user3.id,
            role: 'MEMBER',
            inviteStatus: 'accepted',
            joinedAt: new Date(),
        },
    });

    console.log(`✅ Upserted 3 group members`);

    // Create user contacts
    console.log('📇 Seeding user contacts...');
    await prisma.userContact.upsert({
        where: {
            userId_contactUserId: {
                userId: user1.id,
                contactUserId: user2.id,
            },
        },
        update: {},
        create: {
            userId: user1.id,
            contactUserId: user2.id,
        },
    });

    await prisma.userContact.upsert({
        where: {
            userId_contactUserId: {
                userId: user1.id,
                contactUserId: user3.id,
            },
        },
        update: {},
        create: {
            userId: user1.id,
            contactUserId: user3.id,
        },
    });

    await prisma.userContact.upsert({
        where: {
            userId_contactUserId: {
                userId: user2.id,
                contactUserId: user1.id,
            },
        },
        update: {},
        create: {
            userId: user2.id,
            contactUserId: user1.id,
        },
    });

    await prisma.userContact.upsert({
        where: {
            userId_contactUserId: {
                userId: user2.id,
                contactUserId: user3.id,
            },
        },
        update: {},
        create: {
            userId: user2.id,
            contactUserId: user3.id,
        },
    });

    await prisma.userContact.upsert({
        where: {
            userId_contactUserId: {
                userId: user3.id,
                contactUserId: user1.id,
            },
        },
        update: {},
        create: {
            userId: user3.id,
            contactUserId: user1.id,
        },
    });

    await prisma.userContact.upsert({
        where: {
            userId_contactUserId: {
                userId: user3.id,
                contactUserId: user2.id,
            },
        },
        update: {},
        create: {
            userId: user3.id,
            contactUserId: user2.id,
        },
    });

    console.log(`✅ Upserted 6 user contacts`);

    return { group1 };
}
