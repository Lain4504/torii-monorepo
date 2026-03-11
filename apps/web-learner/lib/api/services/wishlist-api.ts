import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type { StandardApiResponse, PaginatedApiResponse } from '@workspace/schemas';

export interface WishlistItem {
  id: string;
  userId: string;
  offeringId: string;
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
   * Check if course offering is in wishlist
   */
  checkCourseInWishlist: async (
    offeringId: string,
    userId: string,
  ): Promise<WishlistItem | null> => {
    try {
      const response = await wishlistApi.getWishlist(userId, 1, 100);
      const item = response.data?.find((item) => item.offeringId === offeringId);
      return item || null;
    } catch (error) {
      console.error('Failed to check wishlist:', error);
      return null;
    }
  },

  /**
   * Add course offering to wishlist
   */
  addToWishlist: async (offeringId: string): Promise<WishlistItem> => {
    const response = await apiClient.post<StandardApiResponse<{ wishlist: WishlistItem }>>('/api/wishlists', {
      offeringId,
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
   * Toggle wishlist (add/remove course offering from wishlist)
   */
  toggleWishlist: async (offeringId: string): Promise<{ isInWishlist: boolean }> => {
    const response = await apiClient.post<StandardApiResponse<{ isInWishlist: boolean }>>(`/api/wishlists/toggle/${offeringId}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to toggle wishlist');
    }
    return response.data.data;
  },

  /**
   * Check if course offering is in wishlist
   */
  checkWishlist: async (offeringId: string): Promise<{ isInWishlist: boolean }> => {
    const response = await apiClient.get<StandardApiResponse<{ isInWishlist: boolean }>>(`/api/wishlists/check/${offeringId}`);
    if (!response.data.success || !response.data.data) {
      return { isInWishlist: false };
    }
    return response.data.data;
  },
};

/**
 * Hook: Check if a course offering is in wishlist
 */
export function useCheckWishlist(offeringId?: string) {
  return useQuery({
    queryKey: ['wishlist', 'check', offeringId],
    queryFn: () => wishlistApi.checkWishlist(offeringId!),
    enabled: !!offeringId,
  });
}

/**
 * Hook: Toggle wishlist (add/remove)
 */
export function useToggleWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (offeringId: string) => wishlistApi.toggleWishlist(offeringId),
    onSuccess: (_data, offeringId) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', 'check', offeringId] });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}

