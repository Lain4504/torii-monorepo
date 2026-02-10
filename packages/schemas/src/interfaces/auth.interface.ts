import { UserRole } from '../models/user.model';

export interface TokenPayload {
    sub: string; // user ID
    sid?: string; // session ID
    role?: UserRole;
    permissions?: string[];

    // Metadata claims
    app_metadata?: {
        provider?: string;
        [key: string]: any;
    };
    user_metadata?: {
        displayName?: string;
        avatarUrl?: string;
        [key: string]: any;
    };

    // Auth context claims
    amr?: string[]; // Authentication Methods Reference (e.g., ['password', 'totp'])

    // Standard claims
    jti?: string;
    exp?: number;
    iat?: number;
    nbf?: number;
    aud?: string;
    iss?: string;
}

export interface Requester extends TokenPayload { }

/**
 * Minimal request interface containing requester information.
 * Suitable for cross-environment use (Frontend, Microservices, etc.) where 
 * full HTTP request properties like headers/cookies might not be available.
 * For server-side Express controllers, use the extended ReqWithRequester from '@server/shared'.
 */
export interface ReqWithRequester {
    requester: Requester;
}
