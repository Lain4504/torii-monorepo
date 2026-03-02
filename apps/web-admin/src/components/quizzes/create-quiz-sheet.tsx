import { useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
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
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { toast } from '@workspace/ui/components/sonner';
import { useCreateQuiz, type CreateQuizDTO } from '@/lib/api/services/quizzes';
import { useQuestionPools } from '@/lib/api/services/question-pools';
import { HelpCircle, Plus, BookOpen, Clock, Trash2, Layers } from 'lucide-react';
import { QuestionJlptLevel } from '@workspace/schemas';
import { Badge } from '@workspace/ui/components/badge';
import { Card } from '@workspace/ui/components/card';

interface CreateQuizSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    courseRunId?: string;
    lessonId?: string;
    moduleId?: string;
}

export function CreateQuizSheet({
    open,
    onOpenChange,
    courseRunId,
    lessonId,
    moduleId: _moduleId,
}: CreateQuizSheetProps) {
    const createMutation = useCreateQuiz();

    const [form, setForm] = useState({
        title: '',
        description: '',
        totalTime: '',
        passingScore: '60',
        maxAttempts: '1',
        shuffleQuestions: true,
        showExplanation: false,
        status: 'draft',
        jlptLevel: 'N5' as string,
        sections: [
            {
                id: Math.random().toString(36).substr(2, 9),
                type: 'vocab' as 'vocab' | 'grammar' | 'reading' | 'listening',
                poolId: '',
                questionCount: '10',
                timeLimit: '10',
            }
        ],
    });

    const { data: poolsData } = useQuestionPools({
        page: 1,
        jlptLevel: form.jlptLevel === 'GLOBAL' ? undefined : form.jlptLevel as QuestionJlptLevel,
        limit: 100
    });
    const pools = poolsData?.data || [];

    const addSection = () => {
        setForm(f => ({
            ...f,
            sections: [
                ...f.sections,
                {
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'vocab',
                    poolId: '',
                    questionCount: '10',
                    timeLimit: '10',
                }
            ]
        }));
    };

    const removeSection = (id: string) => {
        if (form.sections.length <= 1) {
            toast.error('Phải có ít nhất một section');
            return;
        }
        setForm(f => ({
            ...f,
            sections: f.sections.filter(s => s.id !== id)
        }));
    };

    const updateSection = (id: string, data: any) => {
        setForm(f => ({
            ...f,
            sections: f.sections.map(s => s.id === id ? { ...s, ...data } : s)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) { toast.error('Vui lòng nhập tiêu đề quiz'); return; }

        if (form.sections.some(s => !s.poolId)) {
            toast.error('Vui lòng chọn bộ đề cho tất cả các phần');
            return;
        }

        const dto: CreateQuizDTO = {
            title: form.title.trim(),
            description: form.description.trim() || undefined,
            quizType: lessonId ? 'lesson' : 'course',
            examType: 'practice',
            jlptLevel: form.jlptLevel,
            courseRunId,
            lessonId,
            totalTime: form.totalTime ? parseInt(form.totalTime, 10) : undefined,
            passingScore: form.passingScore ? parseFloat(form.passingScore) : 60,
            maxAttempts: form.maxAttempts ? parseInt(form.maxAttempts, 10) : 1,
            shuffleQuestions: form.shuffleQuestions,
            showExplanation: form.showExplanation,
            status: form.status,
            sections: form.sections.map(s => ({
                type: s.type,
                poolId: s.poolId,
                questionCount: parseInt(s.questionCount, 10) || 10,
                timeLimit: parseInt(s.timeLimit, 10) || 10,
            }))
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
                jlptLevel: 'N5',
                sections: [
                    {
                        id: Math.random().toString(36).substr(2, 9),
                        type: 'vocab',
                        poolId: '',
                        questionCount: '10',
                        timeLimit: '10',
                    }
                ],
            });
        } catch (err: any) {
            toast.error(err?.message || 'Tạo quiz thất bại');
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[800px] flex flex-col">
                <SheetHeader>
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

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col flex-1 overflow-hidden min-h-0"
                >
                    <ScrollArea className="flex-1 min-h-0">
                        <div className="space-y-6 p-6">
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="quiz-title"
                                        className="text-xs font-bold uppercase tracking-widest"
                                    >
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

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="quiz-desc"
                                        className="text-xs font-bold uppercase tracking-widest"
                                    >
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

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="quiz-time"
                                            className="text-xs font-bold uppercase tracking-widest"
                                        >
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
                                        <Label
                                            htmlFor="quiz-passing"
                                            className="text-xs font-bold uppercase tracking-widest"
                                        >
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

                                <div className="space-y-4 pt-4 border-t border-border">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Layers className="size-4 text-violet-500" />
                                            <h4 className="text-sm font-bold">Cấu hình các phần (Sections)</h4>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addSection}
                                            className="h-8 text-xs bg-violet-500/5 border-violet-500/20 text-violet-600 hover:bg-violet-500/10 hover:text-violet-700"
                                        >
                                            <Plus className="size-3 mr-1" /> Thêm phần
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 gap-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-auto">
                                                Lọc bộ đề theo cấp độ JLPT
                                            </Label>
                                            <Select
                                                value={form.jlptLevel}
                                                onValueChange={v => setForm(f => ({ ...f, jlptLevel: v }))}
                                            >
                                                <SelectTrigger className="w-[120px] h-8 text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="N1">N1</SelectItem>
                                                    <SelectItem value="N2">N2</SelectItem>
                                                    <SelectItem value="N3">N3</SelectItem>
                                                    <SelectItem value="N4">N4</SelectItem>
                                                    <SelectItem value="N5">N5</SelectItem>
                                                    <SelectItem value="GLOBAL">Tất cả</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {form.sections.map((section, index) => (
                                            <Card key={section.id} className="p-4 border-dashed bg-muted/30">
                                                <div className="flex flex-col gap-4">
                                                    <div className="flex items-center justify-between">
                                                        <Badge variant="outline" className="bg-background text-[10px] font-bold">
                                                            Phần {index + 1}
                                                        </Badge>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-7 text-muted-foreground hover:text-destructive"
                                                            onClick={() => removeSection(section.id)}
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                                Bộ đề (Question Pool)
                                                            </Label>
                                                            <Select
                                                                value={section.poolId}
                                                                onValueChange={v => updateSection(section.id, { poolId: v })}
                                                            >
                                                                <SelectTrigger className="h-9">
                                                                    <SelectValue placeholder="Chọn bộ đề..." />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {pools.length > 0 ? (
                                                                        pools.map((p: any) => (
                                                                            <SelectItem key={p.id} value={p.id}>
                                                                                {p.name}
                                                                            </SelectItem>
                                                                        ))
                                                                    ) : (
                                                                        <SelectItem value="none" disabled>
                                                                            Không có bộ đề nào
                                                                        </SelectItem>
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                                Loại phần
                                                            </Label>
                                                            <Select
                                                                value={section.type}
                                                                onValueChange={(v: any) => updateSection(section.id, { type: v })}
                                                            >
                                                                <SelectTrigger className="h-9">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="vocab">Từ vựng</SelectItem>
                                                                    <SelectItem value="grammar">Ngữ pháp</SelectItem>
                                                                    <SelectItem value="reading">Đọc hiểu</SelectItem>
                                                                    <SelectItem value="listening">Nghe hiểu</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                                Số câu hỏi
                                                            </Label>
                                                            <div className="relative">
                                                                <BookOpen className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                                                                <Input
                                                                    type="number"
                                                                    min={1}
                                                                    className="pl-9 h-9"
                                                                    value={section.questionCount}
                                                                    onChange={e => updateSection(section.id, { questionCount: e.target.value })}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                                Thời gian (phút)
                                                            </Label>
                                                            <div className="relative">
                                                                <Clock className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                                                                <Input
                                                                    type="number"
                                                                    min={1}
                                                                    className="pl-9 h-9"
                                                                    value={section.timeLimit}
                                                                    onChange={e => updateSection(section.id, { timeLimit: e.target.value })}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 pt-2 border-t border-border">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest">
                                            Số lần làm tối đa
                                        </Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={form.maxAttempts}
                                            onChange={e => setForm(f => ({ ...f, maxAttempts: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest">
                                            Trạng thái Quiz
                                        </Label>
                                        <Select
                                            value={form.status}
                                            onValueChange={v => setForm(f => ({ ...f, status: v }))}
                                        >
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

                                <div className="space-y-4 pt-2 border-t border-border">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold">Xáo trộn câu hỏi</p>
                                            <p className="text-xs text-muted-foreground">
                                                Thứ tự câu hỏi ngẫu nhiên
                                            </p>
                                        </div>
                                        <Switch
                                            checked={form.shuffleQuestions}
                                            onCheckedChange={v =>
                                                setForm(f => ({ ...f, shuffleQuestions: v }))
                                            }
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold">Hiển thị giải thích</p>
                                            <p className="text-xs text-muted-foreground">Sau khi nộp bài</p>
                                        </div>
                                        <Switch
                                            checked={form.showExplanation}
                                            onCheckedChange={v =>
                                                setForm(f => ({ ...f, showExplanation: v }))
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                    <SheetFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={createMutation.isPending}>
                            <Plus className="size-4 mr-2" />
                            {createMutation.isPending ? 'Đang tạo...' : 'Tạo Quiz'}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
