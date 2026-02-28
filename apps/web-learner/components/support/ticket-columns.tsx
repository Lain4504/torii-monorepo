'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { TicketResponseDTO, TicketStatus, TicketType } from '@workspace/schemas';
import {
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ChevronRight
} from 'lucide-react';
import { formatDate } from '@/utils/format-utils';
import { cn } from '@workspace/ui/lib/utils';

const columnHelper = createColumnHelper<TicketResponseDTO>();

const getStatusInfo = (status: TicketStatus) => {
    switch (status) {
        case TicketStatus.RESOLVED:
            return {
                label: 'Đã giải quyết',
                color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
                icon: CheckCircle2
            };
        case TicketStatus.CANCELLED:
            return {
                label: 'Đã hủy',
                color: 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20',
                icon: XCircle
            };
        case TicketStatus.PROCESSING:
            return {
                label: 'Đang xử lý',
                color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
                icon: Clock
            };
        case TicketStatus.PENDING:
        default:
            return {
                label: 'Đang chờ',
                color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
                icon: AlertCircle
            };
    }
};

const getTypeLabel = (type: TicketType) => {
    switch (type) {
        case TicketType.REFUND: return 'Hoàn tiền';
        case TicketType.ERROR_REPORT: return 'Báo lỗi';
        case TicketType.SUPPORT:
        default: return 'Hỗ trợ';
    }
};

interface TicketColumnsProps {
    onView: (id: string) => void;
    onCancel: (id: string) => void;
    page: number;
    limit: number;
}

export const getTicketColumns = ({ onView, onCancel, page, limit }: TicketColumnsProps) => [
    columnHelper.display({
        id: 'stt',
        header: 'STT',
        cell: (info) => (
            <span className="text-sm font-medium text-muted-foreground w-10 block">
                {(page - 1) * limit + info.row.index + 1}
            </span>
        ),
    }),
    columnHelper.accessor('subject', {
        header: 'Tiêu đề / Loại',
        cell: (info) => {
            const ticket = info.row.original;
            return (
                <div className="flex flex-col gap-1 py-1">
                    <span className="font-medium text-sm line-clamp-1">
                        {ticket.subject}
                    </span>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-normal">
                            {getTypeLabel(ticket.type as TicketType)}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-mono">
                            #{ticket.id.slice(0, 8).toUpperCase()}
                        </span>
                    </div>
                </div>
            );
        },
    }),
    columnHelper.accessor('createdAt', {
        header: 'Ngày tạo',
        cell: (info) => (
            <div className="text-sm text-muted-foreground">
                {formatDate(info.getValue())}
            </div>
        ),
    }),
    columnHelper.accessor('status', {
        header: 'Trạng thái',
        cell: (info) => {
            const status = info.getValue() as TicketStatus;
            const { label, color, icon: Icon } = getStatusInfo(status);
            return (
                <Badge variant="outline" className={cn("gap-1.5", color)}>
                    <Icon className="w-3 h-3" />
                    {label}
                </Badge>
            );
        },
    }),
    columnHelper.display({
        id: 'actions',
        header: '',
        cell: ({ row }) => (
            <div className="flex items-center justify-end gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8"
                    onClick={() => onView(row.original.id)}
                >
                    Chi tiết
                    <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
            </div>
        ),
    }),
];
