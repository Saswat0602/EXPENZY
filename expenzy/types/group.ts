import type { Split } from './split';

export interface Group {
    id: string;
    name: string;
    description?: string;
    groupType?: string;
    currency: string;
    createdByUserId: string;
    createdAt: string;
    updatedAt: string;
    members?: GroupMember[];
    groupExpenses?: GroupExpense[];
    _count?: {
        members?: number;
        splitExpenses?: number;
    };
}

export interface GroupMember {
    id: string;
    groupId: string;
    userId: string;
    role: 'ADMIN' | 'MEMBER';
    joinedAt: string;
    inviteStatus?: string;
    user?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        avatar?: string;
    };
}

export interface GroupExpense {
    id: string;
    groupId: string;
    paidByUserId: string;
    amount: number;
    currency: string;
    description: string;
    expenseDate: string;
    category?: {
        id: string;
        name: string;
        icon?: string;
        color?: string;
    };
    paidBy?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
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
    role?: 'ADMIN' | 'MEMBER';
}
