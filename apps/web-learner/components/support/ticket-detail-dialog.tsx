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
    User,
    Calendar,
    AlertCircle,
    XCircle,
} from 'lucide-react';
import { TicketResponseDTO, TicketStatus } from '@workspace/schemas';
import { formatDateTime } from '@/utils/format-utils';
import { ComponentLoading } from '@workspace/ui/components/component-loading';
import { ScrollArea } from '@workspace/ui/components/scroll-area';

interface TicketDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    ticket: TicketResponseDTO | null;
    isLoading: boolean;
    onCancel?: (id: string) => void;
}

const getStatusLabel = (status: TicketStatus) => {
    switch (status) {
        case TicketStatus.APPROVED: return 'Đã chấp nhận';
        case TicketStatus.REJECTED: return 'Đã từ chối';
        case TicketStatus.PROCESSING: return 'Đang xử lý';
        case TicketStatus.PENDING: default: return 'Đang chờ';
    }
};

export function TicketDetailDialog({ open, onOpenChange, ticket, isLoading, onCancel }: TicketDetailDialogProps) {
    return (
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
                                <Badge variant={
                                    ticket.status === TicketStatus.APPROVED ? "default" :
                                        ticket.status === TicketStatus.REJECTED ? "destructive" :
                                            "secondary"
                                }>
                                    {getStatusLabel(ticket.status as TicketStatus)}
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
                                        <h4 className="text-xs font-bold uppercase text-primary mb-2">Phản hồi điện tử</h4>
                                        <p className="text-sm p-4 rounded-md bg-primary/5 border border-primary/20 leading-relaxed italic">{ticket.response}</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        <DialogFooter className="p-6 border-t flex flex-row justify-between items-center sm:justify-between">
                            <div>
                                {ticket.status === TicketStatus.PENDING && onCancel && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => onCancel(ticket.id)}
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Hủy yêu cầu
                                    </Button>
                                )}
                            </div>
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
    );
}
