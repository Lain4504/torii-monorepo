import { z } from 'zod';

export const academyLearningProgressModelSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    classId: z.string().uuid(),
    lessonId: z.string().uuid(),
    status: z.string(),
    progressPercent: z.number(),
    lastAccessedAt: z.coerce.date(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),

    // Rich Mapping Fields (Learner View)
    courseTitle: z.string().optional(),
    lessonTitle: z.string().optional(),
    timestamp: z.coerce.date().optional(),
    slug: z.string().optional(),
    courseProfileId: z.string().uuid().optional(),
});

export type AcademyLearningProgressModel = z.infer<typeof academyLearningProgressModelSchema>;

export const academyLearningStatsSchema = z.object({
    totalCourses: z.number(),
    totalLearningHours: z.number(),
    inProgressCourses: z.number(),
    completedCourses: z.number(),
    averageProgress: z.number(),
});

export type AcademyLearningStats = z.infer<typeof academyLearningStatsSchema>;
