import { useState, useEffect } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from '@workspace/ui/components/sheet';
import { Button } from '@workspace/ui/components/button';
import { Textarea } from '@workspace/ui/components/textarea';
import { Badge } from '@workspace/ui/components/badge';
import { Separator } from '@workspace/ui/components/separator';
import type { TicketResponseDTO } from '@workspace/schemas';
import { TicketStatus, TicketType } from '@workspace/schemas';
import { useUpdateTicketStatus } from '@/api/services/tickets-hook';
import { toast } from '@workspace/ui/components/sonner';
import {
    CheckCircle2,
    XCircle,
    User,
    Mail,
    Calendar,
    MessageSquare,
    Tag,
    Clock,
    AlertTriangle,
} from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';

interface TicketDetailSheetProps {
    ticket: TicketResponseDTO | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TicketDetailSheet({
    ticket,
    open,
    onOpenChange,
}: TicketDetailSheetProps) {
    const [response, setResponse] = useState('');
    const updateStatusMutation = useUpdateTicketStatus();

    useEffect(() => {
        if (ticket) {
            setResponse(ticket.response || '');
        }
    }, [ticket]);

    const handleUpdateStatus = async (status: TicketStatus) => {
        if (!ticket) return;

        if (status === TicketStatus.REJECTED && !response) {
            toast.error('Vui lòng nhập lý do từ chối');
            return;
        }

        try {
            await updateStatusMutation.mutateAsync({
                id: ticket.id,
                dto: { status, response },
            });
            toast.success(`Yêu cầu đã được ${status === TicketStatus.APPROVED ? 'chấp nhận' : 'từ chối'}`);
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    if (!ticket) return null;

    const isRefund = ticket.type === TicketType.REFUND;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-xl rounded-none p-0 border-l border-border/10 bg-background/95 backdrop-blur-xl overflow-hidden flex flex-col shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <SheetHeader className="p-8 pb-4 relative">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <MessageSquare className="size-5" />
                        </div>
                        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest px-3 py-0.5 border-primary/20 text-primary/60">
                            Ticket #{ticket.id.slice(0, 8)}
                        </Badge>
                    </div>
                    <SheetTitle className="text-3xl font-serif font-bold italic leading-tight pr-8">
                        {ticket.subject}
                    </SheetTitle>
                    <SheetDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic flex items-center gap-2 mt-2">
                        <Calendar className="size-3" />
                        Gửi lúc: {new Date(ticket.createdAt).toLocaleString('vi-VN')}
                    </SheetDescription>
                </SheetHeader>

                <Separator className="bg-border/5" />

                <div className="flex-1 overflow-y-auto scrollbar-none p-8 space-y-10">
                    {/* User Info Section */}
                    <section className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[3px] text-primary/50 flex items-center gap-2">
                            <User className="size-3" />
                            Thông tin người gửi
                        </h4>
                        <div className="grid grid-cols-2 gap-4 bg-muted/5 p-5 rounded-[2rem] border border-border/10 shadow-inner">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Họ và tên</p>
                                <p className="text-sm font-bold truncate">{ticket.user?.displayName || 'N/A'}</p>
                            </div>
                            <div className="space-y-1 border-l border-border/10 pl-4">
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Email liên hệ</p>
                                <p className="text-sm font-bold truncate flex items-center gap-1.5">
                                    <Mail className="size-3 text-primary/40" />
                                    {ticket.user?.email || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </section> section

                    {/* Meta Data Section (Refund special handling) */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black uppercase tracking-[3px] text-amber-500/50 flex items-center gap-2">
                                <Tag className="size-3" />
                                Chi tiết kỹ thuật
                            </h4>
                            <Badge className={cn(
                                "text-[9px] font-black uppercase tracking-widest",
                                ticket.type === TicketType.REFUND ? "bg-amber-500/10 text-amber-600" : "bg-primary/10 text-primary"
                            )}>
                                {ticket.type}
                            </Badge>
                        </div>
                        <div className="bg-muted/5 p-5 rounded-[2rem] border border-border/10 shadow-inner space-y-3">
                            {isRefund && (
                                <div className="flex items-center justify-between p-3 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                                    <div className="flex items-center gap-2 text-amber-600">
                                        <AlertTriangle className="size-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Khóa học hoàn tiền:</span>
                                    </div>
                                    <span className="text-xs font-mono font-bold">{(ticket.metadata as any)?.courseId?.slice(0, 12)}</span>
                                </div>
                            )}
                            <div className="p-4 bg-background/50 rounded-2xl border border-border/10">
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-2">Nội dung yêu cầu</p>
                                <p className="text-sm leading-relaxed font-medium text-foreground/80">
                                    {ticket.description}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Admin Response Section */}
                    <section className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[3px] text-emerald-500/50 flex items-center gap-2">
                            <Clock className="size-3" />
                            Phản hồi & Xử lý
                        </h4>
                        <div className="space-y-3">
                            <Textarea
                                placeholder="Nhập lời nhắn gửi đến học viên hoặc lý do từ chối..."
                                className="min-h-[120px] bg-muted/5 border-border/10 rounded-[1.5rem] p-5 text-sm font-medium focus:ring-1 ring-primary/20 shadow-inner resize-none transition-all focus:bg-background"
                                value={response}
                                onChange={(e) => setResponse(e.target.value)}
                                disabled={ticket.status !== TicketStatus.PENDING && ticket.status !== TicketStatus.PROCESSING}
                            />
                            {ticket.status !== TicketStatus.PENDING && ticket.status !== TicketStatus.PROCESSING && (
                                <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 italic text-xs text-emerald-700/70 text-center font-medium">
                                    Ticket này đã được đóng với trạng thái: {ticket.status}
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {(ticket.status === TicketStatus.PENDING || ticket.status === TicketStatus.PROCESSING) && (
                    <SheetFooter className="p-8 bg-muted/5 border-t border-border/5 grid grid-cols-2 gap-4">
                        <Button
                            variant="outline"
                            className="h-14 rounded-2xl border-red-500/20 text-red-600 font-black uppercase tracking-[2px] text-[10px] hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300 group"
                            onClick={() => handleUpdateStatus(TicketStatus.REJECTED)}
                            disabled={updateStatusMutation.isPending}
                        >
                            <XCircle className="size-4 mr-2 group-hover:scale-110 transition-transform" />
                            Từ chối
                        </Button>
                        <Button
                            className="h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-[2px] text-[10px] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 group"
                            onClick={() => handleUpdateStatus(TicketStatus.APPROVED)}
                            disabled={updateStatusMutation.isPending}
                        >
                            <CheckCircle2 className="size-4 mr-2 group-hover:scale-110 transition-transform" />
                            Chấp nhận {isRefund && 'Hoàn tiền'}
                        </Button>
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    );
}
