import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import { JwtTokenProvider, type RefreshTokenPayload } from '@server/shared';
import { createHash, randomUUID } from 'crypto';

@Injectable()
export class RefreshTokenService {
    private readonly logger = new Logger(RefreshTokenService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtProvider: JwtTokenProvider,
    ) { }

    /**
     * Create a new refresh token for a user
     * @returns The signed JWT refresh token
     */
    async createRefreshToken(userId: string): Promise<string> {
        const tokenId = randomUUID();

        // Generate JWT
        const refreshToken = await this.jwtProvider.generateRefreshToken({
            sub: userId,
            tokenId,
        });

        // Hash token for storage
        const tokenHash = this.hashToken(refreshToken);

        // Store in database
        await this.prisma.refreshToken.create({
            data: {
                userId,
                tokenHash,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        });

        this.logger.log(`Refresh token created for user ${userId}`);
        return refreshToken;
    }

    /**
     * Verify a refresh token
     * @returns Payload if valid, null if invalid/expired/revoked
     */
    async verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
        try {
            // 1. Verify JWT signature and expiration
            const payload = await this.jwtProvider.verifyRefreshToken(token);
            if (!payload) {
                return null;
            }

            // 2. Check if token exists in database and is not revoked
            const tokenHash = this.hashToken(token);
            const storedToken = await this.prisma.refreshToken.findUnique({
                where: { tokenHash },
                select: {
                    id: true,
                    userId: true,
                    expiresAt: true,
                    revokedAt: true,
                },
            });

            if (!storedToken) {
                this.logger.warn(`Refresh token not found in database: ${payload.tokenId}`);
                return null;
            }

            // 3. Check if revoked
            if (storedToken.revokedAt) {
                this.logger.warn(`Attempted use of revoked token: ${payload.tokenId}`);
                return null;
            }

            // 4. Check if expired (double-check in case JWT verification passed)
            if (storedToken.expiresAt < new Date()) {
                this.logger.warn(`Refresh token expired: ${payload.tokenId}`);
                return null;
            }

            return payload;
        } catch (error) {
            this.logger.error(`Error verifying refresh token: ${error}`);
            return null;
        }
    }

    /**
     * Revoke a single refresh token
     */
    async revokeRefreshToken(tokenHash: string): Promise<void> {
        try {
            await this.prisma.refreshToken.updateMany({
                where: {
                    tokenHash,
                    revokedAt: null, // Only update if not already revoked
                },
                data: {
                    revokedAt: new Date(),
                },
            });
            this.logger.log(`Refresh token revoked: ${tokenHash.substring(0, 8)}...`);
        } catch (error) {
            this.logger.error(`Error revoking refresh token: ${error}`);
        }
    }

    /**
     * Revoke all refresh tokens for a user
     * Useful for logout all devices or password change
     */
    async revokeAllUserTokens(userId: string): Promise<void> {
        try {
            const result = await this.prisma.refreshToken.updateMany({
                where: {
                    userId,
                    revokedAt: null,
                },
                data: {
                    revokedAt: new Date(),
                },
            });
            this.logger.log(`Revoked ${result.count} refresh tokens for user ${userId}`);
        } catch (error) {
            this.logger.error(`Error revoking all user tokens: ${error}`);
        }
    }

    /**
     * Cleanup expired and revoked tokens
     * Should be called by a cron job periodically
     */
    async cleanupExpiredTokens(): Promise<number> {
        try {
            const result = await this.prisma.refreshToken.deleteMany({
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

            this.logger.log(`Cleaned up ${result.count} expired/old refresh tokens`);
            return result.count;
        } catch (error) {
            this.logger.error(`Error cleaning up tokens: ${error}`);
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
