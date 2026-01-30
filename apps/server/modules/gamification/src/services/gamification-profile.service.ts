import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';

@Injectable()
export class GamificationProfileService {
    private readonly logger = new Logger(GamificationProfileService.name);
    private readonly MAX_HEARTS = 5;
    private readonly REFILL_INTERVAL_HOURS = 4;

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Get user's gamification profile with dynamic heart calculation
     */
    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                totalXp: true,
                currentWeekXp: true,
                coins: true,
                hearts: true,
                lastHeartRefill: true,
                streak: true,
                league: {
                    select: {
                        id: true,
                        name: true,
                        icon: true,
                    }
                }
            },
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Calculate current hearts
        const { currentHearts, nextRefillAt } = this.calculateHearts(
            user.id,
            user.hearts,
            user.lastHeartRefill
        );

        // Calculate Level (Simple formula: Level = floor(totalXp / 1000) + 1)
        const level = Math.floor(user.totalXp / 1000) + 1;
        const xpToNextLevel = (level * 1000) - user.totalXp;

        return {
            userId: user.id,
            totalXp: user.totalXp,
            currentWeekXp: user.currentWeekXp,
            coins: user.coins,
            hearts: currentHearts,
            maxHearts: this.MAX_HEARTS,
            nextRefillAt,
            level,
            xpToNextLevel,
            streak: user.streak?.currentStreak || 0,
            league: user.league,
        };
    }

    /**
     * Deduct a heart from user
     */
    async deductHeart(userId: string): Promise<boolean> {
        const profile = await this.getProfile(userId);

        if (profile.hearts <= 0) {
            return false;
        }

        // If currently at MAX_HEARTS, set lastHeartRefill to now
        const updateData: any = {
            hearts: profile.hearts - 1,
        };

        if (profile.hearts === this.MAX_HEARTS) {
            updateData.lastHeartRefill = new Date();
        }

        await this.prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        return true;
    }

    /**
     * Fully refill hearts (e.g., from shop)
     */
    async refillHearts(userId: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                hearts: this.MAX_HEARTS,
                lastHeartRefill: new Date(),
            },
        });
    }

    /**
     * Internal heart calculation logic
     */
    private calculateHearts(userId: string, storedHearts: number, lastRefill: Date) {
        if (storedHearts >= this.MAX_HEARTS) {
            return { currentHearts: this.MAX_HEARTS, nextRefillAt: null as Date | null };
        }

        const now = new Date();
        const diffMs = now.getTime() - lastRefill.getTime();
        const refillMs = this.REFILL_INTERVAL_HOURS * 60 * 60 * 1000;

        const heartsToAdd = Math.floor(diffMs / refillMs);
        const currentHearts = Math.min(this.MAX_HEARTS, storedHearts + heartsToAdd);

        let nextRefillAt: Date | null = null;
        if (currentHearts < this.MAX_HEARTS) {
            const msSinceLastHeart = diffMs % refillMs;
            nextRefillAt = new Date(now.getTime() + (refillMs - msSinceLastHeart));
        }

        // Auto-update if hearts increased but don't wait for it
        if (heartsToAdd > 0) {
            this.prisma.user.update({
                where: { id: userId },
                data: {
                    hearts: currentHearts,
                    lastHeartRefill: currentHearts === this.MAX_HEARTS
                        ? now
                        : new Date(lastRefill.getTime() + (heartsToAdd * refillMs))
                }
            }).catch(e => this.logger.error('Failed to auto-update hearts', e));
        }

        return { currentHearts, nextRefillAt };
    }
}
