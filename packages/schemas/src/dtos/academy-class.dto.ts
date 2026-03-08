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

export const academyClassDuplicateDTOSchema = z.object({
  term: z.string().max(100).optional(),
  batch: z.string().max(100).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  code: z.string().max(150).optional(),
  name: z.string().max(255).optional(),
});
export type AcademyClassDuplicateDTO = z.infer<typeof academyClassDuplicateDTOSchema>;
export const academyClassModelSchema = z.object({
  id: z.string().uuid(),
  courseProfileId: z.string().uuid(),
  courseEditionId: z.string().uuid(),
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
    startDate: z.coerce.date().nullable(),
    endDate: z.coerce.date().nullable(),
    enrollmentOpenAt: z.coerce.date().nullable(),
    enrollmentCloseAt: z.coerce.date().nullable(),
    minStudents: z.number().nullable(),
    maxStudents: z.number().nullable(),
    primaryTeacherId: z.string().uuid().nullable(),
    primaryTeacher: z.any().nullable().optional(),
  }).nullable().optional(),
});
export type AcademyClassModel = z.infer<typeof academyClassModelSchema>;
