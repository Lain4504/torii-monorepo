import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog';
import { useDeleteQuestionBank } from '@/features/question-bank/api/question-bank';
import type { QuestionBankResponseDTO } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';

interface DeleteQuestionBankDialogProps {
    question: QuestionBankResponseDTO | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DeleteQuestionBankDialog({
    question,
    open,
    onOpenChange,
}: DeleteQuestionBankDialogProps) {
    const deleteQuestionBank = useDeleteQuestionBank();

    const handleDelete = async () => {
        if (!question) return;
        try {
            await deleteQuestionBank.mutateAsync(question.id);
            toast.success('Question deleted successfully!', {
                description: `Question has been removed from the bank.`,
            });
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Failed to delete question', {
                description: error.response?.data?.error || error.message,
            });
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the selected question.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
