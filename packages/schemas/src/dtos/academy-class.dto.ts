import { z } from 'zod';

export const academyClassCreateDTOSchema = z.object({
  courseProfileId: z.string().uuid(),
  courseEditionId: z.string().uuid(),
  code: z.string().min(1).max(150),
  name: z.string().min(1).max(255),
  mode: z.enum(['VOD', 'LIVE']),

  // Common optional
  status: z.string().max(20).optional(),
  companyId: z.string().uuid().optional(),
  settings: z.unknown().optional(),

  // Live-only fields
  term: z.string().max(100).optional(),
  batch: z.string().max(100).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  minStudents: z.number().int().min(0).optional(),
  minStudentsEnforcement: z.enum(['STRICT', 'NOTIFY', 'DISABLED']).optional(),
  primaryTeacherId: z.string().uuid().optional(),

  // Shared enrollment fields
  enrollmentOpenAt: z.coerce.date().optional(),
  enrollmentCloseAt: z.coerce.date().optional(),
  maxStudents: z.number().int().min(0).optional(),

  // VOD-only fields
  defaultExpiresMonths: z.number().int().min(0).optional(),
});
export type AcademyClassCreateDTO = z.infer<typeof academyClassCreateDTOSchema>;

export const academyClassUpdateDTOSchema = z.object({
  name: z.string().max(255).optional(),
  mode: z.enum(['VOD', 'LIVE']).optional(),

  // Live fields
  term: z.string().max(100).optional(),
  batch: z.string().max(100).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  minStudents: z.number().int().min(0).optional(),
  minStudentsEnforcement: z.enum(['STRICT', 'NOTIFY', 'DISABLED']).optional(),
  primaryTeacherId: z.string().uuid().optional(),

  // Shared enrollment fields
  enrollmentOpenAt: z.coerce.date().optional(),
  enrollmentCloseAt: z.coerce.date().optional(),
  maxStudents: z.number().int().min(0).optional(),

  // VOD-only fields
  defaultExpiresMonths: z.number().int().min(0).optional(),

  status: z.string().max(20).optional(),
  companyId: z.string().uuid().optional(),
  settings: z.unknown().optional(),
});
export type AcademyClassUpdateDTO = z.infer<typeof academyClassUpdateDTOSchema>;

export const academyClassQueryDTOSchema = z.object({
  courseProfileId: z.string().uuid().optional(),
  courseEditionId: z.string().uuid().optional(),
  mode: z.string().optional(),
  status: z.string().optional(),
  q: z.string().optional(),
});
export type AcademyClassQueryDTO = z.infer<typeof academyClassQueryDTOSchema>;
