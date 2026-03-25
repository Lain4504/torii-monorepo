/**
 * Feature Flags Configuration
 * Usage: Use these flags to gate new features during rollout.
 */

export const FEATURE_FLAGS = {
    // VOD Discussion Official Reply
    ENABLE_OFFICIAL_DISCUSSION_BADGE: process.env.NEXT_PUBLIC_ENABLE_OFFICIAL_DISCUSSION_BADGE === 'true' || process.env.NODE_ENV === 'development',
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

/**
 * Check if a feature is enabled
 */
export const isFeatureEnabled = (flag: FeatureFlag): boolean => {
    return FEATURE_FLAGS[flag];
};
