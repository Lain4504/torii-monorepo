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
import type { QuestionResponseDTO } from '@workspace/schemas';
import { QuestionDifficultyLevel, QuestionType } from '@workspace/schemas';
import {
    FileText,
    CheckCircle2,
    BrainCircuit,
    AlignLeft,
    Headphones,
    MessageSquareQuote
} from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { formatDate } from '@/lib/format-utils';
import {
    Item,
    ItemContent,
    ItemTitle,
    ItemDescription,
} from '@workspace/ui/components/item';

interface QuestionDetailSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    question: QuestionResponseDTO | null;
}

export function QuestionDetailSheet({
    open,
    onOpenChange,
    question,
}: QuestionDetailSheetProps) {
    if (!question) return null;

    const renderQuestionContent = () => {
        switch (question.questionType) {
            case QuestionType.MULTIPLE_CHOICE:
            case QuestionType.LISTENING:
                return <MultipleChoiceContent question={question} />;
            case QuestionType.FILL_BLANK:
                return <FillBlankContent question={question} />;
            case QuestionType.TRUE_FALSE:
                return <TrueFalseContent question={question} />;
            case QuestionType.ESSAY:
                return <EssayContent question={question} />;
            default:
                return <DefaultQuestionContent question={question} />;
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="!w-full sm:!max-w-[800px] flex flex-col">
                <SheetHeader>
                    <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">
                            JLPT {question.jlptLevel || 'GLOBAL'}
                        </Badge>
                        <Badge
                            variant={
                                question.difficulty === QuestionDifficultyLevel.HARD ? 'destructive' :
                                    question.difficulty === QuestionDifficultyLevel.MEDIUM ? 'secondary' : 'outline'
                            }
                        >
                            {question.difficulty === QuestionDifficultyLevel.HARD ? 'Khó' :
                                question.difficulty === QuestionDifficultyLevel.MEDIUM ? 'Trung bình' : 'Dễ'}
                        </Badge>
                    </div>
                    <SheetTitle>Chi Tiết Câu Hỏi</SheetTitle>
                    <SheetDescription>
                        Mã số: {question.id.substring(0, 12)}... • {formatDate(question.createdAt)}
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1 min-h-0">
                    <div className="space-y-10 p-6">
                        {/* Question Section */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 text-primary">
                                <FileText className="size-4" />
                                <h3 className="text-sm font-bold uppercase tracking-wider">Nội dung câu hỏi</h3>
                            </div>
                            <Item variant="outline">
                                <ItemContent>
                                    <ItemTitle className="text-muted-foreground">Nội dung câu hỏi</ItemTitle>
                                    <ItemDescription className="text-base font-medium text-foreground leading-relaxed italic">
                                        "{question.questionText}"
                                    </ItemDescription>
                                </ItemContent>
                            </Item>
                        </section>

                        {/* Specific Content */}
                        {renderQuestionContent()}

                        {/* Explanation */}
                        {question.explanation && (
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-amber-600">
                                    <BrainCircuit className="size-4" />
                                    <h3 className="text-sm font-bold uppercase tracking-wider">Giải thích học thuật</h3>
                                </div>
                                <Alert>
                                    <BrainCircuit className="size-4" />
                                    <AlertDescription className="leading-relaxed italic">
                                        {question.explanation}
                                    </AlertDescription>
                                </Alert>
                            </section>
                        )}
                    </div>
                </ScrollArea>

                <SheetFooter className="border-t">
                    <div className="w-full flex items-center justify-between">
                        <div className="flex gap-4 items-center">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Loại</span>
                                <span className="text-xs font-bold text-foreground">{question.questionType}</span>
                            </div>
                            <div className="w-px h-6 bg-border" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Chuyên môn</span>
                                <span className="text-xs font-bold text-foreground">{question.category || 'Chung'}</span>
                            </div>
                        </div>
                        <Badge variant="secondary">
                            Sẵn sàng sử dụng
                        </Badge>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

// Sub-components for specialized UI

import { QuizOption } from '@workspace/ui/components/custom/quiz';

function MultipleChoiceContent({ question }: { question: QuestionResponseDTO }) {
    return (
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-2 text-primary">
                <AlignLeft className="size-4" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Các phương án lựa chọn</h3>
            </div>

            {question.questionType === QuestionType.LISTENING && question.metadata?.audioUrl && (
                <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-4">
                    <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <Headphones className="size-5 text-primary" />
                    </div>
                    <audio controls className="w-full h-8 outline-none">
                        <source src={question.metadata.audioUrl} type="audio/mpeg" />
                    </audio>
                </div>
            )}

            <div className="grid grid-cols-1 gap-3">
                {Object.entries(question.options || {}).map(([key, value], index) => {
                    const isCorrect = key === question.correctAnswer;
                    return (
                        <QuizOption
                            key={key}
                            index={index}
                            value={key}
                            label={value as string}
                            isCorrect={isCorrect}
                            isSelected={isCorrect}
                            disabled
                        />
                    );
                })}
            </div>
        </section>
    );
}

function FillBlankContent({ question }: { question: QuestionResponseDTO }) {
    return (
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-2 text-primary">
                <MessageSquareQuote className="size-4" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Đáp án điền khuyết</h3>
            </div>
            <Item variant="outline">
                <ItemContent>
                    <ItemTitle className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Đáp án chính xác</ItemTitle>
                    <ItemDescription className="text-2xl font-bold font-mono">{question.correctAnswer}</ItemDescription>
                </ItemContent>
            </Item>
        </section>
    );
}

function TrueFalseContent({ question }: { question: QuestionResponseDTO }) {
    const isTrue = question.correctAnswer?.toLowerCase() === 'true' || question.correctAnswer === '1';
    return (
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="size-4" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Xác nhận đúng sai</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className={cn(
                    "p-6 rounded-lg border flex flex-col items-center gap-2 transition-all",
                    isTrue ? "border-primary/30" : "opacity-40"
                )}>
                    <CheckCircle2 className={cn("size-8", isTrue ? "text-primary" : "text-muted-foreground")} />
                    <span className="font-bold text-sm uppercase">Đúng (True)</span>
                </div>
                <div className={cn(
                    "p-6 rounded-lg border flex flex-col items-center gap-2 transition-all",
                    !isTrue ? "border-destructive/30" : "opacity-40"
                )}>
                    <XCircleIcon className={cn("size-8", !isTrue ? "text-destructive" : "text-muted-foreground")} />
                    <span className="font-bold text-sm uppercase">Sai (False)</span>
                </div>
            </div>
        </section>
    );
}

function EssayContent({ question }: { question: QuestionResponseDTO }) {
    return (
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-2 text-primary">
                <AlignLeft className="size-4" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Đáp án mẫu / Gợi ý</h3>
            </div>
            <Item variant="outline">
                <ItemContent>
                    <ItemDescription className="leading-relaxed text-sm text-foreground">
                        {question.correctAnswer || "Chưa thiết lập đáp án mẫu cho câu hỏi tự luận này."}
                    </ItemDescription>
                </ItemContent>
            </Item>
        </section>
    );
}

function DefaultQuestionContent({ question }: { question: QuestionResponseDTO }) {
    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="size-4" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Đáp án hệ thống</h3>
            </div>
            <Item variant="outline">
                <ItemContent>
                    <ItemDescription className="text-xl font-bold font-mono">
                        {question.correctAnswer || 'N/A'}
                    </ItemDescription>
                </ItemContent>
            </Item>
        </section>
    );
}

function XCircleIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6" />
            <path d="m9 9 6 6" />
        </svg>
    );
}
