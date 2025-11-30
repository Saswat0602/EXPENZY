'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils/cn';
import { LogOut, LayoutDashboard, Receipt, BarChart3, Wallet, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const navigation = [
    { name: 'Dashboard', route: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { name: 'Transactions', route: ROUTES.TRANSACTIONS, icon: Receipt },
    { name: 'Analytics', route: ROUTES.ANALYTICS, icon: BarChart3 },
    { name: 'Budget', route: ROUTES.BUDGET, icon: Wallet },
    { name: 'Profile', route: ROUTES.PROFILE, icon: User },
];

export function DesktopSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sidebar-collapsed');
            return saved === 'true';
        }
        return false;
    });

    // Save collapsed state to localStorage
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
            <div className="flex items-center justify-between h-16 px-6 border-b border-border">
                {!isCollapsed && (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground font-bold">
                            E
                        </div>
                        <span className="text-xl font-bold">Expenzy</span>
                    </div>
                )}
                {isCollapsed && (
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground font-bold mx-auto">
                        E
                    </div>
                )}
            </div>

            {/* Toggle Button */}
            <div className="px-4 py-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleCollapsed}
                    className={cn('w-full', isCollapsed && 'px-2')}
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-4 h-4" />
                    ) : (
                        <>
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Collapse
                        </>
                    )}
                </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = pathname === item.route;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.route}
                            onClick={() => router.push(item.route)}
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full',
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                isCollapsed && 'justify-center px-2'
                            )}
                            title={isCollapsed ? item.name : undefined}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            {!isCollapsed && item.name}
                        </button>
                    );
                })}
            </nav>

            {/* User section */}
            <div className="p-4 border-t border-border">
                {!isCollapsed ? (
                    <>
                        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-semibold flex-shrink-0">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user?.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 w-full px-4 py-3 mt-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            Logout
                        </button>
                    </>
                ) : (
                    <button
                        onClick={logout}
                        className="flex items-center justify-center w-full px-2 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                )}
            </div>
        </aside>
    );
}
