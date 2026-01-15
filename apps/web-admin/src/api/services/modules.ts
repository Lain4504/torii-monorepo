import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/api-client.ts';
import type {
    ModuleResponseDTO,
    ModuleCreateDTO,
    ModuleUpdateDTO,
    ModuleQueryDTO,
    StandardApiResponse,
    PaginatedApiResponse,
} from '@workspace/schemas';

// ============================================================================
// API Functions
// ============================================================================

export const modulesApi = {
    // GET /api/admin/modules
    async findAll(params: ModuleQueryDTO): Promise<PaginatedApiResponse<ModuleResponseDTO>> {
        const response = await apiClient.get<PaginatedApiResponse<ModuleResponseDTO>>('/api/modules', { params });
        return response.data;
    },

    // GET /api/admin/modules/:id
    async findOne(id: string): Promise<ModuleResponseDTO> {
        const response = await apiClient.get<StandardApiResponse<{ module: ModuleResponseDTO }>>(`/api/modules/${id}`);
        return response.data.data!.module;
    },

    // POST /api/admin/modules
    async create(module: ModuleCreateDTO): Promise<ModuleResponseDTO> {
        const response = await apiClient.post<StandardApiResponse<{ module: ModuleResponseDTO }>>('/api/modules', module);
        return response.data.data!.module;
    },

    // PATCH /api/admin/modules/:id
    async update(id: string, module: ModuleUpdateDTO): Promise<ModuleResponseDTO> {
        const response = await apiClient.patch<StandardApiResponse<{ module: ModuleResponseDTO }>>(`/api/modules/${id}`, module);
        return response.data.data!.module;
    },

    // DELETE /api/admin/modules/:id
    async delete(id: string): Promise<boolean> {
        const response = await apiClient.delete<StandardApiResponse<boolean>>(`/api/modules/${id}`);
        return response.data.success;
    },

    // PATCH /api/admin/modules/:id/restore
    async restore(id: string): Promise<ModuleResponseDTO> {
        const response = await apiClient.patch<ModuleResponseDTO>(`/api/modules/${id}/restore`);
        return response.data;
    },
};

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook: Get modules list with pagination and filters
 */
export function useModules(params: ModuleQueryDTO) {
    return useQuery({
        queryKey: ['modules', params],
        queryFn: () => modulesApi.findAll(params),
        staleTime: 30000,
    });
}

/**
 * Hook: Get single module by ID
 */
export function useModule(id: string) {
    return useQuery({
        queryKey: ['modules', id],
        queryFn: () => modulesApi.findOne(id),
        enabled: !!id,
    });
}

/**
 * Hook: Create new module
 */
export function useCreateModule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (module: ModuleCreateDTO) => modulesApi.create(module),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['modules'] });
        },
    });
}

/**
 * Hook: Update module
 */
export function useUpdateModule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, module }: { id: string; module: ModuleUpdateDTO }) =>
            modulesApi.update(id, module),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['modules', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['modules'] });
        },
    });
}

/**
 * Hook: Delete module
 */
export function useDeleteModule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => modulesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['modules'] });
        },
    });
}

/**
 * Hook: Restore module
 */
export function useRestoreModule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => modulesApi.restore(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['modules'] });
        },
    });
}

