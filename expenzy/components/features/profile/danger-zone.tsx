'use client';

import { AlertTriangle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DangerZoneProps {
    onLogout: () => void;
    onDeleteAccount: () => void;
}

export function DangerZone({ onLogout, onDeleteAccount }: DangerZoneProps) {
    return (
        <div className="pt-2">
            <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <h3 className="font-semibold text-base text-destructive">Danger Zone</h3>
            </div>

            <div className="flex flex-wrap gap-2.5 pl-1">
                <Button variant="outline" size="sm" onClick={onLogout} className="border-destructive/30 hover:bg-destructive/5 text-destructive hover:text-destructive h-8">
                    <LogOut className="w-3.5 h-3.5 mr-2" />
                    Logout
                </Button>
                <Button variant="destructive" size="sm" onClick={onDeleteAccount} className="h-8">
                    Delete Account
                </Button>
            </div>
        </div>
    );
}
