import { z } from 'zod';

export const createSubscriptionSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    description: z.string().optional(),
    amount: z.number().min(0.01, 'Amount must be greater than 0'),
    currency: z.string().optional(),
    billingCycle: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
    startDate: z.date(),
    nextBillingDate: z.date(),
    endDate: z.date().optional(),
    paymentMethod: z.string().optional(),
    reminderDays: z.number().int().min(0).max(30).optional(),
    notes: z.string().max(500, 'Notes are too long').optional(),
}).refine(
    (data) => {
        if (data.endDate) {
            return data.endDate > data.startDate;
        }
        return true;
    },
    {
        message: 'End date must be after start date',
        path: ['endDate'],
    }
).refine(
    (data) => {
        return data.nextBillingDate >= data.startDate;
    },
    {
        message: 'Next billing date must be on or after start date',
        path: ['nextBillingDate'],
    }
);

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
