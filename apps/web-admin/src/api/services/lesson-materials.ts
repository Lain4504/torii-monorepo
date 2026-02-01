import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/api-client.ts';
import type {
    LessonMaterialResponseDTO,
    LessonMaterialCreateDTO,
    LessonMaterialUpdateDTO,
    StandardApiResponse
} from '@workspace/schemas';

// ============================================================================
// API Functions
// ============================================================================

export const lessonMaterialsApi = {
    // POST /api/lesson-materials
    async uploadMaterial(
        dto: LessonMaterialCreateDTO,
        file: File
    ): Promise<LessonMaterialResponseDTO> {
        // 1. Upload file using Storage Service (Signed URL flow)
        // 'lesson-materials' is the module name for organization
        const { storageApi } = await import('./storage-api');
        const { fileId } = await storageApi.uploadFile(file, 'lesson-materials');

        // 2. Create the lesson material record with the fileId
        const response = await apiClient.post<StandardApiResponse<{ material: LessonMaterialResponseDTO }>>(
            '/api/lesson-materials',
            {
                dto,
                fileId
            }
        );

        return response.data.data!.material;
    },

    // GET /api/lesson-materials/by-lesson/:lessonId
    async getMaterialsByLesson(lessonId: string): Promise<LessonMaterialResponseDTO[]> {
        const response = await apiClient.get<StandardApiResponse<{ materials: LessonMaterialResponseDTO[] }>>(
            `/api/lesson-materials/by-lesson/${lessonId}`
        );

        return response.data.data!.materials;
    },

    // PATCH /api/lesson-materials/:id
    async updateMaterial(id: string, dto: LessonMaterialUpdateDTO): Promise<LessonMaterialResponseDTO> {
        const response = await apiClient.patch<StandardApiResponse<{ material: LessonMaterialResponseDTO }>>(
            `/api/lesson-materials/${id}`,
            dto
        );

        return response.data.data!.material;
    },

    // DELETE /api/lesson-materials/:id
    async deleteMaterial(id: string): Promise<{ message: string }> {
        const response = await apiClient.delete<StandardApiResponse<{ message: string }>>(`/api/lesson-materials/${id}`);

        return response.data.data!;
    },
};

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook: Get materials for a lesson
 */
export function useLessonMaterials(lessonId: string) {
    return useQuery({
        queryKey: ['lesson-materials', 'by-lesson', lessonId],
        queryFn: () => lessonMaterialsApi.getMaterialsByLesson(lessonId),
        enabled: !!lessonId,
        staleTime: 30000,
    });
}

/**
 * Hook: Upload lesson material
 */
export function useUploadMaterial() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ dto, file }: { dto: LessonMaterialCreateDTO; file: File }) =>
            lessonMaterialsApi.uploadMaterial(dto, file),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['lesson-materials', 'by-lesson', variables.dto.lessonId]
            });
            queryClient.invalidateQueries({ queryKey: ['lessons'] });
        },
    });
}

/**
 * Hook: Update lesson material metadata
 */
export function useUpdateMaterial() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: LessonMaterialUpdateDTO }) =>
            lessonMaterialsApi.updateMaterial(id, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lesson-materials'] });
            queryClient.invalidateQueries({ queryKey: ['lessons'] });
        },
    });
}

/**
 * Hook: Delete lesson material
 */
export function useDeleteMaterial() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => lessonMaterialsApi.deleteMaterial(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lesson-materials'] });
            queryClient.invalidateQueries({ queryKey: ['lessons'] });
        },
    });
}
