import { z } from 'zod';
import { enrollmentSchema, EnrollmentStatus } from '../models/enrollment.model';

// Response DTO - includes backward compatibility aliases
export const enrollmentResponseDTOSchema = enrollmentSchema;

export type EnrollmentResponseDTO = z.infer<typeof enrollmentResponseDTOSchema>;

export const enrollmentCreateDTOSchema = z.object({
    courseId: z.string().uuid(),
});

export type EnrollmentCreateDTO = z.infer<typeof enrollmentCreateDTOSchema>;

export const enrollmentQueryDTOSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).default(10),
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

