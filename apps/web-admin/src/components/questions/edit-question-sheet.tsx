import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { FileUpload } from '@/components/common/file-upload';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Textarea } from '@workspace/ui/components/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import {
    Field,
    FieldLabel,
    FieldError,
} from '@workspace/ui/components/field';
import { Loader2, Save, X, BrainCircuit, FileText, CheckCircle2, AlignLeft, Headphones, Plus } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';
import { useUpdateQuestion } from '@/api/services/questions.ts';
import { useQuestionPools } from '@/api/services/question-pools.ts';
import {
    QuestionType,
    QuestionCategory,
    QuestionDifficultyLevel,
    QuestionJlptLevel,
    questionCreateDTOSchema,
    type QuestionCreateDTO,
    type QuestionResponseDTO,
} from '@workspace/schemas';
import type { z } from 'zod';

type EditQuestionFormData = z.input<typeof questionCreateDTOSchema>;

interface EditQuestionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    question: QuestionResponseDTO | null;
}

export function EditQuestionDialog({ open, onOpenChange, question }: EditQuestionDialogProps) {
    const updateQuestion = useUpdateQuestion();
    const { data: poolsData } = useQuestionPools({ page: 1, limit: 100 });
    const [options, setOptions] = useState<Record<string, string>>({ A: '', B: '' });
    const [optionKeys, setOptionKeys] = useState<string[]>(['A', 'B']);

    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
    } = useForm<EditQuestionFormData>({
        resolver: zodResolver(questionCreateDTOSchema),
        defaultValues: {
            questionText: '',
            questionType: QuestionType.MULTIPLE_CHOICE,
            jlptLevel: QuestionJlptLevel.N5,
            category: QuestionCategory.VOCAB,
            difficulty: QuestionDifficultyLevel.MEDIUM,
            correctAnswer: '',
            explanation: '',
            tags: [],
            poolId: undefined,
        },
    });

    const questionType = watch('questionType');
    const category = watch('category');

    useEffect(() => {
        if (open && question) {
            // Populate form
            reset({
                questionText: question.questionText || '',
                questionType: question.questionType as QuestionType,
                jlptLevel: question.jlptLevel as QuestionJlptLevel,
                category: question.category as QuestionCategory,
                difficulty: question.difficulty as QuestionDifficultyLevel,
                correctAnswer: question.correctAnswer || '',
                explanation: question.explanation || '',
                tags: question.tags || [],
                poolId: question.poolId || undefined,
            });

            // Set metadata/audio
            if (question.metadata?.audioUrl) {
                setValue('metadata.audioUrl', question.metadata.audioUrl);
            }

            // Populate options
            if ((question.questionType === QuestionType.MULTIPLE_CHOICE || question.questionType === QuestionType.LISTENING) && question.options) {
                setOptions(question.options as Record<string, string>);
                setOptionKeys(Object.keys(question.options).sort());
            } else {
                setOptions({ A: '', B: '' });
                setOptionKeys(['A', 'B']);
            }
        }
    }, [open, question, reset, setValue]);

    const addOption = () => {
        const nextKey = String.fromCharCode(65 + optionKeys.length);
        setOptionKeys([...optionKeys, nextKey]);
        setOptions({ ...options, [nextKey]: '' });
    };

    const removeOption = (key: string) => {
        if (optionKeys.length <= 2) {
            toast.error('Không thể thực hiện', { description: 'Câu hỏi cần tối thiểu 2 lựa chọn.' });
            return;
        }
        setOptionKeys(optionKeys.filter(k => k !== key));
        const newOptions = { ...options };
        delete newOptions[key];
        setOptions(newOptions);
    };

    const onSubmit = async (data: EditQuestionFormData) => {
        if (!question) return;

        try {
            const submitData: QuestionCreateDTO = {
                ...data,
                options: (questionType === QuestionType.MULTIPLE_CHOICE || questionType === QuestionType.LISTENING) ? options : undefined,
            };

            await updateQuestion.mutateAsync({ id: question.id, question: submitData });
            toast.success('Thành công', {
                description: 'Cập nhật câu hỏi thành công.',
            });
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Lỗi cập nhật', {
                description: error.response?.data?.message || 'Không thể lưu thay đổi vào hệ thống.',
            });
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:w-[800px] !max-w-[800px] max-h-screen flex flex-col p-0 gap-0 border-l border-border/50 shadow-2xl bg-background [&>button]:top-6 [&>button]:right-6 [&>button]:bg-background/20 [&>button]:rounded-xl [&>button]:w-10 [&>button]:h-10">
                <SheetHeader className="px-6 py-6 border-b border-border/10 bg-muted/5">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                                <Save className="size-4" />
                            </div>
                            <div className="space-y-0.5">
                                <SheetTitle className="text-xl font-bold tracking-tight">Chỉnh Sửa Câu Hỏi</SheetTitle>
                                <p className="text-xs font-medium text-muted-foreground/60 italic">Cập nhật dữ liệu tri thức hệ thống</p>
                            </div>
                        </div>
                        <SheetDescription className="text-sm text-muted-foreground/80 leading-relaxed">
                            Cập nhật lại nội dung, đáp án hoặc các thuộc tính liên kết của câu hỏi này.
                        </SheetDescription>
                    </div>
                </SheetHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto flex-1">
                    <div className="p-6 space-y-6">
                        <Controller
                            name="questionText"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel className="text-sm font-semibold mb-1.5 ml-0.5">Nội dung câu hỏi *</FieldLabel>
                                    <div className="relative">
                                        <Textarea
                                            {...field}
                                            placeholder="Nhập nội dung câu hỏi..."
                                            className="min-h-[100px] rounded-xl bg-background border-border hover:border-primary/50 focus-visible:ring-primary/20 text-sm transition-all resize-none p-4 pr-10"
                                        />
                                        <FileText className="absolute right-3.5 top-3.5 h-4 w-4 text-muted-foreground/40 pointer-events-none" />
                                    </div>
                                    {fieldState.error && <FieldError className="text-xs text-destructive mt-1.5 ml-0.5 font-medium">{fieldState.error.message}</FieldError>}
                                </Field>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Controller
                                name="questionType"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel className="text-sm font-semibold mb-1.5 ml-0.5">Loại câu hỏi *</FieldLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className="h-10 px-4 rounded-xl border-border bg-background hover:border-primary/50 transition-all text-sm">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl p-1">
                                                <SelectItem value={QuestionType.MULTIPLE_CHOICE} className="rounded-lg text-sm cursor-pointer">Trắc nghiệm</SelectItem>
                                                <SelectItem value={QuestionType.TRUE_FALSE} className="rounded-lg text-sm cursor-pointer">Đúng/Sai</SelectItem>
                                                <SelectItem value={QuestionType.FILL_BLANK} className="rounded-lg text-sm cursor-pointer">Điền vào chỗ trống</SelectItem>
                                                <SelectItem value={QuestionType.MATCHING} className="rounded-lg text-sm cursor-pointer">Ghép cặp</SelectItem>
                                                <SelectItem value={QuestionType.ESSAY} className="rounded-lg text-sm cursor-pointer">Tự luận</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FieldError className="text-xs text-destructive mt-1.5 ml-0.5 font-medium">{fieldState.error.message}</FieldError>}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="category"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel className="text-sm font-semibold mb-1.5 ml-0.5">Danh mục *</FieldLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className="h-10 px-4 rounded-xl border-border bg-background hover:border-primary/50 transition-all text-sm">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl p-1">
                                                <SelectItem value={QuestionCategory.VOCAB} className="rounded-lg text-sm cursor-pointer">Từ vựng</SelectItem>
                                                <SelectItem value={QuestionCategory.GRAMMAR} className="rounded-lg text-sm cursor-pointer">Ngữ pháp</SelectItem>
                                                <SelectItem value={QuestionCategory.READING} className="rounded-lg text-sm cursor-pointer">Đọc hiểu</SelectItem>
                                                <SelectItem value={QuestionCategory.LISTENING} className="rounded-lg text-sm cursor-pointer">Nghe hiểu</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FieldError className="text-xs text-destructive mt-1.5 ml-0.5 font-medium">{fieldState.error.message}</FieldError>}
                                    </Field>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Controller
                                name="jlptLevel"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel className="text-sm font-semibold mb-1.5 ml-0.5">Cấp độ JLPT</FieldLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className="h-10 px-4 rounded-xl border-border bg-background hover:border-primary/50 transition-all text-sm">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl p-1">
                                                <SelectItem value={QuestionJlptLevel.N5} className="rounded-lg text-sm cursor-pointer">N5</SelectItem>
                                                <SelectItem value={QuestionJlptLevel.N4} className="rounded-lg text-sm cursor-pointer">N4</SelectItem>
                                                <SelectItem value={QuestionJlptLevel.N3} className="rounded-lg text-sm cursor-pointer">N3</SelectItem>
                                                <SelectItem value={QuestionJlptLevel.N2} className="rounded-lg text-sm cursor-pointer">N2</SelectItem>
                                                <SelectItem value={QuestionJlptLevel.N1} className="rounded-lg text-sm cursor-pointer">N1</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FieldError className="text-xs text-destructive mt-1.5 ml-0.5 font-medium">{fieldState.error.message}</FieldError>}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="difficulty"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel className="text-sm font-semibold mb-1.5 ml-0.5">Độ khó</FieldLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className="h-10 px-4 rounded-xl border-border bg-background hover:border-primary/50 transition-all text-sm">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl p-1">
                                                <SelectItem value={QuestionDifficultyLevel.EASY} className="rounded-lg text-sm cursor-pointer">Dễ</SelectItem>
                                                <SelectItem value={QuestionDifficultyLevel.MEDIUM} className="rounded-lg text-sm cursor-pointer">Trung bình</SelectItem>
                                                <SelectItem value={QuestionDifficultyLevel.HARD} className="rounded-lg text-sm cursor-pointer">Khó</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FieldError className="text-xs text-destructive mt-1.5 ml-0.5 font-medium">{fieldState.error.message}</FieldError>}
                                    </Field>
                                )}
                            />
                        </div>

                        <Controller
                            name="poolId"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel className="text-sm font-semibold mb-1.5 ml-0.5">Nhóm câu hỏi (Tùy chọn)</FieldLabel>
                                    <Select value={field.value || 'none'} onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)}>
                                        <SelectTrigger className="h-10 px-4 rounded-xl border-border bg-background hover:border-primary/50 transition-all text-sm">
                                            <SelectValue placeholder="Chọn nhóm câu hỏi" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl p-1 max-h-[250px]">
                                            <SelectItem value="none" className="rounded-lg text-sm cursor-pointer italic">Không chỉ định</SelectItem>
                                            {poolsData?.data?.map((pool) => (
                                                <SelectItem key={pool.id} value={pool.id} className="rounded-lg text-sm cursor-pointer">
                                                    {pool.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && <FieldError className="text-xs text-destructive mt-1.5 ml-0.5 font-medium">{fieldState.error.message}</FieldError>}
                                </Field>
                            )}
                        />

                        {(category === QuestionCategory.LISTENING || questionType === QuestionType.LISTENING) && (
                            <div className="space-y-4 p-5 rounded-xl bg-muted/20 border border-border/50">
                                <div className="flex items-center gap-2 mb-2">
                                    <Headphones className="h-4 w-4 text-primary" />
                                    <h4 className="text-sm font-bold uppercase tracking-wide text-primary/80">
                                        Tệp âm thanh (Nghe hiểu)
                                    </h4>
                                </div>

                                <Controller
                                    name="metadata.audioUrl"
                                    control={control}
                                    rules={{ required: "Bắt buộc phải có tệp âm thanh cho câu hỏi nghe hiểu" }}
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FileUpload
                                                onUploadComplete={(url) => field.onChange(url)}
                                                accept="audio/*"
                                                label="Bấm để tải tệp âm thanh"
                                                currentValue={field.value}
                                            />
                                            {fieldState.error && <FieldError className="text-xs text-destructive mt-1.5 ml-0.5 font-medium">{fieldState.error.message}</FieldError>}
                                        </Field>
                                    )}
                                />
                            </div>
                        )}

                        {(questionType === QuestionType.MULTIPLE_CHOICE || questionType === QuestionType.LISTENING) && (
                            <div className="space-y-4 p-5 rounded-xl bg-muted/20 border border-border/50">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlignLeft className="h-4 w-4 text-primary" />
                                    <h4 className="text-sm font-bold uppercase tracking-wide text-primary/80">
                                        Các lựa chọn trả lời
                                    </h4>
                                </div>

                                <div className="space-y-3">
                                    {optionKeys.map((key) => (
                                        <div key={key} className="flex gap-2">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-background border border-border font-bold text-xs text-muted-foreground shrink-0 shadow-sm">
                                                {key}
                                            </div>
                                            <Input
                                                value={options[key] || ''}
                                                onChange={(e) => setOptions({ ...options, [key]: e.target.value })}
                                                placeholder={`Nhập nội dung lựa chọn ${key}...`}
                                                className="h-10 px-4 rounded-xl border-border bg-background focus-visible:ring-primary/20 text-sm transition-all flex-1"
                                            />
                                            {optionKeys.length > 2 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeOption(key)}
                                                    className="h-10 w-10 text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addOption}
                                        className="w-full h-10 rounded-xl border-dashed hover:bg-muted/30 text-xs font-semibold mt-2"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Thêm lựa chọn
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-6">
                            <Controller
                                name="correctAnswer"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel className="text-sm font-semibold mb-1.5 ml-0.5">Đáp án đúng *</FieldLabel>
                                        <div className="relative">
                                            <Input
                                                {...field}
                                                placeholder={(questionType === QuestionType.MULTIPLE_CHOICE || questionType === QuestionType.LISTENING) ? "Ví dụ: A" : "Nhập nội dung đáp án đúng"}
                                                className="h-10 px-4 pr-10 rounded-xl border-emerald-500/30 bg-emerald-500/5 focus-visible:ring-emerald-500/20 text-sm uppercase"
                                            />
                                            <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600/50 pointer-events-none" />
                                        </div>
                                        {(questionType === QuestionType.MULTIPLE_CHOICE || questionType === QuestionType.LISTENING) && (
                                            <p className="text-[11px] text-muted-foreground/70 ml-1 mt-1.5 italic">
                                                * Phải khớp với một trong các ký tự lựa chọn (A, B, C,...)
                                            </p>
                                        )}
                                        {fieldState.error && <FieldError className="text-xs text-destructive mt-1.5 ml-0.5 font-medium">{fieldState.error.message}</FieldError>}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="explanation"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel className="text-sm font-semibold mb-1.5 ml-0.5">Giải thích đáp án</FieldLabel>
                                        <div className="relative">
                                            <Textarea
                                                {...field}
                                                placeholder="Nhập giải thích cho đáp án..."
                                                className="min-h-[80px] rounded-xl bg-background border-border hover:border-primary/50 focus-visible:ring-primary/20 text-sm transition-all resize-none p-4 pr-10"
                                            />
                                            <BrainCircuit className="absolute right-3.5 top-3.5 h-4 w-4 text-muted-foreground/40 pointer-events-none" />
                                        </div>
                                        {fieldState.error && <FieldError className="text-xs text-destructive mt-1.5 ml-0.5 font-medium">{fieldState.error.message}</FieldError>}
                                    </Field>
                                )}
                            />
                        </div>
                    </div>
                    <SheetFooter className="p-6 border-t border-border/10 bg-muted/5 flex-row justify-end space-x-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="h-11 px-6 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            type="submit"
                            disabled={updateQuestion.isPending}
                            className="h-11 px-8 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {updateQuestion.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Lưu thay đổi
                                </>
                            )}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
