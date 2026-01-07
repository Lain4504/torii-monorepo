import { apiClient } from '../api-client';

export interface Course {
    id: string;
    title: string;
    slug: string;
    thumbnailUrl?: string;
    jlptLevel: string;
    totalLessons: number;
    durationWeeks?: number;
    price: number;
    discountPrice?: number;
    averageRating: number;
    totalReviews: number;
    totalStudents: number;
    createdBy?: string;
}

export interface CoursesListResponse {
    data: Course[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const coursesApi = {
    /**
     * Fetch courses list with filtering and pagination
     */
    async getList(params: {
        page?: number;
        limit?: number;
        jlptLevel?: string;
        type?: string;
        search?: string;
    }): Promise<CoursesListResponse> {
        const response = await apiClient.get('/courses', { params });
        return response.data;
    },

    /**
     * Get single course by slug
     */
    async getBySlug(slug: string): Promise<Course> {
        const response = await apiClient.get(`/courses/${slug}`);
        return response.data;
    },
};
