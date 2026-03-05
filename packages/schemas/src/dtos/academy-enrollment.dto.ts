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
