import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketApi } from '@/lib/api/services/tickets.ts';
import type { TicketQueryDTO, UpdateTicketStatusDTO } from '@workspace/schemas';

export function useTickets(query: TicketQueryDTO) {
    return useQuery({
        queryKey: ['tickets', query],
        queryFn: () => ticketApi.findAll(query),
    });
}

export function useTicket(id: string) {
    return useQuery({
        queryKey: ['tickets', id],
        queryFn: () => ticketApi.findById(id),
        enabled: !!id,
    });
}

export function useUpdateTicketStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateTicketStatusDTO }) =>
            ticketApi.updateStatus(id, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
        },
    });
}
