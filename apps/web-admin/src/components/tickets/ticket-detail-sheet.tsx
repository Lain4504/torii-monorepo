import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@workspace/ui/components/sheet';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Button } from '@workspace/ui/components/button';
import { Separator } from '@workspace/ui/components/separator';
import type { TicketResponseDTO } from '@workspace/schemas';
import { formatDateTime } from '@/lib/format-utils';
import { User, Calendar, MessageSquare, Tag, Info, Building, Coins } from 'lucide-react';
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
} from "@workspace/ui/components/item";

interface TicketDetailSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    ticket: TicketResponseDTO | null;
}

export function TicketDetailSheet({
    open,
    onOpenChange,
    ticket,
}: TicketDetailSheetProps) {
    if (!ticket) return null;

    const renderMetadata = () => {
        if (!ticket.metadata) return null;
        return (
            <div className="space-y-2 mt-4">
                <h4 className="text-xs uppercase text-muted-foreground font-semibold">Thông tin bổ sung</h4>
                <div className="p-4 rounded-lg bg-muted/50 border border-border/50 text-xs font-mono">
                    <pre className="whitespace-pre-wrap break-words">{JSON.stringify(ticket.metadata, null, 2)}</pre>
                </div>
            </div>
        )
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="!w-full sm:!max-w-[800px] max-h-screen p-0 flex flex-col overflow-hidden">
                <SheetHeader className="p-6 border-b shrink-0">
                    <SheetTitle>Chi tiết Ticket #{ticket.id.slice(0, 8)}</SheetTitle>
                    <SheetDescription>
                        Xem lại thông tin chi tiết và lịch sử của ticket.
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1 min-h-0">
                    <div className="space-y-6 p-6">
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
                        {(ticket as any).refundAmount !== undefined && (ticket as any).refundAmount !== null && (ticket as any).refundAmount > 0 && (
                            <Item variant="outline">
                                <ItemMedia><Coins className="size-4 text-primary" /></ItemMedia>
                                <ItemContent>
                                    <ItemTitle>Số tiền hoàn trả</ItemTitle>
                                    <ItemDescription>{(ticket as any).refundAmount} Xu</ItemDescription>
                                </ItemContent>
                            </Item>
                        )}
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
                <div className="p-6 border-t flex justify-end bg-muted/20 shrink-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="px-8">
                        Đóng
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
