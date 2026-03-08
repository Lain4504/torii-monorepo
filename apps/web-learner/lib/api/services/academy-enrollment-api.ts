import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type {
    AcademyEnrollmentModel,
    AcademyEnrollmentQueryDTO,
    StandardApiResponse,
    PaginatedApiResponse,
} from '@workspace/schemas';

export const academyEnrollmentApi = {
    /**
     * Get current user's enrollments
     */
    async getMyEnrollments(query?: AcademyEnrollmentQueryDTO): Promise<PaginatedApiResponse<AcademyEnrollmentModel>> {
        const response = await apiClient.get<StandardApiResponse<{ items: AcademyEnrollmentModel[]; total: number; page: number; limit: number; totalPages: number }>>(
            '/api/academy/enrollments/me',
            { params: query }
        );
        const data = response.data.data!;
        return {
            success: response.data.success,
            data: data.items,
            total: data.total,
            page: data.page,
            limit: data.limit,
            totalPages: data.totalPages
        };
    },

    /**
     * Get enrollment by ID
     */
    async findById(id: string): Promise<AcademyEnrollmentModel> {
        const response = await apiClient.get<StandardApiResponse<{ item: AcademyEnrollmentModel }>>(`/api/academy/enrollments/${id}`);
        return response.data.data!.item;
    },

    /**
     * Check if user is enrolled in a specific class
     */
    async checkEnrollment(classId: string): Promise<{ isEnrolled: boolean; enrollment?: AcademyEnrollmentModel }> {
        const response = await apiClient.get<StandardApiResponse<{ items: AcademyEnrollmentModel[] }>>(
            '/api/academy/enrollments/me',
            { params: { classId, limit: 1 } }
        );
        const enrollment = response.data.data?.items?.[0];
        return {
            isEnrolled: !!enrollment,
            enrollment
        };
    },

    /**
     * Check if a recipient is eligible for a gift (registered but not enrolled)
     */
    async checkGiftRecipient(_recipientEmail: string, _courseId: string): Promise<{ isEnrolled: boolean; isRegistered: boolean }> {
        // This endpoint might need to be implemented on the backend
        // For now, we'll return a default response to support the UI
        return { isEnrolled: false, isRegistered: true };
    },
};

/**
 * Hook: Get paginated enrollments for current user
 */
export function useMyEnrollments(query?: AcademyEnrollmentQueryDTO) {
    return useQuery({
        queryKey: ['academy-enrollments', 'me', query],
        queryFn: () => academyEnrollmentApi.getMyEnrollments(query),
    });
}

/**
 * Hook: Get academy enrollment by ID
 */
export function useAcademyEnrollment(id?: string) {
    return useQuery({
        queryKey: ['academy-enrollments', 'id', id],
        queryFn: () => academyEnrollmentApi.findById(id!),
        enabled: !!id,
    });
}

/**
 * Hook: Check enrollment status for a class
 */
export function useAcademyEnrollmentCheck(classId: string) {
    return useQuery({
        queryKey: ['academy-enrollments', 'check', classId],
        queryFn: () => academyEnrollmentApi.checkEnrollment(classId),
        enabled: !!classId,
    });
}
