'use client';

import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { Bell, Moon, Sun, LogOut } from 'lucide-react';

export function DesktopHeader() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="hidden md:block fixed top-0 left-0 right-0 z-50 h-16 bg-card border-b border-border">
            <div className="flex items-center justify-between h-full px-6">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold shadow-lg">
                        E
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                        Expenzy
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? (
                            <Sun className="w-5 h-5" />
                        ) : (
                            <Moon className="w-5 h-5" />
                        )}
                    </button>

                    <button
                        className="p-2 rounded-lg hover:bg-muted transition-colors relative"
                        aria-label="Notifications"
                    >
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
                    </button>

                    {user && (
                        <button
                            onClick={logout}
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                            aria-label="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
