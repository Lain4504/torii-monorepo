import { createColumnHelper } from '@tanstack/react-table';
import type { QuestionResponseDTO, QuestionType, QuestionStatus, QuestionDifficultyLevel, QuestionJlptLevel } from '@workspace/schemas';
import { Button } from '@workspace/ui/components/button';

import { ArrowUpDown, Pencil, Trash, Eye, CheckCircle, XCircle, Clock, Archive, BrainCircuit, MoreVertical } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { cn } from "@workspace/ui/lib/utils";

const columnHelper = createColumnHelper<QuestionResponseDTO>();

export type QuestionsColumnsProps = {
    onView: (question: QuestionResponseDTO) => void;
    onEdit: (question: QuestionResponseDTO) => void;
    onDelete: (question: QuestionResponseDTO) => void;
    onApprove?: (question: QuestionResponseDTO) => void;
    onDeactivate?: (question: QuestionResponseDTO) => void;
    onReject?: (question: QuestionResponseDTO) => void;
    onSendForReview?: (question: QuestionResponseDTO) => void;
    page?: number;
    limit?: number;
};

const getStatusColor = (status: QuestionStatus) => {
    const colors: Record<QuestionStatus, string> = {
        active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        inactive: 'bg-muted/10 text-muted-foreground border-border/20',
        review: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        archived: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    };
    return colors[status] || colors.active;
};

const getStatusLabel = (status: QuestionStatus) => {
    const labels: Record<QuestionStatus, string> = {
        active: 'Đang hoạt động',
        inactive: 'Ngừng hoạt động',
        review: 'Chờ duyệt',
        archived: 'Đã lưu trữ',
    };
    return labels[status] || status;
};

const getTypeLabel = (type: QuestionType) => {
    const labels: Record<QuestionType, string> = {
        multiple_choice: 'Trắc nghiệm',
        true_false: 'Đúng/Sai',
        fill_blank: 'Điền khuyết',
        matching: 'Nối thẻ',
        essay: 'Tự luận',
        listening: 'Nghe hiểu',
    };
    return labels[type] || type.toUpperCase();
};

const getDifficultyLabel = (difficulty: QuestionDifficultyLevel) => {
    const labels: Record<QuestionDifficultyLevel, string> = {
        easy: 'Dễ',
        medium: 'Trung bình',
        hard: 'Khó',
    };
    return labels[difficulty] || difficulty;
};

export const getQuestionsColumns = ({
    onView,
    onEdit,
    onDelete,
    onApprove,
    onDeactivate,
    onReject,
    onSendForReview,
    page = 1,
    limit = 10,
}: QuestionsColumnsProps) => [
        // STT Column
        columnHelper.display({
            id: 'stt',
            header: () => <div className="text-center text-xs text-muted-foreground">#</div>,
            cell: ({ row }) => {
                const stt = (page - 1) * limit + row.index + 1;
                return <div className="text-center text-xs text-muted-foreground">{stt}</div>;
            },
            size: 60,
        }),
        columnHelper.accessor('questionText', {
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="justify-start"
                >
                    <span className="text-xs">Nội dung câu hỏi</span>
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
            ),
            cell: (info) => (
                <button
                    type="button"
                    className="flex items-start gap-2 text-left max-w-[420px]"
                    onClick={() => onView(info.row.original)}
                >
                    <BrainCircuit className="size-4 text-primary mt-[2px]" />
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium truncate">{info.getValue()}</span>
                        <span className="text-[10px] text-muted-foreground">Mã: {info.row.original.id.slice(0, 8)}</span>
                    </div>
                </button>
            ),
        }),
        columnHelper.accessor('questionType', {
            header: () => <div className="px-1 text-center text-xs text-muted-foreground">Loại hình</div>,
            cell: (info) => (
                <div className="flex justify-center">
                    <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-[10px] text-muted-foreground">
                        {getTypeLabel(info.getValue() as QuestionType)}
                    </div>
                </div>
            ),
        }),
        columnHelper.accessor('jlptLevel', {
            header: () => <div className="px-1 text-center text-xs text-muted-foreground">Cấp độ</div>,
            cell: (info) => {
                const level = info.getValue() as QuestionJlptLevel | null;
                return (
                    <div className="flex justify-center text-xs text-muted-foreground">
                        {level || '—'}
                    </div>
                );
            },
        }),
        columnHelper.accessor('difficulty', {
            header: () => <div className="px-1 text-center text-xs text-muted-foreground">Độ khó</div>,
            cell: (info) => {
                const difficulty = info.getValue() as QuestionDifficultyLevel | null;
                return (
                    <div className="flex justify-center text-xs text-muted-foreground">
                        {difficulty ? getDifficultyLabel(difficulty) : 'N/A'}
                    </div>
                );
            },
        }),
        columnHelper.accessor('status', {
            header: () => <div className="px-1 text-center text-xs text-muted-foreground">Trạng thái</div>,
            cell: (info) => {
                const status = info.getValue() as QuestionStatus;
                const colorClass = getStatusColor(status);
                return (
                    <div className="flex justify-center">
                        <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px]", colorClass)}>
                            {getStatusLabel(status)}
                        </span>
                    </div>
                );
            },
        }),
        columnHelper.accessor('usageCount', {
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="w-full justify-center text-xs"
                >
                    Sử dụng tại
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
            ),
            cell: (info) => (
                <div className="text-center text-xs">
                    {info.getValue() || 0}
                </div>
            ),
        }),
        columnHelper.display({
            id: 'actions',
            header: () => <div className="text-center text-xs text-muted-foreground">Quản lý</div>,
            cell: ({ row }) => {
                const question = row.original;
                const status = question.status as QuestionStatus;

                return (
                    <div className="flex justify-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-[200px]"
                            >
                                <DropdownMenuItem onClick={() => onView(question)}>
                                    <Eye className="h-4 w-4 opacity-30" />
                                    <span>Xem chi tiết</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onEdit(question)}>
                                    <Pencil className="h-4 w-4 opacity-30" />
                                    <span>Chỉnh sửa câu hỏi</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {status === 'review' && onApprove && onReject && (
                                    <>
                                        <DropdownMenuItem onClick={() => onApprove(question)}>
                                            <CheckCircle className="h-4 w-4 opacity-60" />
                                            <span>Phê duyệt</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onReject(question)}>
                                            <Archive className="h-4 w-4 opacity-60" />
                                            <span>Từ chối câu hỏi</span>
                                        </DropdownMenuItem>
                                    </>
                                )}
                                {status === 'active' && onDeactivate && (
                                    <DropdownMenuItem onClick={() => onDeactivate(question)}>
                                        <XCircle className="h-4 w-4 opacity-60" />
                                        <span>Ngừng hoạt động</span>
                                    </DropdownMenuItem>
                                )}
                                {(status === 'active' || status === 'inactive') && onSendForReview && (
                                    <DropdownMenuItem onClick={() => onSendForReview(question)}>
                                        <Clock className="h-4 w-4 opacity-30" />
                                        <span>Gửi để duyệt</span>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => onDelete(question)} className="text-destructive">
                                    <Trash className="h-4 w-4 opacity-30" />
                                    <span>Xóa câu hỏi</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
            size: 100,
        }),
    ];
