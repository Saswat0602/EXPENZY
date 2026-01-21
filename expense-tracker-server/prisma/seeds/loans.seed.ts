import { PrismaClient } from '@prisma/client';

type SeedUser = { id: string };

export async function seedLoans(prisma: PrismaClient, users: { user1: SeedUser; user2: SeedUser; user3: SeedUser }) {
    console.log('💵 Seeding loans...');

    const { user1, user2, user3 } = users;

    const loanData = [
        // Loans with Jane Smith (user2) - 6 transactions
        {
            lenderUserId: user1.id,
            borrowerUserId: user2.id,
            amount: 10000,
            description: 'Emergency loan',
            loanDate: new Date('2025-11-01'),
            dueDate: new Date('2025-12-31'),
            status: 'active' as const,
            amountPaid: 4000,
            amountRemaining: 6000,
            interestRate: 0,
        },
        {
            lenderUserId: user2.id,
            borrowerUserId: user1.id,
            amount: 5000,
            description: 'Laptop purchase loan',
            loanDate: new Date('2025-10-15'),
            dueDate: new Date('2025-12-15'),
            status: 'paid' as const,
            amountPaid: 5000,
            amountRemaining: 0,
            interestRate: 0,
        },
        {
            lenderUserId: user1.id,
            borrowerUserId: user2.id,
            amount: 3000,
            description: 'Phone purchase',
            loanDate: new Date('2025-08-20'),
            dueDate: new Date('2025-10-20'),
            status: 'paid' as const,
            amountPaid: 3000,
            amountRemaining: 0,
            interestRate: 0,
        },
        {
            lenderUserId: user1.id,
            borrowerUserId: user2.id,
            amount: 7500,
            description: 'Vacation advance',
            loanDate: new Date('2025-07-10'),
            dueDate: new Date('2025-12-10'),
            status: 'active' as const,
            amountPaid: 3500,
            amountRemaining: 4000,
            interestRate: 0,
        },
        {
            lenderUserId: user2.id,
            borrowerUserId: user1.id,
            amount: 2000,
            description: 'Dinner split',
            loanDate: new Date('2025-09-05'),
            dueDate: new Date('2025-11-05'),
            status: 'paid' as const,
            amountPaid: 2000,
            amountRemaining: 0,
            interestRate: 0,
        },
        {
            lenderUserId: user1.id,
            borrowerUserId: user2.id,
            amount: 4500,
            description: 'Bike repair',
            loanDate: new Date('2025-06-15'),
            dueDate: new Date('2025-09-15'),
            status: 'paid' as const,
            amountPaid: 4500,
            amountRemaining: 0,
            interestRate: 0,
        },
        // Loans with Bob Wilson (user3) - 9 transactions
        {
            lenderUserId: user1.id,
            borrowerUserId: user3.id,
            amount: 15000,
            description: 'Business investment',
            loanDate: new Date('2025-11-20'),
            dueDate: new Date('2026-02-20'),
            status: 'active' as const,
            amountPaid: 0,
            amountRemaining: 15000,
            interestRate: 5,
        },
        {
            lenderUserId: user1.id,
            borrowerUserId: user3.id,
            amount: 5000,
            description: 'Car repair help',
            loanDate: new Date('2025-10-05'),
            dueDate: new Date('2025-12-05'),
            status: 'active' as const,
            amountPaid: 2000,
            amountRemaining: 3000,
            interestRate: 0,
        },
        {
            lenderUserId: user1.id,
            borrowerUserId: user3.id,
            amount: 8000,
            description: 'Medical expenses',
            loanDate: new Date('2025-09-15'),
            dueDate: new Date('2025-11-15'),
            status: 'paid' as const,
            amountPaid: 8000,
            amountRemaining: 0,
            interestRate: 0,
        },
        {
            lenderUserId: user3.id,
            borrowerUserId: user1.id,
            amount: 3500,
            description: 'Concert tickets',
            loanDate: new Date('2025-08-10'),
            dueDate: new Date('2025-10-10'),
            status: 'paid' as const,
            amountPaid: 3500,
            amountRemaining: 0,
            interestRate: 0,
        },
        {
            lenderUserId: user1.id,
            borrowerUserId: user3.id,
            amount: 6000,
            description: 'Laptop upgrade',
            loanDate: new Date('2025-07-20'),
            dueDate: new Date('2025-10-20'),
            status: 'paid' as const,
            amountPaid: 6000,
            amountRemaining: 0,
            interestRate: 0,
        },
        {
            lenderUserId: user3.id,
            borrowerUserId: user1.id,
            amount: 2500,
            description: 'Gym membership',
            loanDate: new Date('2025-06-25'),
            dueDate: new Date('2025-09-25'),
            status: 'paid' as const,
            amountPaid: 2500,
            amountRemaining: 0,
            interestRate: 0,
        },
        {
            lenderUserId: user1.id,
            borrowerUserId: user3.id,
            amount: 4000,
            description: 'Furniture purchase',
            loanDate: new Date('2025-05-15'),
            dueDate: new Date('2025-08-15'),
            status: 'paid' as const,
            amountPaid: 4000,
            amountRemaining: 0,
            interestRate: 0,
        },
        {
            lenderUserId: user1.id,
            borrowerUserId: user3.id,
            amount: 9000,
            description: 'House deposit',
            loanDate: new Date('2025-04-10'),
            dueDate: new Date('2025-12-10'),
            status: 'active' as const,
            amountPaid: 4000,
            amountRemaining: 5000,
            interestRate: 0,
        },
        {
            lenderUserId: user3.id,
            borrowerUserId: user1.id,
            amount: 1500,
            description: 'Book purchase',
            loanDate: new Date('2025-03-20'),
            dueDate: new Date('2025-06-20'),
            status: 'paid' as const,
            amountPaid: 1500,
            amountRemaining: 0,
            interestRate: 0,
        },
    ];

    const createdLoans: Array<{
        id: string;
        lenderUserId: string;
        borrowerUserId: string;
        description: string | null;
    }> = [];
    for (const loan of loanData) {
        const existing = await prisma.loan.findFirst({
            where: {
                lenderUserId: loan.lenderUserId,
                borrowerUserId: loan.borrowerUserId,
                description: loan.description,
                loanDate: loan.loanDate,
            },
        });

        const created = existing
            ? await prisma.loan.update({
                where: { id: existing.id },
                data: {
                    amount: loan.amount,
                    dueDate: loan.dueDate,
                    status: loan.status,
                    amountPaid: loan.amountPaid,
                    amountRemaining: loan.amountRemaining,
                    interestRate: loan.interestRate,
                },
            })
            : await prisma.loan.create({
                data: {
                    lenderUserId: loan.lenderUserId,
                    borrowerUserId: loan.borrowerUserId,
                    amount: loan.amount,
                    currency: 'INR',
                    description: loan.description,
                    loanDate: loan.loanDate,
                    dueDate: loan.dueDate,
                    status: loan.status,
                    amountPaid: loan.amountPaid,
                    amountRemaining: loan.amountRemaining,
                    interestRate: loan.interestRate,
                },
            });

        createdLoans.push(created);
    }

    console.log(`✅ Upserted ${createdLoans.length} loans`);

    // Create Loan Adjustments
    console.log('💳 Seeding loan adjustments...');

    // Find the specific loans for adjustments
    const loan1 = createdLoans.find(
        (l) => l.lenderUserId === user1.id && l.borrowerUserId === user2.id && l.description === 'Emergency loan',
    );
    const loan2 = createdLoans.find(
        (l) => l.lenderUserId === user2.id && l.borrowerUserId === user1.id && l.description === 'Laptop purchase loan',
    );

    const adjustmentData: Array<{
        loanId: string;
        adjustmentType: 'payment';
        amount: number;
        paymentDate: Date;
        paymentMethod: string;
        notes: string;
        createdBy: string;
    }> = [];

    if (loan1) {
        adjustmentData.push(
            {
                loanId: loan1.id,
                adjustmentType: 'payment' as const,
                amount: 2000,
                paymentDate: new Date('2025-11-10'),
                paymentMethod: 'bank_transfer',
                notes: 'First installment',
                createdBy: user2.id,
            },
            {
                loanId: loan1.id,
                adjustmentType: 'payment' as const,
                amount: 2000,
                paymentDate: new Date('2025-11-20'),
                paymentMethod: 'upi',
                notes: 'Second installment',
                createdBy: user2.id,
            },
        );
    }

    if (loan2) {
        adjustmentData.push(
            {
                loanId: loan2.id,
                adjustmentType: 'payment' as const,
                amount: 2500,
                paymentDate: new Date('2025-10-25'),
                paymentMethod: 'cash',
                notes: 'First payment',
                createdBy: user1.id,
            },
            {
                loanId: loan2.id,
                adjustmentType: 'payment' as const,
                amount: 2500,
                paymentDate: new Date('2025-11-05'),
                paymentMethod: 'upi',
                notes: 'Final payment',
                createdBy: user1.id,
            },
        );
    }

    for (const adjustment of adjustmentData) {
        const existing = await prisma.loanAdjustment.findFirst({
            where: {
                loanId: adjustment.loanId,
                paymentDate: adjustment.paymentDate,
                amount: adjustment.amount,
            },
        });

        if (existing) {
            await prisma.loanAdjustment.update({
                where: { id: existing.id },
                data: {
                    adjustmentType: adjustment.adjustmentType,
                    paymentMethod: adjustment.paymentMethod,
                    notes: adjustment.notes,
                },
            });
        } else {
            await prisma.loanAdjustment.create({
                data: {
                    loanId: adjustment.loanId,
                    adjustmentType: adjustment.adjustmentType,
                    amount: adjustment.amount,
                    currency: 'INR',
                    paymentDate: adjustment.paymentDate,
                    paymentMethod: adjustment.paymentMethod,
                    notes: adjustment.notes,
                    createdBy: adjustment.createdBy,
                },
            });
        }
    }

    console.log(`✅ Upserted ${adjustmentData.length} loan adjustments`);

    return { loanCount: createdLoans.length, adjustmentCount: adjustmentData.length };
}
