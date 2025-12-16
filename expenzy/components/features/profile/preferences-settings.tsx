'use client';

import { Settings } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { User } from '@/types/user';
import type { UserSettings } from '@/lib/hooks/use-settings';
import { CURRENCIES } from './constants';

interface PreferencesSettingsProps {
    user: User | undefined;
    userSettings: UserSettings | undefined;
    onCurrencyChange: (currency: string) => void;
    onTextSizeChange: (textSize: 'small' | 'medium' | 'large') => void;
}

export function PreferencesSettings({ user, userSettings, onCurrencyChange, onTextSizeChange }: PreferencesSettingsProps) {
    return (
        <div className="pt-2">
            <div className="flex items-center gap-2 mb-3">
                <Settings className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-base">Preferences</h3>
            </div>

            <div className="space-y-1 pl-1">
                <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                        <div>
                            <p className="font-medium text-sm">Currency</p>
                        </div>
                    </div>
                    <Select
                        value={user?.defaultCurrency || 'USD'}
                        onValueChange={onCurrencyChange}
                    >
                        <SelectTrigger className="w-[120px] h-8 text-xs bg-muted/30 border-none shadow-none">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {CURRENCIES.map((currency) => (
                                <SelectItem key={currency.value} value={currency.value}>
                                    {currency.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                        <div>
                            <p className="font-medium text-sm">Text Size</p>
                        </div>
                    </div>
                    <Select
                        value={userSettings?.textSize || 'medium'}
                        onValueChange={(value) => onTextSizeChange(value as 'small' | 'medium' | 'large')}
                    >
                        <SelectTrigger className="w-[120px] h-8 text-xs bg-muted/30 border-none shadow-none">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
