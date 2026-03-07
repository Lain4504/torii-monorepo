import { apiClient } from '../api-client';

export interface StudyNote {
    id: string;
    userId: string;
    lessonId?: string;
    content: string;
    tags: string[];
    metadata: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export interface CreateStudyNotePayload {
    content: string;
    lessonId?: string;
    tags?: string[];
    metadata?: Record<string, any>;
}

export interface UpdateStudyNotePayload {
    content?: string;
    tags?: string[];
}

export class StudyNoteApi {
    static async create(payload: CreateStudyNotePayload) {
        const res = await apiClient.post('/academy/study-notes', payload);
        return res.data.item as StudyNote;
    }

    static async findAll(lessonId?: string) {
        const res = await apiClient.get('/academy/study-notes', {
            params: { lessonId },
        });
        return res.data.items as StudyNote[];
    }

    static async findOne(id: string) {
        const res = await apiClient.get(`/academy/study-notes/${id}`);
        return res.data.item as StudyNote;
    }

    static async update(id: string, payload: UpdateStudyNotePayload) {
        const res = await apiClient.patch(`/academy/study-notes/${id}`, payload);
        return res.data.item as StudyNote;
    }

    static async remove(id: string) {
        const res = await apiClient.delete(`/academy/study-notes/${id}`);
        return res.data.result;
    }
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useStudyNotes(lessonId?: string) {
    return useQuery({
        queryKey: ['study-notes', lessonId],
        queryFn: () => StudyNoteApi.findAll(lessonId),
        enabled: !!lessonId,
    });
}

export function useCreateStudyNote() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateStudyNotePayload) => StudyNoteApi.create(payload),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['study-notes'] });
        },
    });
}

export function useDeleteStudyNote() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => StudyNoteApi.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['study-notes'] });
        },
    });
}
