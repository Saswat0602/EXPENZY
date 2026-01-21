'use client';

import { useReminders, useMarkReminderAsRead, useDeleteReminder, type Reminder } from '@/lib/hooks/use-reminders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export function RemindersList() {
    const { data: reminders, isLoading } = useReminders();
    const markAsRead = useMarkReminderAsRead();
    const deleteReminder = useDeleteReminder();

    const getReminderTypeColor = (type: string) => {
        switch (type) {
            case 'payment':
                return 'bg-red-500';
            case 'subscription':
                return 'bg-blue-500';
            case 'loan':
                return 'bg-orange-500';
            default:
                return 'bg-gray-500';
        }
    };

    if (isLoading) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">Loading reminders...</p>
            </div>
        );
    }

    if (!reminders || reminders.length === 0) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center py-8">
                        <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">No reminders set</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {reminders.map((reminder: Reminder) => (
                <Card key={reminder.id} className={reminder.isRead ? 'opacity-60' : ''}>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2">
                                    <Bell className="h-5 w-5" />
                                    <CardTitle className="text-lg">{reminder.title}</CardTitle>
                                </div>
                                <CardDescription>
                                    <Badge className={getReminderTypeColor(reminder.type)}>
                                        {reminder.type}
                                    </Badge>
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                {!reminder.isRead && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => markAsRead.mutate(reminder.id)}
                                        disabled={markAsRead.isPending}
                                    >
                                        <Check className="h-4 w-4 text-green-500" />
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteReminder.mutate(reminder.id)}
                                    disabled={deleteReminder.isPending}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm mb-4">{reminder.message}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(reminder.reminderDate), 'PPP')}</span>
                        </div>
                        {reminder.actionUrl && reminder.actionLabel && (
                            <div className="mt-4">
                                <Button variant="outline" size="sm" asChild>
                                    <a href={reminder.actionUrl}>{reminder.actionLabel}</a>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
