import { apiClient } from '../api-client';

export interface WishlistItem {
  id: string;
  userId: string;
  courseId: string;
  addedAt: string;
}

export interface PaginatedWishlistResponse {
  data: WishlistItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const wishlistApi = {
  /**
   * Get wishlist items
   */
  getWishlist: async (
    userId?: string,
    page: number = 1,
    limit: number = 100,
  ): Promise<PaginatedWishlistResponse> => {
    const response = await apiClient.get<PaginatedWishlistResponse>(
      '/api/wishlists',
      {
        params: { userId, page, limit },
      },
    );
    return response.data;
  },

  /**
   * Check if course is in wishlist
   */
  checkCourseInWishlist: async (
    courseId: string,
    userId: string,
  ): Promise<WishlistItem | null> => {
    try {
      const response = await wishlistApi.getWishlist(userId, 1, 100);
      const item = response.data.find((item) => item.courseId === courseId);
      return item || null;
    } catch (error) {
      console.error('Failed to check wishlist:', error);
      return null;
    }
  },

  /**
   * Add course to wishlist
   */
  addToWishlist: async (courseId: string): Promise<WishlistItem> => {
    const response = await apiClient.post<WishlistItem>('/api/wishlists', {
      courseId,
    });
    return response.data;
  },

  /**
   * Remove course from wishlist
   */
  removeFromWishlist: async (wishlistId: string): Promise<boolean> => {
    await apiClient.delete(`/api/wishlists/${wishlistId}`);
    return true;
  },

  /**
   * Toggle wishlist (add/remove course from wishlist)
   */
  toggleWishlist: async (courseId: string): Promise<{ isInWishlist: boolean }> => {
    const response = await apiClient.post<{ isInWishlist: boolean }>(`/api/wishlists/toggle/${courseId}`);
    return response.data;
  },

  /**
   * Check if course is in wishlist
   */
  checkWishlist: async (courseId: string): Promise<{ isInWishlist: boolean }> => {
    const response = await apiClient.get<{ isInWishlist: boolean }>(`/api/wishlists/check/${courseId}`);
    return response.data;
  },
};




