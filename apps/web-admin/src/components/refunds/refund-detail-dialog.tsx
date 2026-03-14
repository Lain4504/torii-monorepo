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
import type { RefundResponseDTO } from '@workspace/schemas';
import { formatDateTime, formatNumber } from '@/lib/format-utils';
import { User, Calendar, Clock, BadgeCent, Info, Building, FileText } from 'lucide-react';
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
} from "@workspace/ui/components/item";
import { Badge } from '@workspace/ui/components/badge';

interface RefundDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    refund: RefundResponseDTO | null;
}

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'PENDING': return 'Đang chờ';
        case 'COMPLETED': return 'Hoàn tất';
        case 'REJECTED': return 'Từ chối';
        default: return status;
    }
}

export function RefundDetailDialog({
    open,
    onOpenChange,
    refund,
}: RefundDetailDialogProps) {
    if (!refund) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Chi tiết Hoàn tiền #{refund.id.slice(0, 8)}</DialogTitle>
                    <DialogDescription>
                        Thông tin chi tiết về yêu cầu hoàn tiền và lịch sử thay đổi.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] -mx-6 px-6">
                    <div className="space-y-6 py-6">
                        <Item variant="outline">
                            <ItemMedia><User className="size-4" /></ItemMedia>
                            <ItemContent>
                                <ItemTitle>Học viên</ItemTitle>
                                <ItemDescription>{refund.ticket?.user?.displayName || 'N/A'} ({refund.ticket?.user?.email})</ItemDescription>
                            </ItemContent>
                        </Item>
                        <div className="grid grid-cols-2 gap-4">
                            <Item variant="outline">
                                <ItemMedia><BadgeCent className="size-4" /></ItemMedia>
                                <ItemContent>
                                    <ItemTitle>Số tiền hoàn</ItemTitle>
                                    <ItemDescription className="font-bold text-blue-600">{formatNumber(refund.amount)} Coin</ItemDescription>
                                </ItemContent>
                            </Item>
                            <Item variant="outline">
                                <ItemMedia><Info className="size-4" /></ItemMedia>
                                <ItemContent>
                                    <ItemTitle>Trạng thái</ItemTitle>
                                    <ItemDescription>
                                        <Badge variant="outline">{getStatusLabel(refund.status)}</Badge>
                                    </ItemDescription>
                                </ItemContent>
                            </Item>
                        </div>
                        <Item variant="outline">
                            <ItemMedia><FileText className="size-4" /></ItemMedia>
                            <ItemContent>
                                <ItemTitle>Lý do hoàn tiền</ItemTitle>
                                <ItemDescription className="whitespace-pre-wrap">{refund.reason || 'Không có'}</ItemDescription>
                            </ItemContent>
                        </Item>
                        {refund.adminNote && (
                            <Item variant="outline">
                                <ItemMedia><Building className="size-4" /></ItemMedia>
                                <ItemContent>
                                    <ItemTitle>Ghi chú Admin</ItemTitle>
                                    <ItemDescription className="whitespace-pre-wrap">{refund.adminNote}</ItemDescription>
                                </ItemContent>
                            </Item>
                        )}

                        <Separator />

                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                <Clock className="size-4" /> Lịch sử thay đổi
                            </h4>
                            <div className="space-y-4 ml-2 border-l-2 border-muted pl-4">
                                {refund.logs?.map((log) => (
                                    <div key={log.id} className="relative space-y-1">
                                        <div className="absolute -left-[21px] top-1 size-2 rounded-full bg-primary" />
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-bold">
                                                {getStatusLabel(log.oldStatus)} → {getStatusLabel(log.newStatus)}
                                            </span>
                                            <span className="text-muted-foreground">{formatDateTime(log.createdAt)}</span>
                                        </div>
                                        {log.reason && <p className="text-xs text-muted-foreground italic">"{log.reason}"</p>}
                                        <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                                            By: <span className="font-medium">{log.changedBy?.displayName || 'Hệ thống'}</span>
                                        </div>
                                    </div>
                                ))}
                                {(!refund.logs || refund.logs.length === 0) && (
                                    <p className="text-xs text-muted-foreground italic">Chưa có lịch sử thay đổi.</p>
                                )}
                            </div>
                        </div>

                        <Separator />

                        <Item variant="outline">
                            <ItemMedia><Calendar className="size-4" /></ItemMedia>
                            <ItemContent>
                                <ItemTitle>Ngày tạo</ItemTitle>
                                <ItemDescription>{formatDateTime(refund.createdAt)}</ItemDescription>
                            </ItemContent>
                        </Item>
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
