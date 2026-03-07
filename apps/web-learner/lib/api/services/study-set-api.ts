import { api } from '../api';

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
    _count?: { cards: number };
}

export interface SetCard {
    id: string;
    studySetId: string;
    front: string;
    back: string;
    frontAudio: string | null;
    backAudio: string | null;
    frontImage: string | null;
    backImage: string | null;
    hint: string | null;
    srsState: 'NEW' | 'LEARNING' | 'REVIEW' | 'GRADUATED';
    interval: number;
    nextReviewAt: string;
    lastReviewedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateStudySetPayload {
    title: string;
    description?: string;
    tags?: string[];
    isPublic?: boolean;
    color?: string;
}

export interface CreateSetCardPayload {
    front: string;
    back: string;
    frontImage?: string;
    backImage?: string;
    hint?: string;
}

export class StudySetApi {
    // Sets
    static async createSet(payload: CreateStudySetPayload) {
        const res = await api.post('/academy/study-sets', payload);
        return res.data.item as StudySet;
    }

    static async findAllSets() {
        const res = await api.get('/academy/study-sets');
        return res.data.items as StudySet[];
    }

    static async findSetById(id: string) {
        const res = await api.get(`/academy/study-sets/${id}`);
        // Assume API returns `{ item: StudySet & { cards: SetCard[] } }`
        return res.data.item as StudySet & { cards: SetCard[] };
    }

    static async updateSet(id: string, payload: Partial<CreateStudySetPayload>) {
        const res = await api.patch(`/academy/study-sets/${id}`, payload);
        return res.data.item as StudySet;
    }

    static async deleteSet(id: string) {
        const res = await api.delete(`/academy/study-sets/${id}`);
        return res.data.result;
    }

    // Cards
    static async createCard(setId: string, payload: CreateSetCardPayload) {
        const res = await api.post(`/academy/study-sets/${setId}/cards`, payload);
        return res.data.item as SetCard;
    }

    static async updateCard(cardId: string, payload: Partial<CreateSetCardPayload>) {
        const res = await api.patch(`/academy/set-cards/${cardId}`, payload);
        return res.data.item as SetCard;
    }

    static async deleteCard(cardId: string) {
        const res = await api.delete(`/academy/set-cards/${cardId}`);
        return res.data.result;
    }

    // Study
    static async getStudyCards(setId: string) {
        const res = await api.get(`/academy/study-sets/${setId}/study`);
        return res.data.items as SetCard[];
    }

    static async reviewCard(cardId: string, rating: 'KNOW' | 'DONT_KNOW') {
        const res = await api.post(`/academy/set-cards/${cardId}/review`, { rating });
        return res.data.item as SetCard;
    }
}
