import { z } from 'zod';
import { CourseStatus, courseSchema, JlptLevel, deriveCourseStatus } from '../models/course.model';

export const courseCreateDTOSchema = courseSchema
    .pick({
        title: true,
        type: true,
        description: true,
        shortDescription: true,
        jlptLevel: true,
        aiMetadata: true,
        thumbnailUrl: true,
        previewVideoUrl: true,
        price: true,
        discountPrice: true,
        liveConfig: true,
        durationWeeks: true,
        isFree: true,
        tags: true,
        learningOutcomes: true,
        requirements: true,
        createdBy: true,
    })
    .extend({
        jlptLevel: z.nativeEnum(JlptLevel),
        tags: z.array(z.string()).optional(),
    });

export type CourseCreateDTO = z.infer<typeof courseCreateDTOSchema>;

export const courseUpdateDTOSchema = courseSchema
    .pick({
        title: true,
        type: true,
        description: true,
        shortDescription: true,
        jlptLevel: true,
        thumbnailUrl: true,
        previewVideoUrl: true,
        price: true,
        discountPrice: true,
        liveConfig: true,
        durationWeeks: true,
        isFree: true,
        tags: true,
        learningOutcomes: true,
        requirements: true,
        approvedBy: true,
    })
    .partial();

export type CourseUpdateDTO = z.infer<typeof courseUpdateDTOSchema>;

export const courseQueryDTOSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    jlptLevel: z.nativeEnum(JlptLevel).optional(),
    status: z.nativeEnum(CourseStatus).optional(), // Filter by computed status
    search: z.string().optional(),
});

export type CourseQueryDTO = z.infer<typeof courseQueryDTOSchema>;

export const courseResponseDTOSchema = courseSchema.extend({
    // Status is computed from approvedBy/approvedAt
    // featured is removed - can be added to aiMetadata if needed
    instructors: z.array(z.object({
        id: z.string().uuid(),
        userId: z.string().uuid(),
        courseId: z.string().uuid(),
        isPrimary: z.boolean(),
        assignedDate: z.date(),
        user: z.object({
            id: z.string().uuid(),
            displayName: z.string(),
            avatarUrl: z.string().optional().nullable(),
            email: z.string(),
        }),
    })).optional().default([]),
});

// Export helper for deriving status
export { deriveCourseStatus };

export type CourseResponseDTO = z.infer<typeof courseResponseDTOSchema>;
