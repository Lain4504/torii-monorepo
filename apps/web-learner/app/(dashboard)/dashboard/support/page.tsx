'use client';

import { useState } from 'react';
import { Badge } from '@workspace/ui/components/badge';
import {
    Plus,
    MessageSquare,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    MoreHorizontal,
    Search,
    LifeBuoy,
    HelpCircle,
    History,
    FileText,
    ChevronRight,
} from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@workspace/ui/components/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select";
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from '@workspace/ui/lib/utils';
import { useTickets, useCreateTicket, useTicket } from '@/apis/services/ticket-api';
import { useEnrollments } from '@/apis/services/enrollment-api';
import { ComponentLoading } from '@workspace/ui/components/component-loading';
import { Separator } from '@workspace/ui/components/separator';
import { TicketType, TicketStatus } from '@workspace/schemas';
import { toast } from 'sonner';

export default function SupportPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Form state for new ticket
    const [newTicketType, setNewTicketType] = useState<TicketType>(TicketType.SUPPORT);
    const [newTicketSubject, setNewTicketSubject] = useState('');
    const [newTicketDescription, setNewTicketDescription] = useState('');
    const [newTicketCourseId, setNewTicketCourseId] = useState<string | undefined>(undefined);

    const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>('ALL');

    const limit = 10;
    const { data: ticketsData, isLoading: isLoadingTickets } = useTickets({
        page: currentPage,
        limit,
        search: searchTerm || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter as TicketStatus,
    });

    const { data: enrollmentsData } = useEnrollments({ page: 1, limit: 100 });
    const createTicketMutation = useCreateTicket();
    const { data: ticketDetail, isLoading: isLoadingDetail } = useTicket(selectedTicketId || '');

    const tickets = ticketsData?.data || [];
    const enrollments = enrollmentsData?.data || [];

    const getStatusInfo = (status: TicketStatus) => {
        switch (status) {
            case TicketStatus.APPROVED:
                return {
                    label: 'Đã chấp nhận',
                    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
                    icon: <CheckCircle2 className="w-3 h-3" />
                };
            case TicketStatus.REJECTED:
                return {
                    label: 'Đã từ chối',
                    color: 'bg-red-500/10 text-red-600 border-red-500/20',
                    icon: <XCircle className="w-3 h-3" />
                };
            case TicketStatus.PROCESSING:
                return {
                    label: 'Đang xử lý',
                    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
                    icon: <Clock className="w-3 h-3" />
                };
            case TicketStatus.PENDING:
            default:
                return {
                    label: 'Đang chờ',
                    color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
                    icon: <AlertCircle className="w-3 h-3" />
                };
        }
    };

    const getTypeLabel = (type: TicketType) => {
        switch (type) {
            case TicketType.REFUND: return 'Hoàn tiền';
            case TicketType.ERROR_REPORT: return 'Báo lỗi';
            case TicketType.SUPPORT:
            default: return 'Hỗ trợ';
        }
    };

    const handleCreateTicket = async () => {
        if (!newTicketSubject || !newTicketDescription) {
            toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung');
            return;
        }

        if (newTicketType === TicketType.REFUND && !newTicketCourseId) {
            toast.error('Vui lòng chọn khóa học cần hoàn tiền');
            return;
        }

        try {
            await createTicketMutation.mutateAsync({
                type: newTicketType,
                subject: newTicketSubject,
                description: newTicketDescription,
                metadata: newTicketType === TicketType.REFUND ? { courseId: newTicketCourseId } : {},
            });
            toast.success('Yêu cầu đã được gửi thành công');
            setIsCreateOpen(false);
            // Reset form
            setNewTicketSubject('');
            setNewTicketDescription('');
            setNewTicketType(TicketType.SUPPORT);
            setNewTicketCourseId(undefined);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu');
        }
    };

    const handleViewDetail = (id: string) => {
        setSelectedTicketId(id);
        setIsDetailOpen(true);
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-7xl animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-border/10">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-serif font-bold italic uppercase tracking-wider">
                        <LifeBuoy className="size-3.5" />
                        Support Center
                    </div>
                    <h1 className="text-3xl md:text-5xl font-serif font-bold italic tracking-tight text-foreground uppercase leading-[0.85]">
                        Trung tâm <span className="text-primary not-italic">Hỗ trợ</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic border-l-2 border-primary/20 pl-4 mt-2">
                        Gửi yêu cầu hỗ trợ hoặc hoàn tiền khóa học Torii
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 md:flex-initial w-full sm:w-64 mt-4 lg:mt-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30" />
                            <Input
                                placeholder="Tìm kiếm yêu cầu..."
                                className="pl-9 h-11 w-full bg-background/30 backdrop-blur-xl border-border/20 rounded-2xl text-xs placeholder:text-muted-foreground/30 focus:ring-1 ring-primary/20 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select
                            value={statusFilter}
                            onValueChange={(val) => setStatusFilter(val as TicketStatus | 'ALL')}
                        >
                            <SelectTrigger className="h-11 w-full sm:w-40 bg-background/30 backdrop-blur-xl border-border/20 rounded-2xl text-[10px] font-bold uppercase tracking-wider focus:ring-1 ring-primary/20 transition-all">
                                <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-border/10 shadow-xl overflow-hidden">
                                <SelectItem value="ALL" className="text-[10px] font-bold uppercase tracking-wider py-3">Tất cả trạng thái</SelectItem>
                                <SelectItem value={TicketStatus.PENDING} className="text-[10px] font-bold uppercase tracking-wider py-3">Đang chờ</SelectItem>
                                <SelectItem value={TicketStatus.PROCESSING} className="text-[10px] font-bold uppercase tracking-wider py-3">Đang xử lý</SelectItem>
                                <SelectItem value={TicketStatus.APPROVED} className="text-[10px] font-bold uppercase tracking-wider py-3">Đã chấp nhận</SelectItem>
                                <SelectItem value={TicketStatus.REJECTED} className="text-[10px] font-bold uppercase tracking-wider py-3">Đã từ chối</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="h-11 w-full sm:w-auto px-6 rounded-2xl bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 group flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
                        Gửi yêu cầu mới
                    </Button>
                </div>
            </div>

            {/* Content Stats Section (Subtle) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Quick Stats Cards could go here */}
            </div>

            {/* Tickets Table */}
            {isLoadingTickets ? (
                <ComponentLoading className="h-64" />
            ) : (
                <div className="space-y-4">
                    <div className="hidden md:grid grid-cols-6 px-6 text-[10px] font-black uppercase tracking-[2px] text-muted-foreground/30">
                        <div className="col-span-2">Tiêu đề / Loại</div>
                        <div className="col-span-1">Ngày tạo</div>
                        <div className="col-span-1 text-center">Trạng thái</div>
                        <div className="col-span-1">Mã yêu cầu</div>
                        <div className="col-span-1 text-right">Chi tiết</div>
                    </div>

                    <div className="divide-y divide-border/5 border border-border/10 bg-card/20 backdrop-blur-md rounded-[2rem] overflow-hidden shadow-2xl shadow-black/5">
                        {tickets.length > 0 ? tickets.map((ticket) => {
                            const statusInfo = getStatusInfo(ticket.status as TicketStatus);
                            return (
                                <div key={ticket.id} className="grid grid-cols-1 md:grid-cols-6 items-center p-6 hover:bg-muted/5 transition-all group relative">
                                    <div className="col-span-2 space-y-2 mb-3 md:mb-0">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                                <MessageSquare className="w-4 h-4" />
                                            </div>
                                            <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                                                {ticket.subject}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 ml-10">
                                            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter px-1.5 py-0 h-3.5 border-primary/20 text-primary/60 bg-primary/5">
                                                {getTypeLabel(ticket.type as TicketType)}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="col-span-1 text-xs text-muted-foreground/50 font-medium md:table-cell hidden px-2">
                                        <div className="flex items-center gap-2 font-mono">
                                            <History className="w-3 h-3" />
                                            {new Date(ticket.createdAt).toLocaleDateString('vi-VN')}
                                        </div>
                                    </div>

                                    <div className="col-span-1 flex justify-center mb-3 md:mb-0">
                                        <div className={cn(
                                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-2",
                                            statusInfo.color
                                        )}>
                                            {statusInfo.icon}
                                            {statusInfo.label}
                                        </div>
                                    </div>

                                    <div className="col-span-1 text-xs font-mono text-muted-foreground/30 uppercase hidden md:block">
                                        #{ticket.id.slice(0, 8)}
                                    </div>

                                    <div className="col-span-1 text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-9 w-9 p-0 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
                                            onClick={() => handleViewDetail(ticket.id)}
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="py-24 text-center space-y-4">
                                <div className="mx-auto w-16 h-16 rounded-full bg-muted/10 flex items-center justify-center">
                                    <HelpCircle className="w-8 h-8 text-muted-foreground/20" />
                                </div>
                                <div>
                                    <p className="text-sm text-foreground/60 font-serif italic">Bạn chưa gửi yêu cầu hỗ trợ nào.</p>
                                    <p className="text-[10px] text-muted-foreground/30 uppercase tracking-widest mt-1">Chúng tôi luôn sẵn sàng lắng nghe bạn</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Create Ticket Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-xl rounded-[2.5rem] p-10 border-border/10 bg-background/80 backdrop-blur-2xl overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

                    <DialogHeader className="relative space-y-4">
                        <DialogTitle className="text-3xl font-serif font-bold italic uppercase leading-none">
                            Yêu cầu <span className="text-primary not-italic">Mới</span>
                        </DialogTitle>
                        <DialogDescription className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground/40 italic">
                            Vui lòng cung cấp chi tiết vấn đề bạn đang gặp phải
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-6 relative">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-2">Phân loại</label>
                            <Select
                                value={newTicketType}
                                onValueChange={(val) => setNewTicketType(val as TicketType)}
                            >
                                <SelectTrigger className="h-12 bg-muted/10 border-border/10 rounded-2xl text-xs font-bold transition-all focus:ring-1 ring-primary/20 shadow-inner">
                                    <SelectValue placeholder="Chọn loại yêu cầu" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-border/10 shadow-xl overflow-hidden">
                                    <SelectItem value={TicketType.SUPPORT} className="text-xs font-bold py-3 transition-colors">⚙️ Hỗ trợ kỹ thuật</SelectItem>
                                    <SelectItem value={TicketType.REFUND} className="text-xs font-bold py-3 transition-colors">💰 Yêu cầu hoàn tiền</SelectItem>
                                    <SelectItem value={TicketType.ERROR_REPORT} className="text-xs font-bold py-3 transition-colors">⚠️ Báo lỗi ứng dụng</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {newTicketType === TicketType.REFUND && (
                            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 px-2">Khóa học cần hoàn tiền</label>
                                <Select
                                    onValueChange={setNewTicketCourseId}
                                >
                                    <SelectTrigger className="h-12 bg-primary/5 border-primary/10 rounded-2xl text-xs font-black transition-all focus:ring-1 ring-primary/20 shadow-inner">
                                        <SelectValue placeholder="Chọn khóa học của bạn" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-border/10 shadow-xl overflow-hidden">
                                        {enrollments.map((en: any) => (
                                            <SelectItem key={en.courseId} value={en.courseId} className="text-xs font-bold py-3">
                                                {en.courseId.slice(0, 8)} (Khóa học của tôi)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-2">Tiêu đề</label>
                            <Input
                                placeholder="VD: Không vào được bài học số 5"
                                className="h-12 bg-muted/10 border-border/10 rounded-2xl text-xs font-bold placeholder:text-muted-foreground/30 focus:ring-1 ring-primary/20 shadow-inner"
                                value={newTicketSubject}
                                onChange={(e) => setNewTicketSubject(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-2">Nội dung chi tiết</label>
                            <Textarea
                                placeholder="Mô tả cụ thể vấn đề bạn cần giúp đỡ..."
                                className="min-h-[120px] bg-muted/10 border-border/10 rounded-[1.5rem] text-xs font-medium p-4 placeholder:text-muted-foreground/30 focus:ring-1 ring-primary/20 shadow-inner resize-none"
                                value={newTicketDescription}
                                onChange={(e) => setNewTicketDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-3 pt-4 border-t border-border/10 mt-4 px-2">
                        <Button
                            variant="ghost"
                            className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-muted/10 transition-all sm:order-1"
                            onClick={() => setIsCreateOpen(false)}
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            className="flex-1 h-12 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[9px] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all sm:order-2"
                            onClick={handleCreateTicket}
                            disabled={createTicketMutation.isPending}
                        >
                            {createTicketMutation.isPending ? 'Đang gửi...' : 'Gửi yêu cầu'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Ticket Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-2xl rounded-[2.5rem] p-10 border-border/10 bg-background/80 backdrop-blur-2xl shadow-2xl overflow-hidden ring-1 ring-white/10">
                    <div className="absolute top-0 left-0 w-full h-2 bg-primary/20" />

                    <DialogHeader className="space-y-6">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <DialogTitle className="text-3xl font-serif font-bold italic leading-tight">
                                {ticketDetail?.subject || 'Đang tải...'}
                            </DialogTitle>
                            {ticketDetail && (
                                <div className={cn(
                                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[2px] border flex items-center gap-2 shadow-sm",
                                    getStatusInfo(ticketDetail.status as TicketStatus).color
                                )}>
                                    {getStatusInfo(ticketDetail.status as TicketStatus).icon}
                                    {getStatusInfo(ticketDetail.status as TicketStatus).label}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                            <div className="flex items-center gap-1.5">
                                <FileText className="size-3" />
                                ID: #{ticketDetail?.id.slice(0, 12).toUpperCase()}
                            </div>
                            <div className="flex items-center gap-1.5 border-l border-border/20 pl-4">
                                <Clock className="size-3" />
                                {ticketDetail && new Date(ticketDetail.createdAt).toLocaleString('vi-VN')}
                            </div>
                        </div>
                    </DialogHeader>

                    {isLoadingDetail ? (
                        <div className="py-20 flex justify-center">
                            <ComponentLoading />
                        </div>
                    ) : ticketDetail ? (
                        <div className="space-y-10 mt-8">
                            {/* Problem Section */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-[3px] text-primary/50 px-1 border-b border-primary/10 pb-2">Vấn đề của bạn</h3>
                                <div className="bg-muted/5 p-6 rounded-3xl border border-border/10 shadow-inner">
                                    <p className="text-sm leading-relaxed font-medium text-foreground/80">
                                        {ticketDetail.description}
                                    </p>
                                </div>
                            </div>

                            {/* Response Section */}
                            <div className="space-y-4 relative">
                                <h3 className="text-[10px] font-black uppercase tracking-[3px] text-emerald-500/50 px-1 border-b border-emerald-500/10 pb-2">Phản hồi từ Torii</h3>
                                {ticketDetail.response ? (
                                    <div className="bg-emerald-500/[0.03] p-6 rounded-3xl border border-emerald-500/10 shadow-inner relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <CheckCircle2 className="size-16 text-emerald-500" />
                                        </div>
                                        <p className="text-sm leading-relaxed font-bold text-foreground relative z-10 italic">
                                            "{ticketDetail.response}"
                                        </p>
                                        <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600/60 transition-all relative z-10">
                                            <div className="w-8 h-[1px] bg-emerald-500/30" />
                                            Admin Team
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8 border border-dashed border-border/20 rounded-3xl text-center bg-muted/5 group">
                                        <p className="text-xs text-muted-foreground/40 italic font-serif flex items-center justify-center gap-2">
                                            <Clock className="size-4 animate-pulse" />
                                            Yêu cầu của bạn đang được xem xét. Vui lòng chờ phản hồi...
                                        </p>
                                    </div>
                                )}
                            </div>

                            <Button
                                className="w-full h-14 rounded-2xl bg-foreground text-background font-black uppercase tracking-[4px] text-[10px] hover:bg-primary hover:text-white transition-all duration-500 group relative overflow-hidden shadow-xl"
                                onClick={() => setIsDetailOpen(false)}
                            >
                                <span className="relative z-10 group-hover:scale-110 transition-transform inline-block">Đóng hội thoại</span>
                                <div className="absolute inset-x-0 bottom-0 h-0 bg-primary group-hover:h-full transition-all duration-500 z-0 opacity-50" />
                            </Button>
                        </div>
                    ) : (
                        <div className="py-20 text-center text-red-500 font-bold uppercase tracking-widest text-xs">
                            Lỗi: Không thể tải thông tin yêu cầu.
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
