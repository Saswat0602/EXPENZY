'use client';

import { AlertTriangle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DangerZoneProps {
    onLogout: () => void;
    onDeleteAccount: () => void;
}

export function DangerZone({ onLogout, onDeleteAccount }: DangerZoneProps) {
    return (
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm">
            <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5 lg:mb-6">
                <div className="p-2 bg-destructive/10 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <h3 className="font-semibold text-lg text-destructive">Danger Zone</h3>
            </div>

            <div className="flex flex-wrap gap-3">
                <Button
                    variant="outline"
                    size="default"
                    onClick={onLogout}
                    className="border-destructive/30 hover:bg-destructive/10 text-destructive hover:text-destructive font-medium"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                </Button>
                <Button
                    variant="destructive"
                    size="default"
                    onClick={onDeleteAccount}
                    className="font-medium"
                >
                    Delete Account
                </Button>
            </div>
        </div>
    );
}
