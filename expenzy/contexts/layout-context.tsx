'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LayoutContextType {
    showMobileHeader: boolean;
    showBottomNav: boolean;
    setLayoutVisibility: (options: { showMobileHeader?: boolean; showBottomNav?: boolean }) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
    const [showMobileHeader, setShowMobileHeader] = useState(true);
    const [showBottomNav, setShowBottomNav] = useState(true);

    const setLayoutVisibility = ({ showMobileHeader: header, showBottomNav: nav }: { showMobileHeader?: boolean; showBottomNav?: boolean }) => {
        if (header !== undefined) setShowMobileHeader(header);
        if (nav !== undefined) setShowBottomNav(nav);
    };

    return (
        <LayoutContext.Provider value={{ showMobileHeader, showBottomNav, setLayoutVisibility }}>
            {children}
        </LayoutContext.Provider>
    );
}

export function useLayout() {
    const context = useContext(LayoutContext);
    if (context === undefined) {
        throw new Error('useLayout must be used within a LayoutProvider');
    }
    return context;
}
