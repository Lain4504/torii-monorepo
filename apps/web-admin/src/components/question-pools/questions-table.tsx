import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@workspace/ui/components/dropdown-menu';
import { MoreHorizontal, Pencil, Trash, Eye, Inbox } from 'lucide-react';
import type { QuestionResponseDTO } from '@workspace/schemas';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface QuestionsTableProps {
    data: QuestionResponseDTO[];
    isLoading?: boolean;
    onEdit: (question: QuestionResponseDTO) => void;
    onDelete: (question: QuestionResponseDTO) => void;
    onView: (question: QuestionResponseDTO) => void;
}

export function QuestionsTable({
    data,
    isLoading,
    onEdit,
    onDelete,
    onView,
}: QuestionsTableProps) {
    if (isLoading) {
        return (
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted-foreground/5 hover:bg-muted-foreground/5">
                        <TableHead className="w-12 h-11 px-6">#</TableHead>
                        <TableHead className="h-11 px-4">Câu hỏi</TableHead>
                        <TableHead className="h-11 px-4 w-32">Cấp độ</TableHead>
                        <TableHead className="h-11 px-4 w-32">Ngày tạo</TableHead>
                        <TableHead className="w-12 h-11 px-6 text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell className="px-6 py-4"><Skeleton className="h-4 w-4" /></TableCell>
                            <TableCell className="px-4 py-4"><Skeleton className="h-4 w-[80%]" /></TableCell>
                            <TableCell className="px-4 py-4"><Skeleton className="h-4 w-12" /></TableCell>
                            <TableCell className="px-4 py-4"><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell className="px-6 py-4 text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    }

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/5 border-2 border-dashed border-border/40 rounded-3xl m-6">
                <div className="p-5 rounded-full bg-muted/10 mb-4">
                    <Inbox className="size-10 text-muted-foreground/20" />
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-bold text-muted-foreground/60 uppercase tracking-tight italic">Kho câu hỏi trống</h3>
                    <p className="text-xs text-muted-foreground/40 mt-1 uppercase tracking-widest font-black">Chưa có câu hỏi nào được thêm vào bộ đề này.</p>
                </div>
            </div>
        );
    }

    return (
        <Table>
            <TableHeader className="bg-muted/30 border-b border-border">
                <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="h-12 text-xs font-bold text-muted-foreground px-6 w-12 uppercase tracking-wider">#</TableHead>
                    <TableHead className="h-12 text-xs font-bold text-muted-foreground px-4 uppercase tracking-wider">Câu hỏi & Đáp án</TableHead>
                    <TableHead className="h-12 text-xs font-bold text-muted-foreground px-4 w-32 uppercase tracking-wider">Cấp độ</TableHead>
                    <TableHead className="h-12 text-xs font-bold text-muted-foreground px-4 w-40 uppercase tracking-wider">Thời gian cập nhật</TableHead>
                    <TableHead className="text-right h-12 text-xs font-bold text-muted-foreground px-6 w-32 uppercase tracking-wider">Thao tác</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((question, idx) => (
                    <TableRow key={question.id} className="group border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <TableCell className="px-6 py-4 tabular-nums text-xs text-muted-foreground/40 font-mono italic">
                            {String(idx + 1).padStart(2, '0')}
                        </TableCell>
                        <TableCell className="px-4 py-4">
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-foreground line-clamp-2 leading-relaxed tracking-tight group-hover:text-primary transition-colors">
                                    {question.questionText}
                                </p>
                                <div className="flex flex-wrap gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                    {Object.entries(question.options || {}).slice(0, 4).map(([key, value]: [string, any], oIdx: number) => (
                                        <span
                                            key={oIdx}
                                            className={`text-[9px] px-1.5 py-0.5 rounded border ${(question.correctAnswer === key) ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-muted/30 border-border/10 text-muted-foreground/50'}`}
                                        >
                                            {key}. {String(value).slice(0, 20)}...
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-lg border-primary/20 bg-primary/5 text-primary">
                                {question.jlptLevel || 'GLOBAL'}
                            </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                            <span className="text-xs text-muted-foreground tabular-nums">
                                {format(new Date(question.updatedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                            </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="size-8 rounded-lg hover:bg-muted opacity-40 group-hover:opacity-100 transition-opacity">
                                        <MoreHorizontal className="size-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-xl border-border shadow-xl min-w-[160px] p-1.5">
                                    <DropdownMenuItem onClick={() => onView(question)} className="rounded-lg gap-2 py-2 cursor-pointer">
                                        <Eye className="size-3.5 opacity-40" />
                                        <span className="font-bold text-xs uppercase tracking-wider">Xem chi tiết</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onEdit(question)} className="rounded-lg gap-2 py-2 cursor-pointer">
                                        <Pencil className="size-3.5 opacity-40" />
                                        <span className="font-bold text-xs uppercase tracking-wider">Chỉnh sửa</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onDelete(question)} className="rounded-lg text-destructive focus:bg-destructive/10 gap-2 py-2 cursor-pointer">
                                        <Trash className="size-3.5 opacity-40" />
                                        <span className="font-bold text-xs uppercase tracking-wider">Xóa</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
