import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/api-client.ts';
import type {
    CourseInstructorResponseDTO,
    CourseInstructorAssignDTO,
    CourseInstructorUpdateDTO
} from '@workspace/schemas';

// ============================================================================
// API Functions
// ============================================================================

export const courseInstructorsApi = {
    // POST /api/course-instructors
    async assignLecturer(dto: CourseInstructorAssignDTO): Promise<CourseInstructorResponseDTO> {
        const response = await apiClient.post<CourseInstructorResponseDTO>('/api/course-instructors', dto);
        return response.data;
    },

    // GET /api/course-instructors/by-course/:courseId
    async getInstructorsByCourse(courseId: string): Promise<CourseInstructorResponseDTO[]> {
        const response = await apiClient.get<CourseInstructorResponseDTO[]>(`/api/course-instructors/by-course/${courseId}`);
        return response.data;
    },

    // GET /api/course-instructors/by-lecturer/:lecturerId
    async getCoursesByLecturer(lecturerId: string): Promise<CourseInstructorResponseDTO[]> {
        const response = await apiClient.get<CourseInstructorResponseDTO[]>(`/api/course-instructors/by-lecturer/${lecturerId}`);
        return response.data;
    },

    // PATCH /api/course-instructors/:id/primary
    async updatePrimaryInstructor(id: string, dto: CourseInstructorUpdateDTO): Promise<CourseInstructorResponseDTO> {
        const response = await apiClient.patch<CourseInstructorResponseDTO>(`/api/course-instructors/${id}/primary`, dto);
        return response.data;
    },

    // DELETE /api/course-instructors/:id
    async unassignLecturer(id: string): Promise<{ message: string }> {
        const response = await apiClient.delete<{ message: string }>(`/api/course-instructors/${id}`);
        return response.data;
    },
};

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook: Get instructors for a course
 */
export function useCourseInstructors(courseId: string) {
    return useQuery({
        queryKey: ['course-instructors', 'by-course', courseId],
        queryFn: () => courseInstructorsApi.getInstructorsByCourse(courseId),
        enabled: !!courseId,
        staleTime: 30000,
    });
}

/**
 * Hook: Get courses assigned to a lecturer
 */
export function useLecturerCourses(lecturerId: string) {
    return useQuery({
        queryKey: ['course-instructors', 'by-lecturer', lecturerId],
        queryFn: () => courseInstructorsApi.getCoursesByLecturer(lecturerId),
        enabled: !!lecturerId,
        staleTime: 30000,
    });
}

/**
 * Hook: Assign lecturer to course
 */
export function useAssignLecturer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: CourseInstructorAssignDTO) => courseInstructorsApi.assignLecturer(dto),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['course-instructors', 'by-course', variables.courseId] });
            queryClient.invalidateQueries({ queryKey: ['course-instructors', 'by-lecturer', variables.lecturerId] });
            queryClient.invalidateQueries({ queryKey: ['courses'] });
        },
    });
}

/**
 * Hook: Update primary instructor status
 */
export function useUpdatePrimaryInstructor() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: CourseInstructorUpdateDTO }) =>
            courseInstructorsApi.updatePrimaryInstructor(id, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['course-instructors'] });
            queryClient.invalidateQueries({ queryKey: ['courses'] });
        },
    });
}

/**
 * Hook: Unassign lecturer from course
 */
export function useUnassignLecturer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => courseInstructorsApi.unassignLecturer(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['course-instructors'] });
            queryClient.invalidateQueries({ queryKey: ['courses'] });
        },
    });
}
