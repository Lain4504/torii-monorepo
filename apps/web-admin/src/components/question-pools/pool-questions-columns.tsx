import type { ColumnDef } from '@tanstack/react-table';
import type { QuestionResponseDTO } from '@workspace/schemas';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { MoreVertical, Eye, Pencil, Trash } from 'lucide-react';
import { formatDateTime } from '@/lib/format-utils';

interface GetQuestionsColumnsOptions {
    onView: (question: QuestionResponseDTO) => void;
    onEdit: (question: QuestionResponseDTO) => void;
    onDelete: (question: QuestionResponseDTO) => void;
}

export function getPoolQuestionsColumns({
    onView,
    onEdit,
    onDelete,
}: GetQuestionsColumnsOptions): ColumnDef<QuestionResponseDTO>[] {
    return [
        {
            id: 'index',
            header: '#',
            cell: ({ row }) => (
                <span className="text-center font-medium text-muted-foreground block">
                    {row.index + 1}
                </span>
            ),
            size: 48,
        },
        {
            accessorKey: 'questionText',
            header: 'Câu hỏi & Đáp án',
            cell: ({ row }) => {
                const question = row.original;
                return (
                    <div className="flex flex-col gap-2">
                        <p className="text-sm font-medium line-clamp-2">
                            {question.questionText}
                        </p>
                        <div className="flex flex-wrap gap-1">
                            {Object.entries(question.options || {}).slice(0, 4).map(([key, value]: [string, any], oIdx: number) => (
                                <Badge
                                    key={oIdx}
                                    variant={question.correctAnswer === key ? 'default' : 'outline'}
                                    className="text-[9px] font-normal"
                                >
                                    {key}. {String(value).slice(0, 20)}
                                </Badge>
                            ))}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'jlptLevel',
            header: 'Cấp độ',
            cell: ({ row }) => (
                <div className="text-center">
                    <Badge variant="secondary">
                        {row.original.jlptLevel || 'GLOBAL'}
                    </Badge>
                </div>
            ),
            size: 128,
        },
        {
            accessorKey: 'updatedAt',
            header: 'Thời gian',
            cell: ({ row }) => (
                <span className="text-center text-xs text-muted-foreground block">
                    {formatDateTime(row.original.updatedAt, 'dd/MM/yyyy HH:mm')}
                </span>
            ),
            size: 160,
        },
        {
            id: 'actions',
            header: () => <span className="text-right block">Thao tác</span>,
            cell: ({ row }) => {
                const question = row.original;
                return (
                    <div className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onView(question)}>
                                    <Eye className="size-4 mr-2" />
                                    Xem chi tiết
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onEdit(question)}>
                                    <Pencil className="size-4 mr-2" />
                                    Chỉnh sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onDelete(question)} className="text-destructive">
                                    <Trash className="size-4 mr-2" />
                                    Xóa
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
            size: 48,
        },
    ];
}
