import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';
import { useDeleteQuestionPool } from '@/api/services/question-pools.ts';
import type { QuestionPoolResponseDTO } from '@workspace/schemas';

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
            toast.success('Question pool deleted successfully');
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete question pool');
        }
    };

    if (!pool) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md border-none shadow-2xl bg-background/95 backdrop-blur-xl rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Delete Question Pool
                    </DialogTitle>
                    <DialogDescription className="pt-2">
                        Are you sure you want to delete <span className="font-semibold">{pool.name}</span>?
                        This action cannot be undone. Questions in this pool will not be deleted, but they will no longer be associated with this pool.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={deletePool.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deletePool.isPending}
                    >
                        {deletePool.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

