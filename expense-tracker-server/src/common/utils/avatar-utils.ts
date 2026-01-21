/**
 * Avatar utility functions for generating and validating user avatars and group icons
 */

const ALLOWED_USER_AVATAR_STYLES = new Set([
  'adventurer',
  'adventurer-neutral',
  'thumbs',
  'fun-emoji',
]);
const ALLOWED_GROUP_ICON_PROVIDERS = new Set(['jdenticon']);

/**
 * Validate user avatar style
 * @param style - Style to validate
 * @returns true if valid, false otherwise
 */
export function validateUserAvatarStyle(style: string): boolean {
  return ALLOWED_USER_AVATAR_STYLES.has(style);
}

/**
 * Validate group icon provider
 * @param provider - Provider to validate
 * @returns true if valid, false otherwise
 */
export function validateGroupIconProvider(provider: string): boolean {
  return ALLOWED_GROUP_ICON_PROVIDERS.has(provider);
}

/**
 * Generate a random seed for avatar/icon generation
 * @returns Random UUID-like string
 */
export function generateRandomSeed(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Get allowed avatar styles
 * @returns Array of allowed styles
 */
export function getAllowedAvatarStyles(): string[] {
  return Array.from(ALLOWED_USER_AVATAR_STYLES);
}
