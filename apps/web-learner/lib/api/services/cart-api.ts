import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type {
    CartResponse,
    StandardApiResponse
} from '@workspace/schemas';

export const cartApi = {
    /**
     * Get current user's cart
     */
    async getCart(): Promise<CartResponse> {
        const response = await apiClient.get<StandardApiResponse<CartResponse>>('/api/carts');
        return response.data.data!;
    },

    /**
     * Add course to cart
     */
    async addToCart(courseId: string): Promise<CartResponse> {
        const response = await apiClient.post<StandardApiResponse<CartResponse>>('/api/carts/items', { courseId });
        return response.data.data!;
    },

    /**
     * Remove course from cart
     */
    async removeFromCart(courseId: string): Promise<CartResponse> {
        const response = await apiClient.delete<StandardApiResponse<CartResponse>>(`/api/carts/items/${courseId}`);
        return response.data.data!;
    },

    /**
     * Clear cart
     */
    async clearCart(): Promise<boolean> {
        await apiClient.delete('/api/carts');
        return true;
    }
};

/**
 * Hook: Get cart
 */
export function useCart() {
    return useQuery({
        queryKey: ['cart'],
        queryFn: () => cartApi.getCart(),
    });
}

/**
 * Hook: Add to cart
 */
export function useAddToCart() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (courseId: string) => cartApi.addToCart(courseId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        }
    });
}

/**
 * Hook: Remove from cart
 */
export function useRemoveFromCart() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (courseId: string) => cartApi.removeFromCart(courseId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        }
    });
}
