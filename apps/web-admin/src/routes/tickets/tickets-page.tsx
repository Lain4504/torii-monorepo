import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebounceValue } from '@workspace/ui/hooks/use-debounce-value';
import {
    Search,
    MessageSquare,
    Filter,
} from 'lucide-react';
import { Input } from '@workspace/ui/components/input';
import { Card } from '@workspace/ui/components/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { useTickets } from '@/api/services/tickets-hook';
import { TicketsTable } from '@/components/tickets/tickets-table';
import { TicketDetailSheet } from '@/components/tickets/ticket-detail-sheet';
import type { TicketResponseDTO } from '@workspace/schemas';
import { TicketStatus, TicketType } from '@workspace/schemas';
import { Button } from '@workspace/ui/components/button';

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
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-lg shadow-primary/5">
                            <MessageSquare className="size-6" />
                        </div>
                        <h1 className="text-4xl font-serif font-bold italic tracking-tight text-foreground uppercase leading-none">
                            Yêu cầu <span className="text-primary not-italic">& Hỗ trợ</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic border-l-2 border-primary/20 pl-4">
                        Quản lý các ticket hỗ trợ kỹ thuật và hoàn tiền từ người dùng
                    </div>
                </div>
            </div>

            {/* Filters Control Center */}
            <Card className="rounded-[2rem] border border-border/10 shadow-2xl shadow-black/5 p-2 flex flex-col lg:flex-row gap-2 bg-background/50 backdrop-blur-xl ring-1 ring-white/5">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/30" />
                    <Input
                        placeholder="Tìm kiếm theo tiêu đề, email, ID..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="h-12 pl-11 bg-transparent border-transparent hover:bg-muted/10 focus-visible:bg-muted/10 rounded-2xl transition-all text-sm font-medium placeholder:text-muted-foreground/30 ring-0 focus-visible:ring-1 focus-visible:ring-primary/20"
                    />
                </div>

                <div className="w-px h-8 bg-border/20 my-auto hidden lg:block" />

                <div className="flex flex-col sm:flex-row gap-2">
                    <Select value={type || 'all'} onValueChange={(val) => handleFilterChange('type', val)}>
                        <SelectTrigger className="w-full sm:w-[180px] h-12 border-0 bg-transparent hover:bg-muted/10 focus:ring-1 focus:ring-primary/10 rounded-2xl gap-3 text-xs font-bold uppercase tracking-widest text-muted-foreground/70 transition-all">
                            <Filter className="size-3.5 opacity-30" />
                            <SelectValue placeholder="Loại hỗ trợ" />
                        </SelectTrigger>
                        <SelectContent align="end" className="rounded-2xl border-border/10 shadow-2xl bg-background/95 backdrop-blur-xl">
                            <SelectItem value="all" className="text-xs font-bold uppercase tracking-widest py-3 transition-colors">Tất cả loại</SelectItem>
                            <SelectItem value={TicketType.SUPPORT} className="text-xs font-bold uppercase tracking-widest py-3 transition-colors">Hỗ trợ kỹ thuật</SelectItem>
                            <SelectItem value={TicketType.REFUND} className="text-xs font-bold uppercase tracking-widest py-3 transition-colors">Hoàn tiền</SelectItem>
                            <SelectItem value={TicketType.ERROR_REPORT} className="text-xs font-bold uppercase tracking-widest py-3 transition-colors">Báo lỗi</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={status || 'all'} onValueChange={(val) => handleFilterChange('status', val)}>
                        <SelectTrigger className="w-full sm:w-[180px] h-12 border-0 bg-transparent hover:bg-muted/10 focus:ring-1 focus:ring-primary/10 rounded-2xl gap-3 text-xs font-bold uppercase tracking-widest text-muted-foreground/70 transition-all">
                            <Filter className="size-3.5 opacity-30" />
                            <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent align="end" className="rounded-2xl border-border/10 shadow-2xl bg-background/95 backdrop-blur-xl">
                            <SelectItem value="all" className="text-xs font-bold uppercase tracking-widest py-3 transition-colors">Tất cả trạng thái</SelectItem>
                            <SelectItem value={TicketStatus.PENDING} className="text-xs font-bold uppercase tracking-widest py-3 transition-colors">Đang chờ</SelectItem>
                            <SelectItem value={TicketStatus.PROCESSING} className="text-xs font-bold uppercase tracking-widest py-3 transition-colors">Đang xử lý</SelectItem>
                            <SelectItem value={TicketStatus.APPROVED} className="text-xs font-bold uppercase tracking-widest py-3 transition-colors">Thành công</SelectItem>
                            <SelectItem value={TicketStatus.REJECTED} className="text-xs font-bold uppercase tracking-widest py-3 transition-colors">Đã từ chối</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </Card>

            {/* Main Table Content */}
            <Card className="rounded-[2.5rem] border border-border/10 bg-background/40 backdrop-blur-md shadow-2xl shadow-black/5 overflow-hidden ring-1 ring-white/5 transition-all duration-700">
                <TicketsTable
                    data={tickets}
                    isLoading={isLoading}
                    onView={handleViewTicket}
                />

                {/* Pagination Footer */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-8 py-6 border-t border-border/5 bg-muted/5 backdrop-blur-xl">
                        <div className="flex flex-col">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 italic">Hệ thống phân trang</p>
                            <p className="text-xs text-foreground/40 font-bold">
                                Trang <span className="text-primary">{page}</span> / {totalPages}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page <= 1}
                                className="h-10 px-5 rounded-xl border-border/20 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black hover:border-white transition-all duration-300 disabled:opacity-20"
                            >
                                Trước
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page >= totalPages}
                                className="h-10 px-5 rounded-xl border-border/20 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black hover:border-white transition-all duration-300 disabled:opacity-20"
                            >
                                Sau
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Ticket Detail Detail Detail Sheet */}
            <TicketDetailSheet
                ticket={selectedTicket}
                open={detailOpen}
                onOpenChange={setDetailOpen}
            />
        </div>
    );
}
