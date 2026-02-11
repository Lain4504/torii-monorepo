import { z } from 'zod';

export const AgentGrammarCheckResponseSchema = z.object({
    isCorrect: z.boolean(),
    originalText: z.string(),
    correctedText: z.string(),
    errors: z.array(
        z.object({
            type: z.string(),
            location: z.string(),
            issue: z.string(),
            correction: z.string(),
            explanation: z.string(),
        }),
    ),
    suggestions: z.array(z.string()),
});

export const AgentTranslateResponseSchema = z.object({
    originalText: z.string(),
    translatedText: z.string(),
    sourceLanguage: z.string(),
    targetLanguage: z.string(),
    culturalNotes: z.string().optional(),
    alternativeTranslations: z.array(z.string()).optional(),
});

export const AgentFlashcardResponseSchema = z.object({
    topic: z.string(),
    flashcards: z.array(
        z.object({
            front: z.string(),
            back: z.string(),
            reading: z.string().optional(),
        }),
    ),
});

export const AgentDrillResponseSchema = z.object({
    topic: z.string(),
    drills: z.array(
        z.object({
            question: z.string(),
            options: z.array(z.string()),
            correctAnswer: z.string(),
            explanation: z.string(),
        }),
    ),
});

export const AgentConversationSimulationResponseSchema = z.object({
    scenario: z.string(),
    conversation: z.array(
        z.object({
            speaker: z.string(),
            japanese: z.string(),
            romaji: z.string(),
            english: z.string(),
        }),
    ),
    vocabulary: z.array(z.string()),
    grammarPoints: z.array(z.string()),
});

export const AgentResourceRecommendationResponseSchema = z.object({
    topic: z.string(),
    resources: z.array(
        z.object({
            title: z.string(),
            type: z.string(),
            url: z.string(),
            description: z.string(),
        }),
    ),
});

export const AgentChatResponseSchema = z.object({
    message: z.string(),
    language: z.string(),
    suggestions: z.array(z.string()),
});

export const AgentReadinessProfileResponseSchema = z.object({
    userId: z.string(),
    targetLevel: z.string(),
    readinessPercentage: z.number().min(0).max(100),
    skillGaps: z.object({
        vocabulary: z.number(),
        grammar: z.number(),
        reading: z.number(),
        listening: z.number(),
    }),
    weaknesses: z.array(z.object({
        topic: z.string(),
        severity: z.enum(['low', 'medium', 'high']),
        description: z.string(),
        suggestedReview: z.string(),
    })),
    recommendations: z.array(z.string()),
    recentPerformance: z.object({
        averageScore: z.number(),
        testsTaken: z.number(),
        trend: z.enum(['improving', 'stable', 'declining']),
    }).optional(),
    nextSteps: z.array(z.string()),
});

export type AgentGrammarCheckResponseDTO = z.infer<typeof AgentGrammarCheckResponseSchema>;
export type AgentTranslateResponseDTO = z.infer<typeof AgentTranslateResponseSchema>;
export type AgentFlashcardResponseDTO = z.infer<typeof AgentFlashcardResponseSchema>;
export type AgentDrillResponseDTO = z.infer<typeof AgentDrillResponseSchema>;
export type AgentConversationSimulationResponseDTO = z.infer<typeof AgentConversationSimulationResponseSchema>;
export type AgentResourceRecommendationResponseDTO = z.infer<typeof AgentResourceRecommendationResponseSchema>;
export type AgentChatResponseDTO = z.infer<typeof AgentChatResponseSchema>;
export type AgentReadinessProfileResponseDTO = z.infer<typeof AgentReadinessProfileResponseSchema>;
