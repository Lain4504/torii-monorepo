import { CouponValidateRequestDTO, CouponValidateResponseDTO } from '@workspace/schemas'
import { apiClient } from '../api-client'

export const couponApi = {
    validateCoupon: async (data: CouponValidateRequestDTO): Promise<CouponValidateResponseDTO> => {
        const response = await apiClient.post<any>('/api/billing/coupons/validate', data)
        return response.data.data
    },

    getMyCoupons: async (userId: string): Promise<any[]> => {
        if (!userId) return []
        const response = await apiClient.get<any>(`/api/billing/coupons/my-coupons?userId=${userId}`)
        // Adjust for StandardApiResponse if needed
        return response.data?.data || response.data || []
    }
}

import { useQuery } from '@tanstack/react-query'

export const useMyCoupons = (userId: string | undefined) => {
    return useQuery({
        queryKey: ['my-coupons', userId],
        queryFn: () => couponApi.getMyCoupons(userId!),
        enabled: !!userId,
    })
}
