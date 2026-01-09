import { z } from 'zod';

export enum JlptLevel {
    N5 = 'N5',
    N4 = 'N4',
    N3 = 'N3',
    N2 = 'N2',
    N1 = 'N1',
}

export enum CourseStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
}

/**
 * Helper function to derive course status from approvedBy and approvedAt
 */
export function deriveCourseStatus(approvedBy: string | null | undefined, approvedAt: Date | null | undefined): CourseStatus {
    return (approvedBy && approvedAt) ? CourseStatus.PUBLISHED : CourseStatus.DRAFT;
}

export const courseSchema = z.object({
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
    price: z.number().min(0),
    discountPrice: z.number().min(0).optional(),
    liveConfig: z.record(z.any()).optional().nullable(), // JSONB
    durationWeeks: z.number().min(0).optional(),
    totalLessons: z.number().default(0),
    totalQuizzes: z.number().default(0),
    totalStudents: z.number().default(0),
    averageRating: z.number().default(0),
    totalReviews: z.number().default(0),
    status: z.nativeEnum(CourseStatus), // Computed field derived from approvedBy/approvedAt
    isFree: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
    learningOutcomes: z.any().optional(), // JSONB
    requirements: z.any().optional(), // JSONB
    createdBy: z.string().uuid().optional(),
    approvedBy: z.string().uuid().optional(),
    approvedAt: z.date().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().optional(),
});

export type Course = z.infer<typeof courseSchema>;
