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
  classAssessmentId: z.string().uuid().optional(),
  status: z.string().optional(),
  latestOnly: z.coerce.boolean().optional(),
});
export type AcademyExamAttemptQueryDTO = z.infer<
  typeof academyExamAttemptQueryDTOSchema
>;

export type AcademyExamAttemptModel = {
  id: string;
  examId: string;
  userId: string;
  classId?: string | null;
  classAssessmentId?: string | null;
  status: string; // IN_PROGRESS, SUBMITTED
  score?: number | null;
  maxScore?: number | null;
  percentage?: number | null;
  deadlineAt?: string | null;
  draftAnswers?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
  startedAt: string;
  submittedAt?: string | null;
  completedAt?: string | null;
  isPassed?: boolean | null;
  timeTakenSeconds?: number | null;
  resultMetadata?: any | null;
  exam?: any | null;
  details?: any[] | null;
  quizTitle?: string | null;
  createdAt: string;
  updatedAt: string;
};

