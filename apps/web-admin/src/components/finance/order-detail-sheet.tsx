import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from '@workspace/ui/components/sheet';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
    ShieldCheck,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ExternalLink,
    RotateCcw
} from 'lucide-react';
import { OrderStatus, type OrderResponseDTO } from '@workspace/schemas';
import { formatCurrency, formatDateTime } from '@/lib/format-utils';
import { cn } from "@workspace/ui/lib/utils";
import { useOrderPayments } from '@/api/services/finance';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Separator } from '@workspace/ui/components/separator';

interface OrderDetailSheetProps {
    order: OrderResponseDTO | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function OrderDetailSheet({
    order,
    open,
    onOpenChange,
}: OrderDetailSheetProps) {
    const { data: paymentsData, isLoading: isLoadingPayments } = useOrderPayments(order?.id || '');

    if (!order) return null;

    const getStatusConfig = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.COMPLETED:
                return {
                    label: 'Hoàn thành',
                    variant: 'default' as const,
                    icon: CheckCircle2
                };
            case OrderStatus.PENDING:
            case OrderStatus.PROCESSING:
                return {
                    label: 'Đang xử lý',
                    variant: 'secondary' as const,
                    icon: Clock
                };
            case OrderStatus.FAILED:
            case OrderStatus.CANCELLED:
            case OrderStatus.TIMED_OUT:
                return {
                    label: status === OrderStatus.CANCELLED ? 'Đã hủy' : status === OrderStatus.TIMED_OUT ? 'Hết hạn' : 'Thất bại',
                    variant: 'destructive' as const,
                    icon: XCircle
                };
            case OrderStatus.REFUNDED:
                return {
                    label: 'Hoàn tiền',
                    variant: 'outline' as const,
                    icon: RotateCcw
                };
            default:
                return {
                    label: status,
                    variant: 'outline' as const,
                    icon: AlertCircle
                };
        }
    };

    const statusConfig = getStatusConfig(order.status);
    const StatusIcon = statusConfig.icon;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="!w-full sm:!max-w-[800px] flex flex-col">
                <SheetHeader>
                    <SheetTitle>Chi tiết Đơn hàng</SheetTitle>
                    <SheetDescription>
                        Mã đơn hàng: {order.id}
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1 min-h-0">
                    <div className="space-y-8 p-6">
                        {/* Status Section */}
                        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
                            <div className="flex items-center gap-3">
                                <StatusIcon className={cn("h-5 w-5", statusConfig.variant === 'destructive' ? "text-destructive" : statusConfig.variant === 'default' ? "text-emerald-500" : "text-amber-500")} />
                                <div>
                                    <p className="text-sm font-semibold">{statusConfig.label}</p>
                                    <p className="text-xs text-muted-foreground">Cập nhật lúc: {formatDateTime(order.updatedAt)}</p>
                                </div>
                            </div>
                            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                        </div>

                        {/* Order Info Grid */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Khách hàng</p>
                                <p className="text-sm font-semibold">{(order as any).userName || 'Chưa cập nhật'}</p>
                                <p className="text-xs text-muted-foreground">{(order as any).userEmail || order.userId}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ngày tạo</p>
                                <p className="text-sm font-semibold">{formatDateTime(order.createdAt)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Phương thức</p>
                                <p className="text-sm font-semibold uppercase">{order.paymentMethod}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tổng tiền</p>
                                <p className="text-sm font-bold text-primary">{formatCurrency(order.amount)}</p>
                            </div>
                        </div>

                        <Separator />

                        {/* Transactions Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-primary" />
                                    Lịch sử Giao dịch
                                </h3>
                                <Badge variant="outline">{paymentsData?.data?.length || 0} bản ghi</Badge>
                            </div>

                            {isLoadingPayments ? (
                                <div className="py-8 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                    <Clock className="h-5 w-5 animate-spin" />
                                    <p className="text-xs uppercase font-bold tracking-widest">Đang tải...</p>
                                </div>
                            ) : !paymentsData?.data?.length ? (
                                <div className="p-8 text-center border rounded-lg border-dashed">
                                    <AlertCircle className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">Chưa có dữ liệu giao dịch</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {paymentsData.data.map((payment) => (
                                        <div key={payment.id} className="p-4 rounded-lg border bg-card flex items-center justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold">Giao dịch #{payment.transactionId?.slice(0, 10) || payment.id.slice(0, 8)}</p>
                                                    <Badge variant={payment.status === 'success' ? 'secondary' : 'destructive'} className="text-[10px] h-4">
                                                        {payment.status === 'success' ? 'Thành công' : 'Thất bại'}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{formatDateTime(payment.processedAt)}</p>
                                            </div>
                                            <p className="text-sm font-bold">{formatCurrency(payment.amount || 0)}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </ScrollArea>

                <SheetFooter>
                    {order.metadata?.checkoutUrl && (
                        <Button onClick={() => window.open(order.metadata.checkoutUrl, '_blank')}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Trang thanh toán
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Đóng
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
