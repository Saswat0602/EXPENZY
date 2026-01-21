import { z } from 'zod';

// ============= EXPENSE VALIDATIONS =============
export const createExpenseSchema = z.object({
    amount: z.number().positive('Amount must be positive'),
    description: z.string().min(1, 'Description is required').max(200),
    categoryId: z.string().min(1, 'Category is required'),
    expenseDate: z.date(),
    notes: z.string().optional(),
    paymentMethodId: z.string().optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

// ============= BUDGET VALIDATIONS =============
export const createBudgetSchema = z.object({
    categoryId: z.string().min(1, 'Category is required'),
    amount: z.number().positive('Amount must be positive'),
    periodType: z.enum(['monthly', 'yearly', 'custom']),
    startDate: z.date(),
    endDate: z.date().optional(),
    alertThreshold: z.number().min(0).max(100).optional(),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;

// ============= GROUP VALIDATIONS =============
export const createGroupSchema = z.object({
    name: z.string().min(1, 'Group name is required').max(100),
    description: z.string().max(500).optional(),
    groupType: z.enum(['home', 'office', 'trip', 'friends', 'other']).default('other'),
    iconSeed: z.string().optional(),
    iconProvider: z.enum(['jdenticon']).optional(),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;

export const updateGroupSchema = z.object({
    name: z.string().min(1, 'Group name is required').max(100),
    description: z.string().max(500).optional(),
});

export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;


// ============= LOAN VALIDATIONS =============
export const createLoanSchema = z.object({
    amount: z.number().positive('Amount must be positive'),
    borrowerName: z.string().min(1, 'Borrower name is required').max(100).optional(),
    lenderName: z.string().min(1, 'Lender name is required').max(100).optional(),
    description: z.string().min(1, 'Description is required').max(200).optional(),
    loanDate: z.date(),
    dueDate: z.date().optional(),
});

export type CreateLoanInput = z.infer<typeof createLoanSchema>;

// ============= CATEGORY VALIDATIONS =============
export const createCategorySchema = z.object({
    name: z.string().min(1, 'Category name is required').max(50),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
    type: z.enum(['EXPENSE', 'INCOME', 'GROUP']),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

// ============= TAG VALIDATIONS =============
export const createTagSchema = z.object({
    name: z.string().min(1, 'Tag name is required').max(50),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;

// ============= PAYMENT METHOD VALIDATIONS =============
export const createPaymentMethodSchema = z.object({
    name: z.string().min(1, 'Name is required').max(50),
    type: z.enum(['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'BANK_TRANSFER', 'OTHER']),
    isDefault: z.boolean().optional(),
});

export type CreatePaymentMethodInput = z.infer<typeof createPaymentMethodSchema>;

// ============= ACCOUNT VALIDATIONS =============
export const createAccountSchema = z.object({
    name: z.string().min(1, 'Account name is required').max(100),
    type: z.enum(['SAVINGS', 'CHECKING', 'CREDIT_CARD', 'CASH', 'INVESTMENT', 'OTHER']),
    balance: z.number().default(0),
    currency: z.string().default('INR'),
    isDefault: z.boolean().optional(),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;

// ============= SAVINGS GOAL VALIDATIONS =============
export const createSavingsGoalSchema = z.object({
    name: z.string().min(1, 'Goal name is required').max(100),
    targetAmount: z.number().positive('Target amount must be positive'),
    currentAmount: z.number().min(0).default(0),
    deadline: z.date().optional(),
    description: z.string().max(500).optional(),
});

export type CreateSavingsGoalInput = z.infer<typeof createSavingsGoalSchema>;

// ============= SUBSCRIPTION VALIDATIONS =============
export const createSubscriptionSchema = z.object({
    name: z.string().min(1, 'Subscription name is required').max(100),
    amount: z.number().positive('Amount must be positive'),
    billingCycle: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
    nextBillingDate: z.date(),
    categoryId: z.string().optional(),
    isActive: z.boolean().default(true),
    notes: z.string().optional(),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
