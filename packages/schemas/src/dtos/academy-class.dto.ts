import { z } from 'zod';

export const academyClassCreateDTOSchema = z.object({
  courseProfileId: z.string().uuid(),
  syllabusId: z.string().uuid().optional(),
  code: z.string().min(1).max(150),
  name: z.string().min(1).max(255),
  mode: z.enum(['VOD', 'LIVE']),

  // Common optional
  status: z.string().max(20).optional(),
  companyId: z.string().uuid().optional(),
  settings: z.unknown().optional(),

  // Live-only fields (mapped to opening/closing date & instructor in classroom service)
  term: z.string().max(100).optional(),
  batch: z.string().max(100).optional(),
  openingDate: z.coerce.date().optional(),
  closingDate: z.coerce.date().optional(),
  minStudents: z.number().int().min(0).optional(),
  minStudentsEnforcement: z.enum(['STRICT', 'NOTIFY', 'DISABLED']).optional(),
  instructorId: z.string().uuid().optional(),

  // Shared enrollment fields
  enrollmentOpenAt: z.coerce.date().optional(),
  enrollmentCloseAt: z.coerce.date().optional(),
  maxStudents: z.number().int().min(0).optional(),

  // VOD-only fields
  defaultExpiresMonths: z.number().int().min(0).optional(),
}).superRefine((data, ctx) => {
  if (data.mode === 'LIVE' && data.openingDate && data.closingDate) {
    if (data.closingDate < data.openingDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Closing date must be after or equal to opening date',
        path: ['closingDate'],
      });
    }
  }
  if (data.enrollmentOpenAt && data.enrollmentCloseAt) {
    if (data.enrollmentCloseAt < data.enrollmentOpenAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enrollment close date must be after or equal to open date',
        path: ['enrollmentCloseAt'],
      });
    }
  }
});
export type AcademyClassCreateDTO = z.infer<typeof academyClassCreateDTOSchema>;

export const academyClassUpdateDTOSchema = z.object({
  name: z.string().max(255).optional(),
  mode: z.enum(['VOD', 'LIVE']).optional(),

  // Live fields
  term: z.string().max(100).optional(),
  batch: z.string().max(100).optional(),
  openingDate: z.coerce.date().optional(),
  closingDate: z.coerce.date().optional(),
  minStudents: z.number().int().min(0).optional(),
  minStudentsEnforcement: z.enum(['STRICT', 'NOTIFY', 'DISABLED']).optional(),
  instructorId: z.string().uuid().optional(),

  // Shared enrollment fields
  enrollmentOpenAt: z.coerce.date().optional(),
  enrollmentCloseAt: z.coerce.date().optional(),
  maxStudents: z.number().int().min(0).optional(),

  // VOD-only fields
  defaultExpiresMonths: z.number().int().min(0).optional(),

  status: z.string().max(20).optional(),
  companyId: z.string().uuid().optional(),
  settings: z.unknown().optional(),
}).superRefine((data, ctx) => {
  // Only validate if both present in update
  if (data.openingDate && data.closingDate) {
    if (data.closingDate < data.openingDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Closing date must be after or equal to opening date',
        path: ['closingDate'],
      });
    }
  }
  if (data.enrollmentOpenAt && data.enrollmentCloseAt) {
    if (data.enrollmentCloseAt < data.enrollmentOpenAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enrollment close date must be after or equal to open date',
        path: ['enrollmentCloseAt'],
      });
    }
  }
});

export type AcademyClassUpdateDTO = z.infer<typeof academyClassUpdateDTOSchema>;

export const academyClassQueryDTOSchema = z.object({
  courseProfileId: z.string().uuid().optional(),
  mode: z.string().optional(),
  status: z.string().optional(),
  instructorId: z.string().uuid().optional(),
  q: z.string().optional(),
});
export type AcademyClassQueryDTO = z.infer<typeof academyClassQueryDTOSchema>;

export const academyClassDuplicateDTOSchema = z.object({
  term: z.string().max(100).optional(),
  batch: z.string().max(100).optional(),
  openingDate: z.coerce.date().optional(),
  closingDate: z.coerce.date().optional(),
  code: z.string().max(150).optional(),
  name: z.string().max(255).optional(),
});
export type AcademyClassDuplicateDTO = z.infer<typeof academyClassDuplicateDTOSchema>;
export const academyClassModelSchema = z.object({
  id: z.string().uuid(),
  courseProfileId: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  mode: z.enum(['VOD', 'LIVE']),
  status: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),

  // TPT Relations (Flattened or nested depending on include)
  vodClass: z.object({
    id: z.string().uuid(),
    enrollmentOpenAt: z.coerce.date().nullable(),
    enrollmentCloseAt: z.coerce.date().nullable(),
    maxStudents: z.number().nullable(),
    defaultExpiresMonths: z.number().nullable(),
  }).nullable().optional(),
  liveClass: z.object({
    id: z.string().uuid(),
    term: z.string().nullable(),
    batch: z.string().nullable(),
    openingDate: z.coerce.date().nullable(),
    closingDate: z.coerce.date().nullable(),
    enrollmentOpenAt: z.coerce.date().nullable(),
    enrollmentCloseAt: z.coerce.date().nullable(),
    minStudents: z.number().nullable(),
    maxStudents: z.number().nullable(),
    instructorId: z.string().uuid().nullable(),
  }).nullable().optional(),
});
export type AcademyClassModel = z.infer<typeof academyClassModelSchema>;

export const academyClassModuleCreateDTOSchema = z.object({
  title: z.string().min(1).max(255),
  orderIndex: z.number().int().min(0).optional(),
});
export type AcademyClassModuleCreateDTO = z.infer<
  typeof academyClassModuleCreateDTOSchema
>;

export const academyClassModuleUpdateDTOSchema = z.object({
  title: z.string().max(255).optional(),
  orderIndex: z.number().int().min(0).optional(),
});
export type AcademyClassModuleUpdateDTO = z.infer<
  typeof academyClassModuleUpdateDTOSchema
>;

export const academyClassContentItemCreateDTOSchema = z.object({
  kind: z
    .enum(['VIDEO', 'MATERIAL', 'EXAM', 'ASSIGNMENT', 'TOPIC'])
    .or(z.string().min(1).max(20)),
  referenceId: z.string().uuid().optional(),
  orderIndex: z.number().int().min(0).optional(),
  status: z.string().max(20).optional(),
  availableFrom: z.coerce.date().optional(),
  deadline: z.coerce.date().optional(),
  isPrerequisite: z.boolean().optional(),
  settings: z.unknown().optional(),
});
export type AcademyClassContentItemCreateDTO = z.infer<
  typeof academyClassContentItemCreateDTOSchema
>;

export const academyClassContentItemUpdateDTOSchema =
  academyClassContentItemCreateDTOSchema.partial();
export type AcademyClassContentItemUpdateDTO = z.infer<
  typeof academyClassContentItemUpdateDTOSchema
>;
