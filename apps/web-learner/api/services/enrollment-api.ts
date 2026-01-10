import { apiClient } from '../api-client';
import type {
    EnrollmentResponseDTO,
    EnrollmentCreateDTO,
    EnrollmentQueryDTO,
    PaginatedResponseDTO,
} from '@workspace/schemas';

export const enrollmentApi = {
    /**
     * Get all enrollments
     */
    async getAllEnrollments(query?: EnrollmentQueryDTO): Promise<PaginatedResponseDTO<EnrollmentResponseDTO>> {
        const response = await apiClient.get<PaginatedResponseDTO<EnrollmentResponseDTO>>('/enrollments', {
            params: query,
        });
        return response.data;
    },

    /**
     * Get enrollment by ID
     */
    async getEnrollment(id: string): Promise<EnrollmentResponseDTO> {
        const response = await apiClient.get<EnrollmentResponseDTO>(`/enrollments/${id}`);
        return response.data;
    },

    /**
     * Check if user is enrolled in a course
     */
    async checkEnrollment(courseId: string): Promise<{ isEnrolled: boolean; enrollment?: EnrollmentResponseDTO }> {
        const response = await apiClient.get<{ isEnrolled: boolean; enrollment?: EnrollmentResponseDTO }>(
            `/enrollments/check/${courseId}`
        );
        return response.data;
    },

    /**
     * Create enrollment
     */
    async createEnrollment(data: EnrollmentCreateDTO): Promise<EnrollmentResponseDTO> {
        const response = await apiClient.post<EnrollmentResponseDTO>('/enrollments', data);
        return response.data;
    },

    /**
     * Update enrollment progress
     */
    async updateProgress(enrollmentId: string, completionPercentage: number): Promise<EnrollmentResponseDTO> {
        const response = await apiClient.patch<EnrollmentResponseDTO>(
            `/enrollments/${enrollmentId}/progress`,
            { completionPercentage }
        );
        return response.data;
    },
};

