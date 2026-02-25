import { CouponValidateRequestDTO, CouponValidateResponseDTO } from '@workspace/schemas'
import { apiClient } from '../api-client'

export const couponApi = {
    validateCoupon: async (data: CouponValidateRequestDTO): Promise<CouponValidateResponseDTO> => {
        const response = await apiClient.post<any>('/api/billing/coupons/validate', data)
        return response.data.data
    },

    getMyCoupons: async (): Promise<any[]> => {
        const response = await apiClient.get<any>('/api/billing/coupons/my-coupons')
        return response.data?.data || []
    }
}

import { useQuery } from '@tanstack/react-query'

export const useMyCoupons = (enabled: boolean = true) => {
    return useQuery({
        queryKey: ['my-coupons'],
        queryFn: () => couponApi.getMyCoupons(),
        enabled,
    })
}
