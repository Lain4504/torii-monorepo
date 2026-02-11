import { z } from 'zod';

// Sensei Types
export const agentChatResponseDTOSchema = z.object({
    message: z.string(),
    language: z.string(),
    suggestions: z.array(z.string()),
});
export type AgentChatResponseDTO = z.infer<typeof agentChatResponseDTOSchema>;

export const agentGrammarCheckResponseDTOSchema = z.object({
    isCorrect: z.boolean(),
    originalText: z.string(),
    correctedText: z.string(),
    errors: z.array(z.object({
        type: z.string(),
        location: z.string(),
        issue: z.string(),
        correction: z.string(),
        explanation: z.string(),
    })),
    suggestions: z.array(z.string()),
});
export type AgentGrammarCheckResponseDTO = z.infer<typeof agentGrammarCheckResponseDTOSchema>;

export const agentTranslateResponseDTOSchema = z.object({
    originalText: z.string(),
    translatedText: z.string(),
    sourceLanguage: z.string(),
    targetLanguage: z.string(),
    culturalNotes: z.string().optional(),
    alternativeTranslations: z.array(z.string()).optional(),
});
export type AgentTranslateResponseDTO = z.infer<typeof agentTranslateResponseDTOSchema>;

export const agentFlashcardResponseDTOSchema = z.object({
    topic: z.string(),
    flashcards: z.array(z.object({
        front: z.string(),
        back: z.string(),
        reading: z.string().optional(),
    })),
});
export type AgentFlashcardResponseDTO = z.infer<typeof agentFlashcardResponseDTOSchema>;

export const agentDrillResponseDTOSchema = z.object({
    topic: z.string(),
    drills: z.array(z.object({
        question: z.string(),
        options: z.array(z.string()),
        correctAnswer: z.string(),
        explanation: z.string(),
    })),
});
export type AgentDrillResponseDTO = z.infer<typeof agentDrillResponseDTOSchema>;

export const agentConversationSimulationResponseDTOSchema = z.object({
    scenario: z.string(),
    conversation: z.array(z.object({
        speaker: z.string(),
        japanese: z.string(),
        romaji: z.string(),
        english: z.string(),
    })),
    vocabulary: z.array(z.string()),
    grammarPoints: z.array(z.string()),
});
export type AgentConversationSimulationResponseDTO = z.infer<typeof agentConversationSimulationResponseDTOSchema>;

export const agentResourceRecommendationResponseDTOSchema = z.object({
    topic: z.string(),
    resources: z.array(z.object({
        title: z.string(),
        type: z.string(),
        url: z.string(),
        description: z.string(),
    })),
});
export type AgentResourceRecommendationResponseDTO = z.infer<typeof agentResourceRecommendationResponseDTOSchema>;

// Assessment Types
export const agentTestGenerationResponseDTOSchema = z.object({
    testId: z.string(),
    questions: z.array(z.object({
        id: z.string(),
        type: z.string(),
        content: z.string(),
        options: z.array(z.string()).optional(),
    })),
});
export type AgentTestGenerationResponseDTO = z.infer<typeof agentTestGenerationResponseDTOSchema>;

export type AgentPlacementTestResponseDTO = AgentTestGenerationResponseDTO; // Alias

export const agentTestEvaluationResponseDTOSchema = z.object({
    testId: z.string(),
    score: z.number(),
    maxScore: z.number(),
    feedback: z.string(),
    details: z.array(z.object({
        questionId: z.string(),
        isCorrect: z.boolean(),
        explanation: z.string(),
    })),
});
export type AgentTestEvaluationResponseDTO = z.infer<typeof agentTestEvaluationResponseDTOSchema>;

export const agentPlacementEvaluationResponseDTOSchema = agentTestEvaluationResponseDTOSchema.extend({
    suggestedLevel: z.string().optional(),
    analysis: z.string().optional(),
});
export type AgentPlacementEvaluationResponseDTO = z.infer<typeof agentPlacementEvaluationResponseDTOSchema>;

export const agentBenchmarkResponseDTOSchema = z.object({
    level: z.string(),
    readinessPercentage: z.number(),
    recommendations: z.array(z.string()),
    skillGaps: z.object({
        vocabulary: z.number(),
        grammar: z.number(),
        reading: z.number(),
        listening: z.number(),
    }),
    nextScheduledTest: z.object({
        date: z.string(),
        type: z.string(),
    }).optional(),
    recentPerformance: z.object({
        averageScore: z.number(),
        testsTaken: z.number(),
        trend: z.enum(['improving', 'stable', 'declining']),
    }).optional(),
});
export type AgentBenchmarkResponseDTO = z.infer<typeof agentBenchmarkResponseDTOSchema>;

export const agentProgressTrackResponseDTOSchema = z.object({
    timeframe: z.string(),
    metrics: z.object({
        completedLessons: z.number(),
        averageScore: z.number(),
        studyHours: z.number(),
        streak: z.number().optional(),
    }),
    chartData: z.array(z.object({
        date: z.string(),
        score: z.number(),
        lessons: z.number(),
    })),
});
export type AgentProgressTrackResponseDTO = z.infer<typeof agentProgressTrackResponseDTOSchema>;

export const agentStudyPathResponseDTOSchema = z.object({
    targetLevel: z.string(),
    studyPathRecommendation: z.object({
        roadmap: z.array(z.object({
            title: z.string(),
            status: z.enum(['completed', 'in-progress', 'locked']),
            description: z.string(),
        })),
        estimatedWeeks: z.number(),
        focusAreas: z.array(z.string()),
    }),
});
export type AgentStudyPathResponseDTO = z.infer<typeof agentStudyPathResponseDTOSchema>;

export const agentWeaknessResponseDTOSchema = z.object({
    weaknesses: z.array(z.object({
        topic: z.string(),
        severity: z.enum(['low', 'medium', 'high']),
        description: z.string(),
        suggestedReview: z.string(),
    })),
});
export type AgentWeaknessResponseDTO = z.infer<typeof agentWeaknessResponseDTOSchema>;

export const agentReadinessResponseDTOSchema = z.object({
    targetLevel: z.string(),
    probability: z.number(),
    warnings: z.array(z.string()),
});
export type AgentReadinessResponseDTO = z.infer<typeof agentReadinessResponseDTOSchema>;

export const agentReportResponseDTOSchema = z.object({
    reportType: z.string(),
    content: z.string(), // Markdown or detailed object
    generatedAt: z.string(),
});
export type AgentReportResponseDTO = z.infer<typeof agentReportResponseDTOSchema>;
