import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Loader2, AlertTriangle, Trash2 } from 'lucide-react';
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
            toast.success('Thành công', {
                description: 'Đã xóa kho đề câu hỏi khỏi hệ thống.'
            });
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Thất bại', {
                description: error.response?.data?.message || 'Không thể xóa kho đề lúc này.'
            });
        }
    };

    if (!pool) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md border-border shadow-2xl bg-background rounded-xl p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-4 bg-destructive/5 border-b border-destructive/10">
                    <div className="flex flex-col gap-4">
                        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/20 mx-auto">
                            <AlertTriangle className="h-6 w-6 text-destructive" />
                        </div>
                        <div className="space-y-1 text-center">
                            <DialogTitle className="text-xl font-bold text-destructive">
                                Xác nhận xóa kho đề
                            </DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground">
                                Hành động này không thể hoàn tác và sẽ ảnh hưởng đến các câu hỏi thuộc kho này.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 text-center">
                    <p className="text-sm font-medium text-muted-foreground/80">
                        Bạn có chắc chắn muốn xóa kho đề:
                    </p>
                    <p className="text-base font-bold text-foreground mt-2 px-4 py-2 bg-muted/30 rounded-lg border border-border/50 inline-block">
                        {pool.name}
                    </p>
                </div>

                <DialogFooter className="p-4 bg-muted/5 border-t border-border flex gap-3 sm:justify-center">
                    <Button
                        variant="ghost"
                        className="rounded-xl h-10 px-6 font-semibold"
                        onClick={() => onOpenChange(false)}
                        disabled={deletePool.isPending}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="destructive"
                        className="rounded-xl h-10 px-8 font-semibold shadow-sm"
                        onClick={handleDelete}
                        disabled={deletePool.isPending}
                    >
                        {deletePool.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <Trash2 className="mr-2 size-4" />
                                Xác nhận xóa
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
