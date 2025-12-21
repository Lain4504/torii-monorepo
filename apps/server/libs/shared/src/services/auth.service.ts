import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { AccessToken } from 'livekit-server-sdk';

/**
 * AuthService - Handles plugNmeet and LiveKit JWT token generation
 * Matches Go server: plugnmeet-protocol/auth/access_token.go
 */
@Injectable()
export class AuthService {
    private readonly apiKey: string;
    private readonly secret: string;
    private readonly tokenValidity: number; // in seconds
    private readonly jwtIssuer: string; // plugNmeet issuer

    constructor(private readonly configService: ConfigService) {
        this.apiKey = this.configService.get<string>('LIVEKIT_API_KEY') || 'devkey';
        this.secret = this.configService.get<string>('LIVEKIT_API_SECRET') || 'secret';
        this.tokenValidity = this.configService.get<number>('TOKEN_VALIDITY') || 3600; // 1 hour default
        // IMPORTANT: Go server generates with "plugnmeet" BUT verifies against apiKey!
        // See verify_token.go line 30: exp := jwt.Expected{Issuer: apiKey, ...}
        // So we MUST use apiKey as issuer for verification to pass
        this.jwtIssuer = this.apiKey;
    }

    /**
     * Generate plugNmeet JWT access token
     * Matches Go: auth.GeneratePlugNmeetJWTAccessToken()
     * 
     * This is the PRIMARY authentication token returned to the client
     * 
     * @param claims PlugNmeetTokenClaims { name, user_id, room_id, is_admin, is_hidden }
     * @returns JWT token string
     */
    generatePlugNmeetJWTAccessToken(claims: {
        name: string;
        user_id: string;
        room_id: string;
        is_admin: boolean;
        is_hidden?: boolean;
    }): string {
        const now = Math.floor(Date.now() / 1000);

        const payload = {
            // Standard JWT claims (jwt.Claims in Go)
            iss: this.jwtIssuer,  // Issuer: "plugnmeet" (not API key!)
            sub: claims.user_id,  // Subject (user ID)
            nbf: now,  // Not before
            exp: now + this.tokenValidity,  // Expiration time

            // plugNmeet custom claims (PlugNmeetTokenClaims)
            name: claims.name,
            user_id: claims.user_id,
            room_id: claims.room_id,
            is_admin: claims.is_admin,
            is_hidden: claims.is_hidden || false,
        };

        // IMPORTANT: Use noTimestamp to prevent 'iat' claim
        // Go server JWT doesn't include 'iat', only 'nbf', 'exp'
        return jwt.sign(payload, this.secret, {
            algorithm: 'HS256',
            header: { typ: 'JWT' },  // Matches Go: WithType("JWT")
            noTimestamp: true,  // Don't add 'iat' claim
        });
    }

    /**
     * Generate LiveKit access token for room joining
     * Matches Go: auth.GenerateLivekitAccessToken()
     * 
     * This is used for actual LiveKit room access (media streaming)
     * 
     * @param claims PlugNmeetTokenClaims
     * @returns LiveKit JWT token
     */
    async generateLivekitAccessToken(claims: {
        name: string;
        user_id: string;
        room_id: string;
        is_admin: boolean;
        is_hidden?: boolean;
    }): Promise<string> {
        const at = new AccessToken(this.apiKey, this.secret, {
            identity: claims.user_id,
            name: claims.name,
            ttl: this.tokenValidity,
        });

        at.addGrant({
            roomJoin: true,
            room: claims.room_id,
            roomAdmin: claims.is_admin,
            hidden: claims.is_hidden || false,
            canPublish: true,
            canSubscribe: true,
            canPublishData: true,
        });

        return await at.toJwt();
    }

    /**
     * Verify plugNmeet JWT token
     * Matches Go: auth.VerifyPlugNmeetAccessToken()
     * 
     * @param token JWT token string
     * @param gracefulPeriod Optional grace period in seconds for expired tokens
     * @returns Decoded token payload (PlugNmeetTokenClaims)
     */
    verifyPlugNmeetAccessToken(token: string, gracefulPeriod: number = 0): any {
        try {
            const decoded = jwt.verify(token, this.secret, {
                algorithms: ['HS256'],
                clockTolerance: gracefulPeriod,  // Grace period for exp check
            });
            return decoded;
        } catch (error) {
            if (error.name === 'TokenExpiredError' && gracefulPeriod > 0) {
                // Try decoding without verification if within grace period
                const decoded: any = jwt.decode(token);
                if (decoded && decoded.exp) {
                    const now = Math.floor(Date.now() / 1000);
                    if (now - decoded.exp <= gracefulPeriod) {
                        return decoded;
                    }
                }
            }
            throw new Error(`Token verification failed: ${error.message}`);
        }
    }

    /**
     * Unsafe decode without verification
     * Matches Go: UnsafeClaimsWithoutVerification()
     * 
     * WARNING: Does NOT verify signature! Only for debugging/inspection
     */
    unsafeClaimsWithoutVerification(token: string): any {
        return jwt.decode(token);
    }

    /**
     * Generate token for downloading recordings
     * Matches Go: auth.GenerateTokenForDownloadRecording()
     * 
     * @param path Download path (format: sub_path/roomSid/filename)
     * @param tokenValidity Token validity duration in seconds
     * @returns JWT token for download authentication
     */
    generateTokenForDownloadRecording(
        path: string,
        tokenValidity: number = 3600,
    ): string {
        const now = Math.floor(Date.now() / 1000);

        const payload = {
            iss: this.apiKey,
            sub: path,  // Path as subject
            nbf: now,
            exp: now + tokenValidity,
        };

        return jwt.sign(payload, this.secret, {
            algorithm: 'HS256',
            header: { typ: 'JWT' },
        });
    }

    /**
     * Renew plugNmeet token
     * Matches Go: AuthModel.RenewPNMToken()
     * 
     * Validates existing token and issues a new one with fresh expiration
     */
    renewPlugNmeetToken(
        token: string,
        gracefulPeriod: number = 60,  // 1 minute grace
    ): string {
        // Verify the existing token (with grace period)
        const claims = this.verifyPlugNmeetAccessToken(token, gracefulPeriod);

        // Extract plugNmeet claims and generate new token
        return this.generatePlugNmeetJWTAccessToken({
            name: claims.name,
            user_id: claims.user_id,
            room_id: claims.room_id,
            is_admin: claims.is_admin,
            is_hidden: claims.is_hidden,
        });
    }
}
