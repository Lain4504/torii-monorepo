import { z } from 'zod';
import { paginationOptionsDTOSchema } from './common.dto';
import { courseSchema, CourseStatus } from '../models/course.model';

export const courseCreateDTOSchema = courseSchema.pick({
    title: true,
    description: true,
    shortDescription: true,
    jlptLevel: true,
    thumbnailUrl: true,
    previewVideoUrl: true,
    price: true,
    discountPrice: true,
    type: true,
    isFree: true,
    durationWeeks: true,
    expirationMonths: true,
    startDate: true,
    expiresAt: true,
    registrationClosedAt: true,
    tags: true,
    learningOutcomes: true,
    requirements: true,
    liveConfig: true,
    maxStudents: true,
    aiMetadata: true,
}).partial({
    description: true,
    shortDescription: true,
    thumbnailUrl: true,
    previewVideoUrl: true,
    discountPrice: true,
    type: true,
    isFree: true,
    durationWeeks: true,
    expirationMonths: true,
    startDate: true,
    expiresAt: true,
    registrationClosedAt: true,
    tags: true,
    learningOutcomes: true,
    requirements: true,
    liveConfig: true,
    maxStudents: true,
    aiMetadata: true,
});

export type CourseCreateDTO = z.infer<typeof courseCreateDTOSchema>;

export const courseUpdateDTOSchema = courseCreateDTOSchema.extend({
    approvedBy: z.string().uuid().optional(),
    status: z.nativeEnum(CourseStatus).optional(),
}).partial();

export type CourseUpdateDTO = z.infer<typeof courseUpdateDTOSchema>;

export const courseResponseDTOSchema = courseSchema.extend({
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

export type CourseResponseDTO = z.infer<typeof courseResponseDTOSchema>;

export const courseSearchRequestDTOSchema = paginationOptionsDTOSchema.extend({
    status: z.nativeEnum(CourseStatus).optional(),
    jlptLevel: z.string().optional(),
    instructorId: z.string().uuid().optional(),
});

export type CourseSearchRequestDTO = z.infer<typeof courseSearchRequestDTOSchema>;
