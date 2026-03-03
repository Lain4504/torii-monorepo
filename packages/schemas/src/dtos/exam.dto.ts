import { z } from 'zod';
import {
    examSchema,
    examSessionSchema,
    ExamType,
    ExamStatus,
    examSectionSchema,
    ExamSessionStatus,
    QuestionJlptLevel,
} from '../models/exam.model';

// Exam DTOs
export const examCreateDTOSchema = examSchema
    .pick({
        title: true,
        description: true,
        jlptLevel: true,
        examType: true,
        sections: true,
        totalTime: true,
        createdBy: true,
        courseRunId: true,
    })
    .extend({
        sections: z.array(examSectionSchema),
        examType: z.nativeEnum(ExamType).default(ExamType.PRACTICE),
    });

export type ExamCreateDTO = z.infer<typeof examCreateDTOSchema>;

export const examUpdateDTOSchema = examSchema
    .pick({
        title: true,
        description: true,
        jlptLevel: true,
        examType: true,
        sections: true,
        totalTime: true,
        status: true,
        courseRunId: true,
    })
    .partial();

export type ExamUpdateDTO = z.infer<typeof examUpdateDTOSchema>;

export const examQueryDTOSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).default(10),
    jlptLevel: z.nativeEnum(QuestionJlptLevel).optional(),
    examType: z.nativeEnum(ExamType).optional(),
    status: z.nativeEnum(ExamStatus).optional(),
    courseRunId: z.string().uuid().optional(),
    courseMasterId: z.string().uuid().optional(), // Filter by course master (via lesson or courseRun)
    search: z.string().optional(),
});

export type ExamQueryDTO = z.infer<typeof examQueryDTOSchema>;

export const examResponseDTOSchema = examSchema;

export type ExamResponseDTO = z.infer<typeof examResponseDTOSchema>;

// Exam Session DTOs
export const examSessionStartDTOSchema = z.object({
    examId: z.string().uuid(),
    courseRunId: z.string().uuid(),
});

export type ExamSessionStartDTO = z.infer<typeof examSessionStartDTOSchema>;

export const examSessionStartResponseDTOSchema = z.object({
    sessionId: z.string().uuid(),
    exam: examResponseDTOSchema,
    questions: z.array(z.object({
        id: z.string().uuid(),
        questionText: z.string(),
        questionType: z.string(),
        options: z.record(z.string(), z.string()).optional(),
        audioUrl: z.string().optional(),
        section: z.string(),
        order: z.number(),
    })),
    timeLimit: z.number(), // Total seconds
    sections: z.array(examSectionSchema),
    // Resume session data
    answers: z.record(z.string().uuid(), z.string()).optional(), // { questionId: "answer" }
    flaggedQuestions: z.array(z.string().uuid()).optional(),
    currentQuestion: z.number().optional(),
    timeRemaining: z.number().optional(), // Seconds remaining
});

export type ExamSessionStartResponseDTO = z.infer<typeof examSessionStartResponseDTOSchema>;

export const examSessionAnswerDTOSchema = z.object({
    questionId: z.string().uuid(),
    answer: z.string(),
});

export type ExamSessionAnswerDTO = z.infer<typeof examSessionAnswerDTOSchema>;

export const examSessionAnswersDTOSchema = z.object({
    answers: z.record(z.string().uuid(), z.string()), // { questionId: "answer" }
    flaggedQuestions: z.array(z.string().uuid()).optional(),
    currentSection: z.string().optional(),
    currentQuestion: z.number().optional(),
    timeRemaining: z.number().optional(), // Seconds remaining
});

export type ExamSessionAnswersDTO = z.infer<typeof examSessionAnswersDTOSchema>;

export const examSessionResponseDTOSchema = examSessionSchema;

export type ExamSessionResponseDTO = z.infer<typeof examSessionResponseDTOSchema>;

export const examSessionSubmitDTOSchema = z.object({
    sessionId: z.string().uuid(),
});

export type ExamSessionSubmitDTO = z.infer<typeof examSessionSubmitDTOSchema>;

// Exam with session status (for listing)
export const examWithStatusResponseDTOSchema = examResponseDTOSchema.extend({
    sessionStatus: z.nativeEnum(ExamSessionStatus).optional(), // 'new', 'in-progress', 'submitted'
    sessionId: z.string().uuid().optional(),
    score: z.number().optional(),
    maxScore: z.number().optional(),
    progress: z.number().min(0).max(100).optional(), // 0-100
    lastAttemptDate: z.date().optional(),
});

export type ExamWithStatusResponseDTO = z.infer<typeof examWithStatusResponseDTOSchema>;

// Exam Session Query DTO
export const examSessionQueryDTOSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).default(10),
    status: z.nativeEnum(ExamSessionStatus).optional(),
    examId: z.string().uuid().optional(),
    courseRunId: z.string().uuid().optional(),
});

export type ExamSessionQueryDTO = z.infer<typeof examSessionQueryDTOSchema>;

// Exam Session with exam details (for history)
export const examSessionWithExamResponseDTOSchema = examSessionResponseDTOSchema.extend({
    exam: examResponseDTOSchema.optional(),
    score: z.number().optional(),
    maxScore: z.number().optional(),
    passed: z.boolean().optional(),
});

export type ExamSessionWithExamResponseDTO = z.infer<typeof examSessionWithExamResponseDTOSchema>;

// Exam Statistics DTO
export const examStatsResponseDTOSchema = z.object({
    totalExamsTaken: z.number(),
    averageScore: z.number(),
    totalTimeSpent: z.number(), // minutes
    certificatesEarned: z.number(),
    passedExams: z.number(),
    failedExams: z.number(),
    byLevel: z.record(z.string(), z.object({
        count: z.number(),
        averageScore: z.number(),
    })).optional(),
});

export type ExamStatsResponseDTO = z.infer<typeof examStatsResponseDTOSchema>;









