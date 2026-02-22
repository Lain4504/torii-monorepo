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
import { useDeleteQuestionPool } from '@/api/services/question-pools.ts';
import type { QuestionPoolResponseDTO } from '@workspace/schemas';
import { Spinner } from "@workspace/ui/components/spinner";

interface DeleteQuestionPoolDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pool: QuestionPoolResponseDTO | null;
}

export function DeleteQuestionPoolDialog({ open, onOpenChange, pool }: DeleteQuestionPoolDialogProps) {
    const deletePool = useDeleteQuestionPool();

    const handleDelete = async () => {
        if (!pool) return;

        try {
            await deletePool.mutateAsync(pool.id);
            toast.success('Đã xóa kho đề', {
                description: `Kho đề "${pool.name}" đã được xóa khỏi hệ thống.`,
            });
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Xóa thất bại', {
                description: error.response?.data?.message || 'Không thể xóa kho đề lúc này.',
            });
        }
    };

    if (!pool) return null;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive">
                        <AlertTriangle />
                    </AlertDialogMedia>
                    <AlertDialogTitle>Xóa kho đề</AlertDialogTitle>
                    <AlertDialogDescription>
                        Hành động này sẽ xóa vĩnh viễn kho đề <span className="font-semibold text-foreground">"{pool.name}"</span> và tất cả câu hỏi liên quan. Thao tác này không thể hoàn tác.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                        <Button variant="outline" disabled={deletePool.isPending}>Hủy</Button>
                    </AlertDialogCancel>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deletePool.isPending}
                    >
                        {deletePool.isPending ? (
                            <Spinner />
                        ) : (
                            "Xóa kho đề"
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
