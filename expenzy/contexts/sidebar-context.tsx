'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextType {
    isCollapsed: boolean;
    toggleSidebar: () => void;
}

// Provide a default value to prevent undefined context errors
const defaultContextValue: SidebarContextType = {
    isCollapsed: false,
    toggleSidebar: () => { },
};

const SidebarContext = createContext<SidebarContextType>(defaultContextValue);

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Load saved state from localStorage
        const saved = localStorage.getItem('sidebar-collapsed');
        if (saved === 'true') {
            setIsCollapsed(true);
        }
        setMounted(true);
    }, []);

    const toggleSidebar = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('sidebar-collapsed', String(newState));
    };

    const value = {
        isCollapsed: mounted ? isCollapsed : false,
        toggleSidebar,
    };

    return (
        <SidebarContext.Provider value={value}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    return context;
}
