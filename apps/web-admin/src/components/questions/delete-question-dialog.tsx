import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Loader2, AlertTriangle, FileText, X } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';
import { useDeleteQuestion } from '@/api/services/questions.ts';
import type { QuestionResponseDTO } from '@workspace/schemas';

interface DeleteQuestionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    question: QuestionResponseDTO | null;
}

export function DeleteQuestionDialog({
    open,
    onOpenChange,
    question,
}: DeleteQuestionDialogProps) {
    const deleteQuestion = useDeleteQuestion();

    if (!question) return null;

    const handleDelete = async () => {
        try {
            await deleteQuestion.mutateAsync(question.id);
            toast.success('Question Deleted', {
                description: 'Question has been removed.',
            });
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Deletion Failed', {
                description: error.response?.data?.message || 'System unable to remove question.',
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] border border-border/50 shadow-2xl bg-background rounded-3xl p-0">
                <DialogHeader className="p-8 pb-6 bg-red-500/5 border-b border-red-500/10 relative">
                    <div className="absolute inset-0 bg-red-500/5 blur-3xl opacity-50 pointer-events-none" />
                    <div className="relative z-10 flex flex-col gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-lg shadow-red-500/10">
                            <AlertTriangle className="h-6 w-6 text-red-500" />
                        </div>
                        <div className="space-y-1">
                            <DialogTitle className="text-xl font-black uppercase tracking-tight text-red-500">
                                Confirm Deletion
                            </DialogTitle>
                            <DialogDescription className="text-xs font-medium text-red-500/60">
                                This action cannot be undone.
                            </DialogDescription>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onOpenChange(false)}
                        className="absolute right-4 top-4 rounded-xl hover:bg-red-500/10 text-red-500/50 hover:text-red-500"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </DialogHeader>

                <div className="p-8 space-y-6">
                    <div className="space-y-4">
                        <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                            You are about to permanently delete this assessment item. This action cannot be undone and may affect associated question pools.
                        </p>

                        <div className="flex flex-col gap-2 p-4 rounded-2xl bg-muted/5 border border-border/10">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-3 w-3 text-muted-foreground/50" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Question Content</span>
                            </div>
                            <div className="text-sm font-bold text-foreground line-clamp-2 italic">
                                "{question.questionText}"
                            </div>
                            <div className="mt-2 text-[10px] font-mono text-muted-foreground/50 uppercase">
                                ID: {question.id}
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 pt-4 bg-background border-t border-border/10">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={deleteQuestion.isPending}
                        className="rounded-xl h-12 px-6 hover:bg-muted/20 text-[11px] font-black uppercase tracking-widest"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleteQuestion.isPending}
                        className="rounded-xl h-12 px-8 bg-red-500 shadow-xl shadow-red-500/20 hover:bg-red-600 hover:scale-[1.02] transition-all text-[11px] font-black uppercase tracking-widest"
                    >
                        {deleteQuestion.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
