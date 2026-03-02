import { z } from 'zod';
import { paginationOptionsDTOSchema } from './common.dto';
import { courseMasterSchema, CourseMasterStatus } from '../models/course-master.model';

export const courseMasterCreateDTOSchema = courseMasterSchema.pick({
    title: true,
    description: true,
    shortDescription: true,
    jlptLevel: true,
    type: true,
    durationWeeks: true,
    expirationMonths: true,
    tags: true,
    learningOutcomes: true,
    requirements: true,
    aiMetadata: true,
}).extend({
    lecturerId: z.string().uuid().optional().nullable(),
}).partial({
    description: true,
    shortDescription: true,
    type: true,
    durationWeeks: true,
    expirationMonths: true,
    tags: true,
    learningOutcomes: true,
    requirements: true,
    aiMetadata: true,
});

export type CourseMasterCreateDTO = z.infer<typeof courseMasterCreateDTOSchema>;

export const courseMasterUpdateDTOSchema = courseMasterCreateDTOSchema.extend({
    approvedBy: z.string().uuid().optional(),
    status: z.nativeEnum(CourseMasterStatus).optional(),
}).partial();

export type CourseMasterUpdateDTO = z.infer<typeof courseMasterUpdateDTOSchema>;

// Basic User info for instructor
export const courseMasterInstructorDTOSchema = z.object({
    id: z.string().uuid(),
    displayName: z.string(),
    avatarUrl: z.string().optional().nullable(),
    email: z.string().optional(),
});

export type CourseMasterInstructorDTO = z.infer<typeof courseMasterInstructorDTOSchema>;

export const courseMasterResponseDTOSchema = courseMasterSchema.extend({
    lecturer: courseMasterInstructorDTOSchema.optional().nullable(),
});

export type CourseMasterResponseDTO = z.infer<typeof courseMasterResponseDTOSchema>;

// DTO for learner-facing course search/catalog results
export const courseMasterSearchResponseDTOSchema = courseMasterSchema.pick({
    id: true,
    title: true,
    slug: true,
    jlptLevel: true,
    totalStudents: true,
    totalLessons: true,
    durationWeeks: true,
    averageRating: true,
    totalReviews: true,
    shortDescription: true,
    description: true,
    aiMetadata: true,
    type: true,
    thumbnailUrl: true,
}).extend({
    lecturer: courseMasterInstructorDTOSchema.optional().nullable(),
});

export type CourseMasterSearchResponseDTO = z.infer<typeof courseMasterSearchResponseDTOSchema>;

export const courseMasterSearchRequestDTOSchema = paginationOptionsDTOSchema.extend({
    status: z.nativeEnum(CourseMasterStatus).optional(),
    jlptLevel: z.string().optional(),
    instructorId: z.string().uuid().optional(),
});

export type CourseMasterSearchRequestDTO = z.infer<typeof courseMasterSearchRequestDTOSchema>;
export type CourseMasterQueryDTO = CourseMasterSearchRequestDTO;
