import { z } from 'zod';

export const academyExamSectionInputSchema = z.object({
  title: z.string().min(1).max(255),
  instruction: z.string().optional(),
  timeLimitSeconds: z.number().int().min(0).optional(),
  orderIndex: z.number().int().min(0),
  sectionType: z.string().min(1).max(50),
  metadata: z.unknown().optional(),
});
export type AcademyExamSectionInputDTO = z.infer<
  typeof academyExamSectionInputSchema
>;

export const academyExamQuestionInputSchema = z.object({
  orderIndex: z.number().int().min(0),
  sectionId: z.string().uuid(),
  questionId: z.string().uuid(),
  points: z.number().min(0).optional(),
  metadata: z.unknown().optional(),
});
export type AcademyExamQuestionInputDTO = z.infer<
  typeof academyExamQuestionInputSchema
>;

export const academyExamCreateDTOSchema = z.object({
  courseProfileId: z.string().uuid().optional(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  examType: z.string().max(30).optional(),
  level: z.string().max(20).optional(),
  totalTimeLimitMinutes: z.number().int().min(0).optional(),
  status: z.string().max(20).optional(),
  settings: z.unknown().optional(),
  sections: z.array(academyExamSectionInputSchema),
});
export type AcademyExamCreateDTO = z.infer<typeof academyExamCreateDTOSchema>;

export const academyExamUpdateDTOSchema = z.object({
  title: z.string().max(255).optional(),
  description: z.string().optional(),
  examType: z.string().max(30).optional(),
  level: z.string().max(20).optional(),
  totalTimeLimitMinutes: z.number().int().min(0).optional(),
  status: z.string().max(20).optional(),
  settings: z.unknown().optional(),
});
export type AcademyExamUpdateDTO = z.infer<typeof academyExamUpdateDTOSchema>;

export const academyExamQueryDTOSchema = z.object({
  courseProfileId: z.string().uuid().optional(),
  status: z.string().optional(),
});
export type AcademyExamQueryDTO = z.infer<typeof academyExamQueryDTOSchema>;

export const academyExamAddQuestionsFromPoolDTOSchema = z.object({
  sectionId: z.string().uuid(),
  poolId: z.string().uuid(),
  count: z.number().int().min(1),
});
export type AcademyExamAddQuestionsFromPoolDTO = z.infer<
  typeof academyExamAddQuestionsFromPoolDTOSchema
>;

export const academyExamAddQuestionsDTOSchema = z.object({
  sectionId: z.string().uuid(),
  questionIds: z.array(z.string().uuid()).min(1),
  points: z.number().min(0).optional(),
});
export type AcademyExamAddQuestionsDTO = z.infer<
  typeof academyExamAddQuestionsDTOSchema
>;

