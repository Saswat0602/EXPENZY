/**
 * Avatar utility functions for generating user avatars and group icons
 */

export const USER_AVATAR_STYLES = ['adventurer', 'adventurer-neutral', 'thumbs', 'fun-emoji'] as const;
export const GROUP_ICON_PROVIDERS = ['jdenticon'] as const;

export type UserAvatarStyle = (typeof USER_AVATAR_STYLES)[number];
export type GroupIconProvider = (typeof GROUP_ICON_PROVIDERS)[number];

/**
 * Generate a random seed for avatar/icon generation
 * @returns Random UUID-like string
 */
export function generateRandomSeed(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Generate avatar URL from backend API
 * @param seed - Unique seed for avatar generation
 * @returns Backend API URL for avatar
 */
export function generateAvatarUrl(seed: string): string {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return `${apiUrl}/api/avatars/${encodeURIComponent(seed)}.svg`;
}

/**
 * Generate Jdenticon SVG string for group icons
 * @param seed - Unique seed for icon generation
 * @param size - Size of the icon in pixels (default: 40)
 * @returns SVG string
 */
export function generateJdenticonSvg(seed: string, size: number = 40): string {
    if (typeof window === 'undefined') return '';

    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const jdenticon = require('jdenticon');
        return jdenticon.toSvg(seed, size);
    } catch {
        return '';
    }
}
