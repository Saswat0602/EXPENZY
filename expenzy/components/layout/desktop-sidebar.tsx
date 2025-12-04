'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useSidebar } from '@/contexts/sidebar-context';
import { cn } from '@/lib/utils/cn';
import {
    LayoutDashboard,
    Receipt,
    BarChart3,
    Wallet,
    ChevronLeft,
    ChevronRight,
    PiggyBank,
    Calendar,
    Users,
    HandCoins
} from 'lucide-react';
import { ROUTES } from '@/lib/routes';
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
];

export function DesktopSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();
    const { isCollapsed, toggleSidebar } = useSidebar();

    return (
        <aside
            className={cn(
                'hidden md:flex md:flex-col md:fixed md:inset-y-0 md:border-r md:border-border md:bg-card transition-all duration-300 pt-16',
                isCollapsed ? 'md:w-20' : 'md:w-64'
            )}
        >
            {/* Toggle Button */}
            <div className="px-4 py-4 mt-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSidebar}
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
                    // Special handling for Dashboard - only active on exact match
                    const isActive = item.route === ROUTES.DASHBOARD
                        ? pathname === item.route
                        : pathname === item.route || pathname.startsWith(item.route + '/');
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
                    <button
                        onClick={() => router.push(ROUTES.PROFILE)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-accent/50 hover:bg-accent transition-colors cursor-pointer group"
                    >
                        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground font-bold text-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                            {user.firstName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                                {user.firstName && user.lastName
                                    ? `${user.firstName} ${user.lastName}`
                                    : user.firstName || user.username || 'User'}
                            </p>
                        </div>
                    </button>
                </div>
            )}

            {/* Collapsed User Avatar */}
            {isCollapsed && user && (
                <div className="px-4 pb-4 flex justify-center">
                    <button
                        onClick={() => router.push(ROUTES.PROFILE)}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold shadow-md hover:scale-110 transition-transform cursor-pointer"
                        title="Go to Profile"
                    >
                        {user.firstName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                    </button>
                </div>
            )}
        </aside>
    );
}
