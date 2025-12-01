'use client';

import { Download, FileText, HardDrive } from 'lucide-react';
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
        <div className="rounded-xl bg-card border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-muted/50 p-5 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Download className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Data & Privacy</h3>
                        <p className="text-sm text-muted-foreground">Export and backup</p>
                    </div>
                </div>
            </div>
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <div>
                            <p className="font-medium text-sm">Export Format</p>
                            <p className="text-xs text-muted-foreground">File type</p>
                        </div>
                    </div>
                    <Select
                        value={settings?.exportFormat || 'pdf'}
                        onValueChange={(value) => onSettingChange('exportFormat', value)}
                    >
                        <SelectTrigger className="w-[120px] h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="csv">CSV</SelectItem>
                            <SelectItem value="excel">Excel</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                        <HardDrive className="w-4 h-4 text-muted-foreground" />
                        <div>
                            <p className="font-medium text-sm">Auto Backup</p>
                            <p className="text-xs text-muted-foreground">Automatic backup</p>
                        </div>
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
