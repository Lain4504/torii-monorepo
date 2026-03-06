import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type {
    EnrollmentResponseDTO,
    EnrollmentQueryDTO,
    StandardApiResponse,
    PaginatedApiResponse,
} from '@workspace/schemas';

export const enrollmentApi = {
    /**
     * Get current user's enrollments
     */
    async getMyEnrollments(query?: EnrollmentQueryDTO): Promise<PaginatedApiResponse<any>> {
        const response = await apiClient.get<StandardApiResponse<any>>(
            '/api/academy/enrollments/me',
            { params: query }
        );
        return response.data.data;
    },

    /**
     * Get all enrollments (Admin/Staff use)
     */
    async getAllEnrollments(query?: EnrollmentQueryDTO): Promise<PaginatedApiResponse<any>> {
        const response = await apiClient.get<StandardApiResponse<any>>(
            '/api/academy/enrollments',
            { params: query }
        );
        return response.data.data;
    },

    /**
     * Get enrollment by ID
     */
    async getEnrollment(id: string): Promise<any> {
        const response = await apiClient.get<StandardApiResponse<any>>(`/api/academy/enrollments/\${id}`);
        return response.data.data;
    },

    /**
     * Check if user is enrolled in a specific class
     */
    async checkEnrollment(classId: string): Promise<{ isEnrolled: boolean; enrollment?: any }> {
        const response = await apiClient.get<StandardApiResponse<any>>(
            '/api/academy/enrollments/me',
            { params: { classId, limit: 1 } }
        );
        const data = response.data.data;
        const enrollment = data?.items?.[0] || data?.[0];
        return {
            isEnrolled: !!enrollment,
            enrollment
        };
    },

    /**
     * Check if a gift recipient (by email) is enrolled in a course
     */
    async checkGiftRecipient(email: string, courseProfileId: string): Promise<{ isRegistered: boolean; isEnrolled: boolean }> {
        // Backend doesn't have a direct check-gift endpoint yet in the new academy service,
        // so we check if an enrollment exists for that user+course via admin/staff search if possible,
        // OR we map it to the old endpoint if the gateway still supports it.
        // For now, mapping to a generic check or returning false to avoid blocking the UI.
        try {
            const response = await apiClient.get<StandardApiResponse<{ isRegistered: boolean; isEnrolled: boolean }>>(
                '/api/academy/enrollments/check-gift',
                { params: { email, courseProfileId } }
            );
            return response.data.data || { isRegistered: false, isEnrolled: false };
        } catch (e) {
            return { isRegistered: false, isEnrolled: false };
        }
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
 * Hook: Check enrollment status for a class
 */
export function useCheckEnrollment(classId: string) {
    return useQuery({
        queryKey: ['enrollments', 'check', classId],
        queryFn: () => enrollmentApi.checkEnrollment(classId),
        enabled: !!classId,
    });
}
