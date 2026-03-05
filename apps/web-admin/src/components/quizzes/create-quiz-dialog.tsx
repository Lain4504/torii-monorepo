import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { toast } from '@workspace/ui/components/sonner';
import { useCreateQuiz, type CreateQuizDTO } from '@/lib/api/services/quizzes';
import { HelpCircle, Plus } from 'lucide-react';


interface CreateQuizDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    courseRunId?: string;
}

// Dialog tạo quiz đơn giản – chỉ cần tiêu đề.
// Cấu hình chi tiết sẽ được thực hiện tại Quiz Detail Page.
export function CreateQuizDialog({
    open,
    onOpenChange,
    courseRunId,
}: CreateQuizDialogProps) {
    const createMutation = useCreateQuiz();
    const [title, setTitle] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) { toast.error('Vui lòng nhập tiêu đề quiz'); return; }

        const dto: CreateQuizDTO = {
            title: title.trim(),
            description: undefined,
            quizType: 'practice',
            examType: 'practice',
            courseRunId,
        };

        try {
            await createMutation.mutateAsync(dto);
            toast.success('Đã tạo quiz, hãy cấu hình chi tiết ở trang Quiz Detail.');
            setTitle('');
            onOpenChange(false);
        } catch (err: any) {
            toast.error(err?.message || 'Tạo quiz thất bại');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-violet-500/10">
                                <HelpCircle className="size-5 text-violet-500" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold">Tạo Quiz mới</DialogTitle>
                                <DialogDescription className="text-sm">
                                    Nhập tiêu đề, các cấu hình chi tiết sẽ được thiết lập tại trang Quiz Detail.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-3">
                        <Label
                            htmlFor="quiz-title"
                            className="text-xs font-bold uppercase tracking-widest"
                        >
                            Tiêu đề Quiz <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="quiz-title"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Ví dụ: Quiz bài 3 – Từ vựng N4"
                            autoFocus
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setTitle('');
                                onOpenChange(false);
                            }}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={createMutation.isPending}>
                            <Plus className="size-4 mr-2" />
                            {createMutation.isPending ? 'Đang tạo...' : 'Tạo quiz'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

