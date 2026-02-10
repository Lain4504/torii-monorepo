import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Loader2, AlertTriangle, FileText } from 'lucide-react';
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
            toast.success('Thành công', {
                description: 'Đã xóa câu hỏi khỏi hệ thống.',
            });
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Lỗi xóa', {
                description: error.response?.data?.message || 'Không thể thực hiện xóa câu hỏi này.',
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md border border-border shadow-2xl bg-background rounded-xl p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-4 bg-destructive/5 border-b border-destructive/10">
                    <div className="flex flex-col gap-4">
                        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/20 mx-auto">
                            <AlertTriangle className="h-6 w-6 text-destructive" />
                        </div>
                        <div className="space-y-1 text-center">
                            <DialogTitle className="text-xl font-bold text-destructive">
                                Xác nhận xóa câu hỏi
                            </DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground">
                                Hành động này không thể hoàn tác.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 space-y-4">
                    <p className="text-sm font-medium text-muted-foreground/80 leading-relaxed text-center">
                        Bạn có chắc chắn muốn xóa vĩnh viễn câu hỏi này không? Việc này có thể ảnh hưởng đến các ngân hàng câu hỏi liên quan.
                    </p>

                    <div className="p-4 rounded-xl bg-muted/20 border border-border/80">
                        <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4 text-muted-foreground/60" />
                            <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-wider">Nội dung câu hỏi</span>
                        </div>
                        <div className="text-sm font-semibold text-foreground line-clamp-2">
                            "{question.questionText}"
                        </div>
                        <div className="mt-2 text-[10px] font-mono text-muted-foreground/40 italic">
                            ID: {question.id}
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-4 bg-muted/5 border-t border-border flex gap-3 sm:justify-center">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={deleteQuestion.isPending}
                        className="rounded-xl h-10 px-6 font-semibold"
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleteQuestion.isPending}
                        className="rounded-xl h-10 px-8 shadow-sm font-semibold"
                    >
                        {deleteQuestion.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Xác nhận xóa
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
