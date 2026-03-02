import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type {
    EnrollmentCreateDTO,
    EnrollmentResponseDTO,
    EnrollmentQueryDTO,
    StandardApiResponse,
    PaginatedApiResponse, // Added this import
} from '@workspace/schemas';

export const enrollmentApi = {
    /**
     * Get current user's enrollments
     */
    async getMyEnrollments(query?: EnrollmentQueryDTO): Promise<PaginatedApiResponse<EnrollmentResponseDTO>> {
        const response = await apiClient.get<PaginatedApiResponse<EnrollmentResponseDTO>>(
            '/api/enrollments/me',
            { params: query }
        );
        return response.data;
    },

    /**
     * Get all enrollments (Admin/Staff use)
     */
    async getAllEnrollments(query?: EnrollmentQueryDTO): Promise<PaginatedApiResponse<EnrollmentResponseDTO>> {
        const response = await apiClient.get<PaginatedApiResponse<EnrollmentResponseDTO>>(
            '/api/enrollments',
            { params: query }
        );
        return response.data;
    },

    /**
     * Get enrollment by ID
     */
    async getEnrollment(id: string): Promise<EnrollmentResponseDTO> {
        const response = await apiClient.get<StandardApiResponse<{ enrollment: EnrollmentResponseDTO }>>(`/api/enrollments/${id}`);
        return response.data.data!.enrollment;
    },

    /**
     * Check if user is enrolled in a specific course run
     */
    async checkEnrollment(courseRunId: string): Promise<{ isEnrolled: boolean; enrollment?: EnrollmentResponseDTO; hasNewerVersion?: boolean }> {
        const response = await apiClient.get<StandardApiResponse<{ isEnrolled: boolean; enrollment?: EnrollmentResponseDTO; hasNewerVersion?: boolean }>>(
            `/api/enrollments/check/${courseRunId}`
        );
        return response.data.data!;
    },

    /**
     * Create enrollment
     */
    async createEnrollment(data: EnrollmentCreateDTO): Promise<EnrollmentResponseDTO> {
        const response = await apiClient.post<StandardApiResponse<{ enrollment: EnrollmentResponseDTO }>>('/api/enrollments', data);
        return response.data.data!.enrollment;
    },

    /**
     * Update enrollment progress
     */
    async updateProgress(enrollmentId: string, completionPercentage: number): Promise<EnrollmentResponseDTO> {
        const response = await apiClient.patch<StandardApiResponse<{ enrollment: EnrollmentResponseDTO }>>(
            `/api/enrollments/${enrollmentId}/progress`,
            { completionPercentage }
        );
        return response.data.data!.enrollment;
    },

    /**
     * Upgrade enrollment to the latest course version
     */
    async upgradeVersion(courseMasterId: string): Promise<EnrollmentResponseDTO> {
        const response = await apiClient.post<StandardApiResponse<{ enrollment: EnrollmentResponseDTO }>>(
            `/api/enrollments/upgrade/${courseMasterId}`
        );
        return response.data.data!.enrollment;
    },

    /**
     * Check if a gift recipient (by email) is enrolled in a course
     */
    async checkGiftRecipient(email: string, courseMasterId: string): Promise<{ isRegistered: boolean; isEnrolled: boolean }> {
        const response = await apiClient.get<StandardApiResponse<{ isRegistered: boolean; isEnrolled: boolean }>>(
            '/api/enrollments/check-gift',
            { params: { email, courseMasterId } }
        );
        return response.data.data!;
    },
};



/**
 * Hook: Get paginated enrollments for current user
 */
export function useEnrollments(query?: EnrollmentQueryDTO) {
    return useQuery({
        queryKey: ['enrollments', 'me', query],
        queryFn: () => enrollmentApi.getMyEnrollments(query),
    });
}

/**
 * Hook: Get single enrollment
 */
export function useEnrollment(id: string) {
    return useQuery({
        queryKey: ['enrollments', id],
        queryFn: () => enrollmentApi.getEnrollment(id),
        enabled: !!id,
    });
}

/**
 * Hook: Check enrollment status
 */
export function useCheckEnrollment(courseRunId: string) {
    return useQuery({
        queryKey: ['enrollments', 'check', courseRunId],
        queryFn: () => enrollmentApi.checkEnrollment(courseRunId),
        enabled: !!courseRunId,
    });
}

/**
 * Hook: Create enrollment
 */
export function useCreateEnrollment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EnrollmentCreateDTO) => enrollmentApi.createEnrollment(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['enrollments'] });
        },
    });
}

/**
 * Hook: Update enrollment progress
 */
export function useUpdateEnrollmentProgress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            enrollmentId,
            completionPercentage,
        }: {
            enrollmentId: string;
            completionPercentage: number;
        }) => enrollmentApi.updateProgress(enrollmentId, completionPercentage),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['enrollments', variables.enrollmentId] });
            queryClient.invalidateQueries({ queryKey: ['enrollments'] });
        },
    });
}

/**
 * Hook: Upgrade course version
 */
export function useUpgradeCourseVersion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (courseMasterId: string) => enrollmentApi.upgradeVersion(courseMasterId),
        onSuccess: (_, courseMasterId) => {
            queryClient.invalidateQueries({ queryKey: ['enrollments', 'check', courseMasterId] });
            queryClient.invalidateQueries({ queryKey: ['enrollments'] });
        },
    });
}
