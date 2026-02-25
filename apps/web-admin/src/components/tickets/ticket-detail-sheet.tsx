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
import { cn } from '@workspace/ui/lib/utils';
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
import { formatDateTime } from '@/lib/format-utils';
import { Spinner } from "@workspace/ui/components/spinner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";

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
    const metadata = ticket.metadata as any;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="!w-full sm:!max-w-[800px] flex flex-col">
                <SheetHeader>
                    <SheetTitle>{ticket.subject}</SheetTitle>
                    <SheetDescription>
                        Gửi lúc: {formatDateTime(ticket.createdAt)} | Mã: #{ticket.id.slice(0, 8)}
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
                                    <div className="space-y-3">
                                        <Alert variant="destructive" className="border-amber-500/20 bg-amber-500/5 text-amber-700">
                                            <AlertTriangle className="size-4" />
                                            <AlertDescription className="font-bold flex flex-col gap-1">
                                                <span>Khóa học yêu cầu hoàn tiền:</span>
                                                <span className="text-sm text-foreground">{metadata?.courseTitle || 'N/A'}</span>
                                                <span className="font-mono text-[10px] break-all text-muted-foreground">{metadata?.courseId}</span>
                                            </AlertDescription>
                                        </Alert>

                                        {/* Refund Audit Section for Staff */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <Item variant="outline" className="bg-muted/30">
                                                <ItemContent>
                                                    <ItemTitle className="text-[10px] uppercase tracking-widest text-muted-foreground">Mã đơn hàng</ItemTitle>
                                                    <ItemDescription className="text-sm font-mono font-bold text-foreground">
                                                        {metadata?.orderId ? `#${metadata.orderId.slice(0, 8).toUpperCase()}` : 'N/A'}
                                                    </ItemDescription>
                                                    {metadata?.orderId && (
                                                        <span className="text-[9px] text-muted-foreground block truncate max-w-full font-mono">{metadata.orderId}</span>
                                                    )}
                                                </ItemContent>
                                            </Item>
                                            <Item variant="outline" className="bg-muted/30">
                                                <ItemContent>
                                                    <ItemTitle className="text-[10px] uppercase tracking-widest text-muted-foreground">Tiến độ học</ItemTitle>
                                                    <ItemDescription className={cn(
                                                        "text-sm font-black",
                                                        metadata?.progress > 20 ? "text-destructive" : "text-emerald-600"
                                                    )}>
                                                        {metadata?.progress || 0}%
                                                    </ItemDescription>
                                                </ItemContent>
                                            </Item>
                                            <Item variant="outline" className="bg-muted/30">
                                                <ItemContent>
                                                    <ItemTitle className="text-[10px] uppercase tracking-widest text-muted-foreground">Ngày đăng ký</ItemTitle>
                                                    <ItemDescription className="text-sm font-bold text-foreground">
                                                        {metadata?.enrollmentDate ? formatDateTime(metadata?.enrollmentDate) : 'N/A'}
                                                    </ItemDescription>
                                                </ItemContent>
                                            </Item>
                                        </div>
                                    </div>
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
                    <SheetFooter className="p-6 border-t bg-muted/5 flex-row gap-2">
                        {isRefund ? (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        disabled={updateStatusMutation.isPending}
                                        className="flex-1"
                                    >
                                        {updateStatusMutation.isPending ? (
                                            <Spinner className="mr-2" />
                                        ) : (
                                            <CheckCircle2 className="size-4 mr-2" />
                                        )}
                                        Chấp nhận Hoàn tiền
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Xác nhận hoàn tiền?</AlertDialogTitle>
                                        <AlertDialogDescription className="space-y-4">
                                            <div className="space-y-2">
                                                <p className="font-medium text-foreground">Hành động này sẽ thực hiện:</p>
                                                <ul className="list-disc pl-5 text-sm space-y-1">
                                                    <li>Hủy quyền truy cập khóa học của người dùng ngay lập tức.</li>
                                                    <li>
                                                        Hoàn trả lại số <strong className="text-primary">Coin</strong> tương ứng (tỷ lệ 1:1 với VND) vào ví <strong className="text-primary">User Balance</strong>.
                                                    </li>
                                                    <li>Gửi email thông báo chính thức cho học viên.</li>
                                                </ul>
                                            </div>

                                            {response && (
                                                <div className="p-3 bg-muted rounded-md text-xs border">
                                                    <span className="font-bold block mb-1 uppercase tracking-wider text-[10px] text-muted-foreground">Lời nhắn gửi kèm:</span>
                                                    <p className="italic text-foreground">"{response}"</p>
                                                </div>
                                            )}

                                            <p className="text-[11px] text-muted-foreground bg-amber-500/10 p-2 rounded border border-amber-500/20">
                                                Lưu ý: Hệ thống không hoàn tiền mặt. Số dư Coin có thể được sử dụng để mua các khóa học khác trên nền tảng.
                                            </p>
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => handleUpdateStatus(TicketStatus.APPROVED)}
                                            className="bg-primary hover:bg-primary/90"
                                        >
                                            Xác nhận Hoàn tiền
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        ) : (
                            <Button
                                onClick={() => handleUpdateStatus(TicketStatus.APPROVED)}
                                disabled={updateStatusMutation.isPending}
                                className="flex-1"
                            >
                                {updateStatusMutation.isPending ? (
                                    <Spinner className="mr-2" />
                                ) : (
                                    <CheckCircle2 className="size-4 mr-2" />
                                )}
                                Chấp nhận
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => handleUpdateStatus(TicketStatus.REJECTED)}
                            disabled={updateStatusMutation.isPending}
                            className="flex-1"
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
