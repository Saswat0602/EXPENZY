'use client';

import { useEffect } from 'react';
import { useSettings } from '@/lib/hooks/use-settings';

export function TextSizeProvider() {
    const { data: settings } = useSettings();

    useEffect(() => {
        if (settings?.textSize) {
            document.body.setAttribute('data-text-size', settings.textSize);
        }
    }, [settings?.textSize]);

    return null;
}
