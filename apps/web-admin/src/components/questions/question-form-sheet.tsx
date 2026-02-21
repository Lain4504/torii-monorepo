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
            <SheetContent className="w-full sm:w-[800px] !max-w-[800px] max-h-screen flex flex-col p-0 gap-0 border-l border-border/50 shadow-2xl bg-background [&>button]:top-6 [&>button]:right-6 [&>button]:bg-background/20 [&>button]:rounded-xl [&>button]:w-10 [&>button]:h-10">
                <SheetHeader className="px-6 py-6 border-b border-border/10 bg-muted/5">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                                {isEdit ? <Target className="size-4" /> : <Plus className="size-4" />}
                            </div>
                            <div className="space-y-0.5">
                                <SheetTitle className="text-xl font-bold tracking-tight">
                                    {isEdit ? 'Cập Nhật Câu Hỏi' : 'Tạo Câu Hỏi Mới'}
                                </SheetTitle>
                                <p className="text-xs font-medium text-muted-foreground/60">
                                    {isEdit ? 'Điều chỉnh nội dung và cấu trúc câu hỏi' : 'Xây dựng câu hỏi tri thức mới'}
                                </p>
                            </div>
                        </div>
                        <SheetDescription className="text-sm text-muted-foreground/80 leading-relaxed italic">
                            {isEdit
                                ? 'Thay đổi nội dung hoặc các thông số cấu trúc của câu hỏi này để phù hợp với giáo trình.'
                                : 'Thiết lập các thuộc tính kỹ thuật và nội dung hiển thị cho câu hỏi thi mới trong ngân hàng.'}
                        </SheetDescription>
                    </div>
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
                            <section className="space-y-4 p-6 rounded-2xl bg-primary/5 border border-primary/10 animate-in zoom-in-95 duration-300">
                                <div className="flex items-center gap-2">
                                    <Headphones className="size-4 text-primary" />
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">
                                        Âm Thanh Đính Kèm
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
                                                label="Bấm vào đây để tải tệp âm thanh"
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
                            <section className="space-y-6 p-6 rounded-2xl bg-muted/20 border border-border/50 animate-in zoom-in-95 duration-300">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <AlignLeft className="size-4 text-primary" />
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">
                                            Các Phương Án Trả Lời
                                        </h4>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addOption}
                                        className="h-8 rounded-lg border-primary/20 bg-primary/5 text-primary text-[10px] font-bold uppercase hover:bg-primary/10">
                                        <Plus className="size-3 mr-1.5" />
                                        Thêm
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
                                                placeholder={`Nhập nội dung lựa chọn ${key}...`}
                                                className="h-11 px-4 rounded-xl border-border bg-background focus-visible:ring-primary/20 text-sm font-medium transition-all flex-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                disabled={optionKeys.length <= 2}
                                                onClick={() => removeOption(key)}
                                                className="size-11 text-destructive hover:bg-destructive/10 rounded-xl shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
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

                <div className="p-6 border-t border-border/10 bg-muted/5 flex items-center justify-end gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="h-11 px-6 rounded-xl text-xs font-bold uppercase tracking-wider transition-all">
                        Hủy Bỏ
                    </Button>
                    <Button
                        onClick={handleSubmit(onSubmit)}
                        disabled={isLoading}
                        className="h-11 px-10 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 size-4 animate-spin" />
                                Đang Xử Lý...
                            </>
                        ) : (
                            <>
                                {isEdit ? <Save className="mr-2 size-4" /> : <Plus className="mr-2 size-4" />}
                                {isEdit ? 'Cập Nhật Câu Hỏi' : 'Khởi Tạo Câu Hỏi'}
                            </>
                        )}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
