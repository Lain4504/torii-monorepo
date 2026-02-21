import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@workspace/ui/components/sheet';
import { Badge } from '@workspace/ui/components/badge';
import { Label } from '@workspace/ui/components/label';
import type { QuestionResponseDTO } from '@workspace/schemas';
import { QuestionStatus, QuestionDifficultyLevel, QuestionType, QuestionCategory } from '@workspace/schemas';
import { Button } from '@workspace/ui/components/button';
import { FileText, Tag, CheckCircle2, BrainCircuit, Layers, Hash, Calendar, X, AlignLeft, Headphones } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';

interface ViewQuestionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    question: QuestionResponseDTO | null;
}

export function ViewQuestionDialog({
    open,
    onOpenChange,
    question,
}: ViewQuestionDialogProps) {
    if (!question) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent showCloseButton={false} className="w-full sm:w-[800px] !max-w-[800px] border-l border-border/50 bg-background p-0 h-full flex flex-col shadow-2xl">
                <SheetHeader className="p-6 border-b border-border bg-muted/5 flex-shrink-0">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <SheetTitle>
                                Chi tiết câu hỏi
                            </SheetTitle>
                            <SheetDescription>
                                <span className="px-1.5 py-0.5 bg-muted rounded font-mono text-[10px]">ID: {question.id}</span>
                            </SheetDescription>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onOpenChange(false)}
                            className="rounded-lg h-9 w-9 hover:bg-muted/50"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Status Bar */}
                    <div className="grid grid-cols-3 gap-4 bg-muted/20 p-4 rounded-xl border border-border/50">
                        <div className="space-y-1.5 border-r border-border/50">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Trạng thái</span>
                            <div className="flex">
                                <Badge
                                    className={cn(
                                        "rounded-md text-[10px] font-bold px-2 py-0 border shadow-none",
                                        question.status === QuestionStatus.ACTIVE
                                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                            : "bg-muted text-muted-foreground border-border"
                                    )}
                                >
                                    {question.status === QuestionStatus.ACTIVE ? "Đang hoạt động" : question.status}
                                </Badge>
                            </div>
                        </div>
                        <div className="space-y-1.5 border-r border-border/50 pl-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Lượt sử dụng</span>
                            <div className="flex items-center gap-1.5">
                                <Hash className="h-3.5 w-3.5 text-primary/70" />
                                <span className="text-sm font-bold">{question.usageCount} <span className="text-xs font-normal text-muted-foreground">lần</span></span>
                            </div>
                        </div>
                        <div className="space-y-1.5 pl-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Ngày tạo</span>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-primary/70" />
                                <span className="text-sm font-bold">{new Date(question.createdAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Question Text */}
                    <div className="space-y-3">
                        <Label className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Nội dung câu hỏi
                        </Label>
                        <div className="text-base font-medium text-foreground p-5 rounded-xl bg-muted/5 border border-border/80 leading-relaxed">
                            {question.questionText}
                        </div>
                    </div>

                    {/* Audio Player */}
                    {((question.category === QuestionCategory.LISTENING || question.questionType === QuestionType.LISTENING) && question.metadata?.audioUrl) && (
                        <div className="space-y-3">
                            <Label className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                                <Headphones className="h-4 w-4" />
                                Tệp âm thanh bài nghe
                            </Label>
                            <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                                <audio controls className="w-full h-10 outline-none">
                                    <source src={question.metadata.audioUrl} type="audio/mpeg" />
                                    Trình duyệt không hỗ trợ nghe audio.
                                </audio>
                            </div>
                        </div>
                    )}

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                                <Tag className="h-4 w-4" />
                                Phân loại & Danh mục
                            </Label>
                            <div className="space-y-2 p-4 rounded-xl bg-muted/5 border border-border/50">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Loại câu hỏi</span>
                                    <span className="text-xs font-bold uppercase">{question.questionType.replace('_', ' ')}</span>
                                </div>
                                <div className="h-px bg-border/50 w-full" />
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Chuyên môn</span>
                                    <span className="text-xs font-bold uppercase">{question.category || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                                <Layers className="h-4 w-4" />
                                Đặc tính kỹ thuật
                            </Label>
                            <div className="space-y-2 p-4 rounded-xl bg-muted/5 border border-border/50">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Cấp độ JLPT</span>
                                    <Badge variant="outline" className="text-[10px] font-bold bg-primary/5 text-primary border-primary/20">
                                        {question.jlptLevel || 'N/A'}
                                    </Badge>
                                </div>
                                <div className="h-px bg-border/50 w-full" />
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Độ khó</span>
                                    <Badge variant="outline" className={cn(
                                        "text-[10px] font-bold border-none",
                                        question.difficulty === QuestionDifficultyLevel.HARD ? "bg-rose-500/10 text-rose-600" :
                                            question.difficulty === QuestionDifficultyLevel.MEDIUM ? "bg-amber-500/10 text-amber-600" :
                                                "bg-emerald-500/10 text-emerald-600"
                                    )}>
                                        {question.difficulty === QuestionDifficultyLevel.HARD ? "Khó" :
                                            question.difficulty === QuestionDifficultyLevel.MEDIUM ? "Trung bình" : "Dễ"}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Options */}
                    {question.options && Object.keys(question.options).length > 0 && (
                        <div className="space-y-3">
                            <Label className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                                <AlignLeft className="h-4 w-4" />
                                Các phương án trả lời
                            </Label>
                            <div className="grid grid-cols-1 gap-2.5">
                                {Object.entries(question.options).map(([key, value]) => {
                                    const isCorrect = key === question.correctAnswer;
                                    return (
                                        <div
                                            key={key}
                                            className={cn(
                                                "flex items-center gap-3 p-3.5 rounded-xl border transition-all",
                                                isCorrect
                                                    ? "bg-emerald-500/5 border-emerald-500/40"
                                                    : "bg-muted/5 border-border/50"
                                            )}
                                        >
                                            <div className={cn(
                                                "h-8 w-8 flex items-center justify-center rounded-lg font-bold text-xs shrink-0",
                                                isCorrect ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground border border-border"
                                            )}>
                                                {key}
                                            </div>
                                            <div className="flex-1 text-sm font-medium">{value}</div>
                                            {isCorrect && (
                                                <Badge className="bg-emerald-500 text-[9px] font-bold py-0.5 border-none shadow-none">ĐÁP ÁN ĐÚNG</Badge>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Correct Answer (if not redundant with options) */}
                    {(!question.options || Object.keys(question.options).length === 0) && (
                        <div className="space-y-3">
                            <Label className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                Đáp án đúng
                            </Label>
                            <div className="text-lg font-bold text-emerald-600 p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                                {question.correctAnswer || 'N/A'}
                            </div>
                        </div>
                    )}

                    {/* Explanation */}
                    {question.explanation && (
                        <div className="space-y-3 pb-6">
                            <Label className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                                <BrainCircuit className="h-4 w-4" />
                                Giải thích đáp án
                            </Label>
                            <div className="text-sm font-medium text-muted-foreground/80 leading-relaxed whitespace-pre-wrap p-5 rounded-xl bg-muted/5 border border-border/80 italic">
                                "{question.explanation}"
                            </div>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
