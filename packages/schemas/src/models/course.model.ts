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
    ARCHIVED = 'archived',
}

export const courseSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1),
    slug: z.string(),
    description: z.string().optional(),
    shortDescription: z.string().optional(),
    jlptLevel: z.nativeEnum(JlptLevel),
    thumbnailUrl: z.string().optional(),
    previewVideoUrl: z.string().optional(),
    price: z.number().min(0),
    discountPrice: z.number().min(0).optional(),
    durationWeeks: z.number().min(0).optional(),
    totalLessons: z.number().default(0),
    totalQuizzes: z.number().default(0),
    totalStudents: z.number().default(0),
    averageRating: z.number().default(0),
    totalReviews: z.number().default(0),
    status: z.nativeEnum(CourseStatus),
    featured: z.boolean().default(false),
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
