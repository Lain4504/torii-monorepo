import { z } from 'zod';
import { courseSchema, JlptLevel, CourseStatus } from '../models/course.model';

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
        status: true,
        featured: true,
        isFree: true,
        tags: true,
        learningOutcomes: true,
        requirements: true,
        createdBy: true,
    })
    .extend({
        jlptLevel: z.nativeEnum(JlptLevel),
        status: z.nativeEnum(CourseStatus).optional(),
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
        aiMetadata: true,
        thumbnailUrl: true,
        previewVideoUrl: true,
        price: true,
        discountPrice: true,
        liveConfig: true,
        durationWeeks: true,
        status: true,
        featured: true,
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
    status: z.nativeEnum(CourseStatus).optional(),
    search: z.string().optional(),
    featured: z.coerce.boolean().optional(),
});

export type CourseQueryDTO = z.infer<typeof courseQueryDTOSchema>;

export const courseResponseDTOSchema = courseSchema.extend({
    // Add any computed fields or relationships if needed, 
    // but default schema should cover most response fields
});

export type CourseResponseDTO = z.infer<typeof courseResponseDTOSchema>;
