import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import {
    Field,
    FieldLabel,
    FieldError,
} from '@workspace/ui/components/field';
import {
    QuestionType,
    QuestionJlptLevel,
    QuestionDifficultyLevel,
    questionBankCreateDTOSchema,
    type QuestionBankCreateDTO,
} from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';
import { useCreateQuestionBank } from "@/api/services/question-bank.ts";

const createQuestionSchema = questionBankCreateDTOSchema.omit({
    tags: true,
    options: true,
    createdBy: true
}).extend({
    tags: z.string().optional(),
    options: z.string().optional(),
});

type CreateQuestionFormData = z.infer<typeof createQuestionSchema>;

interface CreateQuestionBankDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateQuestionBankDialog({
    open,
    onOpenChange,
}: CreateQuestionBankDialogProps) {
    const createQuestionBank = useCreateQuestionBank();

    const {
        control,
        handleSubmit,
        watch,
        reset,
    } = useForm<CreateQuestionFormData>({
        resolver: zodResolver(createQuestionSchema),
        defaultValues: {
            questionText: '',
            questionType: QuestionType.MULTIPLE_CHOICE,
            category: '',
            subcategory: '',
            correctAnswer: '',
            explanation: '',
            tags: '',
            options: '',
        },
    });

    const questionType = watch('questionType');

    // Reset form when dialog closes
    useEffect(() => {
        if (!open) {
            reset();
        }
    }, [open, reset]);

    const handleClose = () => {
        if (!createQuestionBank.isPending) {
            onOpenChange(false);
        }
    };

    const onSubmit = async (data: CreateQuestionFormData) => {
        try {
            // Parse tags
            const tags = data.tags
                ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
                : undefined;

            // Parse options
            let options: Record<string, string> | undefined = undefined;
            if (data.options) {
                try {
                    options = JSON.parse(data.options);
                } catch (e) {
                    console.error('Invalid JSON options');
                    // Could add setCheck error here ideally
                }
            }

            const dto: QuestionBankCreateDTO = {
                questionText: data.questionText,
                questionType: data.questionType,
                jlptLevel: data.jlptLevel,
                category: data.category || undefined,
                subcategory: data.subcategory || undefined,
                difficulty: data.difficulty,
                options: options || undefined,
                correctAnswer: data.correctAnswer || undefined,
                explanation: data.explanation || undefined,
                tags: tags || undefined,
            };

            await createQuestionBank.mutateAsync(dto);
            toast.success('Question created successfully!', {
                description: `Question has been added to the bank.`,
            });
            onOpenChange(false);
            reset();
        } catch (error: any) {
            toast.error('Failed to create question', {
                description: error.response?.data?.error || error.message,
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Question</DialogTitle>
                    <DialogDescription>
                        Add a new question to the question bank. Fill in the required fields.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                    <Controller
                        control={control}
                        name="questionText"
                        render={({ field, fieldState }) => (
                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name} className="flex">Question Text <span className="text-destructive ml-1">*</span></FieldLabel>
                                <Textarea
                                    id={field.name}
                                    {...field}
                                    rows={3}
                                    placeholder="Enter the question text..."
                                    aria-invalid={fieldState.invalid}
                                />
                                <FieldError errors={[fieldState.error]} />
                            </Field>
                        )}
                    />

                    <Controller
                        control={control}
                        name="questionType"
                        render={({ field, fieldState }) => (
                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name} className="flex">Question Type <span className="text-destructive ml-1">*</span></FieldLabel>
                                <Select
                                    value={field.value}
                                    onValueChange={(value) => field.onChange(value as QuestionType)}
                                >
                                    <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                                        <SelectValue placeholder="Select question type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={QuestionType.MULTIPLE_CHOICE}>Multiple Choice</SelectItem>
                                        <SelectItem value={QuestionType.TRUE_FALSE}>True/False</SelectItem>
                                        <SelectItem value={QuestionType.FILL_BLANK}>Fill Blank</SelectItem>
                                        <SelectItem value={QuestionType.MATCHING}>Matching</SelectItem>
                                        <SelectItem value={QuestionType.ESSAY}>Essay</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FieldError errors={[fieldState.error]} />
                            </Field>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Controller
                            control={control}
                            name="jlptLevel"
                            render={({ field, fieldState }) => (
                                <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>JLPT Level</FieldLabel>
                                    <Select
                                        value={field.value || undefined}
                                        onValueChange={(value) => field.onChange(value as QuestionJlptLevel)}
                                    >
                                        <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                                            <SelectValue placeholder="Select Level" />
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
                            control={control}
                            name="difficulty"
                            render={({ field, fieldState }) => (
                                <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Difficulty</FieldLabel>
                                    <Select
                                        value={field.value || undefined}
                                        onValueChange={(value) => field.onChange(value as QuestionDifficultyLevel)}
                                    >
                                        <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                                            <SelectValue placeholder="Select Difficulty" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={QuestionDifficultyLevel.EASY}>Easy</SelectItem>
                                            <SelectItem value={QuestionDifficultyLevel.MEDIUM}>Medium</SelectItem>
                                            <SelectItem value={QuestionDifficultyLevel.HARD}>Hard</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FieldError errors={[fieldState.error]} />
                                </Field>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Controller
                            control={control}
                            name="category"
                            render={({ field, fieldState }) => (
                                <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                                    <Input
                                        id={field.name}
                                        {...field}
                                        value={field.value || ''}
                                        placeholder="Enter category..."
                                        aria-invalid={fieldState.invalid}
                                    />
                                    <FieldError errors={[fieldState.error]} />
                                </Field>
                            )}
                        />

                        <Controller
                            control={control}
                            name="subcategory"
                            render={({ field, fieldState }) => (
                                <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Subcategory</FieldLabel>
                                    <Input
                                        id={field.name}
                                        {...field}
                                        value={field.value || ''}
                                        placeholder="Enter subcategory..."
                                        aria-invalid={fieldState.invalid}
                                    />
                                    <FieldError errors={[fieldState.error]} />
                                </Field>
                            )}
                        />
                    </div>

                    {questionType === QuestionType.MULTIPLE_CHOICE && (
                        <Controller
                            control={control}
                            name="options"
                            render={({ field, fieldState }) => (
                                <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>
                                        Options (JSON format: {'{ "A": "option1", "B": "option2" }'})
                                    </FieldLabel>
                                    <Textarea
                                        id={field.name}
                                        {...field}
                                        value={field.value || ''}
                                        rows={3}
                                        className="font-mono text-sm"
                                        placeholder='{"A": "Option 1", "B": "Option 2", "C": "Option 3"}'
                                        aria-invalid={fieldState.invalid}
                                    />
                                    <FieldError errors={[fieldState.error]} />
                                </Field>
                            )}
                        />
                    )}

                    <Controller
                        control={control}
                        name="correctAnswer"
                        render={({ field, fieldState }) => (
                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Correct Answer</FieldLabel>
                                <Input
                                    id={field.name}
                                    {...field}
                                    value={field.value || ''}
                                    placeholder="Enter correct answer..."
                                    aria-invalid={fieldState.invalid}
                                />
                                <FieldError errors={[fieldState.error]} />
                            </Field>
                        )}
                    />

                    <Controller
                        control={control}
                        name="explanation"
                        render={({ field, fieldState }) => (
                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Explanation</FieldLabel>
                                <Textarea
                                    id={field.name}
                                    {...field}
                                    value={field.value || ''}
                                    rows={3}
                                    placeholder="Enter explanation for the answer..."
                                    aria-invalid={fieldState.invalid}
                                />
                                <FieldError errors={[fieldState.error]} />
                            </Field>
                        )}
                    />

                    <Controller
                        control={control}
                        name="tags"
                        render={({ field, fieldState }) => (
                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Tags</FieldLabel>
                                <Input
                                    id={field.name}
                                    {...field}
                                    value={field.value || ''}
                                    placeholder="Enter tags separated by commas (e.g., grammar, vocabulary)"
                                    aria-invalid={fieldState.invalid}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Separate multiple tags with commas
                                </p>
                                <FieldError errors={[fieldState.error]} />
                            </Field>
                        )}
                    />

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createQuestionBank.isPending}>
                            {createQuestionBank.isPending ? 'Creating...' : 'Create Question'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
