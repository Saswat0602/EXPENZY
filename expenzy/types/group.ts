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
    isLocal: boolean;
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
    contactName?: string | null;
    contactAvatar?: string | null;
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
    contact?: {
        id: string;
        contactName?: string | null;
        contactEmail?: string | null;
        contactPhone?: string | null;
        contactAvatar?: string | null;
    } | null;
}

// GroupExpense is now defined in split.ts with more comprehensive fields

export interface CreateGroupDto {
    name: string;
    description?: string;
    currency?: string;
    memberEmails?: string[];
    isLocal?: boolean;
}


export type UpdateGroupDto = Partial<CreateGroupDto>;


export interface AddMemberDto {
    email?: string;
    memberName?: string;
    role?: 'ADMIN' | 'MEMBER';
}
