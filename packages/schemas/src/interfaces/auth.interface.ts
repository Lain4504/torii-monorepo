import { UserRole } from '../models/user.model';

export interface TokenPayload {
    sub: string; // user ID
    role: UserRole;
    permissions?: string[];
    jti?: string; // Standard JWT ID claim
    exp?: number;
    iat?: number;
    aud?: string;
    iss?: string;
    displayName?: string;
    email?: string;
}

export interface Requester extends TokenPayload { }

export interface ReqWithRequester {
    requester: Requester;
}
