import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@workspace/ui/components/sheet';
import { Badge } from '@workspace/ui/components/badge';
import type { QuestionResponseDTO } from '@workspace/schemas';
import { QuestionDifficultyLevel, QuestionType } from '@workspace/schemas';
import {
    FileText,
    CheckCircle2,
    BrainCircuit,
    Calendar,
    AlignLeft,
    Headphones,
    Target,
    Zap,
    MessageSquareQuote
} from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';

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
            <SheetContent className="w-full sm:w-[800px] !max-w-[800px] max-h-screen flex flex-col p-0 gap-0 border-l border-border/50 shadow-2xl bg-background [&>button]:top-6 [&>button]:right-6 [&>button]:bg-background/20 [&>button]:rounded-xl [&>button]:w-10 [&>button]:h-10">
                <SheetHeader className="px-6 py-6 border-b border-border/10 bg-muted/5">
                    <div className="flex items-center justify-between mb-4">
                        <Badge variant="outline" className="rounded-full px-3 py-1 bg-primary/5 text-primary border-primary/20 text-[10px] font-bold tracking-widest uppercase">
                            JLPT {question.jlptLevel || 'GLOBAL'}
                        </Badge>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className={cn(
                                "rounded-full px-3 py-1 border-none text-[10px] font-bold uppercase",
                                question.difficulty === QuestionDifficultyLevel.HARD ? "bg-rose-500/10 text-rose-600" :
                                    question.difficulty === QuestionDifficultyLevel.MEDIUM ? "bg-amber-500/10 text-amber-600" :
                                        "bg-emerald-500/10 text-emerald-600"
                            )}>
                                {question.difficulty === QuestionDifficultyLevel.HARD ? "Mức độ: Khó" :
                                    question.difficulty === QuestionDifficultyLevel.MEDIUM ? "Mức độ: Trung bình" : "Mức độ: Dễ"}
                            </Badge>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <SheetTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-3">
                            <Target className="size-5 text-primary opacity-40" />
                            Chi Tiết Câu Hỏi
                        </SheetTitle>
                        <SheetDescription className="text-sm font-medium text-muted-foreground/60 flex items-center gap-3">
                            <span>Mã số: <span className="font-mono text-primary/60">{question.id.slice(0, 12)}...</span></span>
                            <span className="size-1 rounded-full bg-border" />
                            <span className="flex items-center gap-1.5 uppercase font-bold text-[10px] tracking-wider">
                                <Calendar className="size-3" />
                                {new Date(question.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                        </SheetDescription>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-8 space-y-10">
                        {/* Question Section */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 text-primary">
                                <FileText className="size-4" />
                                <h3 className="text-sm font-bold uppercase tracking-wider">Nội dung câu hỏi</h3>
                            </div>
                            <div className="text-lg font-medium text-foreground p-6 rounded-2xl bg-muted/5 border border-border/80 leading-relaxed shadow-sm italic">
                                "{question.questionText}"
                            </div>
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
                                <div className="text-sm font-medium text-muted-foreground/80 leading-relaxed p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 italic">
                                    {question.explanation}
                                </div>
                            </section>
                        )}
                    </div>
                </div>

                <div className="p-8 border-t border-border bg-muted/5 flex items-center justify-between gap-4">
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
                    <Badge variant="outline" className="rounded-lg bg-emerald-500/5 text-emerald-600 border-emerald-500/10 px-3 py-1 font-bold text-[10px] uppercase">
                        Sẵn sàng sử dụng
                    </Badge>
                </div>
            </SheetContent>
        </Sheet>
    );
}

// Sub-components for specialized UI

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
                {Object.entries(question.options || {}).map(([key, value]) => {
                    const isCorrect = key === question.correctAnswer;
                    return (
                        <div
                            key={key}
                            className={cn(
                                "flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 group",
                                isCorrect
                                    ? "bg-emerald-500/5 border-emerald-500/40 shadow-sm"
                                    : "bg-muted/5 border-border/50 hover:border-primary/30"
                            )}
                        >
                            <div className={cn(
                                "size-9 flex items-center justify-center rounded-xl font-bold text-sm shrink-0 transition-all duration-300",
                                isCorrect
                                    ? "bg-emerald-500 text-white shadow-emerald-500/20 shadow-lg scale-105"
                                    : "bg-background text-muted-foreground border border-border group-hover:bg-primary/5 group-hover:text-primary group-hover:border-primary/20"
                            )}>
                                {key}
                            </div>
                            <div className={cn(
                                "flex-1 text-sm font-medium transition-colors duration-300",
                                isCorrect ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                            )}>
                                {value}
                            </div>
                            {isCorrect && (
                                <Zap className="size-4 text-emerald-500 fill-emerald-500 animate-pulse" />
                            )}
                        </div>
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
            <div className="p-8 rounded-2xl bg-emerald-500/5 border-2 border-dashed border-emerald-500/20 flex flex-col items-center justify-center text-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600/60">Đáp án chính xác</span>
                <div className="text-2xl font-bold text-emerald-600 font-mono tracking-tight underline decoration-emerald-500/30 underline-offset-8">
                    {question.correctAnswer}
                </div>
            </div>
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
                    "p-6 rounded-2xl border flex flex-col items-center gap-2 transition-all",
                    isTrue ? "bg-emerald-500/10 border-emerald-500/40 opacity-100" : "bg-muted/5 border-border/50 opacity-40"
                )}>
                    <CheckCircle2 className={cn("size-8", isTrue ? "text-emerald-500" : "text-muted-foreground")} />
                    <span className="font-bold text-sm uppercase">Đúng (True)</span>
                </div>
                <div className={cn(
                    "p-6 rounded-2xl border flex flex-col items-center gap-2 transition-all",
                    !isTrue ? "bg-rose-500/10 border-rose-500/40 opacity-100" : "bg-muted/5 border-border/50 opacity-40"
                )}>
                    <XCircleIcon className={cn("size-8", !isTrue ? "text-rose-500" : "text-muted-foreground")} />
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
            <div className="p-6 rounded-2xl bg-muted/5 border border-border/80 leading-relaxed text-sm text-foreground">
                {question.correctAnswer || "Chưa thiết lập đáp án mẫu cho câu hỏi tự luận này."}
            </div>
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
            <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-center">
                <div className="text-xl font-bold text-emerald-600">
                    {question.correctAnswer || 'N/A'}
                </div>
            </div>
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
