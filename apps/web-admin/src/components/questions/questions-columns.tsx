import { createColumnHelper } from '@tanstack/react-table';
import type { QuestionResponseDTO, QuestionType, QuestionStatus, QuestionDifficultyLevel, QuestionJlptLevel } from '@workspace/schemas';
import { Button } from '@workspace/ui/components/button';

import { ArrowUpDown, Pencil, Trash, Eye, CheckCircle, XCircle, Clock, Archive, BrainCircuit, Zap } from 'lucide-react';
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
    onApprove: (question: QuestionResponseDTO) => void;
    onDeactivate: (question: QuestionResponseDTO) => void;
    onReject: (question: QuestionResponseDTO) => void;
    onSendForReview: (question: QuestionResponseDTO) => void;
    page: number;
    limit: number;
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
    page,
    limit,
}: QuestionsColumnsProps) => [
        // STT Column
        columnHelper.display({
            id: 'stt',
            header: () => <div className="text-center">#</div>,
            cell: ({ row }) => {
                const stt = (page - 1) * limit + row.index + 1;
                return <div className="text-center font-black italic text-muted-foreground/30 tabular-nums text-[10px]">L{stt < 10 ? `0${stt}` : stt}</div>;
            },
            size: 60,
        }),
        columnHelper.accessor('questionText', {
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="-ml-4 h-10 px-4 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-primary/5 hover:text-primary transition-all group"
                    >
                        Nội dung Câu hỏi
                        <ArrowUpDown className="ml-2 h-3 w-3 opacity-20 group-hover:opacity-100 transition-opacity" />
                    </Button>
                );
            },
            cell: (info) => (
                <div className="flex items-center gap-3 group/text cursor-pointer max-w-[400px]" onClick={() => onView(info.row.original)}>
                    <div className="w-8 h-8 rounded-md bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover/text:bg-primary group-hover/text:text-white transition-all">
                        <BrainCircuit className="size-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-black italic uppercase tracking-tight text-foreground group-hover/text:text-primary transition-colors truncate">{info.getValue()}</span>
                        <span className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">UID: {info.row.original.id.slice(0, 8)}</span>
                    </div>
                </div>
            ),
        }),
        columnHelper.accessor('questionType', {
            header: () => <div className="px-1 text-center">Loại hình</div>,
            cell: (info) => (
                <div className="flex justify-center">
                    <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted/10 border border-border/10 text-[8px] font-black uppercase tracking-widest text-muted-foreground">
                        {getTypeLabel(info.getValue() as QuestionType)}
                    </div>
                </div>
            ),
        }),
        columnHelper.accessor('jlptLevel', {
            header: () => <div className="px-1 text-center">Cấp độ</div>,
            cell: (info) => {
                const level = info.getValue() as QuestionJlptLevel | null;
                return (
                    <div className="flex justify-center">
                        <div className="w-8 h-8 rounded-md border border-primary/20 flex items-center justify-center text-[10px] font-black italic text-primary">
                            {level || '??'}
                        </div>
                    </div>
                );
            },
        }),
        columnHelper.accessor('difficulty', {
            header: () => <div className="px-1 text-center">Độ khó</div>,
            cell: (info) => {
                const difficulty = info.getValue() as QuestionDifficultyLevel | null;
                const colors: Record<QuestionDifficultyLevel, string> = {
                    easy: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                    medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                    hard: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
                };
                return (
                    <div className="flex justify-center">
                        <div className={cn("inline-flex items-center px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border", difficulty ? colors[difficulty] : 'bg-muted/10 border-border/10 text-muted-foreground')}>
                            {difficulty ? getDifficultyLabel(difficulty) : 'N/A'}
                        </div>
                    </div>
                );
            },
        }),
        columnHelper.accessor('status', {
            header: () => <div className="px-1 text-center">Trạng thái</div>,
            cell: (info) => {
                const status = info.getValue() as QuestionStatus;
                const colorClass = getStatusColor(status);
                return (
                    <div className="flex justify-center">
                        <div className={cn("inline-flex items-center px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-[0.2em] border shadow-sm", colorClass)}>
                            <div className={cn("size-1 rounded-full mr-2", status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-current')} />
                            {getStatusLabel(status)}
                        </div>
                    </div>
                );
            },
        }),
        columnHelper.accessor('usageCount', {
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="-ml-4 h-10 px-4 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-primary/5 hover:text-primary transition-all group w-full justify-center"
                    >
                        Sử dụng tại
                        <ArrowUpDown className="ml-2 h-3 w-3 opacity-20 group-hover:opacity-100 transition-opacity" />
                    </Button>
                );
            },
            cell: (info) => (
                <div className="flex flex-col items-center">
                    <div className="font-black italic text-[14px] leading-none">{info.getValue() || 0}</div>
                    <div className="text-[7px] font-black uppercase tracking-widest text-muted-foreground/40 mt-1">Số lần dùng</div>
                </div>
            ),
        }),
        columnHelper.display({
            id: 'actions',
            header: () => <div className="text-center">Quản lý</div>,
            cell: ({ row }) => {
                const question = row.original;
                const status = question.status as QuestionStatus;

                return (
                    <div className="flex justify-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="h-10 w-10 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-all data-[state=open]:bg-primary/20"
                                >
                                    <Zap className="h-4 w-4 opacity-40 group-hover:opacity-100" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-[200px] border-border/20 shadow-2xl bg-background/80 backdrop-blur-3xl rounded-lg p-2"
                            >
                                <DropdownMenuItem
                                    onClick={() => onView(question)}
                                    className="rounded-md px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer flex gap-3"
                                >
                                    <Eye className="h-4 w-4 opacity-30" />
                                    <span>Xem Chi tiết</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => onEdit(question)}
                                    className="rounded-md px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer flex gap-3"
                                >
                                    <Pencil className="h-4 w-4 opacity-30" />
                                    <span>Chỉnh sửa Câu hỏi</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-border/20 mx-2" />
                                {status === 'review' && (
                                    <>
                                        <DropdownMenuItem
                                            onClick={() => onApprove(question)}
                                            className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-emerald-500 focus:text-emerald-600 focus:bg-emerald-500/10 cursor-pointer flex gap-3"
                                        >
                                            <CheckCircle className="h-4 w-4 opacity-60" />
                                            <span>Phê duyệt</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => onReject(question)}
                                            className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-rose-500 focus:text-rose-600 focus:bg-rose-500/10 cursor-pointer flex gap-3"
                                        >
                                            <Archive className="h-4 w-4 opacity-60" />
                                            <span>Từ chối Câu hỏi</span>
                                        </DropdownMenuItem>
                                    </>
                                )}
                                {status === 'active' && (
                                    <DropdownMenuItem
                                        onClick={() => onDeactivate(question)}
                                        className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-amber-500 focus:text-amber-600 focus:bg-amber-500/10 cursor-pointer flex gap-3"
                                    >
                                        <XCircle className="h-4 w-4 opacity-60" />
                                        <span>Ngừng hoạt động</span>
                                    </DropdownMenuItem>
                                )}
                                {(status === 'active' || status === 'inactive') && (
                                    <DropdownMenuItem
                                        onClick={() => onSendForReview(question)}
                                        className="rounded-md px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary cursor-pointer flex gap-3"
                                    >
                                        <Clock className="h-4 w-4 opacity-30" />
                                        <span>Gửi để Duyệt</span>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator className="bg-border/20 mx-2" />
                                <DropdownMenuItem
                                    onClick={() => onDelete(question)}
                                    className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer flex gap-3"
                                >
                                    <Trash className="h-4 w-4 opacity-30" />
                                    <span>Xóa Câu hỏi</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
            size: 100,
        }),
    ];
