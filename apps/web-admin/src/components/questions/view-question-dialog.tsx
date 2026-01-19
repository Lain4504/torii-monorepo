import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@workspace/ui/components/dialog';
import { Badge } from '@workspace/ui/components/badge';
import { Label } from '@workspace/ui/components/label';
import type { QuestionResponseDTO } from '@workspace/schemas';
import { QuestionStatus, QuestionDifficultyLevel } from '@workspace/schemas';
import { Button } from '@workspace/ui/components/button';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { FileText, Tag, CheckCircle2, BrainCircuit, Layers, Hash, Calendar, X, AlignLeft } from 'lucide-react';
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl border-none shadow-2xl bg-background rounded-3xl p-0 max-h-[90vh] flex flex-col">
                <DialogHeader className="p-8 pb-6 bg-muted/5 border-b border-border/10 relative flex-shrink-0">
                    <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-50 pointer-events-none" />
                    <div className="relative z-10 flex items-start justify-between">
                        <div className="space-y-1">
                            <DialogTitle className="text-2xl font-semibold tracking-tight">
                                Question <span className="text-primary italic">Details</span>
                            </DialogTitle>
                            <DialogDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                                ID: <span className="font-mono text-primary">{question.id.substring(0, 8)}...</span>
                            </DialogDescription>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onOpenChange(false)}
                            className="rounded-xl h-10 w-10 hover:bg-muted/20 -mr-2 -mt-2"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 p-8 pt-6">
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">

                        {/* Status Bar */}
                        <div className="flex items-center gap-4 bg-muted/5 p-4 rounded-2xl border border-border/10">
                            <div className="flex-1 flex flex-col gap-1 border-r border-border/10 pr-4">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Status</span>
                                <Badge
                                    className={cn(
                                        "w-fit rounded-md text-[10px] uppercase tracking-wider font-black shadow-none border",
                                        question.status === QuestionStatus.ACTIVE
                                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                            : "bg-muted/20 text-muted-foreground border-border/20"
                                    )}
                                >
                                    {question.status}
                                </Badge>
                            </div>
                            <div className="flex-1 flex flex-col gap-1 border-r border-border/10 px-4">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Usage Metrics</span>
                                <div className="flex items-center gap-2">
                                    <Hash className="h-3 w-3 text-primary" />
                                    <span className="text-sm font-bold">{question.usageCount} <span className="text-xs font-normal text-muted-foreground">Times Used</span></span>
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col gap-1 px-4">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Created</span>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-3 w-3 text-primary" />
                                    <span className="text-sm font-bold">{new Date(question.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Question Text */}
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1 flex items-center gap-2">
                                <FileText className="h-3 w-3" />
                                Question Content
                            </Label>
                            <div className="text-lg font-medium text-foreground p-6 rounded-3xl bg-background/50 border border-border/20 shadow-sm leading-relaxed">
                                {question.questionText}
                            </div>
                        </div>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1 flex items-center gap-2">
                                    <Tag className="h-3 w-3" />
                                    Type & Category
                                </Label>
                                <div className="flex flex-col gap-2 p-4 rounded-2xl bg-muted/5 border border-border/10">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-muted-foreground uppercase">Format</span>
                                        <span className="text-xs font-bold text-foreground uppercase tracking-wide">{question.questionType.replace('_', ' ')}</span>
                                    </div>
                                    <div className="h-px bg-border/10 w-full" />
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-muted-foreground uppercase">Domain</span>
                                        <span className="text-xs font-bold text-foreground uppercase tracking-wide">{question.category || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1 flex items-center gap-2">
                                    <Layers className="h-3 w-3" />
                                    Classification
                                </Label>
                                <div className="flex flex-col gap-2 p-4 rounded-2xl bg-muted/5 border border-border/10">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-muted-foreground uppercase">Proficiency</span>
                                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-primary/5 text-primary border-primary/20">
                                            {question.jlptLevel || 'N/A'}
                                        </Badge>
                                    </div>
                                    <div className="h-px bg-border/10 w-full" />
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-muted-foreground uppercase">Complexity</span>
                                        <Badge variant="outline" className={cn(
                                            "text-[10px] font-bold uppercase tracking-wider",
                                            question.difficulty === QuestionDifficultyLevel.HARD ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                                                question.difficulty === QuestionDifficultyLevel.MEDIUM ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                                    "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                        )}>
                                            {question.difficulty || 'Normal'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Options */}
                        {question.options && Object.keys(question.options).length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 pb-2 border-b border-border/20">
                                    <div className="h-px flex-1 bg-border/20" />
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-center flex items-center gap-2">
                                        <AlignLeft className="h-3 w-3" />
                                        Options
                                    </h4>
                                    <div className="h-px flex-1 bg-border/20" />
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {Object.entries(question.options).map(([key, value]) => {
                                        const isCorrect = key === question.correctAnswer;
                                        return (
                                            <div
                                                key={key}
                                                className={cn(
                                                    "flex items-center gap-4 p-4 rounded-2xl border transition-all",
                                                    isCorrect
                                                        ? "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]"
                                                        : "bg-muted/5 border-border/10"
                                                )}
                                            >
                                                <div className={cn(
                                                    "h-10 w-10 flex items-center justify-center rounded-xl font-black text-sm",
                                                    isCorrect ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" : "bg-muted text-muted-foreground"
                                                )}>
                                                    {key}
                                                </div>
                                                <div className="flex-1 text-sm font-medium">{value}</div>
                                                {isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Correct Answer (if not redundant with options) */}
                        {(!question.options || Object.keys(question.options).length === 0) && (
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1 flex items-center gap-2">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Correct Answer
                                </Label>
                                <div className="text-lg font-medium text-emerald-500 p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 shadow-sm">
                                    {question.correctAnswer || 'N/A'}
                                </div>
                            </div>
                        )}

                        {/* Explanation */}
                        {question.explanation && (
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1 flex items-center gap-2">
                                    <BrainCircuit className="h-3 w-3" />
                                    Explanation
                                </Label>
                                <div className="text-sm font-medium text-muted-foreground leading-relaxed whitespace-pre-wrap p-6 rounded-3xl bg-muted/5 border border-border/10">
                                    {question.explanation}
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
                <div className="h-6 bg-gradient-to-t from-background/80 to-transparent pointer-events-none sticky bottom-0 left-0 right-0 z-20" />
            </DialogContent>
        </Dialog>
    );
}
