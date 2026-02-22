import type { ColumnDef } from '@tanstack/react-table';
import type { QuestionPoolResponseDTO } from '@workspace/schemas';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { MoreVertical, Eye, Pencil, Trash, FileQuestion } from 'lucide-react';

interface GetPoolsColumnsOptions {
    onView: (pool: QuestionPoolResponseDTO) => void;
    onEdit: (pool: QuestionPoolResponseDTO) => void;
    onDelete: (pool: QuestionPoolResponseDTO) => void;
    page: number;
    limit: number;
}

export function getPoolsColumns({
    onView,
    onEdit,
    onDelete,
    page,
    limit,
}: GetPoolsColumnsOptions): ColumnDef<QuestionPoolResponseDTO>[] {
    return [
        {
            id: 'index',
            header: '#',
            cell: ({ row }) => (
                <span className="text-center font-medium text-muted-foreground block">
                    {(page - 1) * limit + row.index + 1}
                </span>
            ),
            size: 48,
        },
        {
            accessorKey: 'name',
            header: 'Bộ câu hỏi',
            cell: ({ row }) => {
                const pool = row.original;
                return (
                    <div className="flex flex-col gap-1">
                        <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {pool.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            ID: {pool.id.slice(0, 8)}...
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'description',
            header: 'Mô tả',
            cell: ({ row }) => (
                <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                    {row.original.description || 'Chưa có mô tả'}
                </p>
            ),
        },
        {
            accessorKey: 'jlptLevel',
            header: 'Cấp độ',
            cell: ({ row }) => (
                <div className="text-center">
                    <Badge variant="outline">
                        {row.original.jlptLevel || 'GLOBAL'}
                    </Badge>
                </div>
            ),
            size: 96,
        },
        {
            id: 'questionCount',
            header: () => <span className="text-center block">Số lượng</span>,
            cell: ({ row }) => (
                <div className="flex items-center justify-center gap-2">
                    <FileQuestion className="size-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium">—</span>
                </div>
            ),
            size: 96,
        },
        {
            id: 'actions',
            header: () => <span className="text-right block">Thao tác</span>,
            cell: ({ row }) => {
                const pool = row.original;
                return (
                    <div className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onView(pool)}>
                                    <Eye className="size-4 mr-2" />
                                    Xem chi tiết
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onEdit(pool)}>
                                    <Pencil className="size-4 mr-2" />
                                    Chỉnh sửa
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => onDelete(pool)} className="text-destructive">
                                    <Trash className="size-4 mr-2" />
                                    Xóa vĩnh viễn
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
