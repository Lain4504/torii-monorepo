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
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import {
    Field,
    FieldLabel,
    FieldError,
} from '@workspace/ui/components/field';
import { Plus, X, BrainCircuit, FileText, CheckCircle2, AlignLeft, Headphones } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';
import { useCreateQuestion } from '@/api/services/questions.ts';
import { useQuestionPools } from '@/api/services/question-pools.ts';
import {
    QuestionType,
    QuestionCategory,
    QuestionDifficultyLevel,
    QuestionJlptLevel,
    questionCreateDTOSchema,
    type QuestionCreateDTO,
} from '@workspace/schemas';
import type { z } from 'zod';
import { Spinner } from "@workspace/ui/components/spinner";

type CreateQuestionFormData = z.input<typeof questionCreateDTOSchema>;

interface CreateQuestionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultPoolId?: string;
}

export function CreateQuestionDialog({ open, onOpenChange, defaultPoolId }: CreateQuestionDialogProps) {
    const createQuestion = useCreateQuestion();
    const { data: poolsData } = useQuestionPools({ page: 1, limit: 100 });
    const [options, setOptions] = useState<Record<string, string>>({ A: '', B: '' });
    const [optionKeys, setOptionKeys] = useState<string[]>(['A', 'B']);

    const {
        control,
        handleSubmit,
        reset,
        watch,
    } = useForm<CreateQuestionFormData>({
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
    }, [open, defaultPoolId, reset]);

    const addOption = () => {
        const nextKey = String.fromCharCode(65 + optionKeys.length);
        setOptionKeys([...optionKeys, nextKey]);
        setOptions({ ...options, [nextKey]: '' });
    };

    const removeOption = (key: string) => {
        if (optionKeys.length <= 2) {
            toast.error('Không thể thực hiện', { description: 'Câu hỏi trắc nghiệm cần tối thiểu 2 lựa chọn.' });
            return;
        }
        setOptionKeys(optionKeys.filter(k => k !== key));
        const newOptions = { ...options };
        delete newOptions[key];
        setOptions(newOptions);
    };

    const onSubmit = async (data: CreateQuestionFormData) => {
        try {
            const submitData: QuestionCreateDTO = {
                ...data,
                options: (questionType === QuestionType.MULTIPLE_CHOICE || questionType === QuestionType.LISTENING) ? options : undefined,
            };

            await createQuestion.mutateAsync(submitData);
            toast.success('Thành công', {
                description: 'Đã tạo câu hỏi mới thành công.',
            });
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Lỗi khởi tạo', {
                description: error.response?.data?.message || 'Không thể lưu câu hỏi vào hệ thống.',
            });
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="!w-full sm:!max-w-[800px] flex flex-col">
                <SheetHeader>
                    <SheetTitle>Tạo Câu Hỏi Mới</SheetTitle>
                    <SheetDescription>
                        Thiết lập nội dung và các thuộc tính kỹ thuật chuyên sâu cho câu hỏi mới.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full overflow-hidden" noValidate>
                    <ScrollArea className="flex-1 min-h-0">
                        <div className="space-y-6 p-6">
                            <Controller
                                name="questionText"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>Nội dung câu hỏi *</FieldLabel>
                                        <div className="relative">
                                            <Textarea
                                                id={field.name}
                                                {...field}
                                                placeholder="Nhập nội dung câu hỏi..."
                                                className="min-h-[100px] pr-10"
                                            />
                                            <FileText className="absolute right-3.5 top-3.5 h-4 w-4 text-muted-foreground/40 pointer-events-none" />
                                        </div>
                                        <FieldError errors={[fieldState.error]} />
                                    </Field>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Controller
                                    name="questionType"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name}>Loại câu hỏi *</FieldLabel>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger id={field.name}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={QuestionType.MULTIPLE_CHOICE}>Trắc nghiệm</SelectItem>
                                                    <SelectItem value={QuestionType.TRUE_FALSE}>Đúng/Sai</SelectItem>
                                                    <SelectItem value={QuestionType.FILL_BLANK}>Điền vào chỗ trống</SelectItem>
                                                    <SelectItem value={QuestionType.MATCHING}>Ghép cặp</SelectItem>
                                                    <SelectItem value={QuestionType.ESSAY}>Tự luận</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FieldError errors={[fieldState.error]} />
                                        </Field>
                                    )}
                                />

                                <Controller
                                    name="category"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name}>Danh mục *</FieldLabel>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger id={field.name}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={QuestionCategory.VOCAB}>Từ vựng</SelectItem>
                                                    <SelectItem value={QuestionCategory.GRAMMAR}>Ngữ pháp</SelectItem>
                                                    <SelectItem value={QuestionCategory.READING}>Đọc hiểu</SelectItem>
                                                    <SelectItem value={QuestionCategory.LISTENING}>Nghe hiểu</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FieldError errors={[fieldState.error]} />
                                        </Field>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Controller
                                    name="jlptLevel"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name}>Cấp độ JLPT</FieldLabel>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger id={field.name}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={QuestionJlptLevel.N5}>N5</SelectItem>
                                                    <SelectItem value={QuestionJlptLevel.N4}>N4</SelectItem>
                                                    <SelectItem value={QuestionJlptLevel.N3}>N3</SelectItem>
                                                    <SelectItem value={QuestionJlptLevel.N2}>N2</SelectItem>
                                                    <SelectItem value={QuestionJlptLevel.N1}>N1</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FieldError errors={[fieldState.error]} />
                                        </Field>
                                    )}
                                />

                                <Controller
                                    name="difficulty"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name}>Độ khó</FieldLabel>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger id={field.name}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={QuestionDifficultyLevel.EASY}>Dễ</SelectItem>
                                                    <SelectItem value={QuestionDifficultyLevel.MEDIUM}>Trung bình</SelectItem>
                                                    <SelectItem value={QuestionDifficultyLevel.HARD}>Khó</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FieldError errors={[fieldState.error]} />
                                        </Field>
                                    )}
                                />
                            </div>

                            <Controller
                                name="poolId"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>Nhóm câu hỏi (Tùy chọn)</FieldLabel>
                                        <Select value={field.value || 'none'} onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)}>
                                            <SelectTrigger id={field.name}>
                                                <SelectValue placeholder="Chọn nhóm câu hỏi" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Không chỉ định</SelectItem>
                                                {poolsData?.data?.map((pool) => (
                                                    <SelectItem key={pool.id} value={pool.id}>
                                                        {pool.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FieldError errors={[fieldState.error]} />
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
                                            <Field data-invalid={fieldState.invalid}>
                                                <FileUpload
                                                    onUploadComplete={(url) => field.onChange(url)}
                                                    accept="audio/*"
                                                    label="Bấm để tải tệp âm thanh"
                                                    currentValue={field.value}
                                                />
                                                <FieldError errors={[fieldState.error]} />
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
                                                    className="flex-1"
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
                                            className="w-full border-dashed mt-2"
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
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name}>Đáp án đúng *</FieldLabel>
                                            <div className="relative">
                                                <Input
                                                    id={field.name}
                                                    {...field}
                                                    placeholder={(questionType === QuestionType.MULTIPLE_CHOICE || questionType === QuestionType.LISTENING) ? "Ví dụ: A" : "Nhập nội dung đáp án đúng"}
                                                    className="pr-10"
                                                />
                                                <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600/50 pointer-events-none" />
                                            </div>
                                            {(questionType === QuestionType.MULTIPLE_CHOICE || questionType === QuestionType.LISTENING) && (
                                                <p className="text-xs text-muted-foreground mt-1.5">
                                                    * Phải khớp với một trong các ký tự lựa chọn (A, B, C,...)
                                                </p>
                                            )}
                                            <FieldError errors={[fieldState.error]} />
                                        </Field>
                                    )}
                                />

                                <Controller
                                    name="explanation"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name}>Giải thích đáp án</FieldLabel>
                                            <div className="relative">
                                                <Textarea
                                                    id={field.name}
                                                    {...field}
                                                    placeholder="Nhập giải thích cho đáp án..."
                                                    className="min-h-[80px] pr-10"
                                                />
                                                <BrainCircuit className="absolute right-3.5 top-3.5 h-4 w-4 text-muted-foreground/40 pointer-events-none" />
                                            </div>
                                            <FieldError errors={[fieldState.error]} />
                                        </Field>
                                    )}
                                />
                            </div>
                        </div>
                    </ScrollArea>
                    <SheetFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}>
                            Hủy bỏ
                        </Button>
                        <Button
                            type="submit"
                            disabled={createQuestion.isPending}>
                            {createQuestion.isPending ? (
                                <>
                                    <Spinner className="mr-2" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Khởi tạo câu hỏi
                                </>
                            )}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
