import type { ColumnDef } from '@tanstack/react-table';
import { formatDateTime } from '@/lib/format-utils';
import {
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  FileDown
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
import type { SubmissionResponseDTO } from '@workspace/schemas';
import { SubmissionStatus } from '@workspace/schemas';
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Link } from 'react-router-dom';

interface SubmissionsColumnsProps {
  onGrade: (submission: SubmissionResponseDTO) => void;
  onView: (submission: SubmissionResponseDTO) => void;
  page?: number;
  limit?: number;
}

export const getSubmissionsColumns = ({
  onGrade,
  onView,
  page = 1,
  limit = 10,
}: SubmissionsColumnsProps): ColumnDef<SubmissionResponseDTO>[] => [
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
      id: 'courseRun',
      header: () => <div className="text-center">Đợt</div>,
      cell: ({ row }) => {
        const runId = (row.original as any).courseRunId;
        if (!runId) return <span className="text-muted-foreground/50 text-xs">—</span>;
        return (
          <Button variant="link" className="h-auto p-0 text-xs font-mono" asChild>
            <Link to={`/course/${runId}`}>{runId.slice(0, 8)}…</Link>
          </Button>
        );
      },
      size: 90,
    },
    {
      accessorKey: 'student',
      header: 'Học viên',
      cell: ({ row }) => {
        const submission = row.original;
        // Note: Backend expansion usually provides user info here, if not, we show userId
        const studentName = (submission as any).user?.displayName || "Học viên";
        const studentEmail = (submission as any).user?.email || submission.userId.slice(0, 8);
        const avatarUrl = (submission as any).user?.avatarUrl;

        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-8 rounded-lg border border-border/50">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-primary/5 text-[10px] font-bold">
                {studentName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-left">
              <span className="font-bold text-foreground line-clamp-1">{studentName}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none mt-0.5">
                {studentEmail}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const status = row.getValue('status') as SubmissionStatus;
        switch (status) {
          case SubmissionStatus.DRAFT:
            return (
              <Badge variant="outline">
                Nháp
              </Badge>
            );
          case SubmissionStatus.SUBMITTED:
            return (
              <Badge variant="secondary" className="whitespace-nowrap">
                Chờ chấm
              </Badge>
            );
          case SubmissionStatus.GRADED:
            return (
              <Badge variant="default">
                Đã chấm
              </Badge>
            );
          case SubmissionStatus.RETURNED:
            return (
              <Badge variant="destructive">
                Đã trả lại
              </Badge>
            );
          default:
            return null;
        }
      },
    },
    {
      accessorKey: 'submittedAt',
      header: 'Ngày nộp',
      cell: ({ row }) => {
        const date = row.getValue('submittedAt');
        const isLate = row.original.isLate;
        if (!date) return <span className="text-muted-foreground/40 italic text-xs">Chưa nộp</span>;

        return (
          <div className="flex flex-col gap-1 text-left">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="size-3" />
              {formatDateTime(date as string, 'dd/MM/yyyy HH:mm')}
            </div>
            {isLate && (
              <span className="text-[9px] font-bold text-rose-500 uppercase tracking-tighter flex items-center gap-1">
                <AlertCircle className="size-2" /> Nộp muộn
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'score',
      header: 'Điểm số',
      cell: ({ row }) => {
        const score = row.getValue('score');
        const status = row.original.status;

        if (status !== SubmissionStatus.GRADED) {
          return <span className="text-muted-foreground/30 font-sans italic text-xs">--</span>;
        }

        return (
          <div className="flex items-center gap-1">
            <span className="font-bold text-foreground">{score as number}</span>
            <span className="text-[10px] text-muted-foreground lowercase tracking-widest">pt</span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const submission = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px] rounded-xl border-border/10 bg-card/80 backdrop-blur-xl">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground p-3">
                Thao tác
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onView(submission)} className="p-3 cursor-pointer">
                <Eye className="mr-2 h-4 w-4" />
                <span>Xem bài làm</span>
              </DropdownMenuItem>

              {(submission.status === SubmissionStatus.SUBMITTED || submission.status === SubmissionStatus.GRADED) && (
                <DropdownMenuItem onClick={() => onGrade(submission)} className="p-3 cursor-pointer text-primary focus:text-primary">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  <span>{submission.status === SubmissionStatus.GRADED ? "Chấm lại" : "Chấm điểm"}</span>
                </DropdownMenuItem>
              )}

              {submission.fileUrls.length > 0 && (
                <DropdownMenuItem
                  onClick={() => window.open(submission.fileUrls[0], '_blank')}
                  className="p-3 cursor-pointer"
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  <span>Tải tệp đính kèm</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator className="bg-border/10" />
              <DropdownMenuItem
                onClick={() => onGrade(submission)} // TODO: Change to separate return logic if needed
                className="p-3 cursor-pointer text-rose-500 focus:text-rose-500"
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                <span>Cần sửa đổi</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
