import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type { StandardApiResponse, PaginatedApiResponse } from '@workspace/schemas';

export interface WishlistItem {
  id: string;
  userId: string;
  courseRunId: string;
  addedAt: string;
}

export const wishlistApi = {
  /**
   * Get wishlist items
   */
  getWishlist: async (
    userId?: string,
    page: number = 1,
    limit: number = 100,
  ): Promise<PaginatedApiResponse<WishlistItem>> => {
    const response = await apiClient.get<PaginatedApiResponse<WishlistItem>>(
      '/api/wishlists',
      {
        params: { userId, page, limit },
      },
    );
    return response.data;
  },

  /**
   * Check if course run is in wishlist
   */
  checkCourseInWishlist: async (
    courseRunId: string,
    userId: string,
  ): Promise<WishlistItem | null> => {
    try {
      const response = await wishlistApi.getWishlist(userId, 1, 100);
      const item = response.data?.find((item) => item.courseRunId === courseRunId);
      return item || null;
    } catch (error) {
      console.error('Failed to check wishlist:', error);
      return null;
    }
  },

  /**
   * Add course run to wishlist
   */
  addToWishlist: async (courseRunId: string): Promise<WishlistItem> => {
    const response = await apiClient.post<StandardApiResponse<{ wishlist: WishlistItem }>>('/api/wishlists', {
      courseRunId,
    });
    return response.data.data!.wishlist;
  },

  /**
   * Remove course run from wishlist
   */
  removeFromWishlist: async (wishlistId: string): Promise<boolean> => {
    await apiClient.delete(`/api/wishlists/${wishlistId}`);
    return true;
  },

  /**
   * Toggle wishlist (add/remove course run from wishlist)
   */
  toggleWishlist: async (courseRunId: string): Promise<{ isInWishlist: boolean }> => {
    const response = await apiClient.post<StandardApiResponse<{ isInWishlist: boolean }>>(`/api/wishlists/toggle/${courseRunId}`);
    return response.data.data!;
  },

  /**
   * Check if course run is in wishlist
   */
  checkWishlist: async (courseRunId: string): Promise<{ isInWishlist: boolean }> => {
    const response = await apiClient.get<StandardApiResponse<{ isInWishlist: boolean }>>(`/api/wishlists/check/${courseRunId}`);
    // Fallback to false when data is missing to avoid undefined for react-query
    return response.data.data ?? { isInWishlist: false };
  },
};

/**
 * Hook: Check if a course run is in wishlist
 */
export function useCheckWishlist(courseRunId?: string) {
  return useQuery({
    queryKey: ['wishlist', 'check', courseRunId],
    queryFn: () => wishlistApi.checkWishlist(courseRunId!),
    enabled: !!courseRunId,
  });
}

/**
 * Hook: Toggle wishlist (add/remove)
 */
export function useToggleWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseRunId: string) => wishlistApi.toggleWishlist(courseRunId),
    onSuccess: (_data, courseRunId) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', 'check', courseRunId] });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}

