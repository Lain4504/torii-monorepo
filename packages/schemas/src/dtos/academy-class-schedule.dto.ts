import { z } from 'zod';

export const academyClassScheduleCreateDTOSchema = z.object({
  classId: z.string().uuid(),
  weekday: z.number().int().min(0),
  startTime: z.string().min(1).max(20),
  endTime: z.string().min(1).max(20),
  location: z.string().max(255).optional(),
  note: z.string().optional(),
});
export type AcademyClassScheduleCreateDTO = z.infer<
  typeof academyClassScheduleCreateDTOSchema
>;

export const academyClassScheduleUpdateDTOSchema = z.object({
  classId: z.string().uuid().optional(),
  weekday: z.number().int().min(0).optional(),
  startTime: z.string().max(20).optional(),
  endTime: z.string().max(20).optional(),
  location: z.string().max(255).optional(),
  note: z.string().optional(),
});
export type AcademyClassScheduleUpdateDTO = z.infer<
  typeof academyClassScheduleUpdateDTOSchema
>;

export const academyClassScheduleQueryDTOSchema = z.object({
  classId: z.string().uuid().optional(),
});
export type AcademyClassScheduleQueryDTO = z.infer<
  typeof academyClassScheduleQueryDTOSchema
>;

