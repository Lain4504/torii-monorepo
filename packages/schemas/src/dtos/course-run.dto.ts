import { z } from 'zod';
import { courseRunSchema } from '../models/course-run.model';
import { paginationOptionsDTOSchema } from './common.dto';

export const courseRunCreateDTOSchema = courseRunSchema.pick({
    courseMasterId: true,
    title: true,
    lecturerId: true,
    startDate: true,
    endDate: true,
    enrollmentStart: true,
    enrollmentEnd: true,
    maxStudents: true,
    minStudents: true,
    price: true,
    discountPrice: true,
    coverUrl: true,
    previewVideoUrl: true,
    status: true,
}).extend({
    versionId: z.string().uuid().optional().nullable(),
});

export type CourseRunCreateDTO = z.infer<typeof courseRunCreateDTOSchema>;

export const courseRunUpdateDTOSchema = courseRunCreateDTOSchema.extend({
    status: courseRunSchema.shape.status.optional(),
}).partial();

export type CourseRunUpdateDTO = z.infer<typeof courseRunUpdateDTOSchema>;

export const courseRunResponseDTOSchema = courseRunSchema.extend({
    courseMaster: z.object({
        id: z.string().uuid(),
        title: z.string(),
        slug: z.string(),
        jlptLevel: z.string().optional().nullable(),
        shortDescription: z.string().optional().nullable(),
        description: z.string().optional().nullable(),
        learningOutcomes: z.any().optional().nullable(),
        requirements: z.any().optional().nullable(),
        totalLessons: z.number().int().default(0),
        totalQuizzes: z.number().int().default(0),
        durationWeeks: z.number().int().optional().nullable(),
        thumbnailUrl: z.string().optional().nullable(),
    }).optional().nullable(),
    lecturer: z.object({
        id: z.string().uuid(),
        displayName: z.string(),
        avatarUrl: z.string().optional().nullable(),
    }).optional().nullable(),
    averageRating: z.number().optional().nullable(),
    totalReviews: z.number().int().optional().nullable(),
});

export type CourseRunResponseDTO = z.infer<typeof courseRunResponseDTOSchema>;

export const courseRunSearchRequestDTOSchema = paginationOptionsDTOSchema.extend({
    courseMasterId: z.string().uuid().optional(),
    status: courseRunSchema.shape.status.optional(),
    type: z.enum(['vod', 'live']).optional(),
});

export type CourseRunSearchRequestDTO = z.infer<typeof courseRunSearchRequestDTOSchema>;
