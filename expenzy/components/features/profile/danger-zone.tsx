'use client';

import { AlertTriangle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DangerZoneProps {
    onLogout: () => void;
    onDeleteAccount: () => void;
}

export function DangerZone({ onLogout, onDeleteAccount }: DangerZoneProps) {
    return (
        <div className="rounded-xl bg-card border-2 border-destructive/30 overflow-hidden">
            <div className="bg-destructive/5 p-5 border-b border-destructive/30">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-destructive/10">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
                        <p className="text-sm text-destructive/70">Irreversible actions</p>
                    </div>
                </div>
            </div>
            <div className="p-6 flex flex-wrap gap-3">
                <Button variant="outline" onClick={onLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                </Button>
                <Button variant="destructive" onClick={onDeleteAccount}>
                    Delete Account
                </Button>
            </div>
        </div>
    );
}
