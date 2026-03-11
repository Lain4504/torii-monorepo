import { z } from 'zod';

export const academyClassAssignmentCreateDTOSchema = z.object({
  classId: z.string().uuid(),
  title: z.string().min(1).max(255),
  instructions: z.string().min(1),
  titleOverride: z.string().max(255).optional(),
  openAt: z.coerce.date().optional(),
  deadline: z.coerce.date().optional(),
});
export type AcademyClassAssignmentCreateDTO = z.infer<
  typeof academyClassAssignmentCreateDTOSchema
>;

export const academyClassAssignmentUpdateDTOSchema = z.object({
  titleOverride: z.string().max(255).optional(),
  openAt: z.coerce.date().optional(),
  deadline: z.coerce.date().optional(),
});
export type AcademyClassAssignmentUpdateDTO = z.infer<
  typeof academyClassAssignmentUpdateDTOSchema
>;
