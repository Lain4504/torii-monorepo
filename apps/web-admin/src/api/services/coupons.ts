import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/api-client.ts';
import type { 
    PaginatedApiResponse, 
    StandardApiResponse,
    CouponResponseDTO, 
    CouponCreateDTO, 
    CouponUpdateDTO, 
    PaginationOptionsDTO
} from '@workspace/schemas';

// ============================================================================
// API Functions
// ============================================================================

export const couponsApi = {
    // GET /api/coupons
    async findAll(params: PaginationOptionsDTO & { status?: string; search?: string }): Promise<PaginatedApiResponse<CouponResponseDTO>> {
        const response = await apiClient.get<PaginatedApiResponse<CouponResponseDTO>>('/api/coupons', { params });
        return response.data;
    },

    // GET /api/coupons/:id
    async findOne(id: string): Promise<CouponResponseDTO> {
        const response = await apiClient.get<StandardApiResponse<{ coupon: CouponResponseDTO }>>(`/api/coupons/${id}`);
        return response.data.data!.coupon;
    },

    // GET /api/coupons/code/:code
    async findByCode(code: string): Promise<CouponResponseDTO> {
        const response = await apiClient.get<StandardApiResponse<{ coupon: CouponResponseDTO }>>(`/api/coupons/code/${code}`);
        return response.data.data!.coupon;
    },

    // POST /api/coupons
    async create(data: CouponCreateDTO): Promise<CouponResponseDTO> {
        const response = await apiClient.post<StandardApiResponse<{ coupon: CouponResponseDTO }>>('/api/coupons', data);
        return response.data.data!.coupon;
    },

    // PUT /api/coupons/:id
    async update(id: string, data: CouponUpdateDTO): Promise<CouponResponseDTO> {
        const response = await apiClient.put<StandardApiResponse<{ coupon: CouponResponseDTO }>>(`/api/coupons/${id}`, data);
        return response.data.data!.coupon;
    },

    // DELETE /api/coupons/:id
    async delete(id: string): Promise<boolean> {
        const response = await apiClient.delete<StandardApiResponse<boolean>>(`/api/coupons/${id}`);
        return response.data.success;
    },

    // GET /api/coupons/statistics
    async getStatistics(): Promise<any> {
        const response = await apiClient.get<StandardApiResponse<{ statistics: any }>>('/api/coupons/statistics');
        return response.data.data!.statistics;
    }
};

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook: Get coupons list with pagination and filters
 */
export function useCoupons(params: PaginationOptionsDTO & { status?: string; search?: string }) {
    return useQuery({
        queryKey: ['coupons', params],
        queryFn: () => couponsApi.findAll(params),
        // Keep previous data while fetching new data for smoother pagination
        placeholderData: (previousData) => previousData, 
        staleTime: 30000,
    });
}

/**
 * Hook: Get single coupon by ID
 */
export function useCoupon(id: string) {
    return useQuery({
        queryKey: ['coupons', id],
        queryFn: () => couponsApi.findOne(id),
        enabled: !!id,
    });
}

/**
 * Hook: Create new coupon
 */
export function useCreateCoupon() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CouponCreateDTO) => couponsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['coupons'] });
            queryClient.invalidateQueries({ queryKey: ['coupons-stats'] });
        },
    });
}

/**
 * Hook: Update coupon
 */
export function useUpdateCoupon() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: CouponUpdateDTO }) =>
            couponsApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['coupons', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['coupons'] });
            queryClient.invalidateQueries({ queryKey: ['coupons-stats'] });
        },
    });
}

/**
 * Hook: Delete coupon
 */
export function useDeleteCoupon() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => couponsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['coupons'] });
            queryClient.invalidateQueries({ queryKey: ['coupons-stats'] });
        },
    });
}

/**
 * Hook: Get coupon statistics
 */
export function useCouponStatistics() {
    return useQuery({
        queryKey: ['coupons-stats'],
        queryFn: () => couponsApi.getStatistics(),
        staleTime: 60000,
    });
}
