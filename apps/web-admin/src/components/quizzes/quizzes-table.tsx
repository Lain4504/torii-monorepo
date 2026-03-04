import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Empty, EmptyContent, EmptyMedia, EmptyTitle, EmptyDescription } from '@workspace/ui/components/empty';
import { HelpCircle, MoreVertical, Edit, Trash, Globe, FileText, BarChart2 } from 'lucide-react';
import type { QuizDTO } from '@/lib/api/services/quizzes';

interface QuizzesTableProps {
    data: QuizDTO[];
    isLoading?: boolean;
    onView?: (quiz: QuizDTO) => void;
    onEdit: (quiz: QuizDTO) => void;
    onDelete: (quiz: QuizDTO) => void;
    onPublish: (quiz: QuizDTO) => void;
    onViewAttempts?: (quiz: QuizDTO) => void;
}

export function QuizzesTable({
    data,
    isLoading,
    onView,
    onEdit,
    onDelete,
    onPublish,
    onViewAttempts,
}: QuizzesTableProps) {
    if (isLoading) {
        return (
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4">Tiêu đề</TableHead>
                        <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 w-24">Câu hỏi</TableHead>
                        <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 w-24">Thời gian</TableHead>
                        <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 w-24">Trạng thái</TableHead>
                        <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 w-24">Bài học</TableHead>
                        <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 w-32 text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <TableRow key={i}>
                            {Array.from({ length: 6 }).map((_, ci) => (
                                <TableCell key={ci}><Skeleton className="h-4 w-full" /></TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    }

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-16 text-center gap-4">
                <Empty>
                    <EmptyMedia>
                        <HelpCircle className="size-8 text-muted-foreground" />
                    </EmptyMedia>
                    <EmptyContent>
                        <EmptyTitle>Chưa có quiz nào</EmptyTitle>
                        <EmptyDescription>Tạo quiz đầu tiên cho khóa học này để kiểm tra kiến thức học viên.</EmptyDescription>
                    </EmptyContent>
                </Empty>
            </div>
        );
    }

    const statusVariant = (status: string) => {
        switch (status) {
            case 'published': return 'default';
            case 'draft': return 'outline';
            case 'archived': return 'secondary';
            default: return 'outline';
        }
    };

    const statusLabel = (status: string) => {
        switch (status) {
            case 'published': return 'Đã công bố';
            case 'draft': return 'Nháp';
            case 'archived': return 'Lưu trữ';
            default: return status;
        }
    };

    return (
        <Table>
            <TableHeader className="bg-muted/30 border-b border-border">
                <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4">Tiêu đề Quiz</TableHead>
                    <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 w-28">Câu hỏi</TableHead>
                    <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 w-28">Thời gian</TableHead>
                    <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 w-28">Điểm đạt</TableHead>
                    <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 w-32">Trạng thái</TableHead>
                    <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 w-28">Gắn bài học</TableHead>
                    <TableHead className="h-11 text-xs font-semibold text-muted-foreground px-4 w-32 text-right">Thao tác</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((quiz) => (
                    <TableRow key={quiz.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <TableCell className="px-4">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-violet-500/10">
                                    <HelpCircle className="size-3.5 text-violet-500" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">{quiz.title}</p>
                                    {quiz.description && (
                                        <p className="text-xs text-muted-foreground line-clamp-1">{quiz.description}</p>
                                    )}
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="px-4">
                            <span className="text-sm font-medium">{quiz.totalQuestions}</span>
                        </TableCell>
                        <TableCell className="px-4">
                            <span className="text-sm">{quiz.totalTime ? `${quiz.totalTime} phút` : '∞'}</span>
                        </TableCell>
                        <TableCell className="px-4">
                            <span className="text-sm">{quiz.passingScore ?? 60}%</span>
                        </TableCell>
                        <TableCell className="px-4">
                            <Badge
                                variant={statusVariant(quiz.status)}
                                className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg"
                            >
                                {statusLabel(quiz.status)}
                            </Badge>
                        </TableCell>
                        <TableCell className="px-4">
                            {quiz.lessonId ? (
                                <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg">
                                    <FileText className="size-3 mr-1" /> Có bài học
                                </Badge>
                            ) : (
                                <span className="text-xs text-muted-foreground">Chưa gắn</span>
                            )}
                        </TableCell>
                        <TableCell className="px-4 text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreVertical className="size-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-xl border-border/40 shadow-xl min-w-[160px] p-1.5">
                                    {onView && (
                                        <DropdownMenuItem onClick={() => onView(quiz)} className="rounded-lg gap-2 py-2">
                                            <HelpCircle className="size-3.5" />
                                            <span className="font-bold text-xs uppercase">Xem chi tiết</span>
                                        </DropdownMenuItem>
                                    )}
                                    {quiz.status !== 'published' && (
                                        <DropdownMenuItem onClick={() => onPublish(quiz)} className="rounded-lg gap-2 py-2 text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50">
                                            <Globe className="size-3.5" />
                                            <span className="font-bold text-xs uppercase">Công bố</span>
                                        </DropdownMenuItem>
                                    )}
                                    {onViewAttempts && (
                                        <DropdownMenuItem onClick={() => onViewAttempts(quiz)} className="rounded-lg gap-2 py-2">
                                            <BarChart2 className="size-3.5" />
                                            <span className="font-bold text-xs uppercase">Kết quả</span>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onClick={() => onEdit(quiz)} className="rounded-lg gap-2 py-2">
                                        <Edit className="size-3.5" />
                                        <span className="font-bold text-xs uppercase">Sửa</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => onDelete(quiz)}
                                        className="rounded-lg text-destructive focus:bg-destructive/10 gap-2 py-2"
                                    >
                                        <Trash className="size-3.5" />
                                        <span className="font-bold text-xs uppercase">Xóa</span>
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
