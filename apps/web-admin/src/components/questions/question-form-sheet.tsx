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
import {
    Loader2,
    Plus,
    X,
    AlignLeft,
    Headphones,
    Save
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
            <SheetContent className="w-full sm:max-w-[800px] flex flex-col overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>
                        {isEdit ? 'Cập Nhật Câu Hỏi' : 'Tạo Câu Hỏi Mới'}
                    </SheetTitle>
                    <SheetDescription>
                        {isEdit
                            ? 'Thay đổi nội dung hoặc các thông số cấu trúc của câu hỏi này.'
                            : 'Thiết lập các thuộc tính kỹ thuật và nội dung hiển thị cho câu hỏi mới.'}
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full overflow-hidden" noValidate>
                    <ScrollArea className="flex-1">
                        <div className="space-y-6 p-6">
                            {/* Question Text */}
                            <Controller
                                name="questionText"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>Nội dung câu hỏi *</FieldLabel>
                                        <div className="relative group">
                                            <Textarea
                                                id={field.name}
                                                {...field}
                                                placeholder="Nhập nội dung câu hỏi (sử dụng [...] để tạo chỗ trống nếu là điền khuyết)..."
                                                className="min-h-[120px]"
                                            />
                                        </div>
                                        <FieldError errors={[fieldState.error]} />
                                    </Field>
                                )}
                            />

                            {/* Basic Config Grid */}
                            <div className="grid grid-cols-2 gap-6">
                                <Controller
                                    name="questionType"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name}>Loại câu hỏi</FieldLabel>
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
                                            <FieldLabel htmlFor={field.name}>Chuyên môn</FieldLabel>
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

                            {/* JLPT & Difficulty */}
                            <div className="grid grid-cols-2 gap-6">
                                <Controller
                                    name="jlptLevel"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name}>JLPT Level</FieldLabel>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger id={field.name}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {[QuestionJlptLevel.N1, QuestionJlptLevel.N2, QuestionJlptLevel.N3, QuestionJlptLevel.N4, QuestionJlptLevel.N5].map(v => (
                                                        <SelectItem key={v} value={v}>{v}</SelectItem>
                                                    ))}
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

                            {/* Pool Selection */}
                            <Controller
                                name="poolId"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>Nhóm câu hỏi (Pool)</FieldLabel>
                                        <Select value={field.value || 'none'} onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)}>
                                            <SelectTrigger id={field.name}>
                                                <SelectValue placeholder="Chọn kho lưu trữ..." />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-[250px]">
                                                <SelectItem value="none">Không phân loại</SelectItem>
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
                                            <Field data-invalid={fieldState.invalid}>
                                                <FileUpload
                                                    onUploadComplete={(url) => field.onChange(url)}
                                                    accept="audio/*"
                                                    label="Bấm vào đây để tải tệp âm thanh"
                                                    currentValue={field.value}
                                                />
                                                <FieldError errors={[fieldState.error]} />
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
                                                <div className="size-11 flex items-center justify-center rounded-md bg-muted border border-border font-bold text-sm text-foreground shadow-sm">
                                                    {key}
                                                </div>
                                                <Input
                                                    value={options[key] || ''}
                                                    onChange={(e) => setOptions({ ...options, [key]: e.target.value })}
                                                    placeholder={`Nhập nội dung lựa chọn ${key}...`}
                                                    className="flex-1"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled={optionKeys.length <= 2}
                                                    onClick={() => removeOption(key)}>
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
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name}>Đáp án chính xác *</FieldLabel>
                                            <div className="relative">
                                                <Input
                                                    id={field.name}
                                                    {...field}
                                                    placeholder={(questionType === QuestionType.MULTIPLE_CHOICE || questionType === QuestionType.LISTENING) ? "E.g: A" : "Nhập đáp án..."}
                                                />
                                            </div>
                                            <FieldError errors={[fieldState.error]} />
                                        </Field>
                                    )}
                                />

                                <Controller
                                    name="explanation"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name}>Giải thích chi tiết</FieldLabel>
                                            <div className="relative group">
                                                <Textarea
                                                    id={field.name}
                                                    {...field}
                                                    placeholder="Cung cấp kiến thức bổ trợ hoặc phân tích tại sao đáp án này đúng..."
                                                    className="min-h-[100px]"
                                                />
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
                            Hủy Bỏ
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    {isEdit ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                                    {isEdit ? 'Cập Nhật Câu Hỏi' : 'Khởi Tạo Câu Hỏi'}
                                </>
                            )}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
