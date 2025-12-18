'use client';

import { Palette } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { UserSettings } from '@/lib/hooks/use-settings';

interface AppearanceSettingsProps {
    settings: UserSettings | undefined;
    onSettingChange: (key: string, value: string) => void;
}

export function AppearanceSettings({ settings, onSettingChange }: AppearanceSettingsProps) {
    return (
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5 lg:mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Palette className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Appearance</h3>
            </div>

            <div className="space-y-4 sm:space-y-5">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <p className="font-medium text-sm">Theme</p>
                        <p className="text-xs text-muted-foreground">Choose your color scheme</p>
                    </div>
                    <Select
                        value={settings?.theme || 'light'}
                        onValueChange={(value) => onSettingChange('theme', value)}
                    >
                        <SelectTrigger className="w-[140px] h-9 text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="h-px bg-border" />

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <p className="font-medium text-sm">Time Format</p>
                        <p className="text-xs text-muted-foreground">12 or 24 hour display</p>
                    </div>
                    <Select
                        value={settings?.timeFormat || '24h'}
                        onValueChange={(value) => onSettingChange('timeFormat', value)}
                    >
                        <SelectTrigger className="w-[140px] h-9 text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="12h">12-hour</SelectItem>
                            <SelectItem value="24h">24-hour</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
