import { apiClient } from '../api-client';
import type {
    AgentChatResponseDTO,
    AgentGrammarCheckResponseDTO,
    AgentTranslateResponseDTO,
    AgentFlashcardResponseDTO,
    AgentDrillResponseDTO,
    AgentConversationSimulationResponseDTO,
    AgentResourceRecommendationResponseDTO,
    AgentTestGenerationResponseDTO,
    AgentTestEvaluationResponseDTO,
    AgentPlacementTestResponseDTO,
    AgentPlacementEvaluationResponseDTO,
    AgentBenchmarkResponseDTO,
    AgentProgressTrackResponseDTO,
    AgentStudyPathResponseDTO,
    AgentWeaknessResponseDTO,
    AgentReadinessResponseDTO,
    AgentReportResponseDTO
} from '@workspace/schemas';

// --- API Client ---

export const agentApi = {
    sensei: {
        chat: async (message: string, history: any[] = []) => {
            const response = await apiClient.post<{ success: boolean; data: AgentChatResponseDTO }>('/api/agents/chat', {
                message,
                history
            });
            return response.data.data;
        },
        checkGrammar: async (text: string) => {
            const response = await apiClient.post<{ success: boolean; data: AgentGrammarCheckResponseDTO }>('/api/agents/grammar-check', {
                text
            });
            return response.data.data;
        },
        translate: async (text: string, sourceLanguage: string, targetLanguage: string) => {
            const response = await apiClient.post<{ success: boolean; data: AgentTranslateResponseDTO }>('/api/agents/translate', {
                text,
                sourceLanguage,
                targetLanguage
            });
            return response.data.data;
        },
        createFlashcard: async (topic: string, difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate') => {
            const response = await apiClient.post<{ success: boolean; data: AgentFlashcardResponseDTO }>('/api/agents/flashcard', {
                topic,
                difficulty
            });
            return response.data.data;
        },
        generateDrill: async (
            type: 'grammar' | 'vocabulary' | 'kanji' | 'listening' | 'reading',
            topic: string,
            difficulty: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' = 'N4',
            count: number = 5
        ) => {
            const response = await apiClient.post<{ success: boolean; data: AgentDrillResponseDTO }>('/api/agents/drill/generate', {
                type,
                topic,
                difficulty,
                count
            });
            return response.data.data;
        },
        simulateConversation: async (
            scenario: string,
            difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate',
            turns: number = 4
        ) => {
            const response = await apiClient.post<{ success: boolean; data: AgentConversationSimulationResponseDTO }>('/api/agents/conversation/simulate', {
                scenario,
                difficulty,
                turns
            });
            return response.data.data;
        },
        recommendResources: async (topic: string, resourceType: string = 'all') => {
            const response = await apiClient.post<{ success: boolean; data: AgentResourceRecommendationResponseDTO }>('/api/agents/resources/recommend', {
                topic,
                resourceType
            });
            return response.data.data;
        },
        // Additional methods would be added here
    },
    assessment: {
        generateTest: async (level: string, section: string, questionCount: number = 10) => {
            const response = await apiClient.post<{ success: boolean; data: AgentTestGenerationResponseDTO }>('/api/agents/test/generate', {
                level,
                section,
                questionCount
            });
            return response.data.data;
        },
        evaluateTest: async (testId: string, answers: any[]) => {
            const response = await apiClient.post<{ success: boolean; data: AgentTestEvaluationResponseDTO }>('/api/agents/test/evaluate', {
                testId,
                answers
            });
            return response.data.data;
        },
        getBenchmark: async (targetLevel: string) => {
            const response = await apiClient.post<{ success: boolean; data: AgentBenchmarkResponseDTO }>('/api/agents/assessment/benchmark', {
                targetLevel
            });
            return response.data.data;
        },
        scheduleTest: async (targetLevel: string) => {
            const response = await apiClient.post<{ success: boolean; data: any }>('/api/agents/test/schedule', {
                targetLevel
            });
            return response.data.data;
        },
        generatePlacementTest: async (questionCount: number = 15) => {
            const response = await apiClient.post<{ success: boolean; data: AgentPlacementTestResponseDTO }>('/api/agents/placement/test', {
                questionCount
            });
            return response.data.data;
        },
        evaluatePlacementTest: async (testId: string, userAnswers: any) => {
            const response = await apiClient.post<{ success: boolean; data: AgentPlacementEvaluationResponseDTO }>('/api/agents/placement/evaluate', {
                testId,
                userAnswers
            });
            return response.data.data;
        }
    },
    analytics: {
        trackProgress: async (timeframe: string = 'month') => {
            const response = await apiClient.post<{ success: boolean; data: AgentProgressTrackResponseDTO }>('/api/agents/progress/track', {
                timeframe
            });
            return response.data.data;
        },
        suggestStudyPath: async (targetLevel: string) => {
            const response = await apiClient.post<{ success: boolean; data: AgentStudyPathResponseDTO }>('/api/agents/path/suggest', {
                targetLevel
            });
            return response.data.data;
        },
        identifyWeaknesses: async () => {
            const response = await apiClient.post<{ success: boolean; data: AgentWeaknessResponseDTO }>('/api/agents/analytics/weaknesses', {});
            return response.data.data;
        },
        predictReadiness: async (targetLevel: string) => {
            const response = await apiClient.post<{ success: boolean; data: AgentReadinessResponseDTO }>('/api/agents/analytics/readiness', {
                targetLevel
            });
            return response.data.data;
        },
        generateReport: async (reportType: string = 'comprehensive', timeframe: string = 'month') => {
            const response = await apiClient.post<{ success: boolean; data: AgentReportResponseDTO }>('/api/agents/analytics/report', {
                reportType,
                timeframe
            });
            return response.data.data;
        }
    }
};
