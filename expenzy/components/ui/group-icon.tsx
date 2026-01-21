'use client';

import { generateJdenticonSvg, GroupIconProvider } from '@/lib/utils/avatar-utils';
import { useMemo } from 'react';
import Image from 'next/image';

interface GroupIconProps {
    seed?: string;
    provider?: GroupIconProvider;
    size?: number;
    fallbackUrl?: string | null;
    className?: string;
}

/**
 * GroupIcon component - displays Jdenticon with fallback support
 */
export function GroupIcon({
    seed,
    provider = 'jdenticon',
    size = 40,
    fallbackUrl,
    className = '',
}: GroupIconProps) {
    const svgContent = useMemo(() => {
        if (seed && provider === 'jdenticon') {
            return generateJdenticonSvg(seed, size);
        }
        return '';
    }, [seed, provider, size]);

    // Use fallback if no seed provided
    if (!seed && fallbackUrl) {
        return (
            <div className={`rounded-lg overflow-hidden ${className}`} style={{ width: size, height: size }}>
                <Image
                    src={fallbackUrl}
                    alt="Group icon"
                    width={size}
                    height={size}
                    className="w-full h-full object-cover"
                />
            </div>
        );
    }

    // Default fallback - use a placeholder
    if (!svgContent && !fallbackUrl) {
        return (
            <div
                className={`rounded-lg bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center ${className}`}
                style={{ width: size, height: size }}
            >
                <span className="text-white font-semibold" style={{ fontSize: size / 2.5 }}>
                    G
                </span>
            </div>
        );
    }

    return (
        <div
            className={`rounded-lg overflow-hidden ${className}`}
            style={{ width: size, height: size }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
        />
    );
}
