import type { Split } from './split';

export interface Group {
    id: string;
    name: string;
    description?: string;
    currency: string;
    createdById: string;
    createdAt: string;
    updatedAt: string;
    members?: GroupMember[];
    expenses?: GroupExpense[];
}

export interface GroupMember {
    id: string;
    groupId: string;
    userId: string;
    role: 'admin' | 'member';
    joinedAt: string;
    user?: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
    };
}

export interface GroupExpense {
    id: string;
    groupId: string;
    paidById: string;
    amount: number;
    currency: string;
    description: string;
    expenseDate: string;
    category?: string;
    createdAt: string;
    splits?: Split[];
}

export interface CreateGroupDto {
    name: string;
    description?: string;
    currency?: string;
    memberEmails?: string[];
}


export type UpdateGroupDto = Partial<CreateGroupDto>;


export interface AddMemberDto {
    email: string;
    role?: 'admin' | 'member';
}
