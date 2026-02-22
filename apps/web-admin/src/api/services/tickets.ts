import type { TicketQueryDTO, TicketResponseDTO, UpdateTicketStatusDTO, StandardApiResponse, PaginatedApiResponse } from '@workspace/schemas';
import { apiClient } from '../api-client';

export const ticketApi = {
    getTickets: async (query: TicketQueryDTO): Promise<PaginatedApiResponse<TicketResponseDTO>> => {
        const response = await apiClient.post<PaginatedApiResponse<TicketResponseDTO>>('/api/tickets/search', query);
        return response.data;
    },

    getTicket: async (id: string): Promise<TicketResponseDTO> => {
        const response = await apiClient.get<StandardApiResponse<TicketResponseDTO>>(`/api/tickets/${id}`);
        return response.data.data!;
    },

    updateTicketStatus: async (id: string, dto: UpdateTicketStatusDTO): Promise<TicketResponseDTO> => {
        const response = await apiClient.patch<StandardApiResponse<TicketResponseDTO>>(`/api/tickets/${id}/status`, dto);
        return response.data.data!;
    },
};
