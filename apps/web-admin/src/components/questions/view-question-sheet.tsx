import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from '@workspace/ui/components/sheet';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import type { QuestionResponseDTO } from '@workspace/schemas';
import { QuestionStatus, QuestionDifficultyLevel, QuestionType, QuestionCategory } from '@workspace/schemas';
import { FileText, Tag, CheckCircle2, BrainCircuit, Layers, Hash, Calendar, AlignLeft, Headphones } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@workspace/ui/components/item';
import { Separator } from '@workspace/ui/components/separator';

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
            <SheetContent className="!w-full sm:!max-w-[800px] flex flex-col">
                <SheetHeader>
                    <SheetTitle>Chi Tiết Câu Hỏi</SheetTitle>
                    <SheetDescription>
                        Mã hệ thống: <span className="font-mono text-primary/60">{question.id}</span>
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1 min-h-0">
                    <div className="p-6 space-y-6">
                        {/* Status Bar */}
                        <div className="grid grid-cols-3 gap-4">
                            <Item variant="outline" className="p-3">
                                <ItemContent>
                                    <ItemTitle className="text-[10px] uppercase tracking-wider text-muted-foreground/80">Trạng thái</ItemTitle>
                                    <ItemDescription>
                                        <Badge
                                            variant={question.status === QuestionStatus.ACTIVE ? "default" : "secondary"}
                                            className="rounded-md text-[10px] font-bold px-2 py-0 border shadow-none"
                                        >
                                            {question.status === QuestionStatus.ACTIVE ? "Đang hoạt động" : question.status}
                                        </Badge>
                                    </ItemDescription>
                                </ItemContent>
                            </Item>
                            <Item variant="outline" className="p-3">
                                <ItemContent>
                                    <ItemTitle className="text-[10px] uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
                                        <Hash className="size-3" /> Lượt sử dụng
                                    </ItemTitle>
                                    <ItemDescription className="text-sm font-bold">{question.usageCount} <span className="text-xs font-normal text-muted-foreground">lần</span></ItemDescription>
                                </ItemContent>
                            </Item>
                            <Item variant="outline" className="p-3">
                                <ItemContent>
                                    <ItemTitle className="text-[10px] uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
                                        <Calendar className="size-3" /> Ngày tạo
                                    </ItemTitle>
                                    <ItemDescription className="text-sm font-bold">{new Date(question.createdAt).toLocaleDateString('vi-VN')}</ItemDescription>
                                </ItemContent>
                            </Item>
                        </div>

                        {/* Question Text */}
                        <Item variant="outline">
                            <ItemMedia><FileText className="size-4" /></ItemMedia>
                            <ItemContent>
                                <ItemTitle>Nội dung câu hỏi</ItemTitle>
                                <ItemDescription className="text-base font-medium text-foreground leading-relaxed pt-1">
                                    {question.questionText}
                                </ItemDescription>
                            </ItemContent>
                        </Item>


                        {/* Audio Player */}
                        {((question.category === QuestionCategory.LISTENING || question.questionType === QuestionType.LISTENING) && question.metadata?.audioUrl) && (
                            <Item variant="outline">
                                <ItemMedia><Headphones className="size-4" /></ItemMedia>
                                <ItemContent>
                                    <ItemTitle>Tệp âm thanh bài nghe</ItemTitle>
                                    <div className="pt-2">
                                        <audio controls className="w-full h-10 outline-none">
                                            <source src={question.metadata.audioUrl} type="audio/mpeg" />
                                            Trình duyệt không hỗ trợ nghe audio.
                                        </audio>
                                    </div>
                                </ItemContent>
                            </Item>
                        )}

                        <Separator />

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <Item variant="outline">
                                <ItemMedia><Tag className="size-4" /></ItemMedia>
                                <ItemContent>
                                    <ItemTitle>Phân loại & Danh mục</ItemTitle>
                                    <div className="space-y-2 pt-2 text-xs">
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Loại câu hỏi</span>
                                            <span className="font-bold uppercase">{question.questionType.replace('_', ' ')}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Chuyên môn</span>
                                            <span className="font-bold uppercase">{question.category || 'N/A'}</span>
                                        </div>
                                    </div>
                                </ItemContent>
                            </Item>

                            <Item variant="outline">
                                <ItemMedia><Layers className="size-4" /></ItemMedia>
                                <ItemContent>
                                    <ItemTitle>Đặc tính kỹ thuật</ItemTitle>
                                    <div className="space-y-2 pt-2 text-xs">
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Cấp độ JLPT</span>
                                            <Badge variant="secondary">
                                                {question.jlptLevel || 'N/A'}
                                            </Badge>
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Độ khó</span>
                                            <Badge
                                                variant={question.difficulty === QuestionDifficultyLevel.HARD ? "destructive" : "outline"}
                                                className="text-[10px] font-bold border-none"
                                            >
                                                {question.difficulty === QuestionDifficultyLevel.HARD ? "Khó" :
                                                    question.difficulty === QuestionDifficultyLevel.MEDIUM ? "Trung bình" : "Dễ"}
                                            </Badge>
                                        </div>
                                    </div>
                                </ItemContent>
                            </Item>
                        </div>

                        {/* Options */}
                        {question.options && Object.keys(question.options).length > 0 && (
                            <Item variant="outline">
                                <ItemMedia><AlignLeft className="size-4" /></ItemMedia>
                                <ItemContent>
                                    <ItemTitle>Các phương án trả lời</ItemTitle>
                                    <div className="grid grid-cols-1 gap-2.5 pt-2">
                                        {Object.entries(question.options).map(([key, value]) => {
                                            const isCorrect = key === question.correctAnswer;
                                            return (
                                                <Item key={key} variant={isCorrect ? 'default' : 'outline'} className={cn(isCorrect ? "bg-emerald-500/5 border-emerald-500/30" : "")}>
                                                    <ItemMedia>
                                                        <div className={cn(
                                                            "h-8 w-8 flex items-center justify-center rounded-lg font-bold text-xs shrink-0",
                                                            isCorrect ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground border border-border"
                                                        )}>
                                                            {key}
                                                        </div>
                                                    </ItemMedia>
                                                    <ItemContent>
                                                        <ItemDescription className="flex items-center justify-between gap-2">
                                                            <span>{value}</span>
                                                            {isCorrect && (
                                                                <Badge variant="default" className="text-[9px] px-1.5 py-0 h-5">ĐÚNG</Badge>
                                                            )}
                                                        </ItemDescription>
                                                    </ItemContent>
                                                </Item>
                                            );
                                        })}
                                    </div>
                                </ItemContent>
                            </Item>
                        )}

                        {/* Correct Answer */}
                        {(!question.options || Object.keys(question.options).length === 0) && (
                            <Item variant="outline">
                                <ItemMedia><CheckCircle2 className="size-4" /></ItemMedia>
                                <ItemContent>
                                    <ItemTitle>Đáp án đúng</ItemTitle>
                                    <ItemDescription className="text-lg font-bold text-emerald-600 pt-1">
                                        {question.correctAnswer || 'N/A'}
                                    </ItemDescription>
                                </ItemContent>
                            </Item>
                        )}

                        {/* Explanation */}
                        {question.explanation && (
                            <Item variant="outline">
                                <ItemMedia><BrainCircuit className="size-4" /></ItemMedia>
                                <ItemContent>
                                    <ItemTitle>Giải thích đáp án</ItemTitle>
                                    <ItemDescription className="text-sm font-medium text-muted-foreground/80 leading-relaxed whitespace-pre-wrap pt-1 italic">
                                        "{question.explanation}"
                                    </ItemDescription>
                                </ItemContent>
                            </Item>
                        )}
                    </div>
                </ScrollArea>

                <SheetFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Đóng
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
