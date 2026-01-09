import { z } from 'zod';
import { QuestionJlptLevel } from './question.model';

// Re-export QuestionJlptLevel for convenience
export { QuestionJlptLevel } from './question.model';

export enum ExamType {
    PRACTICE = 'practice',
    OFFICIAL = 'official',
}

export enum ExamStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    ARCHIVED = 'archived',
}

export enum ExamSessionStatus {
    IN_PROGRESS = 'in-progress',
    COMPLETED = 'completed',
    SUBMITTED = 'submitted',
    ABANDONED = 'abandoned',
}

export enum ExamSectionType {
    VOCAB = 'vocab',
    GRAMMAR = 'grammar',
    READING = 'reading',
    LISTENING = 'listening',
}

// Section configuration schema
// Each section must have either questionIds (specific questions) or poolId (select from pool)
export const examSectionSchema = z.object({
    type: z.nativeEnum(ExamSectionType),
    timeLimit: z.number().min(1), // minutes
    questionCount: z.number().min(1),
    questionIds: z.array(z.string().uuid()).optional(), // Specific questions to use (if provided, poolId is ignored)
    poolId: z.string().uuid().optional(), // Select questions from this pool (required if questionIds not provided)
}).refine(
    (data) => data.questionIds?.length > 0 || data.poolId,
    {
        message: "Section must have either questionIds or poolId",
        path: ["questionIds", "poolId"],
    }
);

export type ExamSection = z.infer<typeof examSectionSchema>;

export const examSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1),
    description: z.string().optional(),
    jlptLevel: z.nativeEnum(QuestionJlptLevel),
    examType: z.nativeEnum(ExamType).default(ExamType.PRACTICE),
    sections: z.array(examSectionSchema), // Array of section configs
    totalTime: z.number().min(1), // Total time in minutes
    totalQuestions: z.number().default(0),
    status: z.nativeEnum(ExamStatus).default(ExamStatus.DRAFT),
    createdBy: z.string().uuid().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Exam = z.infer<typeof examSchema>;

export const examSessionSchema = z.object({
    id: z.string().uuid(),
    examId: z.string().uuid(),
    userId: z.string().uuid(),
    status: z.nativeEnum(ExamSessionStatus).default(ExamSessionStatus.IN_PROGRESS),
    startedAt: z.date(),
    submittedAt: z.date().optional(),
    timeRemaining: z.number().optional(), // Seconds remaining
    answers: z.record(z.string().uuid(), z.string()).default({}), // { questionId: "answer" }
    flaggedQuestions: z.array(z.string().uuid()).default([]),
    currentSection: z.string().optional(),
    currentQuestion: z.number().optional().default(1),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type ExamSession = z.infer<typeof examSessionSchema>;

