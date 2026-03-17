import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
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
import { Button } from '@workspace/ui/components/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import {
    Field,
    FieldLabel,
} from '@workspace/ui/components/field';
import type { TicketResponseDTO } from '@workspace/schemas';
import { TicketStatus, TicketType } from '@workspace/schemas';
import { toast } from 'sonner';
import { useUpdateTicketStatus } from "@/lib/api/services/tickets";
import { Spinner } from "@workspace/ui/components/spinner";
import { Textarea } from "@workspace/ui/components/textarea";
import { Input } from "@workspace/ui/components/input";
import React from 'react';
import { orderApi } from '@/lib/api/services/order-api';
import { useQuery } from '@tanstack/react-query';

interface ChangeTicketStatusDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    ticket: TicketResponseDTO | null;
}

export function ChangeTicketStatusDialog({
    open,
    onOpenChange,
    ticket,
}: ChangeTicketStatusDialogProps) {
    const updateTicketStatus = useUpdateTicketStatus();
    const [selectedStatus, setSelectedStatus] = useState<TicketStatus>(TicketStatus.PENDING);
    const [response, setResponse] = useState('');
    const [refundAmount, setRefundAmount] = useState<number>(0);
    const [showConfirm, setShowConfirm] = useState(false);

    // Fetch order details if this is a refund ticket and has an orderId
    const { data: orderData } = useQuery({
        queryKey: ['order', ticket?.orderId],
        queryFn: () => ticket?.orderId ? orderApi.getOrder(ticket.orderId) : Promise.resolve(null),
        enabled: open && !!ticket?.orderId && ticket.type === TicketType.REFUND,
    });

    useEffect(() => {
        if (ticket) {
            setSelectedStatus(ticket.status as TicketStatus);
            setResponse(ticket.response || '');
            setRefundAmount((ticket as any).refundAmount || 0);
        }
    }, [ticket, open]);

    // Auto-calculate refund amount when order data is loaded and status is being set to RESOLVED
    useEffect(() => {
        if (
            open &&
            ticket?.type === TicketType.REFUND &&
            selectedStatus === TicketStatus.RESOLVED &&
            orderData &&
            refundAmount === 0
        ) {
            // tỷ lệ 1:1, grandTotal là số tiền VND
            setRefundAmount(Number((orderData as any).grandTotal || orderData.amount || 0));
        }
    }, [open, ticket?.type, selectedStatus, orderData, refundAmount]);

    if (!ticket) return null;

    const handleUpdateClick = () => {
        if (selectedStatus === ticket.status) {
            onOpenChange(false);
            return;
        }
        setShowConfirm(true);
    };

    const handleConfirmUpdate = async () => {
        try {
            await (updateTicketStatus.mutateAsync as any)({
                id: ticket.id,
                status: selectedStatus,
                response: response,
                refundAmount: selectedStatus === TicketStatus.RESOLVED && ticket.type === TicketType.REFUND ? refundAmount : undefined,
            });
            toast.success('Đã cập nhật trạng thái ticket', {
                description: `Trạng thái của ticket đã được thay đổi thành công.`,
            });
            setShowConfirm(false);
            onOpenChange(false);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Không thể cập nhật trạng thái';
            toast.error('Cập nhật thất bại', {
                description: errorMessage,
            });
        }
    };

    const getStatusLabel = (status: TicketStatus) => {
        switch (status) {
            case TicketStatus.PENDING: return 'Đang chờ';
            case TicketStatus.PROCESSING: return 'Đang xử lý';
            case TicketStatus.RESOLVED: return 'Đã giải quyết';
            case TicketStatus.CANCELLED: return 'Đã hủy';
            default: return status;
        }
    }

    return (
        <>
            <Dialog open={open && !showConfirm} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>Thay đổi trạng thái Ticket</DialogTitle>
                        <DialogDescription>
                            Cập nhật trạng thái cho ticket <strong>#{ticket.id.substring(0, 8)}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <Field className="space-y-2">
                            <FieldLabel>Trạng thái mới</FieldLabel>
                            <Select
                                value={selectedStatus}
                                onValueChange={(value) => setSelectedStatus(value as TicketStatus)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={TicketStatus.PENDING} disabled={ticket.status !== TicketStatus.PENDING}>
                                        {getStatusLabel(TicketStatus.PENDING)}
                                    </SelectItem>
                                    <SelectItem value={TicketStatus.PROCESSING} disabled={ticket.status === TicketStatus.CANCELLED || ticket.status === TicketStatus.RESOLVED}>
                                        {getStatusLabel(TicketStatus.PROCESSING)}
                                    </SelectItem>
                                    <SelectItem
                                        value={TicketStatus.RESOLVED}
                                    >
                                        {getStatusLabel(TicketStatus.RESOLVED)}
                                    </SelectItem>
                                    <SelectItem value={TicketStatus.CANCELLED}>
                                        {getStatusLabel(TicketStatus.CANCELLED)}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {ticket.type === TicketType.REFUND && (
                                <p className="text-[13px] text-muted-foreground mt-2 bg-muted/50 p-2 rounded border border-dashed">
                                    {ticket.status === TicketStatus.PENDING ? (
                                        "ℹ️ Ticket Hoàn tiền cần được xác minh trước khi hoàn trả."
                                    ) : ticket.status === TicketStatus.PROCESSING ? (
                                        "ℹ️ Khi chuyển sang 'Đã giải quyết', số tiền xu sẽ được cộng vào ví của người dùng."
                                    ) : null}
                                </p>
                            )}
                        </Field>
                        {selectedStatus === TicketStatus.RESOLVED && ticket.type === TicketType.REFUND && (
                            <Field className="space-y-2">
                                <FieldLabel>Số tiền hoàn trả (Xu)</FieldLabel>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={refundAmount}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRefundAmount(Number(e.target.value))}
                                        placeholder="Nhập số tiền..."
                                        className="pr-12"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">Xu</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Nếu bỏ trống hoặc bằng 0, hệ thống sẽ tự động tính toán dựa trên giá trị đơn hàng.
                                </p>
                            </Field>
                        )}
                        <Field className="space-y-2">
                            <FieldLabel>Phản hồi cho người dùng (tùy chọn)</FieldLabel>
                            <Textarea
                                value={response}
                                onChange={(e) => setResponse(e.target.value)}
                                placeholder="Nhập nội dung phản hồi..."
                                rows={4}
                            />
                        </Field>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Hủy bỏ
                        </Button>
                        <Button onClick={handleUpdateClick}>
                            Tiếp tục
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận thay đổi?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Hành động này sẽ thay đổi trạng thái của ticket từ
                            <span className="font-medium text-foreground mx-1">{getStatusLabel(ticket.status as TicketStatus)}</span>
                            sang
                            <span className="font-medium text-primary mx-1">{getStatusLabel(selectedStatus)}</span>.
                            Một thông báo sẽ được gửi đến người dùng.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={updateTicketStatus.isPending}>Quay lại</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleConfirmUpdate();
                            }}
                            disabled={updateTicketStatus.isPending}
                        >
                            {updateTicketStatus.isPending ? (
                                <>
                                    <Spinner className="mr-2 h-4 w-4" />
                                    Đang lưu...
                                </>
                            ) : (
                                "Xác nhận thay đổi"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
