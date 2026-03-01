import { z } from 'zod';
import { enrollmentSchema } from '../models/enrollment.model';
import { EnrollmentStatus } from '../enums/enrollment.enum';
import { paginationQuerySchema } from './common.dto';

// Response DTO - includes backward compatibility aliases
export const enrollmentResponseDTOSchema = enrollmentSchema.extend({
    user: z.object({
        id: z.string().uuid(),
        displayName: z.string(),
        email: z.string(),
        avatarUrl: z.string().nullable().optional(),
    }).optional(),
    course: z.object({
        id: z.string().uuid(),
        title: z.string(),
        slug: z.string(),
    }).optional(),
    courseRun: z.object({
        id: z.string().uuid(),
        title: z.string(),
    }).optional().nullable(),
});

export type EnrollmentResponseDTO = z.infer<typeof enrollmentResponseDTOSchema>;

export const enrollmentCreateDTOSchema = z.object({
    courseId: z.string().uuid(),
    courseRunId: z.string().uuid().optional(),
    isGift: z.boolean().optional(),
    giftMessage: z.string().optional(),
    senderId: z.string().uuid().optional(),
});

export type EnrollmentCreateDTO = z.infer<typeof enrollmentCreateDTOSchema>;

export const trialEnrollmentCreateDTOSchema = z.object({
    courseId: z.string().uuid(),
    courseRunId: z.string().uuid().optional(),
});

export type TrialEnrollmentCreateDTO = z.infer<typeof trialEnrollmentCreateDTOSchema>;

export const enrollmentQueryDTOSchema = paginationQuerySchema.extend({
    userId: z.string().uuid().optional(),
    courseId: z.string().uuid().optional(),
    status: z.nativeEnum(EnrollmentStatus).optional(),
});

export type EnrollmentQueryDTO = z.infer<typeof enrollmentQueryDTOSchema>;

export const enrollmentPaginatedResponseSchema = z.object({
    data: z.array(enrollmentResponseDTOSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
});

export type EnrollmentPaginatedResponse = z.infer<typeof enrollmentPaginatedResponseSchema>;

