'use client';

import { Settings, DollarSign } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { User } from '@/types/user';
import { CURRENCIES } from './constants';

interface PreferencesSettingsProps {
    user: User | undefined;
    onCurrencyChange: (currency: string) => void;
}

export function PreferencesSettings({ user, onCurrencyChange }: PreferencesSettingsProps) {
    return (
        <div className="rounded-xl bg-card border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-muted/50 p-5 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Settings className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Preferences</h3>
                        <p className="text-sm text-muted-foreground">Default settings</p>
                    </div>
                </div>
            </div>
            <div className="p-6">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <div>
                            <p className="font-medium text-sm">Default Currency</p>
                            <p className="text-xs text-muted-foreground">Primary currency</p>
                        </div>
                    </div>
                    <Select
                        value={user?.defaultCurrency || 'USD'}
                        onValueChange={onCurrencyChange}
                    >
                        <SelectTrigger className="w-[180px] h-8">
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
            </div>
        </div>
    );
}
