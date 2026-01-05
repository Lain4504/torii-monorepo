/**
 * Google user information from OAuth
 */
export interface GoogleUserInfo {
    sub: string;           // Google user ID
    name: string;          // Full name
    email: string;         // Email address
    picture: string;       // Avatar URL
    email_verified: boolean;
    given_name?: string;   // First name
    family_name?: string;  // Last name
}

/**
 * Linked provider information
 */
export interface LinkedProvider {
    provider: string;
    providerId: string;
    linkedAt: Date;
    lastSignInAt?: Date;
}

/**
 * App metadata structure
 */
export interface AppMetadata {
    provider: string;      // Primary provider
    providers: string[];   // All linked providers
}

/**
 * User metadata from OAuth providers
 */
export interface UserMetadata {
    // Google OAuth fields
    iss?: string;
    sub?: string;
    name?: string;
    email?: string;
    picture?: string;
    email_verified?: boolean;

    // Extensible for other providers
    [key: string]: any;
}
