import { z } from 'zod';

export const academyEnrollmentCreateDTOSchema = z.object({
    classId: z.string().uuid(),
    userId: z.string().uuid(),
    expiresAt: z.string().datetime().optional(),
    status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED']).default('ACTIVE'),
    sourceOfferingId: z.string().uuid().optional(),
    companyId: z.string().uuid().optional(),
    metadata: z.unknown().optional(),
});
export type AcademyEnrollmentCreateDTO = z.infer<
    typeof academyEnrollmentCreateDTOSchema
>;

export const academyEnrollmentUpdateDTOSchema = z.object({
    expiresAt: z.string().datetime().optional(),
    status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED']).optional(),
    metadata: z.unknown().optional(),
});
export type AcademyEnrollmentUpdateDTO = z.infer<
    typeof academyEnrollmentUpdateDTOSchema
>;

export const academyEnrollmentQueryDTOSchema = z.object({
    classId: z.string().uuid().optional(),
    userId: z.string().uuid().optional(),
    status: z.string().optional(),
});
export type AcademyEnrollmentQueryDTO = z.infer<
    typeof academyEnrollmentQueryDTOSchema
>;
export const academyEnrollmentModelSchema = z.object({
    id: z.string().uuid(),
    classId: z.string().uuid(),
    userId: z.string().uuid(),
    expiresAt: z.coerce.date().nullable(),
    status: z.string(),
    sourceOfferingId: z.string().uuid().nullable(),
    companyId: z.string().uuid().nullable(),
    metadata: z.unknown().nullable(),
    completionPercentage: z.number().min(0).max(100).default(0),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    // Relations
    class: z.any().optional(),
    user: z.any().optional(),

    // Learner View Rich Fields (Calculated by backend for learner portal)
    courseId: z.string().uuid().optional(),
    courseRunId: z.string().uuid().optional(),
    courseTitle: z.string().optional(),
    slug: z.string().optional(),
    thumbnailUrl: z.string().nullable().optional(),
    instructorName: z.string().optional(),
    instructorAvatar: z.string().nullable().optional(),
    progress: z.number().optional(),
    completedLessons: z.number().optional(),
    totalLessons: z.number().optional(),
});
export type AcademyEnrollmentModel = z.infer<typeof academyEnrollmentModelSchema>;
