import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
    MoreVertical,
    CheckCircle2,
    XCircle,
    Clock, // Keeping temporarily if needed elsewhere, but actually I should remove if not used
    AlertCircle,
    Eye,
    Edit,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@workspace/ui/components/dropdown-menu';
import type { RefundResponseDTO } from '@workspace/schemas';
import { RefundStatus } from '@workspace/schemas';
import { cn } from "@workspace/ui/lib/utils";
import { formatDate } from '@/lib/format-utils';

interface RefundsColumnsProps {
    onView: (refund: RefundResponseDTO) => void;
    onChangeStatus: (refund: RefundResponseDTO) => void;
    page?: number;
    limit?: number;
}

const statusConfig: Record<RefundStatus, { label: string; icon: React.ElementType; className: string }> = {
    [RefundStatus.PENDING]: { label: 'Đang chờ', icon: AlertCircle, className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    [RefundStatus.COMPLETED]: { label: 'Hoàn tất', icon: CheckCircle2, className: 'bg-green-500/10 text-green-700 border-green-500/20' },
    [RefundStatus.REJECTED]: { label: 'Từ chối', icon: XCircle, className: 'bg-red-500/10 text-red-600 border-red-500/20' },
};

export const getRefundsColumns = ({ onView, onChangeStatus, page = 1, limit = 10 }: RefundsColumnsProps): ColumnDef<RefundResponseDTO>[] => [
    {
        id: 'stt',
        header: () => <div className="text-center">#</div>,
        cell: ({ row }) => {
            const stt = (page - 1) * limit + row.index + 1;
            return <div className="text-center font-medium text-muted-foreground/60 tabular-nums text-xs">{stt}</div>;
        },
        size: 50,
    },
    {
        accessorKey: 'id',
        header: 'Mã hoàn tiền',
        cell: ({ row }) => <span className="font-mono text-[10px] uppercase text-muted-foreground">#{row.original.id.slice(0, 8)}</span>,
    },
    {
        accessorKey: 'ticket',
        header: 'Học viên',
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-bold text-xs">{row.original.ticket?.user?.displayName || 'N/A'}</span>
                <span className="text-[10px] text-muted-foreground">{row.original.ticket?.user?.email}</span>
            </div>
        ),
    },
    {
        accessorKey: 'amount',
        header: 'Số tiền (Coin)',
        cell: ({ row }) => <span className="font-bold text-blue-600">{Number(row.original.amount).toLocaleString()}</span>,
    },
    {
        accessorKey: 'status',
        header: 'Trạng thái',
        cell: ({ row }) => {
            const status = row.original.status as RefundStatus;
            const config = statusConfig[status] || statusConfig[RefundStatus.PENDING];
            const Icon = config.icon;
            return (
                <Badge variant="outline" className={cn("gap-1.5 px-2 py-0.5 font-semibold", config.className)}>
                    <Icon className="w-3 h-3" /> {config.label}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'createdAt',
        header: 'Ngày tạo',
        cell: ({ row }) => <span className="text-[11px] font-medium">{formatDate(row.original.createdAt)}</span>,
    },
    {
        id: 'actions',
        header: () => <div className="text-right">Thao tác</div>,
        cell: ({ row }) => {
            const refund = row.original;
            return (
                <div className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Mở menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onView(refund)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onChangeStatus(refund)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Cập nhật trạng thái
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        },
        size: 50,
    },
];
