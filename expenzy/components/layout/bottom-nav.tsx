'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { LayoutDashboard, Receipt, BarChart3, HandCoins, Users } from 'lucide-react';
import { ROUTES } from '@/lib/routes';

const tabs = [
    { name: 'Home', route: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { name: 'Transactions', route: ROUTES.TRANSACTIONS, icon: Receipt },
    { name: 'Groups', route: ROUTES.GROUPS, icon: Users },
    { name: 'Loans', route: ROUTES.LOANS, icon: HandCoins },
    // { name: 'Budget', route: ROUTES.BUDGET, icon: Wallet },
    // { name: 'Subscriptions', route: ROUTES.SUBSCRIPTIONS, icon: Calendar },

    { name: 'Analytics', route: ROUTES.ANALYTICS, icon: BarChart3 },
];

interface BottomNavProps {
    visible?: boolean;
}

export function BottomNav({ visible = true }: BottomNavProps) {
    const pathname = usePathname();
    const router = useRouter();

    if (!visible) return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-bottom md:hidden">
            <div className="flex items-center justify-around h-16">
                {tabs.map((tab) => {
                    // Special handling for Dashboard - only active on exact match
                    let isActive = tab.route === ROUTES.DASHBOARD
                        ? pathname === tab.route
                        : pathname === tab.route || pathname.startsWith(tab.route + '/');

                    // Special case: highlight Transactions when on recurring expenses page
                    if (tab.route === ROUTES.TRANSACTIONS && pathname === ROUTES.RECURRING_EXPENSES) {
                        isActive = true;
                    }

                    const Icon = tab.icon;

                    return (
                        <button
                            key={tab.route}
                            onClick={() => router.push(tab.route)}
                            className={cn(
                                'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                                isActive
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="text-xs font-medium">{tab.name}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
