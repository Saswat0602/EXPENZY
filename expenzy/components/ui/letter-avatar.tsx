'use client';

interface LetterAvatarProps {
    name: string;
    size?: number;
    className?: string;
}

/**
 * Generate a consistent color based on a string
 * @param str - Input string (name, email, etc.)
 * @returns HSL color string
 */
function stringToColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Generate hue from hash (0-360)
    const hue = Math.abs(hash % 360);

    // Use high saturation and medium lightness for vibrant, accessible colors
    return `hsl(${hue}, 70%, 50%)`;
}

/**
 * Get initials from name
 * @param name - Full name or username
 * @returns 1-2 letter initials
 */
function getInitials(name: string): string {
    if (!name) return '?';

    const cleaned = name.trim();
    const words = cleaned.split(/\s+/);

    if (words.length >= 2) {
        // First letter of first two words
        return (words[0][0] + words[1][0]).toUpperCase();
    }

    // First letter or first two letters of single word
    return cleaned.substring(0, 2).toUpperCase();
}

/**
 * LetterAvatar - Fallback avatar showing user initials
 * Used when avatar image fails to load
 */
export function LetterAvatar({ name, size = 40, className = '' }: LetterAvatarProps) {
    const initials = getInitials(name);
    const backgroundColor = stringToColor(name);

    return (
        <div
            className={`rounded-full flex items-center justify-center text-white font-semibold ${className}`}
            style={{
                width: size,
                height: size,
                backgroundColor,
                fontSize: size / 2.5,
            }}
            title={name}
        >
            {initials}
        </div>
    );
}
