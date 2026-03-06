import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type {
    PaginatedApiResponse,
    StandardApiResponse
} from '@workspace/schemas';

export const classApi = {
    /**
     * Get all classes with pagination and filters
     */
    findAll: async (params: any): Promise<PaginatedApiResponse<any>> => {
        const response = await apiClient.get<StandardApiResponse<{ items: any[]; total: number; page: number; limit: number; totalPages: number }>>('/api/academy/classes', {
            params,
        });
        return {
            success: response.data.success,
            data: response.data.data?.items ?? [],
            total: response.data.data?.total ?? 0,
            page: response.data.data?.page ?? 1,
            limit: response.data.data?.limit ?? 10,
            totalPages: response.data.data?.totalPages ?? 1,
        } as any;
    },

    /**
     * Get class by ID
     */
    getClassById: async (id: string): Promise<any | null> => {
        const response = await apiClient.get<StandardApiResponse<{ item: any }>>(
            `/api/academy/classes/${id}`,
        );
        return response.data.data?.item ?? null;
    },

    /**
     * Get available classes for a specific course (profile)
     */
    getAvailableClasses: async (courseProfileId: string): Promise<any[]> => {
        const response = await apiClient.get<StandardApiResponse<{ items: any[] }>>('/api/academy/classes', {
            params: {
                courseProfileId,
                status: 'ENROLLING',
                page: 1,
                limit: 50
            }
        });
        return response.data.data?.items ?? [];
    },

    /**
     * Get curriculum for a class
     */
    getCurriculum: async (id: string): Promise<any> => {
        const response = await apiClient.get<StandardApiResponse<{ curriculum: any }>>(
            `/api/academy/classes/${id}/curriculum`
        );
        const data = response.data.data?.curriculum;
        if (!data) return null;

        // Map new academy structure to legacy UI structure
        return {
            courseId: data.classId,
            modules: data.chapters.map((ch: any) => ({
                id: ch.id,
                title: ch.title,
                order: ch.orderIndex,
                lessons: ch.items.map((it: any) => ({
                    id: it.id,
                    title: it.title,
                    contentType: it.kind.toLowerCase() === 'lesson' ? 'video' : it.kind.toLowerCase(),
                    isUnlocked: true, // TODO: logic for locking
                    isPreview: false,
                    order: it.orderIndex,
                    referenceId: it.referenceId,
                })),
            })),
        };
    },
};

/**
 * Hook: Get classes with filters
 */
export function useClasses(params: any) {
    return useQuery({
        queryKey: ['classes', params],
        queryFn: () => classApi.findAll(params),
    });
}

/**
 * Hook: Get available classes for enrollment
 */
export function useAvailableClasses(courseProfileId?: string) {
    return useQuery({
        queryKey: ['available-classes', courseProfileId],
        queryFn: () => classApi.getAvailableClasses(courseProfileId!),
        enabled: !!courseProfileId,
    });
}

/**
 * Hook: Get class by ID
 */
export function useClass(id?: string) {
    return useQuery({
        queryKey: ['classes', id],
        queryFn: () => classApi.getClassById(id!),
        enabled: !!id,
    });
}

/**
 * Hook: Get curriculum for a class
 */
export function useCurriculum(classId?: string) {
    return useQuery({
        queryKey: ['curriculum', classId],
        queryFn: () => classApi.getCurriculum(classId!),
        enabled: !!classId,
    });
}
