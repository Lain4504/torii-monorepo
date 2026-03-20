import { z } from 'zod';

export const academyClassCreateDTOSchema = z.object({
  courseProfileId: z.string().uuid(),
  code: z.string().min(1).max(150),
  name: z.string().min(1).max(255),
  mode: z.enum(['VOD', 'LIVE']),
  status: z.string().max(20).optional(),
  instructorId: z.string().uuid().optional(),

  // LIVE timeline (auto-generated from term in UI, but persisted in DB)
  openingDate: z.coerce.date().optional(),
  closingDate: z.coerce.date().optional(),
  enrollmentOpenAt: z.coerce.date().optional(),
  enrollmentCloseAt: z.coerce.date().optional(),
}).superRefine((data, ctx) => {
  if (data.mode === 'LIVE') {
    if (!data.openingDate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['openingDate'], message: 'LIVE class cần ngày khai giảng' })
    }
    if (!data.closingDate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['closingDate'], message: 'LIVE class cần ngày bế giảng' })
    }
  }
});
export type AcademyClassCreateDTO = z.infer<typeof academyClassCreateDTOSchema>;

export const academyClassUpdateDTOSchema = z.object({
  name: z.string().max(255).optional(),
  instructorId: z.string().uuid().optional(),
  status: z.string().max(20).optional(),
  openingDate: z.coerce.date().optional(),
  closingDate: z.coerce.date().optional(),
  enrollmentOpenAt: z.coerce.date().optional(),
  enrollmentCloseAt: z.coerce.date().optional(),
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
  code: z.string().max(150).optional(),
  name: z.string().max(255).optional(),
  instructorId: z.string().uuid().optional(),
});
export type AcademyClassDuplicateDTO = z.infer<typeof academyClassDuplicateDTOSchema>;
export const academyClassModelSchema = z.object({
  id: z.string().uuid(),
  courseProfileId: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  mode: z.enum(['VOD', 'LIVE']),
  status: z.string(),
  instructorId: z.string().uuid().nullable().optional(),
  openingDate: z.coerce.date().nullable().optional(),
  closingDate: z.coerce.date().nullable().optional(),
  enrollmentOpenAt: z.coerce.date().nullable().optional(),
  enrollmentCloseAt: z.coerce.date().nullable().optional(),
  submittedForApprovalAt: z.coerce.date().nullable().optional(),
  submittedBy: z.string().uuid().nullable().optional(),
  approvedAt: z.coerce.date().nullable().optional(),
  approvedBy: z.string().uuid().nullable().optional(),
  rejectedAt: z.coerce.date().nullable().optional(),
  rejectedBy: z.string().uuid().nullable().optional(),
  rejectionReason: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),

  // Backward-compat fields (legacy responses may still include)
  vodClass: z.any().optional().nullable(),
  liveClass: z.any().optional().nullable(),
  courseProfile: z.any().optional(),
  durationDays: z.number().optional(),
});
export type AcademyClassModel = z.infer<typeof academyClassModelSchema>;
