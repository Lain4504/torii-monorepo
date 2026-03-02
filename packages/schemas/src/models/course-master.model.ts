import { z } from 'zod';

export enum JlptLevel {
    N5 = 'N5',
    N4 = 'N4',
    N3 = 'N3',
    N2 = 'N2',
    N1 = 'N1',
}

export enum CourseMasterStatus {
    DRAFT = 'draft',
    PENDING_REVIEW = 'pending_review',
    PUBLISHED = 'published',
    REJECTED = 'rejected',
    ARCHIVED = 'archived',
}

export enum InstructorRole {
    MAIN = 'MAIN',
    ASSISTANT = 'ASSISTANT',
    RECORDER = 'RECORDER',
}

/**
 * Helper function to derive course status from approvedBy and approvedAt
 */
export function deriveCourseMasterStatus(approvedBy: string | null | undefined, approvedAt: Date | null | undefined, isSubmittedForReview?: boolean, rejectionReason?: string | null, deletedAt?: Date | null): CourseMasterStatus {
    if (deletedAt) return CourseMasterStatus.ARCHIVED;
    if (approvedBy && approvedAt) return CourseMasterStatus.PUBLISHED;
    if (rejectionReason) return CourseMasterStatus.REJECTED;
    if (isSubmittedForReview) return CourseMasterStatus.PENDING_REVIEW;
    return CourseMasterStatus.DRAFT;
}

export const courseMasterSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1),
    slug: z.string(),
    type: z.enum(['vod', 'live']).default('vod'),
    description: z.string().optional(),
    shortDescription: z.string().optional(),
    jlptLevel: z.nativeEnum(JlptLevel),
    aiMetadata: z.record(z.any()).default({}), // JSONB
    thumbnailUrl: z.string().optional(),
    previewVideoUrl: z.string().optional(),
  // Live config moved to CourseRun (per-cohort configuration)
    durationWeeks: z.number().min(0).optional(),         // Thời lượng nội dung khóa học (hiển thị)
    expirationMonths: z.number().int().min(1).max(6).optional(), // 1-6 tháng: thời hạn truy cập
    totalLessons: z.number().default(0),
    totalQuizzes: z.number().default(0),
    totalStudents: z.number().default(0),
    averageRating: z.number().default(0),
    totalReviews: z.number().default(0),
    status: z.nativeEnum(CourseMasterStatus), // Computed field derived from approvedBy/approvedAt
    tags: z.array(z.string()).optional(),
    learningOutcomes: z.any().optional(), // JSONB
    requirements: z.any().optional(), // JSONB
    createdBy: z.string().uuid().optional(),
    lecturerId: z.string().uuid().optional().nullable(),
    approvedBy: z.string().uuid().optional(),
    approvedAt: z.date().optional(),
    rejectionReason: z.string().optional().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().optional(),
});

export type CourseMaster = z.infer<typeof courseMasterSchema>;



