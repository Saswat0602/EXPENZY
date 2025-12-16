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
        <div className="pt-2">
            <div className="flex items-center gap-2 mb-3">
                <Bell className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-base">Notifications</h3>
            </div>

            <div className="space-y-1 pl-1">
                {NOTIFICATION_OPTIONS.map(({ key, label, desc }) => (
                    <div
                        key={key}
                        className="flex items-center justify-between py-2"
                    >
                        <div>
                            <p className="font-medium text-sm">{label}</p>
                            <p className="text-[11px] text-muted-foreground">{desc}</p>
                        </div>
                        <Switch
                            className="scale-90"
                            checked={settings?.[key as keyof UserSettings] as boolean ?? true}
                            onCheckedChange={(checked) => onToggle(key, checked)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
