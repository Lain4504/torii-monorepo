import { z } from 'zod';

export interface AiTemplateDefinition<TInput = any, TOutput = any> {
  key: string;
  template: string; // Nội dung prompt (có thể load từ file)
  inputSchema?: z.ZodType<TInput>;
  outputSchema?: z.ZodType<TOutput>;
  outputFormat: 'text' | 'json';
}

// Common output schemas
export const FlashcardSchema = z.object({
  word: z.string(),
  meaning: z.string(),
  example: z.string().optional(),
  pronunciation: z.string().optional(),
  partOfSpeech: z.string().optional(),
  mnemonic: z.string().optional(),
});

export const TestQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.number(),
});

export const TestEvaluationSchema = z.object({
  score: z.number(),
  totalQuestions: z.number(),
  feedback: z.array(z.object({
    questionId: z.string(),
    correct: z.boolean(),
    explanation: z.string(),
  })),
  overallFeedback: z.string(),
});

export const ProgressReportSchema = z.object({
  userId: z.string(),
  reportType: z.string(),
  period: z.object({
    start: z.string(),
    end: z.string(),
  }),
  statistics: z.object({
    totalStudyTime: z.number(),
    completedActivities: z.number(),
    averageScore: z.number(),
  }),
  insights: z.array(z.string()),
});

export const ProgressBenchmarkSchema = z.object({
  userId: z.string(),
  level: z.string(),
  skillGaps: z.object({
    vocabulary: z.number(),
    grammar: z.number(),
    reading: z.number(),
    listening: z.number(),
  }),
  readinessPercentage: z.number(),
  recommendations: z.array(z.string()),
});

export const ReadinessPredictionSchema = z.object({
  userId: z.string(),
  level: z.string(),
  predictedScore: z.number(),
  confidenceLevel: z.number(),
  strongAreas: z.array(z.string()),
  weakAreas: z.array(z.string()),
  recommendedExamDate: z.string(),
});

export const WeaknessesAnalysisSchema = z.object({
  userId: z.string(),
  weaknesses: z.array(z.object({
    area: z.string(),
    severity: z.number(),
    examples: z.array(z.string()),
    recommendations: z.array(z.string()),
  })),
  overallAssessment: z.string(),
});

export const ProgressAnalysisSchema = z.object({
  userId: z.string(),
  activity: z.string(),
  score: z.number().optional(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  insights: z.array(z.string()),
  nextSteps: z.array(z.string()),
});

export const StudyPathSchema = z.object({
  userId: z.string(),
  currentLevel: z.string(),
  targetLevel: z.string(),
  timeline: z.array(z.object({
    phase: z.string(),
    duration: z.string(),
    focusAreas: z.array(z.string()),
    resources: z.array(z.string()),
  })),
  milestones: z.array(z.string()),
});

// Input validation schemas
export const TranslateInputSchema = z.object({
  text: z.string().min(1),
  from: z.enum(['ja', 'en']),
  to: z.enum(['ja', 'en']),
});

export const FlashcardInputSchema = z.object({
  word: z.string().min(1),
  meaning: z.string().min(1),
  example: z.string().optional(),
});

export const TestGenerateInputSchema = z.object({
  level: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']),
  type: z.enum(['vocabulary', 'grammar', 'reading', 'listening']),
  questionCount: z.number().min(1).max(50),
});

export const TestEvaluateInputSchema = z.object({
  testId: z.string().min(1),
  answers: z.string(),
});

export const ProgressBenchmarkInputSchema = z.object({
  userId: z.string().min(1),
  level: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']),
});

export const ProgressTrackInputSchema = z.object({
  userId: z.string().min(1),
  activity: z.string().min(1),
  score: z.number().optional(),
});

export const ReadinessPredictInputSchema = z.object({
  userId: z.string().min(1),
  level: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']),
});

export const WeaknessesIdentifyInputSchema = z.object({
  userId: z.string().min(1),
});

export const ReportGenerateInputSchema = z.object({
  userId: z.string().min(1),
  reportType: z.string().min(1),
});