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
        const data = response.data.data;
        // Ensure react-query queryFn never returns undefined
        if (!data) {
            return {
                id: 'empty-cart',
                userId: 'anonymous',
                items: [],
                total: 0,
                count: 0,
            } as any;
        }
        return data;
    },

    /**
     * Add course run to cart
     */
    async addToCart(courseRunId: string): Promise<CartResponse> {
        const response = await apiClient.post<StandardApiResponse<CartResponse>>('/api/carts/items', { courseRunId });
        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.message || 'Failed to add to cart');
        }
        return response.data.data;
    },

    /**
     * Remove course run from cart
     */
    async removeFromCart(courseRunId: string): Promise<CartResponse> {
        const response = await apiClient.delete<StandardApiResponse<CartResponse>>(`/api/carts/items/${courseRunId}`);
        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.message || 'Failed to remove from cart');
        }
        return response.data.data;
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
        mutationFn: (courseRunId: string) => cartApi.addToCart(courseRunId),
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
        mutationFn: (courseRunId: string) => cartApi.removeFromCart(courseRunId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        }
    });
}

