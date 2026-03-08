import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { ActivityType, GamificationTransactionType, GamificationCurrency } from '@prisma/generated';
import { AchievementService } from './achievement.service';

@Injectable()
export class GamificationService {
    private readonly logger = new Logger(GamificationService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly achievementService: AchievementService,
    ) { }

    private readonly EARNING_RULES: Record<string, { xp: number; points: number }> = {
        [ActivityType.LOGIN]: { xp: 0, points: 5 },
        [ActivityType.LESSON_COMPLETE]: { xp: 10, points: 10 },
        [ActivityType.EXAM_COMPLETE]: { xp: 20, points: 20 },
        [ActivityType.REVIEW]: { xp: 50, points: 50 },
    };

    /**
     * Track a user learning activity and reward them.
     */
    async trackActivity(userId: string, activityType: ActivityType, metadata: any = {}) {
        const rule = this.EARNING_RULES[activityType];
        if (!rule) {
            return {
                amount: 0,
                message: "No points awarded for this activity."
            };
        }

        const dateString = new Date().toISOString().split('T')[0];

        // Ensure we don't duplicate one-time daily activities like login
        if (activityType === ActivityType.LOGIN) {
            const existingActivity = await this.prisma.dailyActivity.findUnique({
                where: {
                    userId_date_activityType: {
                        userId,
                        date: dateString,
                        activityType
                    }
                }
            });

            if (existingActivity) {
                return { amount: 0, message: "Already completed daily login today" };
            }
        } else if (activityType === ActivityType.REVIEW && metadata?.reviewId) {
            // Ensure no duplicate points for the same review
            const existingActivity = await this.prisma.gamificationHistory.findFirst({
                where: {
                    userId,
                    activityType: ActivityType.REVIEW,
                    metadata: { path: ['reviewId'], equals: metadata.reviewId }
                }
            });

            if (existingActivity) {
                return { amount: 0, message: "Already rewarded for this review" };
            }
        } else if (metadata?.lessonId) {
            // If lesson, verify if already tracked (simplistic duplicate check)
            // Typically we should store the reference to the lesson, but for now we rely on the specific action or state
        }

        return this.prisma.$transaction(async (tx) => {
            // Log or update the daily activity summary
            await tx.dailyActivity.upsert({
                where: {
                    userId_date_activityType: {
                        userId,
                        date: dateString,
                        activityType
                    }
                },
                update: {
                    // Just optionally update meta, or keep count (if you add count to schema later)
                    meta: metadata
                },
                create: {
                    userId,
                    activityType,
                    date: dateString,
                    meta: metadata
                }
            });

            // Retrieve or create UserGamification profile
            let profile = await tx.userGamification.findUnique({ where: { userId } });
            if (!profile) {
                profile = await tx.userGamification.create({
                    data: {
                        userId,
                        currentXp: 0,
                        totalXp: 0,
                        points: 0,
                        level: 1,
                    }
                });
            }

            const { xp, points } = rule;
            const newTotalXp = profile.totalXp + xp;
            const newLevel = Math.floor(newTotalXp / 1000) + 1;

            // Update stats
            const updatedProfile = await tx.userGamification.update({
                where: { userId },
                data: {
                    currentXp: { increment: xp },
                    totalXp: { increment: xp },
                    points: { increment: points },
                    level: newLevel,
                }
            });

            // Write point tracking in history
            if (points > 0) {
                await tx.gamificationHistory.create({
                    data: {
                        userId,
                        amount: points,
                        currency: GamificationCurrency.POINT,
                        type: GamificationTransactionType.EARN,
                        activityType,
                        description: `Received points for ${activityType}`,
                        metadata,
                    }
                });
            }

            if (xp > 0) {
                await tx.gamificationHistory.create({
                    data: {
                        userId,
                        amount: xp,
                        currency: GamificationCurrency.XP,
                        type: GamificationTransactionType.EARN,
                        activityType,
                        description: `Received XP for ${activityType}`,
                        metadata,
                    }
                });
            }

            const result = {
                xpEarned: xp,
                pointsEarned: points,
                newLevel: updatedProfile.level,
            };

            // Trigger achievement evaluation asynchronously
            this.achievementService.evaluateForUser(userId).catch(err =>
                this.logger.error(`Failed to evaluate achievements for user ${userId}:`, err)
            );

            return result;
        });
    }

    /**
     * Lazy checks the streak.
     * Computes missing days and consumes freeze shields if necessary.
     */
    async checkAndGetStreak(userId: string) {
        let profile = await this.prisma.userGamification.findUnique({ where: { userId } });

        if (!profile) {
            profile = await this.prisma.userGamification.create({
                data: {
                    userId,
                    currentXp: 0,
                    totalXp: 0,
                    points: 0,
                    level: 1,
                }
            });
        }

        const today = new Date();
        // Zero out time
        today.setHours(0, 0, 0, 0);

        if (!profile.lastActiveDate) {
            // First time
            const updated = await this.prisma.userGamification.update({
                where: { userId },
                data: {
                    currentStreak: 1,
                    longestStreak: 1,
                    lastActiveDate: today.toISOString().split('T')[0],
                }
            });
            this.achievementService.evaluateForUser(userId).catch(e => this.logger.error(e));
            return updated;
        }

        const lastActive = new Date(profile.lastActiveDate);
        lastActive.setHours(0, 0, 0, 0);

        const diffTime = Math.abs(today.getTime() - lastActive.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return profile; // Already active today
        }

        if (diffDays === 1) {
            // Perfect sequential login
            const newStreak = profile.currentStreak + 1;
            const updated = await this.prisma.userGamification.update({
                where: { userId },
                data: {
                    currentStreak: newStreak,
                    longestStreak: Math.max(profile.longestStreak, newStreak),
                    lastActiveDate: today.toISOString().split('T')[0],
                }
            });
            this.achievementService.evaluateForUser(userId).catch(e => this.logger.error(e));
            return updated;
        }

        // Missed one or more days. Try to consume streak freezes.
        const missingDaysToCover = diffDays - 1;

        if (profile.freezeCount >= missingDaysToCover) {
            // Used streak freeze
            const newStreak = profile.currentStreak + 1;
            const updated = await this.prisma.userGamification.update({
                where: { userId },
                data: {
                    freezeCount: { decrement: missingDaysToCover },
                    currentStreak: newStreak,
                    longestStreak: Math.max(profile.longestStreak, newStreak),
                    lastActiveDate: today.toISOString().split('T')[0],
                }
            });
            this.achievementService.evaluateForUser(userId).catch(e => this.logger.error(e));
            return updated;
        }

        // Start anew today
        const updated = await this.prisma.userGamification.update({
            where: { userId },
            data: {
                currentStreak: 1, // Start anew today
                lastActiveDate: today.toISOString().split('T')[0],
            }
        });

        // Trigger evaluation after streak update
        this.achievementService.evaluateForUser(userId).catch(err =>
            this.logger.error(`Failed to evaluate achievements for user ${userId} after streak reset:`, err)
        );

        return updated;
    }

    async getProfile(userId: string) {
        // Enforce eager streak validation as part of profile retrieval
        return this.checkAndGetStreak(userId);
    }

    async getHistory(userId: string, limit: number = 20, offset: number = 0) {
        return this.prisma.gamificationHistory.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        });
    }

    async getRewards() {
        return this.prisma.pointReward.findMany({
            where: { isActive: true },
        });
    }

    async redeemReward(userId: string, rewardId: string) {
        return this.prisma.$transaction(async (tx) => {
            const reward = await tx.pointReward.findUnique({
                where: { id: rewardId }
            });

            if (!reward || !reward.isActive) {
                throw new NotFoundException("Reward not found or inactive");
            }

            const profile = await tx.userGamification.findUnique({ where: { userId } });

            if (!profile || profile.points < reward.costPoints) {
                throw new BadRequestException("Insufficient points to redeem this reward");
            }

            // Deduct points
            await tx.userGamification.update({
                where: { userId },
                data: {
                    points: { decrement: reward.costPoints }
                }
            });

            await tx.gamificationHistory.create({
                data: {
                    userId,
                    amount: -reward.costPoints,
                    currency: GamificationCurrency.POINT,
                    type: GamificationTransactionType.REDEEM,
                    description: `Redeemed ${reward.name}`,
                    metadata: { rewardId },
                }
            });

            // NOTE: A real system should integrate with CouponService here to emit a real coupon.
            // Simplified coupon issuance for Phase 1
            const config = (reward.config as any) || {};
            const prefix = config.prefix || 'RWD';
            const generatedCode = `${prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

            const coupon = await tx.coupon.create({
                data: {
                    code: generatedCode,
                    description: `Redeemed from: ${reward.name}`,
                    discountType: config.discountType || 'FIXED_AMOUNT',
                    discountValue: config.discountValue || 0,
                    maxDiscountAmount: config.maxDiscountAmount,
                    minOrderValue: config.minOrderValue,
                    usageLimit: 1,
                    perUserLimit: 1,
                    metadata: { source: "GAMIFICATION", ownerId: userId },
                }
            });

            return {
                success: true,
                message: "Reward redeemed successfully",
                couponCode: coupon.code,
            };
        });
    }

    // --- Admin CRUD ---

    async admin_getAllRewards() {
        return this.prisma.pointReward.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    async admin_createReward(data: any) {
        return this.prisma.pointReward.create({
            data: {
                name: data.name,
                description: data.description,
                costPoints: data.costPoints,
                type: data.type || 'COUPON',
                config: data.config || {},
                isActive: data.isActive !== undefined ? data.isActive : true,
            }
        });
    }

    async admin_updateReward(id: string, data: any) {
        return this.prisma.pointReward.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                costPoints: data.costPoints,
                type: data.type,
                config: data.config,
                isActive: data.isActive,
            }
        });
    }

    async admin_deleteReward(id: string) {
        return this.prisma.pointReward.delete({
            where: { id }
        });
    }
}
