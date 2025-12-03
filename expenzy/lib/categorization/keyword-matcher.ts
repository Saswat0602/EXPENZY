/**
 * Frontend Keyword Matcher for Instant Categorization
 * 
 * This provides instant category suggestions as users type,
 * without needing to call the backend ML service.
 */

import React from 'react';

export class KeywordMatcher {
    private keywords: Record<string, string[]> = {};
    private isLoaded = false;

    /**
     * Load keywords from backend
     */
    async loadKeywords(): Promise<void> {
        try {
            // Try to load user-specific keywords (requires auth)
            const response = await fetch('/api/categorization/keywords', {
                credentials: 'include',
            });

            if (response.ok) {
                this.keywords = await response.json();
                this.isLoaded = true;
                return;
            }
        } catch (error) {
            console.warn('Failed to load user keywords, falling back to system keywords');
        }

        // Fallback to system keywords (public endpoint)
        try {
            const response = await fetch('/api/categorization/keywords/system');
            if (response.ok) {
                this.keywords = await response.json();
                this.isLoaded = true;
            }
        } catch (error) {
            console.error('Failed to load keywords:', error);
        }
    }

    /**
     * Match description to category
     * Returns category name or null if no match
     */
    match(description: string): string | null {
        if (!this.isLoaded || !description) {
            return null;
        }

        const normalized = description.toLowerCase().trim();

        // Check each category's keywords
        for (const [category, words] of Object.entries(this.keywords)) {
            for (const keyword of words) {
                if (normalized.includes(keyword.toLowerCase())) {
                    return category;
                }
            }
        }

        return null;
    }

    /**
     * Get all available categories
     */
    getCategories(): string[] {
        return Object.keys(this.keywords);
    }

    /**
     * Get keywords for a specific category
     */
    getKeywordsForCategory(category: string): string[] {
        return this.keywords[category] || [];
    }

    /**
     * Check if keywords are loaded
     */
    isReady(): boolean {
        return this.isLoaded;
    }

    /**
     * Reload keywords (useful after adding custom keywords)
     */
    async reload(): Promise<void> {
        this.isLoaded = false;
        await this.loadKeywords();
    }
}

// Singleton instance
let keywordMatcherInstance: KeywordMatcher | null = null;

/**
 * Get the singleton keyword matcher instance
 */
export function getKeywordMatcher(): KeywordMatcher {
    if (!keywordMatcherInstance) {
        keywordMatcherInstance = new KeywordMatcher();
    }
    return keywordMatcherInstance;
}

/**
 * React hook for using keyword matcher
 */
export function useKeywordMatcher() {
    const matcher = getKeywordMatcher();

    const [isReady, setIsReady] = React.useState(matcher.isReady());

    React.useEffect(() => {
        if (!matcher.isReady()) {
            matcher.loadKeywords().then(() => {
                setIsReady(true);
            }).catch(() => {
                // Silently fail
            });
        }
    }, [matcher]);

    return {
        match: (description: string) => matcher.match(description),
        isReady,
        reload: () => matcher.reload(),
        getCategories: () => matcher.getCategories(),
    };
}
