export interface SavingsGoal {
    id: string;
    userId: string;
    name: string;
    description?: string;
    targetAmount: number;
    currentAmount: number;
    currency: string;
    deadline?: string;
    category?: string;
    icon?: string;
    color?: string;
    isCompleted: boolean;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
    contributions?: SavingsContribution[];
}

export interface SavingsContribution {
    id: string;
    savingsGoalId: string;
    amount: number;
    contributionDate: string;
    notes?: string;
    createdAt: string;
}

export interface CreateSavingsGoalDto {
    name: string;
    description?: string;
    targetAmount: number;
    currency?: string;
    targetDate?: string;
    priority?: 'low' | 'medium' | 'high';
    category?: string;
    icon?: string;
    color?: string;
}


export type UpdateSavingsGoalDto = Partial<CreateSavingsGoalDto>;


export interface AddContributionDto {
    amount: number;
    contributionDate: string;
    notes?: string;
}

export interface SavingsGoalProgress {
    goalId: string;
    goalName: string;
    targetAmount: number;
    currentAmount: number;
    progress: number;
    remaining: number;
    daysRemaining?: number;
    isOnTrack: boolean;
    projectedCompletion?: string;
}
