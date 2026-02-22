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
import { MoreVertical, Pencil, Trash, Eye, Inbox } from 'lucide-react';
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
            <TableHeader>
                <TableRow>
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead>Câu hỏi & Đáp án</TableHead>
                    <TableHead className="w-32 text-center">Cấp độ</TableHead>
                    <TableHead className="w-40 text-center">Thời gian</TableHead>
                    <TableHead className="w-12 text-right">Thao tác</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((question, idx) => (
                    <TableRow key={question.id} className="group cursor-pointer" onClick={() => onView(question)}>
                        <TableCell className="text-center font-medium text-muted-foreground">
                            {idx + 1}
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-col gap-2">
                                <p className="text-sm font-medium line-clamp-2">
                                    {question.questionText}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {Object.entries(question.options || {}).slice(0, 4).map(([key, value]: [string, any], oIdx: number) => (
                                        <Badge
                                            key={oIdx}
                                            variant={question.correctAnswer === key ? "default" : "outline"}
                                            className="text-[9px] font-normal"
                                        >
                                            {key}. {String(value).slice(0, 20)}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="text-center">
                            <Badge variant="secondary">
                                {question.jlptLevel || 'GLOBAL'}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-center text-xs text-muted-foreground">
                            {format(new Date(question.updatedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
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
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
