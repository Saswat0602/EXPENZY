'use client';

import { Download } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { UserSettings } from '@/lib/hooks/use-settings';

interface DataPrivacySettingsProps {
    settings: UserSettings | undefined;
    onSettingChange: (key: string, value: string) => void;
    onToggle: (key: string, value: boolean) => void;
}

export function DataPrivacySettings({ settings, onSettingChange, onToggle }: DataPrivacySettingsProps) {
    return (
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5 lg:mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Download className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Data & Privacy</h3>
            </div>

            <div className="space-y-4 sm:space-y-5">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <p className="font-medium text-sm">Export Format</p>
                        <p className="text-xs text-muted-foreground">Choose file type for exports</p>
                    </div>
                    <Select
                        value={settings?.exportFormat || 'pdf'}
                        onValueChange={(value) => onSettingChange('exportFormat', value)}
                    >
                        <SelectTrigger className="w-[120px] h-9 text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="csv">CSV</SelectItem>
                            <SelectItem value="excel">Excel</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="h-px bg-border" />

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <p className="font-medium text-sm">Auto Backup</p>
                        <p className="text-xs text-muted-foreground">Automatic data backup</p>
                    </div>
                    <Switch
                        checked={settings?.autoBackup ?? false}
                        onCheckedChange={(checked) => onToggle('autoBackup', checked)}
                    />
                </div>
            </div>
        </div>
    );
}
