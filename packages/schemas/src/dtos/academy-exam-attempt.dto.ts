import { z } from 'zod';

export const academyExamAttemptStartDTOSchema = z.object({
  examId: z.string().uuid(),
  classId: z.string().uuid().optional(),
  userId: z.string().uuid(),
  classAssessmentId: z.string().uuid().optional(),
});
export type AcademyExamAttemptStartDTO = z.infer<
  typeof academyExamAttemptStartDTOSchema
>;

export const academyExamAttemptSaveAnswersDTOSchema = z.object({
  attemptId: z.string().uuid(),
  draftAnswers: z.record(z.unknown()),
});
export type AcademyExamAttemptSaveAnswersDTO = z.infer<
  typeof academyExamAttemptSaveAnswersDTOSchema
>;

export const academyExamAttemptSubmitDTOSchema = z.object({
  attemptId: z.string().uuid(),
});
export type AcademyExamAttemptSubmitDTO = z.infer<
  typeof academyExamAttemptSubmitDTOSchema
>;

export const academyExamAttemptQueryDTOSchema = z.object({
  examId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  classId: z.string().uuid().optional(),
  status: z.string().optional(),
});
export type AcademyExamAttemptQueryDTO = z.infer<
  typeof academyExamAttemptQueryDTOSchema
>;

