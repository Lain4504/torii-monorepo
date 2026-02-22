import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
    MoreVertical,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
} from 'lucide-react';
import type { TicketResponseDTO } from '@workspace/schemas';
import { TicketStatus, TicketType } from '@workspace/schemas';
import { cn } from '@workspace/ui/lib/utils';

interface TicketsColumnsProps {
    onView: (ticket: TicketResponseDTO) => void;
    page?: number;
    limit?: number;
}

export const getTicketsColumns = ({ onView, page = 1, limit = 10 }: TicketsColumnsProps): ColumnDef<TicketResponseDTO>[] => [
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
        header: 'Mã yêu cầu',
        cell: ({ row }) => <span className="font-mono text-[10px] uppercase text-muted-foreground">#{row.original.id.slice(0, 8)}</span>,
    },
    {
        accessorKey: 'type',
        header: 'Phân loại',
        cell: ({ row }) => {
            const type = row.original.type as TicketType;
            const labelMap: Record<TicketType, string> = {
                [TicketType.REFUND]: 'Hoàn tiền',
                [TicketType.SUPPORT]: 'Hỗ trợ',
                [TicketType.ERROR_REPORT]: 'Báo lỗi',
            };
            return (
                <Badge variant="secondary" className="px-2 py-0">
                    {labelMap[type] || type}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'user',
        header: 'Người gửi',
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-bold text-xs">{row.original.user?.displayName || 'N/A'}</span>
                <span className="text-[10px] text-muted-foreground">{row.original.user?.email}</span>
            </div>
        ),
    },
    {
        accessorKey: 'subject',
        header: 'Tiêu đề',
        cell: ({ row }) => <span className="font-medium max-w-[200px] truncate block">{row.original.subject}</span>,
    },
    {
        accessorKey: 'status',
        header: 'Trạng thái',
        cell: ({ row }) => {
            const status = row.original.status as TicketStatus;
            const getStatusBadge = (status: TicketStatus) => {
                switch (status) {
                    case TicketStatus.APPROVED:
                        return (
                            <Badge variant="default" className="gap-1.5 px-2 py-0.5">
                                <CheckCircle2 className="w-3 h-3" /> Thành công
                            </Badge>
                        );
                    case TicketStatus.REJECTED:
                        return (
                            <Badge variant="destructive" className="gap-1.5 px-2 py-0.5">
                                <XCircle className="w-3 h-3" /> Từ chối
                            </Badge>
                        );
                    case TicketStatus.PROCESSING:
                        return (
                            <Badge variant="secondary" className="gap-1.5 px-2 py-0.5">
                                <Clock className="w-3 h-3" /> Đang xử lý
                            </Badge>
                        );
                    case TicketStatus.PENDING:
                    default:
                        return (
                            <Badge variant="outline" className="gap-1.5 px-2 py-0.5">
                                <AlertCircle className="w-3 h-3" /> Chờ xử lý
                            </Badge>
                        );
                }
            };
            return getStatusBadge(status);
        },
    },
    {
        accessorKey: 'createdAt',
        header: 'Ngày tạo',
        cell: ({ row }) => <span className="text-[11px] font-medium">{new Date(row.original.createdAt).toLocaleDateString('vi-VN')}</span>,
    },
    {
        id: 'actions',
        header: () => <div className="text-right">Thao tác</div>,
        cell: ({ row }) => (
            <div className="flex justify-end">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                    onClick={() => onView(row.original)}
                >
                    <MoreVertical className="size-4" />
                </Button>
            </div>
        ),
    },
];
