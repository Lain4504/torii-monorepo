import { z } from 'zod';

// DTO cho CourseOffering bám sát CourseOfferingCreateDto / CourseOfferingUpdateDto bên service academy
// và model Prisma CourseOffering.

export const academyCourseOfferingCreateDTOSchema = z
    .object({
        code: z.string().min(1).max(150),
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        price: z.number().min(0),
        salePrice: z.number().min(0).optional(),
        currency: z.string().min(1).max(10),
        mode: z.string().min(1), // ClassMode (VOD / LIVE)
        courseProfileId: z.string().uuid(),
        termId: z.string().uuid().optional(),
        classId: z.string().uuid().optional(),
        status: z.string().max(20).optional(),
        validFrom: z.string().datetime().optional().or(z.null()),
        validTo: z.string().datetime().optional().or(z.null()),
    })
    .refine(
        (data) => {
            if (data.mode === 'LIVE' && !data.termId) return false;
            if (data.mode === 'VOD' && !data.classId) return false;
            return true;
        },
        {
            message: 'LIVE mode requires termId, VOD mode requires classId',
            path: ['termId'],
        },
    );

export type AcademyCourseOfferingCreateDTO = z.infer<typeof academyCourseOfferingCreateDTOSchema>;

export const academyCourseOfferingUpdateDTOSchema = z.object({
    title: z.string().max(255).optional(),
    description: z.string().optional(),
    price: z.number().min(0).optional(),
    salePrice: z.number().min(0).optional(),
    currency: z.string().max(10).optional(),
    mode: z.string().optional(),
    courseProfileId: z.string().uuid().optional(),
    termId: z.string().uuid().optional(),
    classId: z.string().uuid().optional(),
    status: z.string().max(20).optional(),
    validFrom: z.string().datetime().optional().or(z.null()),
    validTo: z.string().datetime().optional().or(z.null()),
});
export type AcademyCourseOfferingUpdateDTO = z.infer<
  typeof academyCourseOfferingUpdateDTOSchema
>;

export const academyCourseOfferingQueryDTOSchema = z.object({
  status: z.string().optional(),
  q: z.string().optional(),
  /** Filter by mode: VOD | LIVE */
  mode: z.enum(['VOD', 'LIVE']).optional(),
  /** When true and mode=LIVE, only return offerings that have at least one class in enrollment window (OPENING, now in [enrollmentOpenAt, enrollmentCloseAt]) */
  hasEnrollableLiveClass: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((v) =>
      v === undefined ? undefined : v === true || v === 'true',
    ),
});
export type AcademyCourseOfferingQueryDTO = z.infer<
  typeof academyCourseOfferingQueryDTOSchema
>;

