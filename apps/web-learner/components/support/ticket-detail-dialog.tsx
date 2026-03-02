'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@workspace/ui/components/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
    User,
    Calendar,
    AlertCircle,
    XCircle,
    Clock,
    CheckCircle2
} from 'lucide-react';
import { TicketResponseDTO, TicketStatus } from '@workspace/schemas';
import { formatDateTime } from '@/utils/format-utils';
import { ComponentLoading } from '@workspace/ui/components/component-loading';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { useCancelTicket } from "@/lib/api/services/ticket-api";
import { toast } from "sonner";
import { Spinner } from "@workspace/ui/components/spinner";

interface TicketDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    ticket: TicketResponseDTO | null;
    isLoading: boolean;
}

const getStatusInfo = (status: TicketStatus) => {
    switch (status) {
        case TicketStatus.RESOLVED:
            return { label: 'Đã giải quyết', variant: 'default' as const };
        case TicketStatus.CANCELLED:
            return { label: 'Đã hủy', variant: 'destructive' as const };
        case TicketStatus.PROCESSING:
            return { label: 'Đang xử lý', variant: 'outline' as const };
        case TicketStatus.PENDING:
        default:
            return { label: 'Đang chờ', variant: 'secondary' as const };
    }
};

export function TicketDetailDialog({ open, onOpenChange, ticket, isLoading }: TicketDetailDialogProps) {
    const [isConfirmCancelOpen, setConfirmCancelOpen] = useState(false);
    const cancelTicket = useCancelTicket();

    const handleConfirmCancel = async () => {
        if (!ticket) return;
        try {
            await cancelTicket.mutateAsync(ticket.id);
            toast.success('Yêu cầu đã được hủy.');
            setConfirmCancelOpen(false);
            onOpenChange(false); // Close the main dialog as well
        } catch (error) {
            toast.error('Hủy yêu cầu thất bại.');
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
                    {isLoading ? (
                        <>
                            <DialogHeader className="p-6 border-b">
                                <DialogTitle>Đang tải thông tin...</DialogTitle>
                            </DialogHeader>
                            <div className="p-12 flex justify-center"><ComponentLoading /></div>
                        </>
                    ) : ticket ? (
                        <>
                            <DialogHeader className="p-6 border-b">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-mono text-muted-foreground uppercase">#{ticket.id.slice(0, 8)}</span>
                                    <Badge variant={getStatusInfo(ticket.status as TicketStatus).variant}>
                                        {getStatusInfo(ticket.status as TicketStatus).label}
                                    </Badge>
                                </div>
                                <DialogTitle className="text-xl">{ticket.subject}</DialogTitle>
                                <DialogDescription className="flex gap-4 text-[10px] pt-1">
                                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {ticket.user?.displayName}</span>
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDateTime(ticket.createdAt)}</span>
                                </DialogDescription>
                            </DialogHeader>

                            <ScrollArea className="max-h-[50vh]">
                                <div className="p-6 space-y-6">
                                    <div>
                                        <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Nội dung</h4>
                                        <p className="text-sm p-3 rounded-md bg-muted/50 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
                                    </div>

                                    {ticket.response && (
                                        <div>
                                            <h4 className="text-xs font-bold uppercase text-primary mb-2">Phản hồi từ hỗ trợ</h4>
                                            <p className="text-sm p-4 rounded-md bg-primary/5 border border-primary/20 leading-relaxed italic">{ticket.response}</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>

                            <DialogFooter className="p-6 border-t sm:justify-between flex-row justify-between items-center w-full">
                                {ticket.status === TicketStatus.PENDING ? (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => setConfirmCancelOpen(true)}
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Hủy yêu cầu
                                    </Button>
                                ) : (
                                    <div className="flex-1" />
                                )}
                                <Button variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
                            </DialogFooter>
                        </>
                    ) : (
                        <>
                            <DialogHeader className="p-6 border-b">
                                <DialogTitle>Thông báo</DialogTitle>
                            </DialogHeader>
                            <div className="p-12 text-center text-muted-foreground">
                                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p>Không tìm thấy thông tin</p>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={isConfirmCancelOpen} onOpenChange={setConfirmCancelOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bạn có chắc chắn muốn hủy?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Hành động này không thể được hoàn tác. Yêu cầu hỗ trợ của bạn sẽ được đánh dấu là đã hủy.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={cancelTicket.isPending}>Quay lại</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmCancel}
                            disabled={cancelTicket.isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {cancelTicket.isPending ? (
                                <>
                                    <Spinner className="mr-2 h-4 w-4" />
                                    Đang xử lý...
                                </>
                            ) : (
                                "Xác nhận hủy"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
