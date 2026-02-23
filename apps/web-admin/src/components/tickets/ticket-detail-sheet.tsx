import { useState, useEffect } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from '@workspace/ui/components/sheet';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Button } from '@workspace/ui/components/button';
import { Textarea } from '@workspace/ui/components/textarea';
import { Badge } from '@workspace/ui/components/badge';
import type { TicketResponseDTO } from '@workspace/schemas';
import { TicketStatus, TicketType } from '@workspace/schemas';
import { useUpdateTicketStatus } from '@/lib/api/services/tickets-hook';
import { toast } from '@workspace/ui/components/sonner';
import {
    CheckCircle2,
    XCircle,
    User,
    Mail,
    Tag,
    Clock,
    AlertTriangle
} from 'lucide-react';
import {
    Item,
    ItemMedia,
    ItemContent,
    ItemTitle,
    ItemDescription,
} from '@workspace/ui/components/item';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { Spinner } from "@workspace/ui/components/spinner";

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
            <SheetContent className="!w-full sm:!max-w-[800px] flex flex-col">
                <SheetHeader>
                    <SheetTitle>{ticket.subject}</SheetTitle>
                    <SheetDescription>
                        Gửi lúc: {new Date(ticket.createdAt).toLocaleString('vi-VN')} | Mã: #{ticket.id.slice(0, 8)}
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1 min-h-0">
                    <div className="space-y-6 p-6">
                        {/* User Info Section */}
                        <section className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[3px] text-primary/50 flex items-center gap-2">
                                <User className="size-3" />
                                Thông tin người gửi
                            </h4>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <Item variant="outline">
                                    <ItemContent>
                                        <ItemTitle className="text-[10px] uppercase tracking-widest text-muted-foreground">Họ và tên</ItemTitle>
                                        <ItemDescription className="text-sm font-bold text-foreground truncate">{ticket.user?.displayName || 'N/A'}</ItemDescription>
                                    </ItemContent>
                                </Item>
                                <Item variant="outline">
                                    <ItemMedia>
                                        <Mail className="size-4" />
                                    </ItemMedia>
                                    <ItemContent>
                                        <ItemTitle className="text-[10px] uppercase tracking-widest text-muted-foreground">Email liên hệ</ItemTitle>
                                        <ItemDescription className="text-sm font-bold text-foreground truncate">{ticket.user?.email || 'N/A'}</ItemDescription>
                                    </ItemContent>
                                </Item>
                            </div>
                        </section>

                        {/* Meta Data Section (Refund special handling) */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-black uppercase tracking-[3px] text-amber-500/50 flex items-center gap-2">
                                    <Tag className="size-3" />
                                    Chi tiết kỹ thuật
                                </h4>
                                <Badge variant={ticket.type === TicketType.REFUND ? 'secondary' : 'default'}>
                                    {ticket.type}
                                </Badge>
                            </div>
                            <div className="space-y-3">
                                {isRefund && (
                                    <Alert variant="destructive" className="border-amber-500/20 bg-amber-500/5 text-amber-700">
                                        <AlertTriangle className="size-4" />
                                        <AlertDescription className="font-bold">
                                            Khóa học hoàn tiền: <span className="font-mono">{(ticket.metadata as any)?.courseId?.slice(0, 12)}</span>
                                        </AlertDescription>
                                    </Alert>
                                )}
                                <Item variant="outline">
                                    <ItemContent>
                                        <ItemTitle className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Nội dung yêu cầu</ItemTitle>
                                        <ItemDescription className="text-sm leading-relaxed font-medium text-foreground/80">
                                            {ticket.description}
                                        </ItemDescription>
                                    </ItemContent>
                                </Item>
                            </div>
                        </section>

                        {/* Admin Response Section */}
                        <section className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[3px] text-emerald-500/50 flex items-center gap-2">
                                <Clock className="size-3" />
                                Phản hồi &amp; Xử lý
                            </h4>
                            <div className="space-y-3">
                                <Textarea
                                    placeholder="Nhập lời nhắn gửi đến học viên hoặc lý do từ chối..."
                                    className="min-h-[120px] resize-none"
                                    value={response}
                                    onChange={(e) => setResponse(e.target.value)}
                                    disabled={ticket.status !== TicketStatus.PENDING && ticket.status !== TicketStatus.PROCESSING}
                                />
                                {ticket.status !== TicketStatus.PENDING && ticket.status !== TicketStatus.PROCESSING && (
                                    <Alert className="border-emerald-500/20 bg-emerald-500/5 text-emerald-700">
                                        <AlertDescription>
                                            Ticket này đã được đóng với trạng thái: <strong>{ticket.status}</strong>
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        </section>
                    </div>
                </ScrollArea>
                {(ticket.status === TicketStatus.PENDING || ticket.status === TicketStatus.PROCESSING) && (
                    <SheetFooter>
                        <Button
                            onClick={() => handleUpdateStatus(TicketStatus.APPROVED)}
                            disabled={updateStatusMutation.isPending}
                        >
                            {updateStatusMutation.isPending ? (
                                <Spinner className="mr-2" />
                            ) : (
                                <CheckCircle2 className="size-4 mr-2" />
                            )}
                            Chấp nhận {isRefund && 'Hoàn tiền'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleUpdateStatus(TicketStatus.REJECTED)}
                            disabled={updateStatusMutation.isPending}
                        >
                            <XCircle className="size-4 mr-2" />
                            Từ chối
                        </Button>
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    );
}
