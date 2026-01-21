'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarProvider, useSidebar } from '@/contexts/sidebar-context';
import { LayoutProvider, useLayout } from '@/contexts/layout-context';
import { MobileHeader } from '@/components/layout/mobile-header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { DesktopSidebar } from '@/components/layout/desktop-sidebar';
import { DesktopHeader } from '@/components/layout/desktop-header';
import { cn } from '@/lib/utils/cn';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar();
    const { showMobileHeader, showBottomNav } = useLayout();

    return (
        <div className="min-h-screen bg-background">
            <MobileHeader visible={showMobileHeader} />
            <DesktopHeader />
            <DesktopSidebar />
            <main className={cn(
                "pb-20 md:pb-0 md:pt-16 transition-all duration-300",
                isCollapsed ? "md:ml-20" : "md:ml-64",
                !showBottomNav && "pb-0"
            )}>
                <div className="container max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
            <BottomNav visible={showBottomNav} />
        </div>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <SidebarProvider>
            <LayoutProvider>
                <DashboardLayoutContent>{children}</DashboardLayoutContent>
            </LayoutProvider>
        </SidebarProvider>
    );
}
