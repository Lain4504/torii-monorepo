/**
 * NATS Auth Service
 * Handles LiveKit authentication callouts via NATS
 * 
 * This service verifies JWT tokens for LiveKit room access
 * Auth verification logic
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyWajlcAccessToken } from '../utils/verify_token';

@Injectable()
export class NatsAuthService {
    private readonly logger = new Logger(NatsAuthService.name);

    constructor(private readonly configService: ConfigService) { }

    /**
     * Verify token for LiveKit auth callout
     * Called when LiveKit needs to authenticate a user joining a room
     * 
     * @param token JWT token from client
     * @param roomId Room ID to verify access for
     * @returns Verification result with user info
     */
    async verifyToken(token: string, roomId: string): Promise<{
        valid: boolean;
        userId?: string;
        userName?: string;
        isAdmin?: boolean;
        error?: string;
    }> {
        try {
            const apiKey = this.configService.get<string>('LIVEKIT_APIKEY');
            const secret = this.configService.get<string>('LIVEKIT_API_SECRET');

            if (!apiKey || !secret) {
                throw new Error('Missing LIVEKIT_APIKEY or LIVEKIT_API_SECRET configuration');
            }

            // Verify JWT token using shared utility
            const claims = verifyWajlcAccessToken(apiKey, secret, token);

            // Check if room ID matches
            if (claims.roomId !== roomId) {
                this.logger.warn(`Room ID mismatch: token=${claims.roomId}, requested=${roomId}`);
                return {
                    valid: false,
                    error: 'Room ID mismatch',
                };
            }

            this.logger.debug(`Token verified for user ${claims.userId} in room ${roomId}`);

            return {
                valid: true,
                userId: claims.userId,
                userName: claims.name,
                isAdmin: claims.isAdmin,
            };
        } catch (error) {
            this.logger.error(`Token verification failed: ${error.message}`);
            return {
                valid: false,
                error: error.message,
            };
        }
    }
}
