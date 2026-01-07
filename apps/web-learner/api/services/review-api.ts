import { apiClient } from '../api-client';

export interface ReviewResponse {
  id: string;
  userId: string;
  courseId: string;
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

export interface PaginatedReviewResponse {
  data: ReviewResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RatingDistribution {
  courseId: string;
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
  ): Promise<PaginatedReviewResponse> => {
    const response = await apiClient.get<PaginatedReviewResponse>(
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
    const response = await apiClient.get<RatingDistribution>(
      `/api/courses/${courseId}/reviews/distribution`,
    );
    return response.data;
  },

  /**
   * Create a new review
   */
  createReview: async (
    courseId: string,
    data: CreateReviewRequest,
  ): Promise<ReviewResponse> => {
    const response = await apiClient.post<ReviewResponse>(
      `/api/courses/${courseId}/reviews`,
      data,
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




