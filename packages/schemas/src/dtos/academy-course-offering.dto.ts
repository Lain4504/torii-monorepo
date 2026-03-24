import { z } from 'zod';

// DTO cho CourseOffering bám sát CourseOfferingCreateDto / CourseOfferingUpdateDto bên service academy
// và model Prisma CourseOffering.

/** HTML datetime-local (YYYY-MM-DDTHH:mm, không timezone) hoặc chuỗi ISO đầy đủ từ API */
const marketingDateTimeString = z.union([
    z.string().datetime({ local: true }),
    z.string().datetime({ offset: true }),
    z.string().datetime(),
]);

const optionalMarketingDateTime = z.preprocess(
    (v) => (v === '' || v === null ? undefined : v),
    marketingDateTimeString.optional(),
);

const optionalMarketingDateTimeNullable = z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.union([z.null(), marketingDateTimeString]).optional(),
);

/** Select/rHF thường gửi "" thay vì undefined — Zod .uuid().optional() không chấp nhận "". */
const optionalUuid = z.preprocess(
    (v) => (v === '' || v === null ? undefined : v),
    z.string().uuid().optional(),
);

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
        classId: optionalUuid,
        status: z.string().max(20).optional(),
        validFrom: optionalMarketingDateTime,
        validTo: optionalMarketingDateTime,
    })
    .refine(
        (data) => {
            if (data.mode === 'VOD' && !data.classId) return false;
            return true;
        },
        {
            message: 'VOD mode requires classId',
            path: ['classId'],
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
    courseProfileId: optionalUuid,
    classId: optionalUuid,
    status: z.string().max(20).optional(),
    validFrom: optionalMarketingDateTimeNullable,
    validTo: optionalMarketingDateTimeNullable,
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

