import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from '@workspace/ui/components/sheet';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Separator } from '@workspace/ui/components/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { toast } from '@workspace/ui/components/sonner';
import {
    HelpCircle,
    Globe,
    Clock,
    BookOpen,
    CheckCircle,
    Target,
    RefreshCcw,
    BrainCircuit,
    BarChart2,
    Layers,
    AlertTriangle,
} from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { usePublishQuiz, useQuizQuestions, type QuizDTO } from '@/lib/api/services/quizzes';

interface QuizDetailSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    quiz: QuizDTO | null;
}

const statusConfig: Record<string, { label: string; className: string }> = {
    draft: { label: 'Nháp', className: 'bg-muted/30 text-muted-foreground border-border' },
    published: { label: 'Đã công bố', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    archived: { label: 'Lưu trữ', className: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
};

const difficultyConfig: Record<string, { label: string; className: string }> = {
    easy: { label: 'Dễ', className: 'text-emerald-500' },
    medium: { label: 'TB', className: 'text-amber-500' },
    hard: { label: 'Khó', className: 'text-rose-500' },
};

const typeConfig: Record<string, string> = {
    multiple_choice: 'Trắc nghiệm',
    true_false: 'Đúng / Sai',
    fill_blank: 'Điền khuyết',
    matching: 'Nối thẻ',
    essay: 'Tự luận',
    listening: 'Nghe hiểu',
};

export function QuizDetailSheet({ open, onOpenChange, quiz }: QuizDetailSheetProps) {
    const publishMutation = usePublishQuiz();
    const { data: frozenQuestions = [], isLoading: loadingFrozen } = useQuizQuestions(
        quiz?.status === 'published' ? (quiz?.id || '') : ''
    );

    const handlePublish = async () => {
        if (!quiz) return;
        try {
            await publishMutation.mutateAsync(quiz.id);
            toast.success('Quiz đã được công bố và câu hỏi đã được đóng băng!');
            onOpenChange(false);
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Công bố quiz thất bại');
        }
    };

    if (!quiz) return null;

    const status = statusConfig[quiz.status] || statusConfig.draft;
    const isPublished = quiz.status === 'published';

    const infoItems = [
        { icon: Clock, label: 'Thời gian', value: quiz.totalTime ? `${quiz.totalTime} phút` : 'Không giới hạn' },
        { icon: BookOpen, label: 'Số câu hỏi', value: quiz.totalQuestions },
        { icon: Target, label: 'Điểm đạt', value: `${quiz.passingScore ?? 60}%` },
        { icon: RefreshCcw, label: 'Số lần làm', value: quiz.maxAttempts },
        { icon: BarChart2, label: 'Cấp độ', value: quiz.jlptLevel || 'N/A' },
        { icon: Layers, label: 'Loại Quiz', value: quiz.quizType || 'lesson' },
    ];

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[800px] flex flex-col">
                <SheetHeader>
                    <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-violet-500/10 shrink-0">
                            <HelpCircle className="size-5 text-violet-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <SheetTitle className="text-lg font-bold truncate">{quiz.title}</SheetTitle>
                                <Badge
                                    variant="outline"
                                    className={cn('text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border', status.className)}
                                >
                                    {isPublished && <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5 inline-block" />}
                                    {status.label}
                                </Badge>
                            </div>
                            <SheetDescription className="text-sm mt-0.5">
                                {quiz.description || 'Không có mô tả'}
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <ScrollArea className="flex-1 min-h-0">
                    <div className="space-y-6 p-6">

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {infoItems.map(({ icon: Icon, label, value }) => (
                                <div key={label} className="flex flex-col gap-1 p-3 rounded-lg bg-muted/30 border border-border/40">
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <Icon className="size-3.5" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
                                    </div>
                                    <span className="text-sm font-bold">{value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Settings */}
                        <div className="flex gap-3">
                            <Badge variant={quiz.shuffleQuestions ? 'default' : 'outline'} className="text-[9px] font-black uppercase tracking-wider">
                                {quiz.shuffleQuestions ? '✓ Xáo trộn câu hỏi' : '✗ Không xáo trộn'}
                            </Badge>
                            <Badge variant={quiz.showExplanation ? 'default' : 'outline'} className="text-[9px] font-black uppercase tracking-wider">
                                {quiz.showExplanation ? '✓ Hiện giải thích' : '✗ Ẩn giải thích'}
                            </Badge>
                        </div>

                        {/* Sections config */}
                        {quiz.sections && quiz.sections.length > 0 && (
                            <>
                                <Separator />
                                <div className="space-y-3">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                        Cấu hình Section ({quiz.sections.length} phần)
                                    </h4>
                                    <div className="space-y-2">
                                        {quiz.sections.map((section, idx) => (
                                            <div key={section.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-muted/20">
                                                <div className="size-7 rounded-md bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-[10px] font-black text-violet-600">
                                                    {idx + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <span className="text-xs font-bold uppercase tracking-widest">{section.type}</span>
                                                    <span className="text-xs text-muted-foreground ml-2">
                                                        {section.questionCount} câu · {section.timeLimit} phút
                                                    </span>
                                                </div>
                                                {section.poolId && (
                                                    <Badge variant="outline" className="text-[8px] font-bold">Pool</Badge>
                                                )}
                                                {section.questionIds && section.questionIds.length > 0 && (
                                                    <Badge variant="secondary" className="text-[8px] font-bold">Manual ({section.questionIds.length})</Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Frozen Questions (published only) */}
                        {isPublished && (
                            <>
                                <Separator />
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                            <CheckCircle className="size-3.5 text-emerald-500" />
                                            Câu hỏi đã đóng băng ({frozenQuestions.length} câu)
                                        </h4>
                                        <Badge variant="outline" className="text-[9px] font-black text-emerald-600 border-emerald-500/30 bg-emerald-500/5">
                                            Frozen
                                        </Badge>
                                    </div>

                                    {loadingFrozen ? (
                                        <div className="space-y-2">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Skeleton key={i} className="h-10 w-full" />
                                            ))}
                                        </div>
                                    ) : frozenQuestions.length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="hover:bg-transparent border-none bg-muted/30">
                                                    <TableHead className="h-9 text-[9px] font-black uppercase tracking-widest text-muted-foreground w-10">#</TableHead>
                                                    <TableHead className="h-9 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Câu hỏi</TableHead>
                                                    <TableHead className="h-9 text-[9px] font-black uppercase tracking-widest text-muted-foreground w-24">Loại</TableHead>
                                                    <TableHead className="h-9 text-[9px] font-black uppercase tracking-widest text-muted-foreground w-16">Độ khó</TableHead>
                                                    <TableHead className="h-9 text-[9px] font-black uppercase tracking-widest text-muted-foreground w-16 text-right">Điểm</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {frozenQuestions.map((qq: any, idx: number) => {
                                                    const diff = difficultyConfig[qq.difficulty] || { label: 'N/A', className: 'text-muted-foreground' };
                                                    return (
                                                        <TableRow key={qq.id || idx} className="border-b border-border/30 hover:bg-muted/20">
                                                            <TableCell className="py-2 text-center text-[9px] font-black italic text-muted-foreground/40">
                                                                L{String(idx + 1).padStart(2, '0')}
                                                            </TableCell>
                                                            <TableCell className="py-2">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-6 h-6 rounded-md bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
                                                                        <BrainCircuit className="size-3 text-primary" />
                                                                    </div>
                                                                    <span className="text-xs font-medium truncate max-w-[280px]">
                                                                        {qq.questionText || qq.question?.questionText || `Câu hỏi #${idx + 1}`}
                                                                    </span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="py-2">
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                                                    {typeConfig[qq.questionType || qq.question?.questionType] || qq.questionType || '—'}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="py-2">
                                                                <span className={cn('text-[9px] font-black', diff.className)}>
                                                                    {diff.label}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="py-2 text-right">
                                                                <span className="text-xs font-bold">{qq.points ?? 1}</span>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="flex items-center gap-2 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-600">
                                            <AlertTriangle className="size-4 shrink-0" />
                                            <p className="text-xs font-medium">
                                                Không có câu hỏi đóng băng. Thử publish lại quiz để tạo snapshot.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Publish warning for draft */}
                        {!isPublished && (
                            <>
                                <Separator />
                                <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                                    <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
                                    <div className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
                                        <p className="font-bold">Quiz chưa được công bố</p>
                                        <p>Khi công bố, hệ thống sẽ tự động chọn và đóng băng {quiz.sections?.reduce((acc, s) => acc + s.questionCount, 0) || quiz.totalQuestions} câu hỏi từ các bộ đề được cấu hình. Học viên sẽ nhận đề thi nhất quán qua tất cả các lần thi.</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </ScrollArea>

                <SheetFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Đóng
                    </Button>
                    {!isPublished && (
                        <Button
                            onClick={handlePublish}
                            disabled={publishMutation.isPending}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <Globe className="size-4 mr-2" />
                            {publishMutation.isPending ? 'Đang công bố...' : 'Công bố & Đóng băng Câu hỏi'}
                        </Button>
                    )}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
