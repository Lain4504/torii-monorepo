import { z } from 'zod';

// ========================================
// Enums
// ========================================

export const ActivityTypeSchema = z.enum([
    'LESSON_COMPLETE',
    'QUIZ_ANSWER',
    'VIDEO_WATCH',
    'REVIEW',
    'PRACTICE',
    'FLASHCARD_REVIEW',
    'EXAM_COMPLETE',
    'POST_CREATE',
    'COMMENT_CREATE',
    'LOGIN',
]);

export const AchievementCategorySchema = z.enum([
    'STREAK',
    'CONSISTENCY',
    'LEARNING_PROGRESS',
    'RECOVERY',
    'SOCIAL',
    'MASTERY',
]);

export type ActivityType = z.infer<typeof ActivityTypeSchema>;
export type AchievementCategory = z.infer<typeof AchievementCategorySchema>;

// ========================================
// Request DTOs
// ========================================

export const RecordActivityDtoSchema = z.object({
    activityType: ActivityTypeSchema,
    meta: z.record(z.any()).optional(),
});

export type RecordActivityDto = z.infer<typeof RecordActivityDtoSchema>;

export const GrantFreezeDtoSchema = z.object({
    amount: z.number().int().positive(),
});

export type GrantFreezeDto = z.infer<typeof GrantFreezeDtoSchema>;

// ========================================
// Response DTOs
// ========================================

export const StreakStatusDtoSchema = z.object({
    currentStreak: z.number().int(),
    longestStreak: z.number().int(),
    freezeCount: z.number().int(),
    isActiveToday: z.boolean(),
    willBreakTomorrow: z.boolean(),
    lastActiveDate: z.string().nullable(),
    totalActiveDays: z.number().int(),
    weeklyActiveCount: z.number().int(),
    monthlyActiveCount: z.number().int(),
});

export type StreakStatusDto = z.infer<typeof StreakStatusDtoSchema>;

export const AchievementDtoSchema = z.object({
    id: z.string().uuid(),
    code: z.string(),
    category: AchievementCategorySchema,
    title: z.string(),
    description: z.string(),
    icon: z.string().nullable(),
    requirements: z.record(z.any()),
    rewards: z.record(z.any()),
    isActive: z.boolean(),
    orderIndex: z.number().int(),
});

export type AchievementDto = z.infer<typeof AchievementDtoSchema>;

export const UserAchievementDtoSchema = z.object({
    id: z.string().uuid(),
    achievementId: z.string().uuid(),
    isUnlocked: z.boolean(),
    progress: z.record(z.any()).nullable(),
    unlockedAt: z.string().datetime().nullable(),
    achievement: AchievementDtoSchema,
});

export type UserAchievementDto = z.infer<typeof UserAchievementDtoSchema>;

// ========================================
// Event Payloads (for NATS)
// ========================================

export const UserActivityEventSchema = z.object({
    userId: z.string().uuid(),
    activityType: ActivityTypeSchema,
    meta: z.record(z.any()).optional(),
    timestamp: z.string().datetime(),
});

export type UserActivityEvent = z.infer<typeof UserActivityEventSchema>;

export const AchievementUnlockedEventSchema = z.object({
    userId: z.string().uuid(),
    achievementId: z.string().uuid(),
    achievementCode: z.string(),
    achievementTitle: z.string(),
    rewards: z.record(z.any()),
    timestamp: z.string().datetime(),
});

export type AchievementUnlockedEvent = z.infer<typeof AchievementUnlockedEventSchema>;

export const StreakUpdatedEventSchema = z.object({
    userId: z.string().uuid(),
    oldStreak: z.number().int(),
    newStreak: z.number().int(),
    isMilestone: z.boolean(),
    timestamp: z.string().datetime(),
});

export type StreakUpdatedEvent = z.infer<typeof StreakUpdatedEventSchema>;
