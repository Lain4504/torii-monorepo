import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Badge } from '@workspace/ui/components/badge';
import { Label } from '@workspace/ui/components/label';
import type { QuestionResponseDTO } from '@workspace/schemas';

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
            <DialogContent className="max-w-2xl border-none shadow-2xl bg-background/95 backdrop-blur-xl rounded-2xl p-0 overflow-hidden">
                <DialogHeader className="p-8 pb-4 bg-muted/30">
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                        Question Details
                    </DialogTitle>
                </DialogHeader>

                <div className="p-8 pt-4 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">
                            Question Text
                        </Label>
                        <div className="text-base text-foreground px-1 bg-muted/30 p-4 rounded-xl border border-border/20">
                            {question.questionText}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">
                                Type
                            </Label>
                            <Badge variant="outline" className="text-sm px-3 py-1 font-normal bg-background/50">
                                {question.questionType}
                            </Badge>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">
                                Category
                            </Label>
                            <Badge variant="outline" className="text-sm px-3 py-1 font-normal bg-background/50">
                                {question.category || 'N/A'}
                            </Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">
                                JLPT Level
                            </Label>
                            <Badge variant="outline" className="text-sm px-3 py-1 font-normal bg-background/50">
                                {question.jlptLevel || 'N/A'}
                            </Badge>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">
                                Difficulty
                            </Label>
                            <Badge variant="outline" className="text-sm px-3 py-1 font-normal bg-background/50">
                                {question.difficulty || 'N/A'}
                            </Badge>
                        </div>
                    </div>

                    {question.options && Object.keys(question.options).length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">
                                Options
                            </Label>
                            <div className="space-y-2 bg-muted/30 p-4 rounded-xl border border-border/20">
                                {Object.entries(question.options).map(([key, value]) => (
                                    <div key={key} className="text-sm">
                                        <span className="font-semibold">{key}:</span> {value}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">
                            Correct Answer
                        </Label>
                        <div className="text-sm text-foreground bg-muted/30 p-4 rounded-xl border border-border/20">
                            {question.correctAnswer || 'N/A'}
                        </div>
                    </div>

                    {question.explanation && (
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">
                                Explanation
                            </Label>
                            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap bg-muted/30 p-4 rounded-xl border border-border/20">
                                {question.explanation}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">
                                Status
                            </Label>
                            <Badge variant="outline" className="text-sm px-3 py-1 font-normal bg-background/50">
                                {question.status}
                            </Badge>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">
                                Usage Count
                            </Label>
                            <div className="text-sm font-semibold text-foreground">
                                {question.usageCount}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

