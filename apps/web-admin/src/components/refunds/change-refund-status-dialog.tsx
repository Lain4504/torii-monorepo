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
import type { RefundResponseDTO } from '@workspace/schemas';
import { RefundStatus } from '@workspace/schemas';
import { toast } from 'sonner';
import { useUpdateRefundStatus } from "@/lib/api/services/refunds";
import { Spinner } from "@workspace/ui/components/spinner";
import { Textarea } from "@workspace/ui/components/textarea";

interface ChangeRefundStatusDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    refund: RefundResponseDTO | null;
}

export function ChangeRefundStatusDialog({
    open,
    onOpenChange,
    refund,
}: ChangeRefundStatusDialogProps) {
    const updateRefundStatus = useUpdateRefundStatus();
    const [selectedStatus, setSelectedStatus] = useState<RefundStatus>(RefundStatus.PENDING);
    const [reason, setReason] = useState('');
    const [adminNote, setAdminNote] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        if (refund) {
            setSelectedStatus(refund.status as RefundStatus);
            setAdminNote(refund.adminNote || '');
        }
    }, [refund, open]);

    if (!refund) return null;

    const handleUpdateClick = () => {
        if (selectedStatus === refund.status && adminNote === refund.adminNote) {
            onOpenChange(false);
            return;
        }
        setShowConfirm(true);
    };

    const handleConfirmUpdate = async () => {
        try {
            await updateRefundStatus.mutateAsync({
                id: refund.id,
                status: selectedStatus,
                reason: reason,
                adminNote: adminNote,
            });
            toast.success('Đã cập nhật trạng thái hoàn tiền', {
                description: `Trạng thái của yêu cầu đã được thay đổi thành công.`,
            });
            setShowConfirm(false);
            onOpenChange(false);
            setReason('');
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Không thể cập nhật trạng thái';
            toast.error('Cập nhật thất bại', {
                description: errorMessage,
            });
        }
    };

    const getStatusLabel = (status: RefundStatus) => {
        switch (status) {
            case RefundStatus.PENDING: return 'Đang chờ';
            case RefundStatus.COMPLETED: return 'Hoàn tất';
            case RefundStatus.REJECTED: return 'Từ chối';
            default: return status;
        }
    }

    return (
        <>
            <Dialog open={open && !showConfirm} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>Cập nhật trạng thái Hoàn tiền</DialogTitle>
                        <DialogDescription>
                            Cập nhật trạng thái cho yêu cầu <strong>#{refund.id.substring(0, 8)}</strong> của {refund.ticket?.user?.displayName}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <Field className="space-y-2">
                            <FieldLabel>Trạng thái mới</FieldLabel>
                            <Select
                                value={selectedStatus}
                                onValueChange={(value) => setSelectedStatus(value as RefundStatus)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={RefundStatus.PENDING} disabled={refund.status === RefundStatus.COMPLETED || refund.status === RefundStatus.REJECTED}>
                                        {getStatusLabel(RefundStatus.PENDING)}
                                    </SelectItem>
                                    <SelectItem value={RefundStatus.COMPLETED} disabled={refund.status === RefundStatus.COMPLETED || refund.status === RefundStatus.REJECTED}>
                                        {getStatusLabel(RefundStatus.COMPLETED)}
                                    </SelectItem>
                                    <SelectItem value={RefundStatus.REJECTED} disabled={refund.status === RefundStatus.COMPLETED}>
                                        {getStatusLabel(RefundStatus.REJECTED)}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field className="space-y-2">
                            <FieldLabel>Lý do thay đổi (để lưu log)</FieldLabel>
                            <Textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Ví dụ: Đã xác nhận bank transfer..."
                                rows={2}
                            />
                        </Field>
                        <Field className="space-y-2">
                            <FieldLabel>Ghi chú Admin (công khai cho học viên)</FieldLabel>
                            <Textarea
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                placeholder="Ghi chú sẽ hiển thị cho học viên..."
                                rows={3}
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
                            Hành động này sẽ thay đổi trạng thái của yêu cầu hoàn tiền từ
                            <span className="font-medium text-foreground mx-1">{getStatusLabel(refund.status as RefundStatus)}</span>
                            sang
                            <span className="font-medium text-primary mx-1">{getStatusLabel(selectedStatus)}</span>.
                            {selectedStatus === RefundStatus.COMPLETED && (
                                <p className="mt-2 text-red-500 font-bold">
                                    Lưu ý: Trạng thái COMPLETED sẽ tự động HỦY ENROLLMENT của học viên và ĐÓNG TICKET liên quan.
                                </p>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={updateRefundStatus.isPending}>Quay lại</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleConfirmUpdate();
                            }}
                            disabled={updateRefundStatus.isPending}
                        >
                            {updateRefundStatus.isPending ? (
                                <>
                                    <Spinner className="mr-2 h-4 w-4" />
                                    Đang lưu...
                                </>
                            ) : (
                                "Xác nhận cập nhật"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
