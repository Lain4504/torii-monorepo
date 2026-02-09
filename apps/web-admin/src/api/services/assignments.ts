import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/api-client.ts';
import type { 
  PaginatedApiResponse, 
  AssignmentResponseDTO, 
  CreateAssignmentDto, 
  UpdateAssignmentDto, 
  QueryAssignmentsDto, 
  StandardApiResponse 
} from '@workspace/schemas';

// ============================================================================
// API Functions
// ============================================================================

export const assignmentsApi = {
    // GET /api/assignments
    async findAll(params: QueryAssignmentsDto): Promise<PaginatedApiResponse<AssignmentResponseDTO>> {
        const response = await apiClient.get<PaginatedApiResponse<AssignmentResponseDTO>>('/api/assignments', { params });
        return response.data;
    },

    // GET /api/assignments/:id
    async findOne(id: string): Promise<AssignmentResponseDTO> {
        const response = await apiClient.get<StandardApiResponse<{ assignment: AssignmentResponseDTO }>>(`/api/assignments/${id}`);
        return response.data.data!.assignment;
    },

    // POST /api/assignments
    async create(assignment: CreateAssignmentDto): Promise<AssignmentResponseDTO> {
        const response = await apiClient.post<StandardApiResponse<{ assignment: AssignmentResponseDTO }>>('/api/assignments', assignment);
        return response.data.data!.assignment;
    },

    // PUT /api/assignments/:id
    async update(id: string, assignment: UpdateAssignmentDto): Promise<AssignmentResponseDTO> {
        const response = await apiClient.put<StandardApiResponse<{ assignment: AssignmentResponseDTO }>>(`/api/assignments/${id}`, assignment);
        return response.data.data!.assignment;
    },

    // DELETE /api/assignments/:id
    async delete(id: string): Promise<boolean> {
        const response = await apiClient.delete<StandardApiResponse<boolean>>(`/api/assignments/${id}`);
        return response.data.success;
    },

    // PATCH /api/assignments/:id/publish
    async publish(id: string): Promise<AssignmentResponseDTO> {
        const response = await apiClient.patch<StandardApiResponse<{ assignment: AssignmentResponseDTO }>>(`/api/assignments/${id}/publish`);
        return response.data.data!.assignment;
    },
};

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook: Get assignments list with pagination and filters
 */
export function useAssignments(params: QueryAssignmentsDto) {
    return useQuery({
        queryKey: ['assignments', params],
        queryFn: () => assignmentsApi.findAll(params),
        staleTime: 30000,
    });
}

/**
 * Hook: Get single assignment by ID
 */
export function useAssignment(id: string) {
    return useQuery({
        queryKey: ['assignments', id],
        queryFn: () => assignmentsApi.findOne(id),
        enabled: !!id,
    });
}

/**
 * Hook: Create new assignment
 */
export function useCreateAssignment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (assignment: CreateAssignmentDto) => assignmentsApi.create(assignment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
        },
    });
}

/**
 * Hook: Update assignment
 */
export function useUpdateAssignment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, assignment }: { id: string; assignment: UpdateAssignmentDto }) =>
            assignmentsApi.update(id, assignment),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['assignments', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
        },
    });
}

/**
 * Hook: Delete assignment
 */
export function useDeleteAssignment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => assignmentsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
        },
    });
}

/**
 * Hook: Publish assignment
 */
export function usePublishAssignment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => assignmentsApi.publish(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['assignments', id] });
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
        },
    });
}
