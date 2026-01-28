import type { TicketQueryDTO, TicketResponseDTO, PaginatedResponseDTO, UpdateTicketStatusDTO } from '@workspace/schemas';
import { apiClient } from '../api-client';

export const ticketApi = {
    getTickets: async (query: TicketQueryDTO): Promise<PaginatedResponseDTO<TicketResponseDTO>> => {
        const response = await apiClient.get<PaginatedResponseDTO<TicketResponseDTO>>('/api/tickets', { params: query });
        return response.data;
    },

    getTicket: async (id: string): Promise<TicketResponseDTO> => {
        const response = await apiClient.get<{ data: TicketResponseDTO }>(`/api/tickets/${id}`);
        return response.data.data;
    },

    updateTicketStatus: async (id: string, dto: UpdateTicketStatusDTO): Promise<TicketResponseDTO> => {
        const response = await apiClient.patch<{ data: TicketResponseDTO }>(`/api/tickets/${id}/status`, dto);
        return response.data.data;
    },
};
