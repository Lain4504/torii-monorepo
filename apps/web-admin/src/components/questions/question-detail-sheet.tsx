import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@workspace/ui/components/dialog';
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[720px]">
                <DialogHeader>
                    <DialogTitle>Chi tiết câu hỏi</DialogTitle>
                    <DialogDescription>
                        Mã số: {question.id.substring(0, 12)}... • {formatDate(question.createdAt)}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[70vh]">
                    <div className="space-y-6 pr-2">
                        <div className="flex items-center gap-2">
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

                        {/* Question text */}
                        <section className="space-y-2">
                            <div className="flex items-center gap-2 text-primary">
                                <FileText className="size-4" />
                                <h3 className="text-sm font-medium">Nội dung câu hỏi</h3>
                            </div>
                            <Item>
                                <ItemContent>
                                    <ItemDescription className="text-sm leading-relaxed">
                                        {question.questionText}
                                    </ItemDescription>
                                </ItemContent>
                            </Item>
                        </section>

                        {/* Specific Content */}
                        {renderQuestionContent()}

                        {/* Explanation */}
                        {question.explanation && (
                            <section className="space-y-2">
                                <div className="flex items-center gap-2 text-amber-600">
                                    <BrainCircuit className="size-4" />
                                    <h3 className="text-sm font-medium">Giải thích</h3>
                                </div>
                                <Alert>
                                    <AlertDescription className="text-sm leading-relaxed">
                                        {question.explanation}
                                    </AlertDescription>
                                </Alert>
                            </section>
                        )}
                    </div>
                </ScrollArea>

                <DialogFooter>
                    <div className="w-full flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex gap-4">
                            <span>Loại: {question.questionType}</span>
                            <span>Chuyên môn: {question.category || 'Chung'}</span>
                        </div>
                        <Badge variant="secondary">
                            Sẵn sàng sử dụng
                        </Badge>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Sub-components for specialized UI

import { QuizOption } from '@workspace/ui/components/custom/quiz';

function MultipleChoiceContent({ question }: { question: QuestionResponseDTO }) {
    return (
        <section className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
                <AlignLeft className="size-4" />
                <h3 className="text-sm font-medium">Các phương án lựa chọn</h3>
            </div>

            {question.questionType === QuestionType.LISTENING && question.metadata?.audioUrl && (
                <div className="flex items-center gap-3">
                    <Headphones className="size-4 text-primary" />
                    <audio controls className="w-full">
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
        <section className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
                <MessageSquareQuote className="size-4" />
                <h3 className="text-sm font-medium">Đáp án điền khuyết</h3>
            </div>
            <Item>
                <ItemContent>
                    <ItemTitle>Đáp án chính xác</ItemTitle>
                    <ItemDescription className="font-mono">{question.correctAnswer}</ItemDescription>
                </ItemContent>
            </Item>
        </section>
    );
}

function TrueFalseContent({ question }: { question: QuestionResponseDTO }) {
    const isTrue = question.correctAnswer?.toLowerCase() === 'true' || question.correctAnswer === '1';
    return (
        <section className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="size-4" />
                <h3 className="text-sm font-medium">Xác nhận đúng sai</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className={cn(
                    "p-4 rounded-md border flex flex-col items-center gap-2",
                    isTrue ? "border-primary/40" : "opacity-60"
                )}>
                    <CheckCircle2 className={cn("size-8", isTrue ? "text-primary" : "text-muted-foreground")} />
                    <span className="font-bold text-sm uppercase">Đúng (True)</span>
                </div>
                <div className={cn(
                    "p-4 rounded-md border flex flex-col items-center gap-2",
                    !isTrue ? "border-destructive/40" : "opacity-60"
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
        <section className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
                <AlignLeft className="size-4" />
                <h3 className="text-sm font-medium">Đáp án mẫu / Gợi ý</h3>
            </div>
            <Item>
                <ItemContent>
                    <ItemDescription className="leading-relaxed text-sm">
                        {question.correctAnswer || "Chưa thiết lập đáp án mẫu cho câu hỏi tự luận này."}
                    </ItemDescription>
                </ItemContent>
            </Item>
        </section>
    );
}

function DefaultQuestionContent({ question }: { question: QuestionResponseDTO }) {
    return (
        <section className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="size-4" />
                <h3 className="text-sm font-medium">Đáp án hệ thống</h3>
            </div>
            <Item>
                <ItemContent>
                    <ItemDescription className="font-mono">
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
