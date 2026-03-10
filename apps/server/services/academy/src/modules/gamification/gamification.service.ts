import { Injectable, Logger, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { ActivityType, GamificationTransactionType, GamificationCurrency } from '@prisma/generated';
import { AchievementService } from './achievement.service';
import { AuditLoggerService } from '../audit-logger.service';

@Injectable()
export class GamificationService {
    private readonly logger = new Logger(GamificationService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly achievementService: AchievementService,
        private readonly audit: AuditLoggerService,
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

    private readonly EARNING_RULES: Record<string, { xp: number; points: number }> = {
        [ActivityType.LOGIN]: { xp: 0, points: 5 },
        [ActivityType.LESSON_COMPLETE]: { xp: 10, points: 10 },
        [ActivityType.EXAM_COMPLETE]: { xp: 20, points: 20 },
        [ActivityType.REVIEW]: { xp: 50, points: 50 },
    };

    private readonly ACTIVITY_WEIGHTS: Record<string, number> = {
        [ActivityType.LOGIN]: 1,
        [ActivityType.LESSON_COMPLETE]: 5,
        [ActivityType.EXAM_COMPLETE]: 10,
        [ActivityType.REVIEW]: 3,
    };

    /**
     * Track a user learning activity and reward them.
     * Also updates streak based on real learning activities instead of simple logins.
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

        // Retrieve existing activity for this day and type
        const existingActivity = await this.prisma.dailyActivity.findUnique({
            where: {
                userId_date_activityType: {
                    userId,
                    date: dateString,
                    activityType
                }
            }
        });

        // Points/XP Award Eligibility Check
        let shouldAward = true;

        if (activityType === ActivityType.LOGIN) {
            // LOGIN only awards points once per day
            if (existingActivity) {
                shouldAward = false;
            }
        } else if (activityType === ActivityType.REVIEW && metadata?.reviewId) {
            // Ensure no duplicate points for the same review
            const existingHistory = await this.prisma.gamificationHistory.findFirst({
                where: {
                    userId,
                    activityType: ActivityType.REVIEW,
                    metadata: { path: ['reviewId'], equals: metadata.reviewId }
                }
            });

            if (existingHistory) {
                shouldAward = false;
            }
        } else if (metadata?.lessonId) {
            // Optional: check if lesson already rewarded
        }

        const weight = this.ACTIVITY_WEIGHTS[activityType] || 1;

        return this.prisma.$transaction(async (tx) => {
            // Log or update the daily activity summary (Always increment count for Heatmap)
            await tx.dailyActivity.upsert({
                where: {
                    userId_date_activityType: {
                        userId,
                        date: dateString,
                        activityType
                    }
                },
                update: {
                    // For LOGIN, we only record it once per day (increment 0 if exists)
                    // For other activities, we add their weight
                    count: activityType === ActivityType.LOGIN ? { increment: 0 } : { increment: weight },
                    meta: metadata
                },
                create: {
                    userId,
                    activityType,
                    date: dateString,
                    count: weight,
                    meta: metadata
                }
            });

            if (!shouldAward) {
                return { xpEarned: 0, pointsEarned: 0, message: "Activity tracked for heatmap, but points already awarded." };
            }

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

            // Update streak & evaluate achievements asynchronously based on this activity
            // Note: we don't await to keep the main transaction fast
            this.checkAndGetStreak(userId)
                .then(() => this.achievementService.evaluateForUser(userId))
                .catch(err =>
                    this.logger.error(`Failed to update streak/achievements for user ${userId}:`, err),
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

        const todayStr = today.toISOString().split('T')[0];

        if (!profile.lastActiveDate) {
            // First time streak
            return this.prisma.userGamification.update({
                where: { userId },
                data: {
                    currentStreak: 1,
                    longestStreak: 1,
                    lastActiveDate: todayStr,
                }
            });
        }

        const lastActive = new Date(profile.lastActiveDate);
        lastActive.setHours(0, 0, 0, 0);

        const diffTime = Math.abs(today.getTime() - lastActive.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0 || profile.lastActiveDate === todayStr) {
            // Already active today, do not change streak on repeated calls
            return profile;
        }

        if (diffDays === 1) {
            // Perfect sequential login
            const newStreak = profile.currentStreak + 1;
            const updated = await this.prisma.userGamification.update({
                where: { userId },
                data: {
                    currentStreak: newStreak,
                    longestStreak: Math.max(profile.longestStreak, newStreak),
                    lastActiveDate: todayStr,
                }
            });
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
                    lastActiveDate: todayStr,
                }
            });
            return updated;
        }

        // Start anew today
        const updated = await this.prisma.userGamification.update({
            where: { userId },
            data: {
                currentStreak: 1, // Start anew today
                lastActiveDate: todayStr,
            }
        });

        return updated;
    }

    /**
     * Get gamification profile WITHOUT mutating streak or tracking login.
     * Streak is now updated only when real learning activities are recorded.
     */
    async getProfile(userId: string) {
        let profile = await this.prisma.userGamification.findUnique({ where: { userId } });
        if (!profile) {
            profile = await this.prisma.userGamification.create({
                data: {
                    userId,
                    currentXp: 0,
                    totalXp: 0,
                    points: 0,
                    level: 1,
                },
            });
        }
        return profile;
    }

    /**
     * Read-only streak status for APIs that just need to display it.
     * Does NOT change streak counters.
     */
    async getStreakStatus(userId: string) {
        let profile = await this.prisma.userGamification.findUnique({ where: { userId } });

        if (!profile) {
            profile = await this.prisma.userGamification.create({
                data: {
                    userId,
                    currentXp: 0,
                    totalXp: 0,
                    points: 0,
                    level: 1,
                },
            });
        }

        return profile;
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
        const result = await this.prisma.$transaction(async (tx) => {
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
                rewardName: reward.name,
            };
        });

        // Emit notification via NATS (identity service will create in-app notification)
        try {
            this.natsClient.emit(
                { cmd: 'send_notification' },
                {
                    recipientId: userId,
                    type: 'system',
                    payload: {
                        title: 'Bạn vừa đổi quà thành công 🎁',
                        body: `Bạn đã dùng điểm để đổi phần thưởng "${result.rewardName}". Mã coupon của bạn là ${result.couponCode}.`,
                        metadata: {
                            rewardId,
                            rewardName: result.rewardName,
                            couponCode: result.couponCode,
                        },
                    },
                },
            );
        } catch (error: any) {
            this.logger.error(
                `Failed to emit notification for redeemReward user=${userId}, reward=${rewardId}: ${error.message}`,
            );
        }

        return {
            success: result.success,
            message: result.message,
            couponCode: result.couponCode,
        };
    }

    // --- Admin CRUD ---

    async admin_getAllRewards() {
        return this.prisma.pointReward.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    async admin_createReward(data: any, requesterId = 'SYSTEM') {
        const reward = await this.prisma.pointReward.create({
            data: {
                name: data.name,
                description: data.description,
                costPoints: data.costPoints,
                type: data.type || 'COUPON',
                config: data.config || {},
                isActive: data.isActive !== undefined ? data.isActive : true,
            }
        });

        await this.audit.log({
            userId: requesterId,
            action: 'gamification.reward.create',
            entity: 'PointReward',
            entityId: reward.id,
            description: `Created reward: ${reward.name} (${reward.costPoints} points)`,
            newValues: { name: reward.name, costPoints: reward.costPoints, isActive: reward.isActive },
        });

        return reward;
    }

    async admin_updateReward(id: string, data: any, requesterId = 'SYSTEM') {
        const old = await this.prisma.pointReward.findUnique({ where: { id }, select: { name: true, isActive: true } });
        const updated = await this.prisma.pointReward.update({
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

        await this.audit.log({
            userId: requesterId,
            action: 'gamification.reward.update',
            entity: 'PointReward',
            entityId: id,
            description: `Updated reward: ${old?.name || id}`,
            oldValues: { name: old?.name, isActive: old?.isActive },
            newValues: { name: updated.name, isActive: updated.isActive },
        });

        return updated;
    }

    async admin_deleteReward(id: string, requesterId = 'SYSTEM') {
        const reward = await this.prisma.pointReward.findUnique({ where: { id } });
        const result = await this.prisma.pointReward.delete({
            where: { id }
        });

        await this.audit.log({
            userId: requesterId,
            action: 'gamification.reward.delete',
            entity: 'PointReward',
            entityId: id,
            description: `Deleted reward: ${reward?.name || id}`,
            metadata: { name: reward?.name },
        });

        return result;
    }

    /**
     * Get heatmap data for a user.
     */
    async getActivityHeatmap(userId: string, startDate?: string, endDate?: string) {
        // Use raw query to avoid issues with Prisma's groupBy/findMany when used with certain driver adapters
        // that cause "column must appear in GROUP BY clause" or nested aggregate errors.

        let query = `
            SELECT date, SUM(count)::int as value 
            FROM daily_activities 
            WHERE user_id = $1::uuid
        `;

        const params: any[] = [userId];
        let paramCount = 2;

        if (startDate) {
            query += ` AND date >= $${paramCount++}`;
            params.push(startDate);
        }

        if (endDate) {
            query += ` AND date <= $${paramCount++}`;
            params.push(endDate);
        }

        query += ` GROUP BY date ORDER BY date ASC`;

        try {
            const result = await this.prisma.$queryRawUnsafe<{ date: string; value: number }[]>(query, ...params);
            return result;
        } catch (error) {
            this.logger.error(`Failed to execute heatmap raw query: ${error.message}`, error.stack);
            // Fallback to empty array to avoid crashing the whole request
            return [];
        }
    }
}
