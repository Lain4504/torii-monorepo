'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@workspace/ui/components/dialog';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    FileText,
    ShieldCheck,
    User,
    MessageCircle,
    Calendar
} from 'lucide-react';
import { TicketResponseDTO, TicketStatus } from '@workspace/schemas';
import { formatDateTime } from '@/utils/format-utils';
import { cn } from '@workspace/ui/lib/utils';
import { ComponentLoading } from '@workspace/ui/components/component-loading';
import { ScrollArea } from '@workspace/ui/components/scroll-area';

interface TicketDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    ticket: TicketResponseDTO | null;
    isLoading: boolean;
}

const getStatusInfo = (status: TicketStatus) => {
    switch (status) {
        case TicketStatus.APPROVED:
            return {
                label: 'Đã chấp nhận',
                color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
                icon: <CheckCircle2 className="w-4 h-4" />
            };
        case TicketStatus.REJECTED:
            return {
                label: 'Đã từ chối',
                color: 'bg-red-500/10 text-red-600 border-red-500/20',
                icon: <XCircle className="w-4 h-4" />
            };
        case TicketStatus.PROCESSING:
            return {
                label: 'Đang xử lý',
                color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
                icon: <Clock className="w-4 h-4" />
            };
        case TicketStatus.PENDING:
        default:
            return {
                label: 'Đang chờ',
                color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
                icon: <AlertCircle className="w-4 h-4" />
            };
    }
};

export function TicketDetailDialog({ open, onOpenChange, ticket, isLoading }: TicketDetailDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center p-12">
                        <ComponentLoading />
                    </div>
                ) : ticket ? (
                    <>
                        <DialogHeader className="p-6 border-b">
                            <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline" className="font-mono text-[10px] uppercase">
                                    #{ticket.id.slice(0, 8).toUpperCase()}
                                </Badge>
                                <Badge
                                    variant={
                                        ticket.status === TicketStatus.APPROVED ? "default" :
                                            ticket.status === TicketStatus.REJECTED ? "destructive" :
                                                ticket.status === TicketStatus.PROCESSING ? "outline" : "secondary"
                                    }
                                >
                                    {getStatusInfo(ticket.status as TicketStatus).label}
                                </Badge>
                            </div>
                            <DialogTitle className="text-2xl font-bold">{ticket.subject}</DialogTitle>
                            <DialogDescription className="flex items-center gap-4 pt-2">
                                <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {ticket.user?.displayName || 'Người dùng'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDateTime(ticket.createdAt)}
                                </span>
                            </DialogDescription>
                        </DialogHeader>

                        <ScrollArea className="max-h-[60vh]">
                            <div className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                        Nội dung yêu cầu
                                    </h4>
                                    <div className="rounded-lg border bg-muted/30 p-4">
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                            {ticket.description}
                                        </p>
                                    </div>
                                </div>

                                {ticket.type === 'REFUND' && ticket.metadata && (
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                            Chi tiết hoàn tiền
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="p-4 rounded-xl border bg-amber-500/5 border-amber-500/10 space-y-1">
                                                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Khóa học</span>
                                                <p className="text-sm font-bold text-foreground">{(ticket.metadata as any).courseTitle || 'N/A'}</p>
                                            </div>
                                            <div className="p-4 rounded-xl border bg-indigo-500/5 border-indigo-500/10 space-y-1">
                                                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Tiến độ lúc yêu cầu</span>
                                                <p className="text-sm font-bold text-foreground">{(ticket.metadata as any).progress || 0}%</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                        Phản hồi từ hệ thống
                                    </h4>
                                    {ticket.response ? (
                                        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                                            <p className="text-sm leading-relaxed font-medium">
                                                {ticket.response}
                                            </p>
                                            <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-primary uppercase">
                                                <ShieldCheck className="h-3 w-3" />
                                                Đội ngũ hỗ trợ Torii
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border border-dashed p-8 text-center bg-muted/20">
                                            <div className="flex flex-col items-center gap-2">
                                                <Clock className="h-6 w-6 text-muted-foreground/30" />
                                                <p className="text-xs text-muted-foreground">
                                                    Yêu cầu của bạn đang được xử lý. Chúng tôi sẽ phản hồi sớm nhất có thể.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </ScrollArea>

                        <DialogFooter className="p-6 border-t bg-muted/10">
                            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                                Đóng
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <div className="p-12 text-center">
                        <AlertCircle className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="font-semibold">Không tìm thấy yêu cầu</h3>
                        <Button variant="link" onClick={() => onOpenChange(false)}>
                            Quay lại
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
