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
            <DialogContent className="max-w-md border border-border/50 shadow-2xl bg-background rounded-3xl p-0 overflow-hidden">
                <DialogHeader className="p-8 pb-4 bg-red-500/5 border-b border-red-500/10">
                    <DialogTitle className="flex items-center gap-2 text-destructive text-xl font-semibold tracking-tight">
                        <AlertTriangle className="h-5 w-5" />
                        Delete Pool
                    </DialogTitle>
                    <DialogDescription className="text-sm font-medium text-muted-foreground/60 leading-relaxed mt-2">
                        Are you sure you want to delete <span className="text-foreground font-semibold">"{pool.name}"</span>?
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="p-6 bg-background border-t border-border/10 gap-3">
                    <Button
                        variant="ghost"
                        className="rounded-xl h-11 px-6"
                        onClick={() => onOpenChange(false)}
                        disabled={deletePool.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        className="rounded-xl h-11 px-8"
                        onClick={handleDelete}
                        disabled={deletePool.isPending}
                    >
                        {deletePool.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            "Delete Pool"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

