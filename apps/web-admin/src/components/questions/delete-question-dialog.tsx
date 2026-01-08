import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Loader2 } from 'lucide-react';
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
            toast.success('Question deleted successfully');
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete question');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-none shadow-2xl bg-background/95 backdrop-blur-xl rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Delete Question</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this question? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-xl border border-border/20">
                        {question.questionText}
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={deleteQuestion.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleteQuestion.isPending}
                    >
                        {deleteQuestion.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

