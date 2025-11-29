import { z } from 'zod';

// Auth Schemas
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;

// Expense Schemas
export const expenseSchema = z.object({
    categoryId: z.string().min(1, 'Category is required'),
    amount: z.number().positive('Amount must be positive'),
    currency: z.string().optional(),
    description: z.string().min(1, 'Description is required'),
    expenseDate: z.string().min(1, 'Date is required'),
    paymentMethod: z.string().optional(),
    notes: z.string().optional(),
    isRecurring: z.boolean().optional(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;

// Income Schemas
export const incomeSchema = z.object({
    categoryId: z.string().min(1, 'Category is required'),
    amount: z.number().positive('Amount must be positive'),
    currency: z.string().optional(),
    source: z.string().min(1, 'Source is required'),
    description: z.string().optional(),
    incomeDate: z.string().min(1, 'Date is required'),
    paymentMethod: z.string().optional(),
    notes: z.string().optional(),
    isRecurring: z.boolean().optional(),
});

export type IncomeFormData = z.infer<typeof incomeSchema>;

// Budget Schemas
export const budgetSchema = z.object({
    categoryId: z.string().optional(),
    amount: z.number().positive('Amount must be positive'),
    currency: z.string().optional(),
    periodType: z.enum(['weekly', 'monthly', 'quarterly', 'yearly', 'custom']),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    alertThreshold: z.number().min(0).max(100).optional(),
});

export type BudgetFormData = z.infer<typeof budgetSchema>;

// Category Schemas
export const categorySchema = z.object({
    name: z.string().min(1, 'Name is required'),
    icon: z.string().optional(),
    color: z.string().optional(),
    type: z.enum(['expense', 'income']),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
