import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS } from '../api/endpoints';

interface UseAvatarOptions {
    seed?: string;
    style?: string;
    enabled?: boolean;
}

/**
 * Hook to fetch and cache avatar SVG data
 * Uses React Query for automatic caching and deduplication
 */
export function useAvatar({ seed, style, enabled = true }: UseAvatarOptions) {
    return useQuery({
        queryKey: ['avatar', seed, style],
        queryFn: async () => {
            if (!seed) return null;

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const endpoint = style
                ? API_ENDPOINTS.AVATARS.BY_STYLE_AND_SEED(style, seed)
                : API_ENDPOINTS.AVATARS.BY_SEED(seed);

            const url = `${apiUrl}${endpoint}`;

            const response = await fetch(url, {
                mode: 'cors',
                credentials: 'omit',
                headers: {
                    'Accept': 'image/svg+xml,*/*',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch avatar: ${response.status}`);
            }

            const svgText = await response.text();

            // Convert to data URL for inline embedding
            return `data:image/svg+xml,${encodeURIComponent(svgText)}`;
        },
        enabled: enabled && !!seed,
        staleTime: Infinity, // Avatars never change for the same seed
        gcTime: 1000 * 60 * 60 * 24, // Cache for 24 hours (formerly cacheTime)
        retry: 2,
    });
}
