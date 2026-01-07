import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import { JwtTokenProvider, type RefreshTokenPayload } from '@server/shared';
import { createHash, randomUUID } from 'crypto';
import type { ISessionService } from '../../interfaces/services';


@Injectable()
export class SessionService implements ISessionService {
    private readonly logger = new Logger(SessionService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtProvider: JwtTokenProvider,
    ) { }

    /**
     * Create a new session (refresh token) for a user
     * @returns The signed JWT refresh token
     */
    async createSession(
        userId: string,
        metadata: { ipAddress?: string; userAgent?: string } = {}
    ): Promise<string> {
        const tokenId = randomUUID();

        // Generate JWT
        const refreshToken = await this.jwtProvider.generateRefreshToken({
            sub: userId,
            tokenId,
        });

        // Hash token for storage
        const tokenHash = this.hashToken(refreshToken);

        // Parse User Agent
        let deviceInfo = 'Unknown Device';
        if (metadata.userAgent) {
            deviceInfo = metadata.userAgent.substring(0, 100); // Simple truncation for now
        }

        // Store in database
        await this.prisma.session.create({
            data: {
                userId,
                tokenHash,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
                deviceInfo,
            },
        });

        this.logger.log(`Session created for user ${userId} on ${deviceInfo}`);
        return refreshToken;
    }

    /**
     * Verify a refresh token and return session info
     * @returns Payload if valid, null if invalid/expired/revoked
     */
    async verifySession(token: string): Promise<RefreshTokenPayload | null> {
        try {
            // 1. Verify JWT signature and expiration
            const payload = await this.jwtProvider.verifyRefreshToken(token);
            if (!payload) {
                return null;
            }

            // 2. Check if session exists in database and is not revoked
            const tokenHash = this.hashToken(token);
            const storedSession = await this.prisma.session.findUnique({
                where: { tokenHash },
                select: {
                    id: true,
                    userId: true,
                    expiresAt: true,
                    revokedAt: true,
                },
            });

            if (!storedSession) {
                this.logger.warn(`Session not found in database: ${payload.tokenId}`);
                return null;
            }

            // 3. Check if revoked
            if (storedSession.revokedAt) {
                this.logger.warn(`Attempted use of revoked session: ${payload.tokenId}`);
                return null;
            }

            // 4. Check if expired (double-check in case JWT verification passed)
            if (storedSession.expiresAt < new Date()) {
                this.logger.warn(`Session expired: ${payload.tokenId}`);
                return null;
            }

            return payload;
        } catch (error) {
            this.logger.error(`Error verifying session: ${error}`);
            return null;
        }
    }

    /**
     * Revoke a single session
     */
    async revokeSession(tokenHash: string): Promise<void> {
        try {
            await this.prisma.session.updateMany({
                where: {
                    tokenHash,
                    revokedAt: null, // Only update if not already revoked
                },
                data: {
                    revokedAt: new Date(),
                },
            });
            this.logger.log(`Session revoked: ${tokenHash.substring(0, 8)}...`);
        } catch (error) {
            this.logger.error(`Error revoking session: ${error}`);
        }
    }

    /**
     * Revoke all sessions for a user
     * Useful for logout all devices or password change
     */
    async revokeAllUserSessions(userId: string): Promise<void> {
        try {
            const result = await this.prisma.session.updateMany({
                where: {
                    userId,
                    revokedAt: null,
                },
                data: {
                    revokedAt: new Date(),
                },
            });
            this.logger.log(`Revoked ${result.count} sessions for user ${userId}`);
        } catch (error) {
            this.logger.error(`Error revoking all user sessions: ${error}`);
        }
    }

    /**
     * Cleanup expired and revoked sessions
     * Should be called by a cron job periodically
     */
    async cleanupExpiredSessions(): Promise<number> {
        try {
            const result = await this.prisma.session.deleteMany({
                where: {
                    OR: [
                        { expiresAt: { lt: new Date() } },
                        {
                            revokedAt: {
                                lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Revoked >30 days ago
                            },
                        },
                    ],
                },
            });

            this.logger.log(`Cleaned up ${result.count} expired/old sessions`);
            return result.count;
        } catch (error) {
            this.logger.error(`Error cleaning up sessions: ${error}`);
            return 0;
        }
    }

    /**
     * Hash token using SHA-256
     * @private
     */
    private hashToken(token: string): string {
        return createHash('sha256').update(token).digest('hex');
    }

    /**
     * Get hash from token (public helper for controller)
     */
    hashTokenPublic(token: string): string {
        return this.hashToken(token);
    }
}
