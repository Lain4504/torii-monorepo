import { CouponValidateRequestDTO, CouponValidateResponseDTO } from '@workspace/schemas'
import { apiClient } from '../api-client'

export const couponApi = {
    validateCoupon: async (data: CouponValidateRequestDTO): Promise<CouponValidateResponseDTO> => {
        const response = await apiClient.post<any>('/api/billing/coupons/validate', data)
        return response.data.data
    },
}
