import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog';
import { Button } from '@workspace/ui/components/button';
import { AlertTriangle } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';
import { useDeleteQuestion } from '@/lib/api/services/questions.ts';
import type { QuestionResponseDTO } from '@workspace/schemas';
import { Spinner } from "@workspace/ui/components/spinner";

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
            toast.success('Đã xóa câu hỏi', {
                description: 'Câu hỏi đã được xóa khỏi hệ thống.',
            });
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Xóa thất bại', {
                description: error.response?.data?.message || 'Không thể thực hiện xóa câu hỏi này.',
            });
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="w-[95vw] sm:w-[500px] !max-w-[500px] border-destructive/20 bg-background/95 backdrop-blur-xl">
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive">
                        <AlertTriangle />
                    </AlertDialogMedia>
                    <AlertDialogTitle>Xóa câu hỏi</AlertDialogTitle>
                    <AlertDialogDescription>
                        Hành động này sẽ xóa vĩnh viễn câu hỏi này và có thể ảnh hưởng đến các kho đề liên quan. Bạn có chắc chắn muốn tiếp tục?
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                        <Button variant="outline" disabled={deleteQuestion.isPending}>Hủy</Button>
                    </AlertDialogCancel>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleteQuestion.isPending}
                    >
                        {deleteQuestion.isPending ? (
                            <Spinner />
                        ) : (
                            "Xóa câu hỏi"
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
