import { apiClient } from '../api-client';

// --- Types ---

// Sensei Types
export interface ChatResponse {
    message: string;
    language: string;
    suggestions: string[];
}

export interface GrammarCheckResponse {
    isCorrect: boolean;
    originalText: string;
    correctedText: string;
    errors: Array<{
        type: string;
        location: string;
        issue: string;
        correction: string;
        explanation: string;
    }>;
    suggestions: string[];
}

export interface TranslateResponse {
    originalText: string;
    translatedText: string;
    sourceLanguage: string;
    targetLanguage: string;
    culturalNotes?: string;
    alternativeTranslations?: string[];
}

export interface FlashcardResponse {
    topic: string;
    flashcards: Array<{
        front: string;
        back: string;
        reading?: string;
    }>;
}

export interface DrillResponse {
    topic: string;
    drills: Array<{
        question: string;
        options: string[];
        correctAnswer: string;
        explanation: string;
    }>;
}

export interface ConversationSimulationResponse {
    scenario: string;
    conversation: Array<{
        speaker: string;
        japanese: string;
        romaji: string;
        english: string;
    }>;
    vocabulary: string[];
    grammarPoints: string[];
}

export interface RoleplayResponse {
    response: string;
    romaji?: string;
    english?: string;
    feedback?: string | null;
    isFinished: boolean;
}

export interface ResourceRecommendationResponse {
    topic: string;
    resources: Array<{
        title: string;
        type: string;
        url: string;
        description: string;
    }>;
}

// Assessment Types
export interface TestGenerationResponse {
    testId: string;
    questions: Array<{
        id: string;
        type: string;
        content: string;
        options?: string[];
    }>;
}

export type PlacementTestResponse = TestGenerationResponse;

export interface TestEvaluationResponse {
    testId: string;
    score: number;
    maxScore: number;
    feedback: string;
    details: Array<{
        questionId: string;
        isCorrect: boolean;
        explanation: string;
    }>;
}

export interface PlacementEvaluationResponse extends TestEvaluationResponse {
    suggestedLevel?: string;
    analysis?: string;
}

// ...

export interface ProgressTrackResponse {
    timeframe: string;
    metrics: {
        completedLessons: number;
        averageScore: number;
        studyHours: number;
        streak?: number;
    };
    chartData: Array<{ date: string; score: number; lessons: number }>;
}

export interface StudyPathResponse {
    targetLevel: string;
    studyPathRecommendation: {
        roadmap: Array<{
            title: string;
            status: 'completed' | 'in-progress' | 'locked';
            description: string;
        }>;
        estimatedWeeks: number;
        focusAreas: string[];
    };
}

export interface ReportResponse {
    reportType: string;
    content: string; // Markdown or detailed object
    generatedAt: string;
}

export interface ReadinessProfileResponse {
    userId: string;
    targetLevel: string;
    readinessPercentage: number;
    skillGaps: {
        vocabulary: number;
        grammar: number;
        reading: number;
        listening: number;
    };
    weaknesses: Array<{
        topic: string;
        severity: 'low' | 'medium' | 'high';
        description: string;
        suggestedReview: string;
    }>;
    recommendations: string[];
    recentPerformance?: {
        averageScore: number;
        testsTaken: number;
        trend: 'improving' | 'stable' | 'declining';
    };
    nextSteps: string[];
}


// --- API Client ---

export const agentApi = {
    sensei: {
        chat: async (message: string, history: any[] = []) => {
            const response = await apiClient.post<{ success: boolean; data: ChatResponse }>('/api/agents/chat', {
                message,
                history
            });
            return response.data.data;
        },
        checkGrammar: async (text: string) => {
            const response = await apiClient.post<{ success: boolean; data: GrammarCheckResponse }>('/api/agents/grammar-check', {
                text
            });
            return response.data.data;
        },
        translate: async (text: string, sourceLanguage: string, targetLanguage: string) => {
            const response = await apiClient.post<{ success: boolean; data: TranslateResponse }>('/api/agents/translate', {
                text,
                sourceLanguage,
                targetLanguage
            });
            return response.data.data;
        },
        createFlashcard: async (topic: string, difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate') => {
            const response = await apiClient.post<{ success: boolean; data: FlashcardResponse }>('/api/agents/flashcard', {
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
            const response = await apiClient.post<{ success: boolean; data: DrillResponse }>('/api/agents/drill/generate', {
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
            const response = await apiClient.post<{ success: boolean; data: ConversationSimulationResponse }>('/api/agents/conversation/simulate', {
                scenario,
                difficulty,
                turns
            });
            return response.data.data;
        },
        roleplay: async (
            topic: string,
            message: string,
            history: any[] = [],
            isFinal: boolean = false
        ) => {
            const response = await apiClient.post<{ success: boolean; data: RoleplayResponse }>('/api/agents/roleplay', {
                topic,
                message,
                history,
                isFinal
            });
            return response.data.data;
        },
        tts: async (text: string, voice?: string) => {
            const response = await apiClient.post<{ success: boolean; data: { url: string } }>('/api/agents/tts', {
                text,
                voice
            });
            return response.data.data;
        },
        recommendResources: async (topic: string, resourceType: string = 'all') => {
            const response = await apiClient.post<{ success: boolean; data: ResourceRecommendationResponse }>('/api/agents/resources/recommend', {
                topic,
                resourceType
            });
            return response.data.data;
        }
    },
    assessment: {
        generateTest: async (level: string, section: string, questionCount: number = 10) => {
            const response = await apiClient.post<{ success: boolean; data: TestGenerationResponse }>('/api/agents/test/generate', {
                level,
                section,
                questionCount
            });
            return response.data.data;
        },
        evaluateTest: async (testId: string, answers: any[]) => {
            const response = await apiClient.post<{ success: boolean; data: TestEvaluationResponse }>('/api/agents/test/evaluate', {
                testId,
                answers
            });
            return response.data.data;
        },
        generatePlacementTest: async (questionCount: number = 15) => {
            const response = await apiClient.post<{ success: boolean; data: PlacementTestResponse }>('/api/agents/placement/test', {
                questionCount
            });
            return response.data.data;
        },
        evaluatePlacementTest: async (testId: string, userAnswers: any) => {
            const response = await apiClient.post<{ success: boolean; data: PlacementEvaluationResponse }>('/api/agents/placement/evaluate', {
                testId,
                userAnswers
            });
            return response.data.data;
        }
    },
    analytics: {
        trackProgress: async (timeframe: string = 'month') => {
            const response = await apiClient.post<{ success: boolean; data: ProgressTrackResponse }>('/api/agents/progress/track', {
                timeframe
            });
            return response.data.data;
        },
        suggestStudyPath: async (targetLevel: string) => {
            const response = await apiClient.post<{ success: boolean; data: StudyPathResponse }>('/api/agents/path/suggest', {
                targetLevel
            });
            return response.data.data;
        },
        generateReport: async (reportType: string = 'comprehensive', timeframe: string = 'month') => {
            const response = await apiClient.post<{ success: boolean; data: ReportResponse }>('/api/agents/analytics/report', {
                reportType,
                timeframe
            });
            return response.data.data;
        },
        getReadinessProfile: async (targetLevel: string) => {
            const response = await apiClient.post<{ success: boolean; data: ReadinessProfileResponse }>('/api/agents/analytics/readiness-profile', {
                targetLevel
            });
            return response.data.data;
        }
    }
};
