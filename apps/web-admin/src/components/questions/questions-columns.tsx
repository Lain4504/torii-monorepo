import { createColumnHelper } from '@tanstack/react-table';
import type { QuestionResponseDTO, QuestionType, QuestionStatus, QuestionCategory, QuestionDifficultyLevel, QuestionJlptLevel } from '@workspace/schemas';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { ArrowUpDown, MoreHorizontal, Pencil, Trash, Eye, CheckCircle, XCircle, Clock, Archive } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';

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

const getStatusBadge = (status: QuestionStatus) => {
    const variants: Record<QuestionStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
        active: { variant: 'default', className: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' },
        inactive: { variant: 'secondary', className: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20' },
        review: { variant: 'outline', className: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20' },
        archived: { variant: 'destructive', className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
    };
    return variants[status] || variants.active;
};

const getTypeLabel = (type: QuestionType) => {
    const labels: Record<QuestionType, string> = {
        multiple_choice: 'MCQ',
        true_false: 'T/F',
        fill_blank: 'Fill',
        matching: 'Match',
        essay: 'Essay',
    };
    return labels[type] || type;
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
        header: () => <div className="text-center font-semibold text-xs">#</div>,
        cell: ({ row }) => {
            const stt = (page - 1) * limit + row.index + 1;
            return <div className="text-center font-medium text-xs text-muted-foreground">{stt}</div>;
        },
        size: 50,
    }),
    columnHelper.accessor('questionText', {
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4 h-8 text-xs font-semibold hover:bg-transparent hover:text-foreground"
                >
                    Question
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            );
        },
        cell: (info) => (
            <div className="font-medium text-foreground max-w-[300px] truncate" title={info.getValue()}>
                {info.getValue()}
            </div>
        ),
    }),
    columnHelper.accessor('questionType', {
        header: 'Type',
        cell: (info) => (
            <Badge variant="outline" className="font-normal bg-background/50">
                {getTypeLabel(info.getValue() as QuestionType)}
            </Badge>
        ),
    }),
    columnHelper.accessor('category', {
        header: 'Category',
        cell: (info) => {
            const category = info.getValue() as QuestionCategory | null;
            return (
                <Badge variant="outline" className="font-normal bg-background/50">
                    {category ? category.charAt(0).toUpperCase() + category.slice(1) : 'N/A'}
                </Badge>
            );
        },
    }),
    columnHelper.accessor('jlptLevel', {
        header: 'JLPT',
        cell: (info) => {
            const level = info.getValue() as QuestionJlptLevel | null;
            return (
                <Badge variant="outline" className="font-normal bg-background/50">
                    {level || 'N/A'}
                </Badge>
            );
        },
    }),
    columnHelper.accessor('difficulty', {
        header: 'Difficulty',
        cell: (info) => {
            const difficulty = info.getValue() as QuestionDifficultyLevel | null;
            const colors: Record<QuestionDifficultyLevel, string> = {
                easy: 'text-green-600 dark:text-green-400',
                medium: 'text-yellow-600 dark:text-yellow-400',
                hard: 'text-red-600 dark:text-red-400',
            };
            return (
                <Badge variant="outline" className={`font-normal bg-background/50 ${difficulty ? colors[difficulty] : ''}`}>
                    {difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) : 'N/A'}
                </Badge>
            );
        },
    }),
    columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
            const status = info.getValue() as QuestionStatus;
            const badge = getStatusBadge(status);
            return (
                <Badge variant={badge.variant} className={`font-normal ${badge.className}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
            );
        },
    }),
    columnHelper.accessor('usageCount', {
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="-ml-4 h-8 text-xs font-semibold hover:bg-transparent hover:text-foreground"
                >
                    Usage
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            );
        },
        cell: (info) => (
            <div className="text-center font-medium text-xs text-muted-foreground">
                {info.getValue()}
            </div>
        ),
    }),
    columnHelper.display({
        id: 'actions',
        header: () => <div className="text-center font-semibold text-xs">Actions</div>,
        cell: ({ row }) => {
            const question = row.original;
            const status = question.status as QuestionStatus;

            return (
                <div className="flex justify-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onView(question)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(question)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {status === 'review' && (
                                <>
                                    <DropdownMenuItem onClick={() => onApprove(question)}>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onReject(question)}>
                                        <Archive className="mr-2 h-4 w-4" />
                                        Reject
                                    </DropdownMenuItem>
                                </>
                            )}
                            {status === 'active' && (
                                <DropdownMenuItem onClick={() => onDeactivate(question)}>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Deactivate
                                </DropdownMenuItem>
                            )}
                            {(status === 'active' || status === 'inactive') && (
                                <DropdownMenuItem onClick={() => onSendForReview(question)}>
                                    <Clock className="mr-2 h-4 w-4" />
                                    Send for Review
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => onDelete(question)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
        size: 80,
    }),
];

