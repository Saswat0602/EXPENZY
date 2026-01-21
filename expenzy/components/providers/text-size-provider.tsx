'use client';

import { useEffect } from 'react';
import { useSettings } from '@/lib/hooks/use-settings';

export function TextSizeProvider() {
    const { data: settings, isLoading } = useSettings();

    useEffect(() => {
        // Set default medium size immediately
        if (!document.body.hasAttribute('data-text-size')) {
            document.body.setAttribute('data-text-size', 'medium');
        }
    }, []);

    useEffect(() => {
        // Update when settings load
        if (!isLoading && settings?.textSize) {
            document.body.setAttribute('data-text-size', settings.textSize);
        }
    }, [settings?.textSize, isLoading]);

    return null;
}
