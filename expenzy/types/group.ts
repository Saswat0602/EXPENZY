import type { GroupExpense } from './split';

export interface Group {
    id: string;
    name: string;
    description?: string;
    groupType?: string;
    currency: string;
    iconSeed?: string;
    iconProvider?: string;
    iconUrl?: string;
    imageUrl?: string;
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
    userId: string | null;
    role: 'ADMIN' | 'MEMBER';
    joinedAt: string | null;
    inviteStatus?: string;
    inviteToken?: string | null;
    invitedEmail?: string | null;
    user?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        username: string;
        avatar?: string;
        avatarSeed?: string;
        avatarStyle?: string;
        avatarUrl?: string;
    } | null;
}

// GroupExpense is now defined in split.ts with more comprehensive fields

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
