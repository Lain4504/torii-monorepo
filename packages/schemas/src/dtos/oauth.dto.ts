import { z } from 'zod';

/**
 * Google OAuth Authentication DTO
 * Used for Google OAuth login/register
 */
export const googleAuthDTOSchema = z.object({
    idToken: z.string().min(1, 'Google ID token is required'),
});

export type GoogleAuthDTO = z.infer<typeof googleAuthDTOSchema>;

/**
 * Link Provider DTO
 * Used to link an OAuth provider to existing account
 */
export const linkProviderDTOSchema = z.object({
    provider: z.enum(['google'], {
        errorMap: () => ({ message: 'Provider must be google' }),
    }),
    token: z.string().min(1, 'OAuth token is required'),
});

export type LinkProviderDTO = z.infer<typeof linkProviderDTOSchema>;

/**
 * Unlink Provider DTO
 * Used to unlink an OAuth provider from account
 */
export const unlinkProviderDTOSchema = z.object({
    provider: z.enum(['google', 'email'], {
        errorMap: () => ({ message: 'Provider must be google or email' }),
    }),
});

export type UnlinkProviderDTO = z.infer<typeof unlinkProviderDTOSchema>;

// ========================================
// OAuth Response Types
// ========================================

/**
 * Google User Information from OAuth
 */
export const googleUserInfoSchema = z.object({
    sub: z.string(),
    name: z.string(),
    email: z.string().email(),
    picture: z.string(),
    email_verified: z.boolean(),
    given_name: z.string().optional(),
    family_name: z.string().optional(),
});

export type GoogleUserInfo = z.infer<typeof googleUserInfoSchema>;

/**
 * Linked Provider Information
 */
export const linkedProviderSchema = z.object({
    provider: z.string(),
    providerId: z.string(),
    linkedAt: z.date(),
    lastSignInAt: z.date().optional(),
});

export type LinkedProvider = z.infer<typeof linkedProviderSchema>;

/**
 * App Metadata Structure
 */
export const appMetadataSchema = z.object({
    provider: z.string(),
    providers: z.array(z.string()),
});

export type AppMetadata = z.infer<typeof appMetadataSchema>;

/**
 * User Metadata from OAuth Providers
 */
export const userMetadataSchema = z.object({
    iss: z.string().optional(),
    sub: z.string().optional(),
    name: z.string().optional(),
    email: z.string().optional(),
    picture: z.string().optional(),
    email_verified: z.boolean().optional(),
}).passthrough(); // Allow additional properties

export type UserMetadata = z.infer<typeof userMetadataSchema>;
