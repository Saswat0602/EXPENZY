export interface Notification {
    id: string;
    userId: string;
    type: 'budget_alert' | 'subscription_reminder' | 'loan_reminder' | 'goal_achieved' | 'group_invite' | 'payment_received' | 'other';
    title: string;
    message: string;
    isRead: boolean;
    actionUrl?: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
    readAt?: string;
}

export interface CreateNotificationDto {
    type: 'budget_alert' | 'subscription_reminder' | 'loan_reminder' | 'goal_achieved' | 'group_invite' | 'payment_received' | 'other';
    title: string;
    message: string;
    actionUrl?: string;
    metadata?: Record<string, unknown>;
}

export interface NotificationSummary {
    unreadCount: number;
    totalCount: number;
    byType: Array<{
        type: string;
        count: number;
    }>;
}
