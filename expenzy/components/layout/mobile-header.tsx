'use client';

import { useTheme } from '@/contexts/theme-context';
import { Bell, Moon, Sun } from 'lucide-react';

interface MobileHeaderProps {
    visible?: boolean;
}

export function MobileHeader({ visible = true }: MobileHeaderProps) {
    const { theme, toggleTheme } = useTheme();

    if (!visible) return null;

    return (
        <header className="md:hidden sticky top-0 z-40 w-full bg-card border-b border-border safe-top">
            <div className="flex items-center justify-between h-14 px-4">
                <div className="flex items-center gap-2">

                    <h1 className="text-lg font-bold">Expenzy</h1>
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
