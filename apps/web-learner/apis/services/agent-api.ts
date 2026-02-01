import { apiClient } from '../api-client';

// Types
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

export const agentApi = {
    sensei: {
        chat: async (message: string, history: any[] = []) => {
            const response = await apiClient.post<{ success: boolean; data: ChatResponse }>('/api/agents/chat', {
                message,
                history
            });
            if (!response.data.success) throw new Error((response.data as any).message || 'Chat failed');
            return response.data.data;
        },
        checkGrammar: async (text: string) => {
            const response = await apiClient.post<{ success: boolean; data: GrammarCheckResponse }>('/api/agents/grammar-check', {
                text
            });
            if (!response.data.success) throw new Error((response.data as any).message || 'Grammar check failed');

            return response.data.data;
        },
        translate: async (text: string, from: string, to: string) => {
            const response = await apiClient.post<{ success: boolean; data: TranslateResponse }>('/api/agents/translate', {
                text,
                from,
                to
            });
            if (!response.data.success) throw new Error((response.data as any).message || 'Translation failed');
            return response.data.data;
        },
        createFlashcard: async (topic: string, difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate') => {
            const response = await apiClient.post<{ success: boolean; data: FlashcardResponse }>('/api/agents/flashcard', {
                topic,
                difficulty
            });
            if (!response.data.success) throw new Error((response.data as any).message || 'Flashcard creation failed');
            return response.data.data;
        },
        generateDrill: async (
            drillType: 'grammar' | 'vocabulary' | 'kanji' | 'listening' | 'reading' | string,
            topic: string,
            level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | string = 'N4',
            count: number = 5
        ) => {
            const response = await apiClient.post<{ success: boolean; data: DrillResponse }>('/api/agents/drill/generate', {
                drillType,
                topic,
                level,
                count
            });
            if (!response.data.success) throw new Error((response.data as any).message || 'Drill generation failed');
            return response.data.data;
        },
        simulateConversation: async (
            scenario: string,
            difficulty: 'beginner' | 'intermediate' | 'advanced' | string = 'intermediate',
            turns: number = 8
        ) => {
            const response = await apiClient.post<{ success: boolean; data: ConversationSimulationResponse }>('/api/agents/conversation/simulate', {
                scenario,
                difficulty,
                turns
            });
            if (!response.data.success) throw new Error((response.data as any).message || 'Conversation simulation failed');
            return response.data.data;
        }
    }
};
