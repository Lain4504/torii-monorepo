import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { Skeleton } from '@workspace/ui/components/skeleton';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Button } from '@workspace/ui/components/button';
import { MoreVertical, Eye, Pencil, Trash, FileQuestion, Inbox } from 'lucide-react';
import { Badge } from '@workspace/ui/components/badge';
import type { QuestionPoolResponseDTO } from '@workspace/schemas';
import { useQuestionsByPool } from '@/api/services/questions.ts';

interface PoolsTableProps {
    data: QuestionPoolResponseDTO[];
    onView: (pool: QuestionPoolResponseDTO) => void;
    onEdit: (pool: QuestionPoolResponseDTO) => void;
    onDelete: (pool: QuestionPoolResponseDTO) => void;
    isLoading?: boolean;
    page: number;
    limit: number;
}

export function PoolsTable({
    data,
    onView,
    onEdit,
    onDelete,
    isLoading,
    page,
    limit,
}: PoolsTableProps) {
    if (isLoading) {
        return (
            <Table className="min-w-[1000px] border-collapse bg-transparent">
                <TableHeader className="bg-muted/30 border-b border-border">
                    <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="w-12 px-4 h-11">#</TableHead>
                        <TableHead className="px-4 h-11">Tên bộ câu hỏi</TableHead>
                        <TableHead className="px-4 h-11">Mô tả</TableHead>
                        <TableHead className="px-4 h-11">Cấp độ</TableHead>
                        <TableHead className="px-4 h-11">Câu hỏi</TableHead>
                        <TableHead className="w-12 px-4 h-11 text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index} className="border-b border-border/50">
                            <TableCell className="px-4 py-4"><Skeleton className="h-4 w-4" /></TableCell>
                            <TableCell className="px-4 py-4"><Skeleton className="h-4 w-40" /></TableCell>
                            <TableCell className="px-4 py-4"><Skeleton className="h-4 w-60" /></TableCell>
                            <TableCell className="px-4 py-4"><Skeleton className="h-4 w-12" /></TableCell>
                            <TableCell className="px-4 py-4"><Skeleton className="h-4 w-8" /></TableCell>
                            <TableCell className="px-4 py-4 text-right cursor-default"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    }

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <div className="p-4 rounded-full bg-muted/30">
                    <Inbox className="size-10 text-muted-foreground/40" />
                </div>
                <div className="text-center space-y-1">
                    <h3 className="text-lg font-bold text-muted-foreground/60">Không tìm thấy dữ liệu</h3>
                    <p className="text-sm text-muted-foreground/40">Vui lòng điều chỉnh bộ lọc hoặc tạo bộ câu hỏi mới.</p>
                </div>
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead>Bộ câu hỏi</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead className="text-center">Cấp độ</TableHead>
                    <TableHead className="text-center">Số lượng</TableHead>
                    <TableHead className="w-12 text-right">Thao tác</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((pool, index) => (
                    <PoolRow
                        key={pool.id}
                        pool={pool}
                        index={index}
                        page={page}
                        limit={limit}
                        onView={() => onView(pool)}
                        onEdit={() => onEdit(pool)}
                        onDelete={() => onDelete(pool)}
                    />
                ))}
            </TableBody>
        </Table>
    );
}

function PoolRow({
    pool,
    index,
    page,
    limit,
    onView,
    onEdit,
    onDelete,
}: {
    pool: QuestionPoolResponseDTO;
    index: number;
    page: number;
    limit: number;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const { data: questions } = useQuestionsByPool(pool.id);
    const questionCount = questions?.length || 0;

    return (
        <TableRow
            className="group cursor-pointer"
            onClick={onView}
        >
            <TableCell className="text-center font-medium text-muted-foreground">
                {String(((page - 1) * limit + index + 1))}
            </TableCell>
            <TableCell>
                <div className="flex flex-col gap-1">
                    <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {pool.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        ID: {pool.id.slice(0, 8)}...
                    </span>
                </div>
            </TableCell>
            <TableCell className="max-w-xs">
                <p className="text-xs text-muted-foreground line-clamp-1">
                    {pool.description || 'Chưa có mô tả'}
                </p>
            </TableCell>
            <TableCell className="text-center">
                <Badge variant="outline">
                    {pool.jlptLevel || 'GLOBAL'}
                </Badge>
            </TableCell>
            <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                    <FileQuestion className="size-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium">{questionCount}</span>
                </div>
            </TableCell>
            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
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
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onView}>
                            <Eye className="size-4 mr-2" />
                            Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onEdit}>
                            <Pencil className="size-4 mr-2" />
                            Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onDelete} className="text-destructive">
                            <Trash className="size-4 mr-2" />
                            Xóa vĩnh viễn
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}
