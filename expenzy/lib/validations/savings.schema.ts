import { z } from 'zod';

export const createSavingsGoalSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    description: z.string().max(500, 'Description is too long').optional(),
    targetAmount: z.number().min(0.01, 'Target amount must be greater than 0'),
    currency: z.string().optional(),
    targetDate: z.date().optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
}).refine(
    (data) => {
        if (data.targetDate) {
            return data.targetDate > new Date();
        }
        return true;
    },
    {
        message: 'Target date must be in the future',
        path: ['targetDate'],
    }
);

export type CreateSavingsGoalInput = z.infer<typeof createSavingsGoalSchema>;
