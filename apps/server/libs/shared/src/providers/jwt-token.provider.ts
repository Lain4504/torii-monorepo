import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { TokenPayload } from '@workspace/schemas';

export interface RefreshTokenPayload {
    sub: string;      // userId
    tokenId: string;  // UUID for token rotation tracking
}

/**
 * 2FA Temporary Token Payload
 * Used for temporary tokens during 2FA verification flow
 */
export interface TwoFactorTempTokenPayload {
    sub: string;      // userId (for compatibility with TokenPayload)
    role: string;     // user role (for compatibility with TokenPayload)
    userId: string;   // user ID (duplicate of sub for clarity)
    email: string;    // user email
    method: string;   // 2FA method (e.g., 'totp')
    type: '2fa-temp'; // token type identifier
}

@Injectable()
export class JwtTokenProvider {
    private readonly secretKey: string;
    private readonly accessTokenExpiry: string;
    private readonly refreshTokenExpiry: string;

    constructor(private config: ConfigService) {
        this.secretKey = config.get<string>('JWT_SECRET')!;
        this.accessTokenExpiry = config.get<string>('JWT_ACCESS_EXPIRES_IN', '15m')!;
        this.refreshTokenExpiry = config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d')!;
    }

    /**
     * Generate access token (short-lived)
     */
    async generateToken(payload: TokenPayload, expiresIn?: string): Promise<string> {
        return jwt.sign(payload, this.secretKey, {
            expiresIn: expiresIn || this.accessTokenExpiry
        });
    }

    /**
     * Generate refresh token (long-lived)
     */
    async generateRefreshToken(payload: RefreshTokenPayload): Promise<string> {
        return jwt.sign(payload, this.secretKey, {
            expiresIn: this.refreshTokenExpiry
        });
    }

    /**
     * Verify access token
     */
    async verifyToken(token: string): Promise<TokenPayload | null> {
        try {
            const decoded = jwt.verify(token, this.secretKey) as TokenPayload;
            return decoded;
        } catch (error) {
            return null;
        }
    }

    /**
     * Verify refresh token
     */
    async verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
        try {
            const decoded = jwt.verify(token, this.secretKey) as RefreshTokenPayload;
            return decoded;
        } catch (error) {
            return null;
        }
    }

    /**
     * Generate 2FA temporary token (short-lived, for 2FA verification flow)
     */
    async generate2FATempToken(payload: TwoFactorTempTokenPayload, expiresIn?: string): Promise<string> {
        return jwt.sign(payload, this.secretKey, {
            expiresIn: expiresIn || '5m' // Default 5 minutes
        });
    }

    /**
     * Verify 2FA temporary token
     */
    async verify2FATempToken(token: string): Promise<TwoFactorTempTokenPayload | null> {
        try {
            const decoded = jwt.verify(token, this.secretKey) as TwoFactorTempTokenPayload;
            // Validate token type
            if (decoded.type !== '2fa-temp') {
                return null;
            }
            return decoded;
        } catch (error) {
            return null;
        }
    }
}
