import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { 
  MoreHorizontal,
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
}

export const getAssignmentsColumns = ({
  onEdit,
  onDelete,
  onPublish,
  onViewSubmissions,
}: AssignmentsColumnsProps): ColumnDef<AssignmentResponseDTO>[] => [
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
          ID: {row.original.id.slice(0, 8)}...
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
        <Badge variant="outline" className="rounded-lg text-[10px] font-bold uppercase py-0.5">
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
            <Badge className="bg-muted text-muted-foreground hover:bg-muted border-none rounded-lg text-[10px] font-bold uppercase">
              Nháp
            </Badge>
          );
        case AssignmentStatus.PUBLISHED:
          return (
            <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-none rounded-lg text-[10px] font-bold uppercase">
              Đã công bố
            </Badge>
          );
        case AssignmentStatus.CLOSED:
          return (
            <Badge className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border-none rounded-lg text-[10px] font-bold uppercase">
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
          {format(new Date(date as string), 'dd/MM/yyyy HH:mm')}
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
        <span className="text-[10px] text-muted-foreground">pt</span>
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
            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted/50 rounded-lg">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px] rounded-xl border-border/10 bg-card/80 backdrop-blur-xl">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground p-3">
              Thao tác
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onViewSubmissions(assignment)} className="p-3 cursor-pointer">
              <Users className="mr-2 h-4 w-4" />
              <span>Xem bài nộp</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(assignment)} className="p-3 cursor-pointer">
              <Pencil className="mr-2 h-4 w-4" />
              <span>Chỉnh sửa</span>
            </DropdownMenuItem>
            {assignment.status === AssignmentStatus.DRAFT && (
              <DropdownMenuItem onClick={() => onPublish(assignment)} className="p-3 cursor-pointer text-emerald-500 focus:text-emerald-500">
                <Send className="mr-2 h-4 w-4" />
                <span>Công bố bài tập</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator className="bg-border/10" />
            <DropdownMenuItem 
              onClick={() => onDelete(assignment)} 
              className="p-3 cursor-pointer text-rose-500 focus:text-rose-500"
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
