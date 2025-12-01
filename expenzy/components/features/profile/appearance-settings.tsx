'use client';

import { Palette, Clock } from 'lucide-react';
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
        <div className="rounded-xl bg-card border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-muted/50 p-5 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Palette className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Appearance</h3>
                        <p className="text-sm text-muted-foreground">Customize visual preferences</p>
                    </div>
                </div>
            </div>
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                        <Palette className="w-4 h-4 text-muted-foreground" />
                        <div>
                            <p className="font-medium text-sm">Theme</p>
                            <p className="text-xs text-muted-foreground">Color scheme</p>
                        </div>
                    </div>
                    <Select
                        value={settings?.theme || 'light'}
                        onValueChange={(value) => onSettingChange('theme', value)}
                    >
                        <SelectTrigger className="w-[140px] h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                            <p className="font-medium text-sm">Time Format</p>
                            <p className="text-xs text-muted-foreground">12 or 24 hour</p>
                        </div>
                    </div>
                    <Select
                        value={settings?.timeFormat || '24h'}
                        onValueChange={(value) => onSettingChange('timeFormat', value)}
                    >
                        <SelectTrigger className="w-[140px] h-8">
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
