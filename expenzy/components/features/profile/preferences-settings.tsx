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
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5 lg:mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Settings className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Preferences</h3>
            </div>

            <div className="space-y-4 sm:space-y-5">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <p className="font-medium text-sm">Currency</p>
                        <p className="text-xs text-muted-foreground">Default currency for transactions</p>
                    </div>
                    <Select
                        value={user?.defaultCurrency || 'USD'}
                        onValueChange={onCurrencyChange}
                    >
                        <SelectTrigger className="w-[140px] h-9 text-sm">
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

                <div className="h-px bg-border" />

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <p className="font-medium text-sm">Text Size</p>
                        <p className="text-xs text-muted-foreground">Adjust text display size</p>
                    </div>
                    <Select
                        value={userSettings?.textSize || 'medium'}
                        onValueChange={(value) => onTextSizeChange(value as 'small' | 'medium' | 'large')}
                    >
                        <SelectTrigger className="w-[140px] h-9 text-sm">
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
