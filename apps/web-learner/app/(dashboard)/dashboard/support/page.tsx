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
    Search,
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
import { useTickets, useCreateTicket, useTicket } from '@/lib/api/services/ticket-api';
import { useEnrollments } from '@/lib/api/services/enrollment-api';
import { ComponentLoading } from '@workspace/ui/components/component-loading';
import { formatDateTime, formatDate } from '@/utils/format-utils';
import { TicketType, TicketStatus } from '@workspace/schemas';
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle } from '@workspace/ui/components/empty';
import { Card } from '@workspace/ui/components/card';
import { Field, FieldLabel } from '@workspace/ui/components/field';

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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-7xl animate-in fade-in duration-700 pb-20">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2 border-b border-border">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-foreground">
                        Trung tâm hỗ trợ
                    </h1>
                    <p className="text-sm font-medium text-muted-foreground w-full max-w-xl">
                        Gửi yêu cầu hỗ trợ hoặc hoàn tiền khóa học Torii.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 md:flex-initial w-full sm:w-64 mt-4 lg:mt-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm yêu cầu..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select
                            value={statusFilter}
                            onValueChange={(val) => setStatusFilter(val as TicketStatus | 'ALL')}
                        >
                            <SelectTrigger className="h-10 w-full sm:w-40 bg-background border-input rounded-xl text-sm font-medium shadow-sm">
                                <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Tất cả</SelectItem>
                                <SelectItem value={TicketStatus.PENDING}>Đang chờ</SelectItem>
                                <SelectItem value={TicketStatus.PROCESSING}>Đang xử lý</SelectItem>
                                <SelectItem value={TicketStatus.APPROVED}>Đã chấp nhận</SelectItem>
                                <SelectItem value={TicketStatus.REJECTED}>Đã từ chối</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Gửi yêu cầu mới
                    </Button>
                </div>
            </div>

            {/* Tickets Table */}
            {isLoadingTickets ? (
                <ComponentLoading className="h-64" />
            ) : (
                <div className="space-y-4">
                    <Card className="rounded-2xl border-border bg-card overflow-hidden p-0 shadow-sm">
                        <div className="relative overflow-x-auto">
                            <Table className="min-w-[1000px] border-collapse bg-transparent">
                                <TableHeader className="bg-muted/30 border-b border-border">
                                    <TableRow className="hover:bg-transparent border-none">
                                        <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 border-r border-border/30 last:border-r-0 w-[400px]">Tiêu đề / Loại</TableHead>
                                        <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 border-r border-border/30 last:border-r-0 w-[150px]">Ngày tạo</TableHead>
                                        <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 border-r border-border/30 last:border-r-0 text-center w-[150px]">Trạng thái</TableHead>
                                        <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 border-r border-border/30 last:border-r-0 w-[150px]">Mã yêu cầu</TableHead>
                                        <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 border-r border-border/30 last:border-r-0 text-right w-[100px]">Chi tiết</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tickets.length > 0 ? tickets.map((ticket) => {
                                        const statusInfo = getStatusInfo(ticket.status as TicketStatus);
                                        return (
                                            <TableRow key={ticket.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors group">
                                                <TableCell className="py-3 px-4 text-sm text-foreground/80 whitespace-nowrap border-r border-border/10 last:border-r-0">
                                                    <div className="space-y-2 mb-0">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                                                <MessageSquare className="w-4 h-4" />
                                                            </div>
                                                            <p className="text-sm font-semibold text-foreground truncate max-w-[300px]">
                                                                {ticket.subject}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2 ml-10">
                                                            <Badge variant="outline" className="text-xs font-medium border-border text-muted-foreground px-2 py-0.5 h-auto">
                                                                {getTypeLabel(ticket.type as TicketType)}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-3 px-4 text-sm text-foreground/80 whitespace-nowrap border-r border-border/10 last:border-r-0 text-muted-foreground font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <History className="w-3.5 h-3.5" />
                                                        {formatDate(ticket.createdAt)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-3 px-4 text-sm text-foreground/80 whitespace-nowrap border-r border-border/10 last:border-r-0">
                                                    <div className="flex justify-center">
                                                        <span className={cn(
                                                            "px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1.5",
                                                            statusInfo.color
                                                        )}>
                                                            {statusInfo.icon}
                                                            {statusInfo.label}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-3 px-4 text-sm text-foreground/80 whitespace-nowrap border-r border-border/10 last:border-r-0 text-xs font-mono text-muted-foreground uppercase">
                                                    #{ticket.id.slice(0, 8)}
                                                </TableCell>
                                                <TableCell className="py-3 px-4 text-sm text-foreground/80 whitespace-nowrap border-r border-border/10 last:border-r-0 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-muted-foreground hover:text-foreground"
                                                        onClick={() => handleViewDetail(ticket.id)}
                                                    >
                                                        <ChevronRight className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    }) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-[200px] text-center">
                                                <Empty>
                                                    <EmptyMedia>
                                                        <HelpCircle className="size-6 text-muted-foreground" />
                                                    </EmptyMedia>
                                                    <EmptyContent>
                                                        <EmptyTitle>Bạn chưa gửi yêu cầu hỗ trợ nào.</EmptyTitle>
                                                        <EmptyDescription>Chúng tôi luôn sẵn sàng lắng nghe bạn.</EmptyDescription>
                                                    </EmptyContent>
                                                </Empty>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </div>
            )}

            {/* Create Ticket Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-xl rounded-2xl p-6 border-border bg-background shadow-lg">
                    <DialogHeader className="space-y-1">
                        <DialogTitle className="text-xl font-bold">
                            Yêu cầu mới
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            Vui lòng cung cấp chi tiết vấn đề bạn đang gặp phải.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <Field>
                            <FieldLabel className="text-xs font-semibold uppercase text-muted-foreground">Phân loại</FieldLabel>
                            <Select
                                value={newTicketType}
                                onValueChange={(val) => setNewTicketType(val as TicketType)}
                            >
                                <SelectTrigger className="h-10 rounded-lg bg-background border-input text-sm">
                                    <SelectValue placeholder="Chọn loại yêu cầu" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={TicketType.SUPPORT}>⚙️ Hỗ trợ kỹ thuật</SelectItem>
                                    <SelectItem value={TicketType.REFUND}>💰 Yêu cầu hoàn tiền</SelectItem>
                                    <SelectItem value={TicketType.ERROR_REPORT}>⚠️ Báo lỗi ứng dụng</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>

                        {newTicketType === TicketType.REFUND && (
                            <Field className="animate-in slide-in-from-top-2 duration-300">
                                <FieldLabel className="text-xs font-semibold uppercase text-muted-foreground">Khóa học cần hoàn tiền</FieldLabel>
                                <Select
                                    onValueChange={setNewTicketCourseId}
                                >
                                    <SelectTrigger className="h-10 rounded-lg bg-background border-input text-sm">
                                        <SelectValue placeholder="Chọn khóa học của bạn" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {enrollments.map((en: any) => (
                                            <SelectItem key={en.courseId} value={en.courseId}>
                                                {en.course?.title || `Khóa học #${en.courseId.slice(0, 8)}`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                        )}

                        <Field>
                            <FieldLabel className="text-xs font-semibold uppercase text-muted-foreground">Tiêu đề</FieldLabel>
                            <Input
                                placeholder="VD: Không vào được bài học số 5"
                                value={newTicketSubject}
                                onChange={(e) => setNewTicketSubject(e.target.value)}
                            />
                        </Field>

                        <Field>
                            <FieldLabel className="text-xs font-semibold uppercase text-muted-foreground">Nội dung chi tiết</FieldLabel>
                            <Textarea
                                placeholder="Mô tả cụ thể vấn đề bạn cần giúp đỡ..."
                                className="min-h-[120px] resize-none"
                                value={newTicketDescription}
                                onChange={(e) => setNewTicketDescription(e.target.value)}
                            />
                        </Field>
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-3">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setIsCreateOpen(false)}
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            className="flex-1"
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
                <DialogContent className="max-w-2xl rounded-2xl p-6 border-border bg-background shadow-lg">
                    <DialogHeader className="space-y-4">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <DialogTitle className="text-xl font-bold tracking-tight">
                                {ticketDetail?.subject || 'Đang tải...'}
                            </DialogTitle>
                            {ticketDetail && (
                                <div className={cn(
                                    "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 border",
                                    getStatusInfo(ticketDetail.status as TicketStatus).color
                                )}>
                                    {getStatusInfo(ticketDetail.status as TicketStatus).icon}
                                    {getStatusInfo(ticketDetail.status as TicketStatus).label}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <FileText className="size-3.5" />
                                ID: #{ticketDetail?.id.slice(0, 12).toUpperCase()}
                            </div>
                            <div className="flex items-center gap-1.5 border-l border-border pl-4">
                                <Clock className="size-3.5" />
                                {ticketDetail && formatDateTime(ticketDetail.createdAt)}
                            </div>
                        </div>
                    </DialogHeader>

                    {isLoadingDetail ? (
                        <div className="py-20 flex justify-center">
                            <ComponentLoading />
                        </div>
                    ) : ticketDetail ? (
                        <div className="space-y-8 mt-4">
                            {/* Problem Section */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold uppercase text-muted-foreground pb-2 border-b border-border">Vấn đề của bạn</h3>
                                <div className="bg-muted/30 p-4 rounded-xl border border-border">
                                    <p className="text-sm leading-relaxed text-foreground">
                                        {ticketDetail.description}
                                    </p>
                                </div>
                            </div>

                            {/* Response Section */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold uppercase text-emerald-600 pb-2 border-b border-emerald-100">Phản hồi từ Torii</h3>
                                {ticketDetail.response ? (
                                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 relative overflow-hidden">
                                        <p className="text-sm leading-relaxed font-medium text-foreground relative z-10 italic">
                                            "{ticketDetail.response}"
                                        </p>
                                        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                                            <div className="w-6 h-[1px] bg-emerald-300" />
                                            Admin Team
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8 border border-dashed border-border rounded-xl text-center bg-muted/5">
                                        <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                                            <Clock className="size-4" />
                                            Yêu cầu của bạn đang được xem xét. Vui lòng chờ phản hồi...
                                        </p>
                                    </div>
                                )}
                            </div>

                            <Button
                                size="lg"
                                className="w-full"
                                onClick={() => setIsDetailOpen(false)}
                            >
                                Đóng hội thoại
                            </Button>
                        </div>
                    ) : (
                        <div className="py-20 text-center text-destructive font-medium text-sm">
                            Lỗi: Không thể tải thông tin yêu cầu.
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
