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
        <div className="pt-2">
            <div className="flex items-center gap-2 mb-3">
                <Download className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-base">Data & Privacy</h3>
            </div>

            <div className="space-y-1 pl-1">
                <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                        <div>
                            <p className="font-medium text-sm">Export Format</p>
                            <p className="text-[11px] text-muted-foreground">File type</p>
                        </div>
                    </div>
                    <Select
                        value={settings?.exportFormat || 'pdf'}
                        onValueChange={(value) => onSettingChange('exportFormat', value)}
                    >
                        <SelectTrigger className="w-[100px] h-8 text-xs bg-muted/30 border-none shadow-none">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="csv">CSV</SelectItem>
                            <SelectItem value="excel">Excel</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                        <div>
                            <p className="font-medium text-sm">Auto Backup</p>
                            <p className="text-[11px] text-muted-foreground">Automatic backup</p>
                        </div>
                    </div>
                    <Switch
                        className="scale-90"
                        checked={settings?.autoBackup ?? false}
                        onCheckedChange={(checked) => onToggle('autoBackup', checked)}
                    />
                </div>
            </div>
        </div>
    );
}
