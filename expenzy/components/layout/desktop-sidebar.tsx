'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils/cn';
import {
    LayoutDashboard,
    Receipt,
    BarChart3,
    Wallet,
    User,
    ChevronLeft,
    ChevronRight,
    PiggyBank,
    Calendar,
    Users,
    HandCoins
} from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const navigation = [
    { name: 'Dashboard', route: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { name: 'Transactions', route: ROUTES.TRANSACTIONS, icon: Receipt },
    { name: 'Analytics', route: ROUTES.ANALYTICS, icon: BarChart3 },
    { name: 'Budget', route: ROUTES.BUDGET, icon: Wallet },
    { name: 'Savings', route: ROUTES.SAVINGS, icon: PiggyBank },
    { name: 'Subscriptions', route: ROUTES.SUBSCRIPTIONS, icon: Calendar },
    { name: 'Groups', route: ROUTES.GROUPS, icon: Users },
    { name: 'Loans', route: ROUTES.LOANS, icon: HandCoins },
    { name: 'Profile', route: ROUTES.PROFILE, icon: User },
];

export function DesktopSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sidebar-collapsed');
            return saved === 'true';
        }
        return false;
    });

    const toggleCollapsed = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('sidebar-collapsed', String(newState));
    };

    return (
        <aside
            className={cn(
                'hidden md:flex md:flex-col md:fixed md:inset-y-0 md:border-r md:border-border md:bg-card transition-all duration-300',
                isCollapsed ? 'md:w-20' : 'md:w-64'
            )}
        >
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-6">
                {!isCollapsed && (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold shadow-lg">
                            E
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                            Expenzy
                        </span>
                    </div>
                )}
                {isCollapsed && (
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold shadow-lg mx-auto">
                        E
                    </div>
                )}
            </div>

            {/* Toggle Button */}
            <div className="px-4 py-3">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleCollapsed}
                    className={cn(
                        'w-full justify-start gap-2 hover:bg-accent',
                        isCollapsed && 'justify-center px-2'
                    )}
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-4 h-4" />
                    ) : (
                        <>
                            <ChevronLeft className="w-4 h-4" />
                            <span className="text-sm">Collapse</span>
                        </>
                    )}
                </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = pathname === item.route;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.route}
                            onClick={() => router.push(item.route)}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full group',
                                isActive
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                                isCollapsed && 'justify-center px-2'
                            )}
                            title={isCollapsed ? item.name : undefined}
                        >
                            <Icon className={cn(
                                'w-5 h-5 flex-shrink-0',
                                isActive && 'text-primary-foreground',
                                !isActive && 'group-hover:scale-110 transition-transform'
                            )} />
                            {!isCollapsed && (
                                <span className="truncate">{item.name}</span>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* User Info - Always visible when not collapsed */}
            {!isCollapsed && user && (
                <div className="px-4 pb-4">
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
                        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground font-bold text-sm flex-shrink-0">
                            {user.firstName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                                {user.firstName && user.lastName
                                    ? `${user.firstName} ${user.lastName}`
                                    : user.firstName || user.username || 'User'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Collapsed User Avatar */}
            {isCollapsed && user && (
                <div className="px-4 pb-4 flex justify-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold shadow-md">
                        {user.firstName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                </div>
            )}
        </aside>
    );
}
