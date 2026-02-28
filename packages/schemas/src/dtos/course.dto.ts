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
    isReadyForScheduling: true,
    minimumLessons: true,
}).extend({
    lecturerId: z.string().uuid().optional().nullable(),
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

// Basic User info for instructor
export const courseInstructorDTOSchema = z.object({
    id: z.string().uuid(),
    displayName: z.string(),
    avatarUrl: z.string().optional().nullable(),
    email: z.string().optional(),
});

export type CourseInstructorDTO = z.infer<typeof courseInstructorDTOSchema>;

export const courseResponseDTOSchema = courseSchema.extend({
    lecturer: courseInstructorDTOSchema.optional().nullable(),
});

export type CourseResponseDTO = z.infer<typeof courseResponseDTOSchema>;

// DTO for learner-facing course search/catalog results
export const courseSearchResponseDTOSchema = courseSchema.pick({
    id: true,
    title: true,
    slug: true,
    thumbnailUrl: true,
    jlptLevel: true,
    price: true,
    discountPrice: true,
    totalStudents: true,
    totalLessons: true,
    durationWeeks: true,
    averageRating: true,
    totalReviews: true,
    shortDescription: true,
    description: true,
    aiMetadata: true,
}).extend({
    lecturer: courseInstructorDTOSchema.optional().nullable(),
});

export type CourseSearchResponseDTO = z.infer<typeof courseSearchResponseDTOSchema>;

export const courseSearchRequestDTOSchema = paginationOptionsDTOSchema.extend({
    status: z.nativeEnum(CourseStatus).optional(),
    jlptLevel: z.string().optional(),
    instructorId: z.string().uuid().optional(),
});

export type CourseSearchRequestDTO = z.infer<typeof courseSearchRequestDTOSchema>;
export type CourseQueryDTO = CourseSearchRequestDTO;
