import { useState } from 'react';
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
import { useCreateQuiz, type CreateQuizDTO } from '@/lib/api/services/quizzes';
import { HelpCircle, Plus } from 'lucide-react';

interface CreateQuizSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    courseId?: string;
    lessonId?: string;
    moduleId?: string;
}

export function CreateQuizSheet({
    open,
    onOpenChange,
    courseId,
    lessonId,
    moduleId: _moduleId,
}: CreateQuizSheetProps) {
    const createMutation = useCreateQuiz();

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) { toast.error('Vui lòng nhập tiêu đề quiz'); return; }

        const dto: CreateQuizDTO = {
            title: form.title.trim(),
            description: form.description.trim() || undefined,
            quizType: lessonId ? 'lesson' : 'course',
            courseId,
            lessonId,
            totalTime: form.totalTime ? parseInt(form.totalTime, 10) : undefined,
            passingScore: form.passingScore ? parseFloat(form.passingScore) : 60,
            maxAttempts: form.maxAttempts ? parseInt(form.maxAttempts, 10) : 1,
            shuffleQuestions: form.shuffleQuestions,
            showExplanation: form.showExplanation,
            status: form.status,
        };

        try {
            await createMutation.mutateAsync(dto);
            toast.success('Đã tạo quiz thành công!');
            onOpenChange(false);
            setForm({
                title: '',
                description: '',
                totalTime: '',
                passingScore: '60',
                maxAttempts: '1',
                shuffleQuestions: true,
                showExplanation: false,
                status: 'draft',
            });
        } catch (err: any) {
            toast.error(err?.message || 'Tạo quiz thất bại');
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
                            <SheetTitle className="text-lg font-bold">Tạo Quiz Mới</SheetTitle>
                            <SheetDescription className="text-sm">
                                {lessonId ? 'Quiz gắn với bài học này' : 'Quiz cho khóa học'}
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-5 pt-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="quiz-title" className="text-xs font-bold uppercase tracking-widest">
                            Tiêu đề Quiz <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="quiz-title"
                            value={form.title}
                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            placeholder="Ví dụ: Quiz Bài 3 — Từ vựng N4"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="quiz-desc" className="text-xs font-bold uppercase tracking-widest">
                            Mô tả
                        </Label>
                        <Textarea
                            id="quiz-desc"
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="Mô tả nội dung quiz..."
                            rows={3}
                        />
                    </div>

                    {/* Time + Passing score */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="quiz-time" className="text-xs font-bold uppercase tracking-widest">
                                Thời gian (phút)
                            </Label>
                            <Input
                                id="quiz-time"
                                type="number"
                                min={1}
                                value={form.totalTime}
                                onChange={e => setForm(f => ({ ...f, totalTime: e.target.value }))}
                                placeholder="Không giới hạn"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="quiz-passing" className="text-xs font-bold uppercase tracking-widest">
                                Điểm đạt (%)
                            </Label>
                            <Input
                                id="quiz-passing"
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
                            <Label htmlFor="quiz-attempts" className="text-xs font-bold uppercase tracking-widest">
                                Số lần làm tối đa
                            </Label>
                            <Input
                                id="quiz-attempts"
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
                                    <SelectItem value="published">Công bố ngay</SelectItem>
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
                        <Button type="submit" disabled={createMutation.isPending} className="flex-1">
                            <Plus className="size-4 mr-2" />
                            {createMutation.isPending ? 'Đang tạo...' : 'Tạo Quiz'}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
