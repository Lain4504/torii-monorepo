import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebounceValue } from '@workspace/ui/hooks/use-debounce-value';

import { SmartPagination } from '@/components/common/smart-pagination';
import { TicketsPrimaryToolbar } from '@/components/tickets/tickets-primary-toolbar';
import { useTickets } from '@/api/services/tickets-hook';
import { TicketsTable } from '@/components/tickets/tickets-table';
import { TicketDetailSheet } from '@/components/tickets/ticket-detail-sheet';
import type { TicketResponseDTO } from '@workspace/schemas';
import { TicketStatus, TicketType } from '@workspace/schemas';


import { PageHeader } from '@/components/common/page-header';

export default function TicketsPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    // State
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [debouncedSearch] = useDebounceValue(search, 500);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || undefined;
    const type = searchParams.get('type') || undefined;

    // View State
    const [selectedTicket, setSelectedTicket] = useState<TicketResponseDTO | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    // Data Fetching
    const { data, isLoading } = useTickets({
        page,
        limit,
        search: debouncedSearch || undefined,
        status: status as TicketStatus,
        type: type as TicketType,
    });

    const tickets = data?.data || [];
    const totalPages = data?.totalPages || 0;

    // Handlers
    const handleSearch = (value: string) => {
        setSearch(value);
        setSearchParams(prev => {
            if (value) prev.set('search', value);
            else prev.delete('search');
            prev.set('page', '1');
            return prev;
        });
    };

    const handleFilterChange = (key: string, value: string) => {
        setSearchParams(prev => {
            if (value && value !== 'all') prev.set(key, value);
            else prev.delete(key);
            prev.set('page', '1');
            return prev;
        });
    };

    const handlePageChange = (newPage: number) => {
        setSearchParams(prev => {
            prev.set('page', newPage.toString());
            return prev;
        });
    };

    const handleViewTicket = (ticket: TicketResponseDTO) => {
        setSelectedTicket(ticket);
        setDetailOpen(true);
    };

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8 animate-in fade-in duration-700 pb-20 max-w-[1600px] mx-auto">
            <PageHeader
                title="Yêu cầu & Hỗ trợ"
                subtitle="Quản lý các ticket hỗ trợ kỹ thuật và hoàn tiền"
            />


            <div className="space-y-4">
                {/* Toolbar */}
                <TicketsPrimaryToolbar
                    search={search}
                    onSearchChange={handleSearch}
                    type={type}
                    onTypeChange={(val) => handleFilterChange('type', val)}
                    status={status}
                    onStatusChange={(val) => handleFilterChange('status', val)}
                />

                {/* Table */}
                <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                    <TicketsTable
                        data={tickets}
                        isLoading={isLoading}
                        onView={handleViewTicket}
                    />

                    {/* Pagination */}
                    <SmartPagination
                        page={page}
                        totalPages={totalPages}
                        totalItems={data?.total || 0}
                        onPageChange={handlePageChange}
                        itemName="yêu cầu"
                        className="border-t border-border bg-muted/5 px-6 py-4"
                    />
                </div>
            </div>

            {/* Ticket Detail Detail Detail Sheet */}
            <TicketDetailSheet
                ticket={selectedTicket}
                open={detailOpen}
                onOpenChange={setDetailOpen}
            />
        </div>
    );
}
