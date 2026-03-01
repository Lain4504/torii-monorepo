import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type { StandardApiResponse, PaginatedApiResponse } from '@workspace/schemas';

export interface ReviewResponse {
  id: string;
  userId: string;
  courseRunId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
}


export interface RatingDistribution {
  courseRunId: string;
  distribution: Array<{
    stars: number;
    count: number;
    percent: number;
  }>;
  averageRating: number;
  totalReviews: number;
}

export interface CreateReviewRequest {
  rating: number;
  comment?: string;
}

export const reviewApi = {
  /**
   * Get reviews by course ID
   */
  getReviewsByCourse: async (
    courseId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedApiResponse<ReviewResponse>> => {
    const response = await apiClient.get<PaginatedApiResponse<ReviewResponse>>(
      `/api/courses/${courseId}/reviews`,
      {
        params: { page, limit },
      },
    );
    return response.data;
  },

  /**
   * Get rating distribution for a course
   */
  getRatingDistribution: async (
    courseId: string,
  ): Promise<RatingDistribution> => {
    const response = await apiClient.get<StandardApiResponse<RatingDistribution>>(
      `/api/courses/${courseId}/reviews/distribution`,
    );
    return response.data.data!;
  },

  /**
   * Create a new review
   */
  createReview: async (
    courseId: string,
    data: CreateReviewRequest,
  ): Promise<ReviewResponse> => {
    const response = await apiClient.post<StandardApiResponse<{ review: ReviewResponse }>>(
      `/api/courses/${courseId}/reviews`,
      data,
    );
    return response.data.data!.review;
  },

  /**
   * Get all reviews (public)
   */
  getAllReviews: async (
    page: number = 1,
    limit: number = 10,
    rating?: number,
    search?: string
  ): Promise<PaginatedApiResponse<ReviewResponse & { courseTitle?: string; courseSlug?: string }>> => {
    const response = await apiClient.post<PaginatedApiResponse<ReviewResponse & { courseTitle?: string; courseSlug?: string }>>(
      '/api/courses/reviews/search',
      { page, limit, rating, search },
    );
    return response.data;
  },

  /**
   * Delete a review
   */
  deleteReview: async (reviewId: string): Promise<boolean> => {
    await apiClient.delete(`/api/courses/reviews/${reviewId}`);
    return true;
  },
};

/**
 * Hook: Get all reviews for homepage/marketing
 */
export function useAllReviews(params: { page?: number; limit?: number; rating?: number; search?: string } = {}) {
  return useQuery({
    queryKey: ['reviews', 'all', params],
    queryFn: () => reviewApi.getAllReviews(params.page, params.limit, params.rating, params.search),
  });
}

/**
 * Hook: Get reviews by course
 */
export function useCourseReviews(courseId?: string, page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ['reviews', 'course', courseId, page, limit],
    queryFn: () => reviewApi.getReviewsByCourse(courseId!, page, limit),
    enabled: !!courseId,
  });
}

/**
 * Hook: Get rating distribution
 */
export function useRatingDistribution(courseId?: string) {
  return useQuery({
    queryKey: ['reviews', 'distribution', courseId],
    queryFn: () => reviewApi.getRatingDistribution(courseId!),
    enabled: !!courseId,
  });
}




