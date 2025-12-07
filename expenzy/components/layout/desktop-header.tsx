'use client';

import { useTheme } from '@/contexts/theme-context';
import { Bell, Moon, Sun } from 'lucide-react';

export function DesktopHeader() {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="hidden md:block fixed top-0 left-0 right-0 z-50 h-16 bg-card border-b border-border">
            <div className="flex items-center justify-between h-full px-6">
                <div className="flex items-center gap-3">
                    <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                        Expenzy
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            if (!document.startViewTransition) {
                                toggleTheme();
                                return;
                            }

                            const root = document.documentElement;
                            root.style.setProperty('--x', `${e.clientX}px`);
                            root.style.setProperty('--y', `${e.clientY}px`);

                            document.startViewTransition(() => {
                                toggleTheme();
                            });
                        }}
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
                </div>
            </div>
        </header>
    );
}
