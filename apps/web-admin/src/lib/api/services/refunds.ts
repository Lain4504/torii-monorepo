import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
    RefundQueryDTO,
    RefundResponseDTO,
    UpdateRefundStatusDTO,
    StandardApiResponse,
    PaginatedApiResponse
} from '@workspace/schemas';
import { apiClient } from '../api-client.ts';

export const refundApi = {
    findAll: async (query: RefundQueryDTO): Promise<PaginatedApiResponse<RefundResponseDTO>> => {
        const response = await apiClient.get<PaginatedApiResponse<RefundResponseDTO>>('/api/refunds', { params: query });
        return response.data;
    },

    findById: async (id: string): Promise<RefundResponseDTO> => {
        const response = await apiClient.get<StandardApiResponse<RefundResponseDTO>>(`/api/refunds/${id}`);
        return response.data.data!;
    },

    updateStatus: async (id: string, dto: UpdateRefundStatusDTO): Promise<RefundResponseDTO> => {
        const response = await apiClient.patch<StandardApiResponse<RefundResponseDTO>>(`/api/refunds/${id}/status`, dto);
        return response.data.data!;
    }
};

export const useRefunds = (query: RefundQueryDTO) => {
    return useQuery({
        queryKey: ['refunds', query],
        queryFn: () => refundApi.findAll(query),
    });
};

export const useRefund = (id: string) => {
    return useQuery({
        queryKey: ['refund', id],
        queryFn: () => refundApi.findById(id),
        enabled: !!id,
    });
};

export const useUpdateRefundStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...dto }: { id: string } & UpdateRefundStatusDTO) => refundApi.updateStatus(id, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['refunds'] });
            queryClient.invalidateQueries({ queryKey: ['refund'] });
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            queryClient.invalidateQueries({ queryKey: ['ticketStats'] });
        },
    });
};
