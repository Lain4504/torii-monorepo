import { apiClient } from '../api-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface StudySet {
    id: string;
    userId: string;
    title: string;
    description: string | null;
    tags: string[];
    isPublic: boolean;
    color: string | null;
    createdAt: string;
    updatedAt: string;
    _count?: { setCards: number };
}

export interface SetCard {
    id: string;
    studySetId: string;
    term: string;
    definition: string;
    mediaUrl: string | null;
    hint: string | null;
    srsState: 'LEARNING' | 'MASTERED';
    interval: number;
    nextReviewAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateStudySetPayload {
    title: string;
    description?: string;
    tags?: string[];
    isPublic?: boolean;
    settings?: Record<string, any>;
}

export interface CreateSetCardPayload {
    term: string;
    definition: string;
    hint?: string;
    mediaUrl?: string;
}

export class StudySetApi {
    // Sets
    static async createSet(payload: CreateStudySetPayload) {
        const res = await apiClient.post('/academy/study-sets', payload);
        return res.data.item as StudySet;
    }

    static async findAllSets() {
        const res = await apiClient.get('/academy/study-sets');
        return res.data.items as StudySet[];
    }

    static async findSetById(id: string) {
        const res = await apiClient.get(`/academy/study-sets/${id}`);
        // Backend returns item: StudySet & { setCards: SetCard[] }
        return res.data.item as StudySet & { setCards: SetCard[] };
    }

    static async updateSet(id: string, payload: Partial<CreateStudySetPayload>) {
        const res = await apiClient.patch(`/academy/study-sets/${id}`, payload);
        return res.data.item as StudySet;
    }

    static async deleteSet(id: string) {
        const res = await apiClient.delete(`/academy/study-sets/${id}`);
        return res.data.result;
    }

    // Cards
    static async createCard(setId: string, payload: CreateSetCardPayload) {
        const res = await apiClient.post(`/academy/study-sets/${setId}/cards`, payload);
        return res.data.item as SetCard;
    }

    static async updateCard(cardId: string, payload: Partial<CreateSetCardPayload>) {
        const res = await apiClient.patch(`/academy/set-cards/${cardId}`, payload);
        return res.data.item as SetCard;
    }

    static async deleteCard(cardId: string) {
        const res = await apiClient.delete(`/academy/set-cards/${cardId}`);
        return res.data.result;
    }

    // Study Phase
    static async getStudyCards(setId: string) {
        const res = await apiClient.get(`/academy/study-sets/${setId}/study`);
        return res.data.items as SetCard[];
    }

    static async reviewCard(cardId: string, quality: number) {
        const res = await apiClient.post(`/academy/set-cards/${cardId}/review`, { quality });
        return res.data.item as SetCard;
    }

    // Extra Study Modes
    static async getTestQuiz(setId: string, count?: number) {
        const res = await apiClient.get(`/academy/study-sets/${setId}/study-modes/test`, { params: { count } });
        return res.data as any[]; // Array of questions
    }

    static async getMatchGame(setId: string, count?: number) {
        const res = await apiClient.get(`/academy/study-sets/${setId}/study-modes/match`, { params: { count } });
        return res.data as any[]; // Array of pairs
    }
}

// Hooks
export function useStudySets() {
    return useQuery({
        queryKey: ['study-sets'],
        queryFn: () => StudySetApi.findAllSets(),
    });
}

export function useStudySet(id: string) {
    return useQuery({
        queryKey: ['study-set', id],
        queryFn: () => StudySetApi.findSetById(id),
        enabled: !!id,
    });
}

export function useCreateStudySet() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateStudySetPayload) => StudySetApi.createSet(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['study-sets'] });
        },
    });
}

export function useUpdateStudySet() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateStudySetPayload> }) =>
            StudySetApi.updateSet(id, payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['study-sets'] });
            queryClient.invalidateQueries({ queryKey: ['study-set', data.id] });
        },
    });
}

export function useDeleteStudySet() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => StudySetApi.deleteSet(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['study-sets'] });
        },
    });
}

export function useCreateSetCard() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ setId, payload }: { setId: string; payload: CreateSetCardPayload }) =>
            StudySetApi.createCard(setId, payload),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['study-set', variables.setId] });
        },
    });
}

export function useUpdateSetCard() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ cardId, setId, payload }: { cardId: string; setId: string; payload: Partial<CreateSetCardPayload> }) =>
            StudySetApi.updateCard(cardId, payload),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['study-set', variables.setId] });
        },
    });
}

export function useDeleteSetCard() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ cardId, setId }: { cardId: string; setId: string }) =>
            StudySetApi.deleteCard(cardId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['study-set', variables.setId] });
        },
    });
}

export function useStudyCards(setId: string) {
    return useQuery({
        queryKey: ['study-cards', setId],
        queryFn: () => StudySetApi.getStudyCards(setId),
        enabled: !!setId,
    });
}

export function useReviewCard() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ cardId, setId, quality }: { cardId: string; setId: string, quality: number }) =>
            StudySetApi.reviewCard(cardId, quality),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['study-cards', variables.setId] });
        },
    });
}

export function useTestQuiz(setId: string, count?: number) {
    return useQuery({
        queryKey: ['study-mode-test', setId, count],
        queryFn: () => StudySetApi.getTestQuiz(setId, count),
        enabled: !!setId,
    });
}

export function useMatchGame(setId: string, count?: number) {
    return useQuery({
        queryKey: ['study-mode-match', setId, count],
        queryFn: () => StudySetApi.getMatchGame(setId, count),
        enabled: !!setId,
    });
}
