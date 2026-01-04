import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { TokenPayload } from '@workspace/schemas';

export interface RefreshTokenPayload {
    sub: string;      // userId
    tokenId: string;  // UUID for token rotation tracking
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
}
