'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, List, BarChart3, Wallet, User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const tabs = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Transactions', href: '/transactions', icon: List },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Budget', href: '/budget', icon: Wallet },
    { name: 'Profile', href: '/profile', icon: User },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-bottom md:hidden">
            <div className="flex items-center justify-around h-16">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    const Icon = tab.icon;

                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={cn(
                                'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                                isActive
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="text-xs font-medium">{tab.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
