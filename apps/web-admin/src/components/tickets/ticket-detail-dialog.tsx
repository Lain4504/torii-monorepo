import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Separator } from '@workspace/ui/components/separator';
import type { TicketResponseDTO } from '@workspace/schemas';
import { formatDateTime } from '@/lib/format-utils';
import { User, Calendar, MessageSquare, Tag, Info, Building } from 'lucide-react';
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
} from "@workspace/ui/components/item";

interface TicketDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    ticket: TicketResponseDTO | null;
}

export function TicketDetailDialog({
    open,
    onOpenChange,
    ticket,
}: TicketDetailDialogProps) {
    if (!ticket) return null;

    const renderMetadata = () => {
        if (!ticket.metadata) return null;
        return (
            <div className="space-y-2 mt-4">
                <h4 className="text-xs uppercase text-muted-foreground font-semibold">Thông tin bổ sung</h4>
                <div className="p-4 rounded-lg bg-muted/50 border border-border/50 text-xs font-mono">
                    <pre>{JSON.stringify(ticket.metadata, null, 2)}</pre>
                </div>
            </div>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Chi tiết Ticket #{ticket.id.slice(0, 8)}</DialogTitle>
                    <DialogDescription>
                        Xem lại thông tin chi tiết và lịch sử của ticket.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] -mx-6 px-6">
                    <div className="space-y-6 py-6">
                        <Item variant="outline">
                            <ItemMedia><User className="size-4" /></ItemMedia>
                            <ItemContent>
                                <ItemTitle>Người gửi</ItemTitle>
                                <ItemDescription>{ticket.user?.displayName} ({ticket.user?.email})</ItemDescription>
                            </ItemContent>
                        </Item>
                        <Item variant="outline">
                            <ItemMedia><Tag className="size-4" /></ItemMedia>
                            <ItemContent>
                                <ItemTitle>Phân loại</ItemTitle>
                                <ItemDescription>{ticket.type}</ItemDescription>
                            </ItemContent>
                        </Item>
                        <Item variant="outline">
                            <ItemMedia><Info className="size-4" /></ItemMedia>
                            <ItemContent>
                                <ItemTitle>Tiêu đề</ItemTitle>
                                <ItemDescription>{ticket.subject}</ItemDescription>
                            </ItemContent>
                        </Item>
                        <Item variant="outline">
                            <ItemMedia><MessageSquare className="size-4" /></ItemMedia>
                            <ItemContent>
                                <ItemTitle>Nội dung</ItemTitle>
                                <ItemDescription className="whitespace-pre-wrap">{ticket.description}</ItemDescription>
                            </ItemContent>
                        </Item>
                        {ticket.response && (
                            <Item variant="outline">
                                <ItemMedia><Building className="size-4" /></ItemMedia>
                                <ItemContent>
                                    <ItemTitle>Phản hồi từ quản trị viên</ItemTitle>
                                    <ItemDescription className="whitespace-pre-wrap">{ticket.response}</ItemDescription>
                                </ItemContent>
                            </Item>
                        )}
                        <Separator />
                        <div className="grid grid-cols-2 gap-4">
                            <Item variant="outline">
                                <ItemMedia><Calendar className="size-4" /></ItemMedia>
                                <ItemContent>
                                    <ItemTitle>Ngày tạo</ItemTitle>
                                    <ItemDescription>{formatDateTime(ticket.createdAt)}</ItemDescription>
                                </ItemContent>
                            </Item>
                            <Item variant="outline">
                                <ItemMedia><Calendar className="size-4" /></ItemMedia>
                                <ItemContent>
                                    <ItemTitle>Cập nhật lần cuối</ItemTitle>
                                    <ItemDescription>{formatDateTime(ticket.updatedAt)}</ItemDescription>
                                </ItemContent>
                            </Item>
                        </div>
                        {renderMetadata()}
                    </div>
                </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
                        Đóng
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
