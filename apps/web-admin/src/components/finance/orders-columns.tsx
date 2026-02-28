import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
    MoreHorizontal,
    Eye,
    FileText,
    XCircle,
    Clock
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { OrderStatus, type OrderResponseDTO } from '@workspace/schemas';
import { formatCurrency, formatDateTime } from '@/lib/format-utils';
import { cn } from "@workspace/ui/lib/utils";

interface OrdersColumnsProps {
    onView: (order: OrderResponseDTO) => void;
    onCancel: (order: OrderResponseDTO) => void;
    onExport: (order: OrderResponseDTO) => void;
    page: number;
    limit: number;
}

const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case OrderStatus.COMPLETED:
            return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
        case OrderStatus.PENDING:
        case OrderStatus.PROCESSING:
            return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
        case OrderStatus.FAILED:
        case OrderStatus.CANCELLED:
        case OrderStatus.TIMED_OUT:
            return 'bg-red-500/10 text-red-600 border-red-500/20';
        case OrderStatus.REFUNDED:
            return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
        default:
            return 'bg-muted/10 text-muted-foreground border-border/20';
    }
};

const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
        case OrderStatus.COMPLETED:
            return 'Hoàn thành';
        case OrderStatus.PENDING:
        case OrderStatus.PROCESSING:
            return 'Đang xử lý';
        case OrderStatus.FAILED:
            return 'Thất bại';
        case OrderStatus.CANCELLED:
            return 'Đã hủy';
        case OrderStatus.TIMED_OUT:
            return 'Hết hạn';
        case OrderStatus.REFUNDED:
            return 'Hoàn tiền';
        default:
            return status;
    }
};

export const getOrdersColumns = ({ onView, onCancel, onExport, page, limit }: OrdersColumnsProps): ColumnDef<OrderResponseDTO>[] => [
    {
        id: 'stt',
        header: () => <div className="text-center">#</div>,
        cell: ({ row }) => <div className="text-center font-medium text-muted-foreground">{(page - 1) * limit + row.index + 1}</div>,
        size: 50,
    },
    {
        header: 'Dữ liệu Đơn hàng',
        cell: ({ row }) => {
            const order = row.original;
            return (
                <div className="flex items-center gap-3 text-sm">
                    <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                            {order.id.slice(0, 8)}...
                        </span>
                        <span className="text-xs text-muted-foreground">Khách hàng: {(order as any).userName || (order as any).userEmail || order.userId}</span>
                    </div>
                </div>
            );
        }
    },
    {
        accessorKey: 'amount',
        header: () => <div className="text-center font-bold">Số tiền</div>,
        cell: ({ row }) => <div className="text-center font-medium">{formatCurrency(row.getValue('amount'))}</div>
    },
    {
        id: 'service',
        header: () => <div className="text-center">Dịch vụ</div>,
        cell: ({ row }) => {
            const order = row.original;
            return (
                <div className="text-center text-xs">
                    <div className="flex flex-col items-center gap-1">
                        <Badge variant="outline" className="font-normal">
                            {order.paymentMethod}
                        </Badge>
                        <span className="text-muted-foreground">{order.orderType}</span>
                    </div>
                </div>
            );
        }
    },
    {
        accessorKey: 'status',
        header: () => <div className="text-center">Trạng thái</div>,
        cell: ({ row }) => {
            const status = row.getValue('status') as OrderStatus;
            return (
                <div className="text-center">
                    <Badge className={cn("font-medium", getStatusColor(status))} variant="outline">
                        {getStatusLabel(status)}
                    </Badge>
                </div>
            );
        }
    },
    {
        accessorKey: 'createdAt',
        header: () => <div className="text-center">Ngày ghi nhận</div>,
        cell: ({ row }) => (
            <div className="text-center text-xs text-muted-foreground">
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {formatDateTime(row.getValue('createdAt'), 'dd/MM/yyyy')}
                    </div>
                    <span> {formatDateTime(row.getValue('createdAt'), 'HH:mm')}</span>
                </div>
            </div>
        )
    },
    {
        id: 'actions',
        header: () => <div className="text-center">Thao tác</div>,
        cell: ({ row }) => {
            const order = row.original;
            return (
                <div className="text-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onView(order)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onExport(order)}>
                                <FileText className="mr-2 h-4 w-4" />
                                Xuất hóa đơn
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => onCancel(order)}
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Hủy đơn hàng
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        }
    }
];
