import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type { AcademyRoadmapModel, AcademyRoadmapTaskUpdateDTO, StandardApiResponse } from '@workspace/schemas';

export const academyRoadmapApi = {
    async getMyRoadmap(): Promise<AcademyRoadmapModel | null> {
        try {
            const response = await apiClient.get<StandardApiResponse<AcademyRoadmapModel>>(
                '/api/academy/roadmap/me',
            );
            if (!response.data.success || !response.data.data) return null;
            return response.data.data;
        } catch {
            return null;
        }
    },

    async updateTask(taskId: string, body: AcademyRoadmapTaskUpdateDTO) {
        const response = await apiClient.patch<StandardApiResponse<{ ok: boolean }>>(
            `/api/academy/roadmap/tasks/${taskId}`,
            body,
        );
        return response.data.data;
    },

    async replan(trigger: 'USER_REQUEST' | 'SYSTEM_WEEKLY' | 'ORDER_PAID' = 'USER_REQUEST') {
        const response = await apiClient.post<StandardApiResponse<AcademyRoadmapModel>>(
            '/api/academy/roadmap/replan',
            { trigger },
        );
        return response.data.data;
    },
};

export function useAcademyRoadmap(enabled: boolean) {
    return useQuery({
        queryKey: ['academy-roadmap', 'me'],
        queryFn: () => academyRoadmapApi.getMyRoadmap(),
        enabled,
        staleTime: 60 * 1000,
        retry: false,
    });
}

export function useUpdateRoadmapTask() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ taskId, body }: { taskId: string; body: AcademyRoadmapTaskUpdateDTO }) =>
            academyRoadmapApi.updateTask(taskId, body),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: ['academy-roadmap', 'me'] });
            void qc.invalidateQueries({ queryKey: ['academy-learning', 'my-courses'] });
            void qc.invalidateQueries({ queryKey: ['academy-enrollments', 'me'] });
            void qc.invalidateQueries({ queryKey: ['learning-stats'] });
        },
    });
}
