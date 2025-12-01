'use client';

import { Bell } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import type { UserSettings } from '@/lib/hooks/use-settings';

interface NotificationSettingsProps {
    settings: UserSettings | undefined;
    onToggle: (key: string, value: boolean) => void;
}

const NOTIFICATION_OPTIONS = [
    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Updates via email' },
    { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser notifications' },
    { key: 'budgetAlerts', label: 'Budget Alerts', desc: 'Exceeding limits' },
    { key: 'subscriptionReminders', label: 'Subscription Reminders', desc: 'Upcoming renewals' },
    { key: 'loanReminders', label: 'Loan Reminders', desc: 'Payment due dates' },
] as const;

export function NotificationSettings({ settings, onToggle }: NotificationSettingsProps) {
    return (
        <div className="rounded-xl bg-card border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-muted/50 p-5 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Bell className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Notifications</h3>
                        <p className="text-sm text-muted-foreground">Alert preferences</p>
                    </div>
                </div>
            </div>
            <div className="p-6 space-y-3">
                {NOTIFICATION_OPTIONS.map(({ key, label, desc }) => (
                    <div
                        key={key}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                        <div>
                            <p className="font-medium text-sm">{label}</p>
                            <p className="text-xs text-muted-foreground">{desc}</p>
                        </div>
                        <Switch
                            checked={settings?.[key as keyof UserSettings] as boolean ?? true}
                            onCheckedChange={(checked) => onToggle(key, checked)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
