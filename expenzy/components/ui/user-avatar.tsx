'use client';

import { LetterAvatar } from './letter-avatar';
import { useAvatar } from '@/lib/hooks/use-avatar';

interface UserAvatarProps {
    seed?: string;
    style?: string;
    size?: number;
    fallbackUrl?: string | null;
    fallbackName?: string;
    className?: string;
}

/**
 * UserAvatar component - displays avatar from backend API with fallback support
 * Uses React Query for caching and automatic deduplication
 */
export function UserAvatar({
    seed,
    style,
    size = 40,
    fallbackUrl,
    fallbackName = 'User',
    className = '',
}: UserAvatarProps) {
    const { data: avatarDataUrl, isLoading, isError } = useAvatar({
        seed,
        style,
        enabled: !fallbackUrl, // Only fetch if no fallback URL
    });

    // Show letter avatar while loading, on error, or if no seed
    if (isLoading || isError || (!avatarDataUrl && !fallbackUrl)) {
        return (
            <LetterAvatar
                name={fallbackName}
                size={size}
                className={className}
            />
        );
    }

    const displayUrl = avatarDataUrl || fallbackUrl;

    return (
        <div className={`rounded-full overflow-hidden ${className}`} style={{ width: size, height: size }}>
            <img
                src={String(displayUrl!)}
                alt={`${fallbackName}'s avatar`}
                width={size}
                height={size}
                className="object-cover"
            />
        </div>
    );
}
