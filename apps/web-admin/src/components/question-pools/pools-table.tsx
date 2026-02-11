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
import type { QuestionPoolResponseDTO } from '@workspace/schemas';
import { useQuestionsByPool } from '@/api/services/questions.ts';
import { cn } from '@workspace/ui/lib/utils';

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
                        <TableHead className="w-12 px-4 h-11 border-r border-border/30">#</TableHead>
                        <TableHead className="px-4 h-11 border-r border-border/30">Tên bộ câu hỏi</TableHead>
                        <TableHead className="px-4 h-11 border-r border-border/30">Mô tả</TableHead>
                        <TableHead className="px-4 h-11 border-r border-border/30">Cấp độ</TableHead>
                        <TableHead className="px-4 h-11 border-r border-border/30">Câu hỏi</TableHead>
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
        <Table className="min-w-[1000px] border-collapse bg-transparent">
            <TableHeader className="bg-muted/30 border-b border-border">
                <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="w-12 px-4 h-11 text-xs font-semibold text-muted-foreground border-r border-border/30">#</TableHead>
                    <TableHead className="px-4 h-11 text-xs font-semibold text-muted-foreground border-r border-border/30">Bộ câu hỏi</TableHead>
                    <TableHead className="px-4 h-11 text-xs font-semibold text-muted-foreground border-r border-border/30">Mô tả tóm tắt</TableHead>
                    <TableHead className="px-4 h-11 text-xs font-semibold text-muted-foreground border-r border-border/30">Cấp độ</TableHead>
                    <TableHead className="px-4 h-11 text-xs font-semibold text-muted-foreground border-r border-border/30">Số lượng</TableHead>
                    <TableHead className="w-12 px-4 h-11 text-right text-xs font-semibold text-muted-foreground">Thao tác</TableHead>
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
            className="group cursor-pointer hover:bg-muted/30 transition-colors border-b border-border/50"
            onClick={onView}
        >
            <TableCell className="px-4 py-4 text-xs font-medium text-muted-foreground/60 tabular-nums">
                {String(((page - 1) * limit + index + 1)).padStart(2, '0')}
            </TableCell>
            <TableCell className="px-4 py-4">
                <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                        {pool.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60 font-mono tracking-tight">
                        ID: {pool.id}
                    </span>
                </div>
            </TableCell>
            <TableCell className="px-4 py-4 max-w-xs">
                <p className="text-xs text-muted-foreground line-clamp-1">
                    {pool.description || 'Chưa có mô tả chi tiết'}
                </p>
            </TableCell>
            <TableCell className="px-4 py-4">
                <Badge variant="outline" className="rounded-md text-[10px] font-bold bg-primary/5 text-primary border-primary/20">
                    {pool.jlptLevel || 'GLOBAL'}
                </Badge>
            </TableCell>
            <TableCell className="px-4 py-4">
                <div className="flex items-center gap-2">
                    <FileQuestion className="size-3.5 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                    <span className="text-xs font-bold text-foreground">{questionCount}</span>
                </div>
            </TableCell>
            <TableCell className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-muted"
                        >
                            <MoreVertical className="h-4 w-4 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 p-1 rounded-xl">
                        <DropdownMenuItem onClick={onView} className="rounded-lg gap-2 cursor-pointer py-2">
                            <Eye className="size-4 opacity-50" />
                            <span className="text-sm">Xem chi tiết</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onEdit} className="rounded-lg gap-2 cursor-pointer py-2">
                            <Pencil className="size-4 opacity-50" />
                            <span className="text-sm">Chỉnh sửa</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onDelete} className="rounded-lg gap-2 cursor-pointer py-2 text-destructive focus:text-destructive focus:bg-destructive/5">
                            <Trash className="size-4 opacity-50" />
                            <span className="text-sm font-medium">Xóa vĩnh viễn</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}

function Badge({ children, variant, className }: { children: React.ReactNode, variant?: string, className?: string }) {
    return (
        <span className={cn(
            "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border",
            variant === "outline" ? "bg-transparent" : "bg-primary text-primary-foreground",
            className
        )}>
            {children}
        </span>
    );
}
