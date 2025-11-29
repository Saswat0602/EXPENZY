'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, List, BarChart3, Wallet, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/contexts/auth-context';

const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Transactions', href: '/transactions', icon: List },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Budget', href: '/budget', icon: Wallet },
    { name: 'Profile', href: '/profile', icon: User },
];

export function DesktopSidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    return (
        <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 md:border-r md:border-border md:bg-card">
            {/* Logo */}
            <div className="flex items-center gap-3 h-16 px-6 border-b border-border">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground font-bold">
                    E
                </div>
                <span className="text-xl font-bold">Expenzy</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* User section */}
            <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-semibold">
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
            </div>
        </aside>
    );
}
