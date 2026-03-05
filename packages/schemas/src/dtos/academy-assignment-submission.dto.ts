import { z } from 'zod';

export const academyAssignmentSubmissionCreateDTOSchema = z.object({
  classId: z.string().uuid(),
  classAssessmentId: z.string().uuid(),
  assignmentTemplateId: z.string().uuid(),
  userId: z.string().uuid(),
  status: z.string().max(20).optional(),
  content: z.unknown().optional(),
});
export type AcademyAssignmentSubmissionCreateDTO = z.infer<
  typeof academyAssignmentSubmissionCreateDTOSchema
>;

export const academyAssignmentSubmissionUpdateDTOSchema = z.object({
  status: z.string().max(20).optional(),
  score: z.number().min(0).optional(),
  content: z.unknown().optional(),
});
export type AcademyAssignmentSubmissionUpdateDTO = z.infer<
  typeof academyAssignmentSubmissionUpdateDTOSchema
>;

export const academyAssignmentSubmissionQueryDTOSchema = z.object({
  classId: z.string().uuid().optional(),
  classAssessmentId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
});
export type AcademyAssignmentSubmissionQueryDTO = z.infer<
  typeof academyAssignmentSubmissionQueryDTOSchema
>;

