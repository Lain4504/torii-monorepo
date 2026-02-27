'use client';

import { useState } from 'react';
import {
    Search,
    LifeBuoy,
} from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select";
import {
    Card,
    CardContent,
} from "@workspace/ui/components/card";
import { useTickets, useTicket, useDeleteTicket } from '@/lib/api/services/ticket-api';
import { TicketStatus } from '@workspace/schemas';
import { TicketTable } from '@/components/support/ticket-table';
import { CreateTicketDialog } from '@/components/support/create-ticket-dialog';
import { TicketDetailDialog } from '@/components/support/ticket-detail-dialog';
import { toast } from '@workspace/ui/components/sonner';

export default function SupportPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>('ALL');

    const limit = 10;
    const { data: ticketsData, isLoading: isLoadingTickets } = useTickets({
        page: currentPage,
        limit,
        search: searchTerm || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter as TicketStatus,
    });

    const { data: ticketDetail, isLoading: isLoadingDetail } = useTicket(selectedTicketId || '');
    const deleteTicket = useDeleteTicket();

    const tickets = ticketsData?.data || [];

    const handleViewDetail = (id: string) => {
        setSelectedTicketId(id);
        setIsDetailOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn hủy yêu cầu này?')) return;

        try {
            await deleteTicket.mutateAsync(id);
            toast.success('Đã hủy yêu cầu thành công');
            setIsDetailOpen(false);
        } catch (error: any) {
            toast.error(error.message || 'Không thể hủy yêu cầu');
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6 max-w-7xl animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Trung tâm hỗ trợ</h1>
                    <p className="text-muted-foreground">
                        Gửi yêu cầu hỗ trợ hoặc báo lỗi. Đội ngũ Torii luôn đồng hành cùng bạn.
                    </p>
                </div>
                <Button
                    onClick={() => setIsCreateOpen(true)}
                    className="w-fit"
                >
                    <LifeBuoy className="mr-2 h-4 w-4" />
                    Gửi yêu cầu mới
                </Button>
            </div>

            {/* Filter Section */}
            <Card className="border-none shadow-sm bg-muted/20">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm theo tiêu đề..."
                                className="pl-9 bg-background"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select
                            value={statusFilter}
                            onValueChange={(val) => setStatusFilter(val as TicketStatus | 'ALL')}
                        >
                            <SelectTrigger className="w-full md:w-[200px] bg-background">
                                <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                                <SelectItem value={TicketStatus.PENDING}>Đang chờ</SelectItem>
                                <SelectItem value={TicketStatus.PROCESSING}>Đang xử lý</SelectItem>
                                <SelectItem value={TicketStatus.APPROVED}>Đã chấp nhận</SelectItem>
                                <SelectItem value={TicketStatus.REJECTED}>Đã từ chối</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Tickets Table */}
            <TicketTable
                data={tickets}
                onView={handleViewDetail}
                onDelete={handleDelete}
                isLoading={isLoadingTickets}
                page={currentPage}
                limit={limit}
            />

            {/* Modals */}
            <CreateTicketDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
            />

            <TicketDetailDialog
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                ticket={ticketDetail || null}
                isLoading={isLoadingDetail}
                onCancel={handleDelete}
            />
        </div>
    );
}
