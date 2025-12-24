/**
 * PlugNmeet Authentication Service
 * Equivalent to Go: plugnmeet-server/pkg/models/auth.go
 * 
 * Delegates to shared utils (equivalent to plugnmeet-protocol/auth)
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    generatePlugNmeetJWTAccessToken
} from '@server/shared/utils/access_token';
import {
    verifyPlugNmeetAccessToken
} from '@server/shared/utils/verify_token';
import {
    verifyWebhookRequest
} from '@server/shared/utils/webhook_verify';
import * as jwt from 'jsonwebtoken';

/**
 * Plain PlugNmeet token claims (not protobuf)
 * Equivalent to Go: plugnmeet.PlugNmeetTokenClaims
 */
export interface PlugNmeetTokenClaims {
    name: string;
    userId: string;
    roomId: string;
    isAdmin: boolean;
    isHidden?: boolean;
}

/**
 * AuthService handles JWT token generation and verification
 * Equivalent to Go: AuthModel (auth.go)
 * Calls shared utils equivalent to plugnmeet-protocol/auth package
 */
@Injectable()
export class PlugNmeetAuthService {
    private readonly logger = new Logger(PlugNmeetAuthService.name);
    private readonly apiKey: string;
    private readonly secret: string;
    private readonly tokenValidity: number; // in seconds
    private readonly livekitApiKey: string;
    private readonly livekitSecret: string;

    constructor(private readonly configService: ConfigService) {
        // Fallback to WAJLC_ keys if PLUGNMEET_ keys are not set
        this.apiKey = this.configService.get<string>('PLUGNMEET_API_KEY') ||
            this.configService.get<string>('WAJLC_API_KEY') || '';
        this.secret = this.configService.get<string>('PLUGNMEET_SECRET') ||
            this.configService.get<string>('WAJLC_API_SECRET') || '';
        this.tokenValidity = this.configService.get<number>('PLUGNMEET_TOKEN_VALIDITY') || 3600; // 1 hour default
        this.livekitApiKey = this.configService.get<string>('LIVEKIT_API_KEY') || '';
        this.livekitSecret = this.configService.get<string>('LIVEKIT_API_SECRET') || '';

        if (!this.apiKey || !this.secret) {
            this.logger.error('API Key or Secret is missing. Please check configuration (PLUGNMEET_ or WAJLC_ keys).');
        }
    }

    /**
     * Generate PlugNmeet JWT access token
     * Equivalent to Go: authModel.GeneratePNMJoinToken (auth.go:31-33)
     * Calls: auth.GeneratePlugNmeetJWTAccessToken (plugnmeet-protocol/auth)
     */
    generatePNMJoinToken(claims: PlugNmeetTokenClaims): string {
        try {
            // Delegate to shared utils (equivalent to plugnmeet-protocol/auth)
            const token = generatePlugNmeetJWTAccessToken(
                this.apiKey,
                this.secret,
                claims.userId,
                this.tokenValidity,
                claims as any // Cast to protocol type
            );

            this.logger.log(`Generated PNM token for user: ${claims.userId}`);
            return token;
        } catch (error) {
            this.logger.error(`Failed to generate PNM token: ${error.message}`);
            throw error;
        }
    }

    /**
     * Verify PlugNmeet access token
     * Equivalent to Go: authModel.VerifyPlugNmeetAccessToken (auth.go:35-37)
     * Calls: auth.VerifyPlugNmeetAccessToken (plugnmeet-protocol/auth)
     */
    verifyPNMAccessToken(token: string, gracefulPeriodSeconds: number = 0): PlugNmeetTokenClaims {
        try {
            // Delegate to shared utils (equivalent to plugnmeet-protocol/auth)
            const protobufClaims = verifyPlugNmeetAccessToken(
                this.apiKey,
                this.secret,
                token,
                gracefulPeriodSeconds
            );

            // Convert protobuf to plain object
            const claims: PlugNmeetTokenClaims = {
                name: protobufClaims.name,
                userId: protobufClaims.userId,
                roomId: protobufClaims.roomId,
                isAdmin: protobufClaims.isAdmin,
                isHidden: protobufClaims.isHidden,
            };

            return claims;
        } catch (error) {
            this.logger.error(`Invalid token: ${error.message}`);
            throw new Error('Invalid token claims');
        }
    }

    /**
     * Alias for verifyPNMAccessToken
     * Used by NATS auth callout
     */
    verifyToken(token: string): PlugNmeetTokenClaims {
        return this.verifyPNMAccessToken(token, 0);
    }

    /**
     * Get claims without verification (unsafe)
     * Equivalent to Go: authModel.UnsafeClaimsWithoutVerification (auth.go:39-52)
     */
    unsafeClaimsWithoutVerification(token: string): PlugNmeetTokenClaims | null {
        try {
            // Decode without verification
            const decoded = jwt.decode(token) as any;

            if (!decoded) {
                return null;
            }

            const claims: PlugNmeetTokenClaims = {
                name: decoded.name,
                userId: decoded.user_id,
                roomId: decoded.room_id,
                isAdmin: decoded.is_admin,
                isHidden: decoded.is_hidden,
            };

            return claims;
        } catch (error) {
            this.logger.error(`Failed to decode token: ${error.message}`);
            return null;
        }
    }

    /**
     * Renew PNM token
     * Equivalent to Go: authModel.RenewPNMToken (auth.go:55-70)
     * Note: This requires NATS service to check user status
     */
    renewPNMToken(oldToken: string, gracefulPeriodSeconds: number = 0): string {
        // Verify old token first (calls shared utils)
        const claims = this.verifyPNMAccessToken(oldToken, gracefulPeriodSeconds);

        // Generate new token with same claims (calls shared utils)
        return this.generatePNMJoinToken(claims);
    }

    /**
     * Validate LiveKit webhook token
     * Equivalent to Go: authModel.ValidateLivekitWebhookToken (auth.go:72-74)
     * Calls: webhook.VerifyRequest (plugnmeet-protocol/webhook)
     */
    validateLivekitWebhookToken(body: string | Buffer, token: string): boolean {
        try {
            // Convert string to Buffer if needed
            const bodyBuffer = typeof body === 'string' ? Buffer.from(body) : body;

            // Delegate to shared utils (equivalent to plugnmeet-protocol/webhook)
            const isValid = verifyWebhookRequest(
                bodyBuffer,
                this.livekitApiKey,
                this.livekitSecret,
                token
            );

            return isValid;
        } catch (error) {
            this.logger.error(`Failed to validate LiveKit webhook token: ${error.message}`);
            return false;
        }
    }
}
