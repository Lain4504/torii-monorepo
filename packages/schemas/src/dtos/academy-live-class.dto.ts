import { z } from 'zod';

export const academyLiveClassCreateDTOSchema = z.object({
  cohortId: z.string().uuid(),
  code: z.string().min(1).max(150),
  name: z.string().min(1).max(255),
  instructorId: z.string().uuid().optional(),
  maxStudents: z.coerce.number().int().min(1).optional().nullable(),
  status: z.enum(['DRAFT', 'OPENING', 'COMPLETED', 'CANCELLED', 'ARCHIVED']).optional(),
  schedules: z.array(z.object({
    weekday: z.number().int().min(0).max(6),
    startTime: z.string(),
    endTime: z.string(),
  })).optional(),
});
export type AcademyLiveClassCreateDTO = z.infer<typeof academyLiveClassCreateDTOSchema>;

export const academyLiveClassUpdateDTOSchema = academyLiveClassCreateDTOSchema.partial();
export type AcademyLiveClassUpdateDTO = z.infer<typeof academyLiveClassUpdateDTOSchema>;

export const academyLiveClassQueryDTOSchema = z.object({
  cohortId: z.string().uuid().optional(),
  instructorId: z.string().uuid().optional(),
  status: z.string().optional(),
  q: z.string().optional(),
  level: z.string().optional(),
  mode: z.string().optional(), // 'LIVE' | 'VOD'
  month: z.string().optional(), // 'yyyy-MM'
  onlyAvailable: z.coerce.boolean().optional(),
  upcomingRegistration: z.coerce.boolean().optional(),
  courseProfileId: z.string().uuid().optional(),
});
export type AcademyLiveClassQueryDTO = z.infer<typeof academyLiveClassQueryDTOSchema>;

export const academyLiveClassDuplicateDTOSchema = z.object({
  code: z.string().max(150).optional(),
  name: z.string().max(255).optional(),
  instructorId: z.string().uuid().optional(),
});
export type AcademyLiveClassDuplicateDTO = z.infer<typeof academyLiveClassDuplicateDTOSchema>;
