'use client';

import { useNotifications, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from '@/lib/hooks/use-notifications';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { formatDate } from '@/lib/utils/format';
import { Bell, Check, CheckCheck, Trash2, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { PageWrapper } from '@/components/layout/page-wrapper';

export default function NotificationsPage() {
    const { data: notifications = [], isLoading } = useNotifications();
    const markAsRead = useMarkAsRead();
    const markAllAsRead = useMarkAllAsRead();
    const deleteNotification = useDeleteNotification();

    const getIcon = (type: string) => {
        switch (type) {
            case 'SUCCESS':
                return <CheckCircle className="w-5 h-5 text-success" />;
            case 'ERROR':
                return <XCircle className="w-5 h-5 text-destructive" />;
            case 'WARNING':
                return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            default:
                return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (isLoading) {
        return <LoadingSkeleton count={5} />;
    }

    return (
        <PageWrapper>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Notifications</h1>
                        <p className="text-muted-foreground">
                            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <Button onClick={() => markAllAsRead.mutate()}>
                            <CheckCheck className="w-4 h-4 mr-2" />
                            Mark All Read
                        </Button>
                    )}
                </div>

                {/* Notifications List */}
                {notifications.length === 0 ? (
                    <EmptyState
                        icon={Bell}
                        title="No notifications"
                        description="You're all caught up! Notifications will appear here."
                    />
                ) : (
                    <div className="space-y-3">
                        {notifications.map((notification) => (
                            <Card
                                key={notification.id}
                                className={`p-4 ${!notification.isRead ? 'border-l-4 border-l-primary bg-primary/5' : ''}`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 mt-1">
                                        {getIcon(notification.type)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h3 className="font-semibold">{notification.title}</h3>
                                            {!notification.isRead && (
                                                <Badge variant="default" className="flex-shrink-0">
                                                    New
                                                </Badge>
                                            )}
                                        </div>

                                        <p className="text-sm text-muted-foreground mb-2">
                                            {notification.message}
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground">
                                                {formatDate(notification.createdAt)}
                                            </span>

                                            <div className="flex gap-2">
                                                {!notification.isRead && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => markAsRead.mutate(notification.id)}
                                                    >
                                                        <Check className="w-4 h-4 mr-1" />
                                                        Mark Read
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => deleteNotification.mutate(notification.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </PageWrapper>
    );
}
