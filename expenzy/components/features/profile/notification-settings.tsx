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
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5 lg:mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Bell className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Notifications</h3>
            </div>

            <div className="space-y-4 sm:space-y-5">
                {NOTIFICATION_OPTIONS.map(({ key, label, desc }, index) => (
                    <div key={key}>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <p className="font-medium text-sm">{label}</p>
                                <p className="text-xs text-muted-foreground">{desc}</p>
                            </div>
                            <Switch
                                checked={settings?.[key as keyof UserSettings] as boolean ?? true}
                                onCheckedChange={(checked) => onToggle(key, checked)}
                            />
                        </div>
                        {index < NOTIFICATION_OPTIONS.length - 1 && (
                            <div className="h-px bg-border mt-4 sm:mt-5" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
