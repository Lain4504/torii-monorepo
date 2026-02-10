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
import {
    Loader2,
    Plus,
    X,
    BrainCircuit,
    FileText,
    CheckCircle2,
    AlignLeft,
    Headphones,
    Save,
    LayoutGrid,
    Target
} from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';
import { useCreateQuestion, useUpdateQuestion } from '@/api/services/questions.ts';
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

type QuestionFormData = z.input<typeof questionCreateDTOSchema>;

interface QuestionFormSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    question?: QuestionResponseDTO | null; // If provided, we are in EDIT mode
    defaultPoolId?: string;
}

export function QuestionFormSheet({
    open,
    onOpenChange,
    question,
    defaultPoolId
}: QuestionFormSheetProps) {
    const isEdit = !!question;
    const createQuestion = useCreateQuestion();
    const updateQuestion = useUpdateQuestion();
    const { data: poolsData } = useQuestionPools({ page: 1, limit: 100 });

    const [options, setOptions] = useState<Record<string, string>>({ A: '', B: '' });
    const [optionKeys, setOptionKeys] = useState<string[]>(['A', 'B']);

    const {
        control,
        handleSubmit,
        reset,
        watch,
    } = useForm<QuestionFormData>({
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
            poolId: defaultPoolId || undefined,
        },
    });

    const questionType = watch('questionType');
    const category = watch('category');

    useEffect(() => {
        if (open) {
            if (isEdit && question) {
                reset({
                    questionText: question.questionText,
                    questionType: question.questionType as QuestionType,
                    jlptLevel: question.jlptLevel as QuestionJlptLevel,
                    category: question.category as QuestionCategory,
                    difficulty: question.difficulty as QuestionDifficultyLevel,
                    correctAnswer: question.correctAnswer,
                    explanation: question.explanation || '',
                    tags: question.tags || [],
                    poolId: question.poolId || defaultPoolId || undefined,
                    metadata: question.metadata,
                });

                if (question.options) {
                    setOptions(question.options as Record<string, string>);
                    setOptionKeys(Object.keys(question.options));
                } else {
                    setOptions({ A: '', B: '' });
                    setOptionKeys(['A', 'B']);
                }
            } else {
                reset({
                    questionText: '',
                    questionType: QuestionType.MULTIPLE_CHOICE,
                    jlptLevel: QuestionJlptLevel.N5,
                    category: QuestionCategory.VOCAB,
                    difficulty: QuestionDifficultyLevel.MEDIUM,
                    correctAnswer: '',
                    explanation: '',
                    tags: [],
                    poolId: defaultPoolId || undefined,
                });
                setOptions({ A: '', B: '' });
                setOptionKeys(['A', 'B']);
            }
        }
    }, [open, isEdit, question, defaultPoolId, reset]);

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

    const onSubmit = async (data: QuestionFormData) => {
        try {
            const submitData: QuestionCreateDTO = {
                ...data,
                options: (questionType === QuestionType.MULTIPLE_CHOICE || questionType === QuestionType.LISTENING) ? options : undefined,
            };

            if (isEdit && question) {
                await updateQuestion.mutateAsync({ id: question.id, question: submitData });
                toast.success('Thành công', { description: 'Cập nhật câu hỏi thành công.' });
            } else {
                await createQuestion.mutateAsync(submitData);
                toast.success('Thành công', { description: 'Đã tạo câu hỏi mới thành công.' });
            }
            onOpenChange(false);
        } catch (error: any) {
            toast.error(isEdit ? 'Lỗi cập nhật' : 'Lỗi khởi tạo', {
                description: error.response?.data?.message || 'Không thể lưu câu hỏi vào hệ thống.',
            });
        }
    };

    const isLoading = createQuestion.isPending || updateQuestion.isPending;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-2xl border-l border-border bg-background p-0 flex flex-col h-full shadow-2xl">
                <SheetHeader className="p-8 border-b border-border bg-muted/5 space-y-2">
                    <SheetTitle className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        {isEdit ? <Target className="size-6 text-primary opacity-40" /> : <Plus className="size-6 text-primary opacity-40" />}
                        {isEdit ? 'Cập nhật Câu hỏi' : 'Tạo Câu hỏi mới'}
                    </SheetTitle>
                    <SheetDescription className="text-sm font-medium text-muted-foreground/60 italic">
                        {isEdit ? 'Thay đổi nội dung hoặc các thông số cấu trúc của câu hỏi này.' : 'Thiết lập nội dung và các thuộc tính kỹ thuật cho câu hỏi thi mới.'}
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-8 space-y-8">
                        {/* Question Text */}
                        <Controller
                            name="questionText"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field className="space-y-3">
                                    <FieldLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <FileText className="size-4" />
                                        Nội dung câu hỏi *
                                    </FieldLabel>
                                    <div className="relative group">
                                        <Textarea
                                            {...field}
                                            placeholder="Nhập nội dung câu hỏi (sử dụng [...] để tạo chỗ trống nếu là điền khuyết)..."
                                            className="min-h-[120px] rounded-2xl bg-muted/5 border-border hover:border-primary/40 focus-visible:ring-primary/20 text-base leading-relaxed p-6 transition-all resize-none shadow-sm"
                                        />
                                    </div>
                                    {fieldState.error && <FieldError className="text-[10px] font-bold uppercase text-destructive tracking-wider ml-1">{fieldState.error.message}</FieldError>}
                                </Field>
                            )}
                        />

                        {/* Basic Config Grid */}
                        <div className="grid grid-cols-2 gap-6">
                            <Controller
                                name="questionType"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field className="space-y-3">
                                        <FieldLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Loại câu hỏi</FieldLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className="h-12 px-4 rounded-xl border-border bg-background hover:border-primary/40 transition-all font-bold text-xs uppercase tracking-wider">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-border shadow-2xl p-1">
                                                <SelectItem value={QuestionType.MULTIPLE_CHOICE} className="rounded-lg text-xs font-bold uppercase py-3">Trắc nghiệm</SelectItem>
                                                <SelectItem value={QuestionType.TRUE_FALSE} className="rounded-lg text-xs font-bold uppercase py-3">Đúng/Sai</SelectItem>
                                                <SelectItem value={QuestionType.FILL_BLANK} className="rounded-lg text-xs font-bold uppercase py-3">Điền vào chỗ trống</SelectItem>
                                                <SelectItem value={QuestionType.MATCHING} className="rounded-lg text-xs font-bold uppercase py-3">Ghép cặp</SelectItem>
                                                <SelectItem value={QuestionType.ESSAY} className="rounded-lg text-xs font-bold uppercase py-3">Tự luận</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FieldError className="text-[10px] uppercase text-destructive font-bold">{fieldState.error.message}</FieldError>}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="category"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field className="space-y-3">
                                        <FieldLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Chuyên môn</FieldLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className="h-12 px-4 rounded-xl border-border bg-background hover:border-primary/40 transition-all font-bold text-xs uppercase tracking-wider">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-border shadow-2xl p-1">
                                                <SelectItem value={QuestionCategory.VOCAB} className="rounded-lg text-xs font-bold uppercase py-3">Từ vựng</SelectItem>
                                                <SelectItem value={QuestionCategory.GRAMMAR} className="rounded-lg text-xs font-bold uppercase py-3">Ngữ pháp</SelectItem>
                                                <SelectItem value={QuestionCategory.READING} className="rounded-lg text-xs font-bold uppercase py-3">Đọc hiểu</SelectItem>
                                                <SelectItem value={QuestionCategory.LISTENING} className="rounded-lg text-xs font-bold uppercase py-3">Nghe hiểu</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FieldError className="text-[10px] uppercase text-destructive font-bold">{fieldState.error.message}</FieldError>}
                                    </Field>
                                )}
                            />
                        </div>

                        {/* JLPT & Difficulty */}
                        <div className="grid grid-cols-2 gap-6">
                            <Controller
                                name="jlptLevel"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field className="space-y-3">
                                        <FieldLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">JLPT Level</FieldLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className="h-12 px-4 rounded-xl border-border bg-background hover:border-primary/40 transition-all font-bold text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-border shadow-2xl p-1">
                                                {[QuestionJlptLevel.N1, QuestionJlptLevel.N2, QuestionJlptLevel.N3, QuestionJlptLevel.N4, QuestionJlptLevel.N5].map(v => (
                                                    <SelectItem key={v} value={v} className="rounded-lg font-bold py-3">{v}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FieldError className="text-[10px] uppercase text-destructive font-bold">{fieldState.error.message}</FieldError>}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="difficulty"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field className="space-y-3">
                                        <FieldLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Độ khó</FieldLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className="h-12 px-4 rounded-xl border-border bg-background hover:border-primary/40 transition-all font-bold text-xs uppercase tracking-wider">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-border shadow-2xl p-1">
                                                <SelectItem value={QuestionDifficultyLevel.EASY} className="rounded-lg text-xs font-bold uppercase py-3 text-emerald-600">Dễ</SelectItem>
                                                <SelectItem value={QuestionDifficultyLevel.MEDIUM} className="rounded-lg text-xs font-bold uppercase py-3 text-amber-600">Trung bình</SelectItem>
                                                <SelectItem value={QuestionDifficultyLevel.HARD} className="rounded-lg text-xs font-bold uppercase py-3 text-rose-600">Khó</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FieldError className="text-[10px] uppercase text-destructive font-bold">{fieldState.error.message}</FieldError>}
                                    </Field>
                                )}
                            />
                        </div>

                        {/* Pool Selection */}
                        <Controller
                            name="poolId"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field className="space-y-3">
                                    <FieldLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <LayoutGrid className="size-4" />
                                        Nhóm câu hỏi (Pool)
                                    </FieldLabel>
                                    <Select value={field.value || 'none'} onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)}>
                                        <SelectTrigger className="h-12 px-4 rounded-xl border-border bg-background hover:border-primary/40 transition-all font-medium text-xs">
                                            <SelectValue placeholder="Chọn kho lưu trữ..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-border shadow-2xl p-1 max-h-[250px]">
                                            <SelectItem value="none" className="rounded-lg text-xs italic py-3 opacity-60">Không phân loại</SelectItem>
                                            {poolsData?.data?.map((pool) => (
                                                <SelectItem key={pool.id} value={pool.id} className="rounded-lg text-xs font-bold py-3">
                                                    {pool.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && <FieldError className="text-[10px] uppercase text-destructive font-bold">{fieldState.error.message}</FieldError>}
                                </Field>
                            )}
                        />

                        {/* Listening Content */}
                        {(category === QuestionCategory.LISTENING || questionType === QuestionType.LISTENING) && (
                            <section className="space-y-4 p-6 rounded-3xl bg-primary/5 border border-primary/10 animate-in zoom-in-95 duration-300">
                                <div className="flex items-center gap-2">
                                    <Headphones className="size-4 text-primary" />
                                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary/80">
                                        Audio Resource
                                    </h4>
                                </div>

                                <Controller
                                    name="metadata.audioUrl"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <Field className="space-y-2">
                                            <FileUpload
                                                onUploadComplete={(url) => field.onChange(url)}
                                                accept="audio/*"
                                                label="Upload Audio File"
                                                currentValue={field.value}
                                            />
                                            {fieldState.error && <FieldError className="text-[10px] font-bold text-destructive uppercase tracking-widest">{fieldState.error.message}</FieldError>}
                                        </Field>
                                    )}
                                />
                            </section>
                        )}

                        {/* Options Section */}
                        {(questionType === QuestionType.MULTIPLE_CHOICE || questionType === QuestionType.LISTENING) && (
                            <section className="space-y-6 p-6 rounded-3xl bg-muted/20 border border-border/50 animate-in zoom-in-95 duration-300">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <AlignLeft className="size-4 text-primary" />
                                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary/80">
                                            Answer Options
                                        </h4>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addOption}
                                        className="h-8 rounded-lg border-primary/20 bg-primary/5 text-primary text-[10px] font-bold uppercase hover:bg-primary/10"
                                    >
                                        <Plus className="size-3 mr-1.5" />
                                        Add
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {optionKeys.map((key) => (
                                        <div key={key} className="flex gap-3 group">
                                            <div className="size-11 flex items-center justify-center rounded-xl bg-background border border-border font-black text-xs text-muted-foreground shadow-sm group-focus-within:border-primary/40 group-focus-within:text-primary transition-all">
                                                {key}
                                            </div>
                                            <Input
                                                value={options[key] || ''}
                                                onChange={(e) => setOptions({ ...options, [key]: e.target.value })}
                                                placeholder={`Option ${key} text...`}
                                                className="h-11 px-4 rounded-xl border-border bg-background focus-visible:ring-primary/20 text-sm font-medium transition-all flex-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                disabled={optionKeys.length <= 2}
                                                onClick={() => removeOption(key)}
                                                className="size-11 text-destructive hover:bg-destructive/10 rounded-xl shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="size-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Final Answer & Explanation */}
                        <div className="space-y-8 pt-4 border-t border-border">
                            <Controller
                                name="correctAnswer"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field className="space-y-3">
                                        <FieldLabel className="text-xs font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                                            <CheckCircle2 className="size-4" />
                                            Đáp án chính xác *
                                        </FieldLabel>
                                        <div className="relative">
                                            <Input
                                                {...field}
                                                placeholder={(questionType === QuestionType.MULTIPLE_CHOICE || questionType === QuestionType.LISTENING) ? "E.g: A" : "Nhập đáp án..."}
                                                className="h-12 px-6 pr-12 rounded-2xl border-emerald-500/30 bg-emerald-500/5 focus-visible:ring-emerald-500/20 text-lg font-bold text-emerald-700 uppercase"
                                            />
                                            <Target className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-emerald-600/30 pointer-events-none" />
                                        </div>
                                        {fieldState.error && <FieldError className="text-[10px] font-bold uppercase text-destructive tracking-wider ml-1">{fieldState.error.message}</FieldError>}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="explanation"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field className="space-y-3">
                                        <FieldLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                            <BrainCircuit className="size-4" />
                                            Giải thích chi tiết
                                        </FieldLabel>
                                        <div className="relative group">
                                            <Textarea
                                                {...field}
                                                placeholder="Cung cấp kiến thức bổ trợ hoặc phân tích tại sao đáp án này đúng..."
                                                className="min-h-[100px] rounded-2xl bg-muted/5 border-border hover:border-primary/40 focus-visible:ring-primary/20 text-sm leading-relaxed p-6 transition-all resize-none italic"
                                            />
                                        </div>
                                        {fieldState.error && <FieldError className="text-[10px] font-bold uppercase text-destructive tracking-wider ml-1">{fieldState.error.message}</FieldError>}
                                    </Field>
                                )}
                            />
                        </div>
                    </div>
                </form>

                <div className="p-8 border-t border-border bg-muted/5 flex items-center justify-end gap-4 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl h-12 px-8 font-bold text-xs uppercase tracking-widest text-muted-foreground hover:bg-muted"
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        onClick={handleSubmit(onSubmit)}
                        disabled={isLoading}
                        className="rounded-xl h-12 px-10 shadow-lg shadow-primary/20 bg-primary text-white font-bold text-xs uppercase tracking-[0.15em] transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 size-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                {isEdit ? <Save className="mr-2 size-4" /> : <Plus className="mr-2 size-4" />}
                                {isEdit ? 'Update Question' : 'Deploy Question'}
                            </>
                        )}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
