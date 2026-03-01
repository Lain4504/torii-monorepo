import { useState, useEffect } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@workspace/ui/components/sheet';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { Switch } from '@workspace/ui/components/switch';
import { toast } from '@workspace/ui/components/sonner';
import { useUpdateQuiz, type UpdateQuizDTO, type QuizDTO } from '@/lib/api/services/quizzes';
import { HelpCircle, Save } from 'lucide-react';

interface EditQuizSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    quiz: QuizDTO | null;
}

export function EditQuizSheet({
    open,
    onOpenChange,
    quiz,
}: EditQuizSheetProps) {
    const updateMutation = useUpdateQuiz();

    const [form, setForm] = useState<{
        title: string;
        description: string;
        totalTime: string;
        passingScore: string;
        maxAttempts: string;
        shuffleQuestions: boolean;
        showExplanation: boolean;
        status: string;
    }>({
        title: '',
        description: '',
        totalTime: '',
        passingScore: '60',
        maxAttempts: '1',
        shuffleQuestions: true,
        showExplanation: false,
        status: 'draft',
    });

    useEffect(() => {
        if (quiz) {
            setForm({
                title: quiz.title || '',
                description: quiz.description || '',
                totalTime: quiz.totalTime?.toString() || '',
                passingScore: quiz.passingScore?.toString() || '60',
                maxAttempts: quiz.maxAttempts?.toString() || '1',
                shuffleQuestions: quiz.shuffleQuestions ?? true,
                showExplanation: quiz.showExplanation ?? false,
                status: quiz.status || 'draft',
            });
        }
    }, [quiz]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!quiz) return;
        if (!form.title.trim()) { toast.error('Vui lòng nhập tiêu đề quiz'); return; }

        const data: UpdateQuizDTO = {
            title: form.title.trim(),
            description: form.description.trim() || undefined,
            totalTime: form.totalTime ? parseInt(form.totalTime, 10) : undefined,
            passingScore: form.passingScore ? parseFloat(form.passingScore) : 60,
            maxAttempts: form.maxAttempts ? parseInt(form.maxAttempts, 10) : 1,
            shuffleQuestions: form.shuffleQuestions,
            showExplanation: form.showExplanation,
            status: form.status,
        };

        try {
            await updateMutation.mutateAsync({ id: quiz.id, data });
            toast.success('Đã cập nhật quiz thành công!');
            onOpenChange(false);
        } catch (err: any) {
            toast.error(err?.message || 'Cập nhật quiz thất bại');
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[520px] overflow-y-auto">
                <SheetHeader className="pb-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-violet-500/10">
                            <HelpCircle className="size-5 text-violet-500" />
                        </div>
                        <div>
                            <SheetTitle className="text-lg font-bold">Chỉnh sửa Quiz</SheetTitle>
                            <SheetDescription className="text-sm">
                                Cập nhật thông tin chi tiết cho quiz
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-5 pt-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-quiz-title" className="text-xs font-bold uppercase tracking-widest">
                            Tiêu đề Quiz <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="edit-quiz-title"
                            value={form.title}
                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            placeholder="Ví dụ: Quiz Bài 3 — Từ vựng N4"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-quiz-desc" className="text-xs font-bold uppercase tracking-widest">
                            Mô tả
                        </Label>
                        <Textarea
                            id="edit-quiz-desc"
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="Mô tả nội dung quiz..."
                            rows={3}
                        />
                    </div>

                    {/* Time + Passing score */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-quiz-time" className="text-xs font-bold uppercase tracking-widest">
                                Thời gian (phút)
                            </Label>
                            <Input
                                id="edit-quiz-time"
                                type="number"
                                min={1}
                                value={form.totalTime}
                                onChange={e => setForm(f => ({ ...f, totalTime: e.target.value }))}
                                placeholder="Không giới hạn"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-quiz-passing" className="text-xs font-bold uppercase tracking-widest">
                                Điểm đạt (%)
                            </Label>
                            <Input
                                id="edit-quiz-passing"
                                type="number"
                                min={0}
                                max={100}
                                value={form.passingScore}
                                onChange={e => setForm(f => ({ ...f, passingScore: e.target.value }))}
                            />
                        </div>
                    </div>

                    {/* Max attempts + Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-quiz-attempts" className="text-xs font-bold uppercase tracking-widest">
                                Số lần làm tối đa
                            </Label>
                            <Input
                                id="edit-quiz-attempts"
                                type="number"
                                min={1}
                                value={form.maxAttempts}
                                onChange={e => setForm(f => ({ ...f, maxAttempts: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest">Trạng thái</Label>
                            <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Nháp</SelectItem>
                                    <SelectItem value="published">Công bố</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="space-y-4 pt-2 border-t border-border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold">Xáo trộn câu hỏi</p>
                                <p className="text-xs text-muted-foreground">Thứ tự câu hỏi ngẫu nhiên</p>
                            </div>
                            <Switch
                                checked={form.shuffleQuestions}
                                onCheckedChange={v => setForm(f => ({ ...f, shuffleQuestions: v }))}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold">Hiển thị giải thích</p>
                                <p className="text-xs text-muted-foreground">Sau khi nộp bài</p>
                            </div>
                            <Switch
                                checked={form.showExplanation}
                                onCheckedChange={v => setForm(f => ({ ...f, showExplanation: v }))}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-border">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={updateMutation.isPending} className="flex-1">
                            <Save className="size-4 mr-2" />
                            {updateMutation.isPending ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
