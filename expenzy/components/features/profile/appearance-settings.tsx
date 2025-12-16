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
        <div className="pt-2">
            <div className="flex items-center gap-2 mb-3">
                <Palette className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-base">Appearance</h3>
            </div>

            <div className="space-y-1 pl-1">
                <div className="flex items-center justify-between py-2">
                    <div>
                        <p className="font-medium text-sm">Theme</p>
                        <p className="text-[11px] text-muted-foreground">Color scheme</p>
                    </div>
                    <Select
                        value={settings?.theme || 'light'}
                        onValueChange={(value) => onSettingChange('theme', value)}
                    >
                        <SelectTrigger className="w-[120px] h-8 text-xs bg-muted/30 border-none shadow-none">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center justify-between py-2">
                    <div>
                        <p className="font-medium text-sm">Time Format</p>
                        <p className="text-[11px] text-muted-foreground">12 or 24 hour</p>
                    </div>
                    <Select
                        value={settings?.timeFormat || '24h'}
                        onValueChange={(value) => onSettingChange('timeFormat', value)}
                    >
                        <SelectTrigger className="w-[120px] h-8 text-xs bg-muted/30 border-none shadow-none">
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
