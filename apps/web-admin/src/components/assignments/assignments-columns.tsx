import type { ColumnDef } from '@tanstack/react-table';
import { formatDateTime } from '@/lib/format-utils';
import {
  MoreVertical,
  Pencil,
  Trash2,
  Send,
  Users,
  Clock,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@workspace/ui/components/dropdown-menu';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import type { AssignmentResponseDTO } from '@workspace/schemas';
import { AssignmentStatus, AssignmentType } from '@workspace/schemas';

interface AssignmentsColumnsProps {
  onEdit: (assignment: AssignmentResponseDTO) => void;
  onDelete: (assignment: AssignmentResponseDTO) => void;
  onPublish: (assignment: AssignmentResponseDTO) => void;
  onViewSubmissions: (assignment: AssignmentResponseDTO) => void;
  page?: number;
  limit?: number;
}

export const getAssignmentsColumns = ({
  onEdit,
  onDelete,
  onPublish,
  onViewSubmissions,
  page = 1,
  limit = 10,
}: AssignmentsColumnsProps): ColumnDef<AssignmentResponseDTO>[] => [
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
      accessorKey: 'title',
      header: 'Tên bài tập',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <span
            className="font-bold text-foreground hover:text-primary cursor-pointer transition-colors"
            onClick={() => onViewSubmissions(row.original)}
          >
            {row.getValue('title')}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
            Mã: {row.original.id.slice(0, 8)}...
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Loại bài',
      cell: ({ row }) => {
        const type = row.getValue('type') as AssignmentType;
        return (
          <Badge variant="outline" className="font-bold uppercase">
            {type === AssignmentType.TEXT && "Văn bản"}
            {type === AssignmentType.FILE && "Tệp tin"}
            {type === AssignmentType.BOTH && "Cả hai"}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const status = row.getValue('status') as AssignmentStatus;
        switch (status) {
          case AssignmentStatus.DRAFT:
            return (
              <Badge variant="secondary" className="font-bold uppercase">
                Nháp
              </Badge>
            );
          case AssignmentStatus.PUBLISHED:
            return (
              <Badge variant="default" className="font-bold uppercase">
                Đã công bố
              </Badge>
            );
          case AssignmentStatus.CLOSED:
            return (
              <Badge variant="destructive" className="font-bold uppercase">
                Đã đóng
              </Badge>
            );
          default:
            return null;
        }
      },
    },
    {
      accessorKey: 'dueDate',
      header: 'Hạn nộp',
      cell: ({ row }) => {
        const date = row.getValue('dueDate');
        if (!date) return <span className="text-muted-foreground/40 italic text-xs">Không có hạn</span>;
        return (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="size-3" />
            {formatDateTime(date as string, 'dd/MM/yyyy HH:mm')}
          </div>
        );
      },
    },
    {
      accessorKey: 'maxScore',
      header: 'Thang điểm',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <span className="font-bold text-foreground">{row.getValue('maxScore')}</span>
          <span className="text-[10px] text-muted-foreground">điểm</span>
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const assignment = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>
                Thao tác
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onViewSubmissions(assignment)}>
                <Users className="mr-2 h-4 w-4" />
                <span>Xem bài nộp</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(assignment)}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Chỉnh sửa</span>
              </DropdownMenuItem>
              {assignment.status === AssignmentStatus.DRAFT && (
                <DropdownMenuItem onClick={() => onPublish(assignment)} className="text-emerald-500 focus:text-emerald-500">
                  <Send className="mr-2 h-4 w-4" />
                  <span>Công bố bài tập</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(assignment)}
                className="text-rose-500 focus:text-rose-500"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Xóa bài tập</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
