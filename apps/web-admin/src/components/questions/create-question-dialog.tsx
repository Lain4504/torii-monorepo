import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import {
    Field,
    FieldLabel,
    FieldError,
} from '@workspace/ui/components/field';
import { Loader2, Plus, X } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';
import { useCreateQuestion } from '@/api/services/questions.ts';
import {
    QuestionType,
    QuestionStatus,
    QuestionCategory,
    QuestionDifficultyLevel,
    QuestionJlptLevel,
    questionCreateDTOSchema,
    type QuestionCreateDTO,
} from '@workspace/schemas';
import type { z } from 'zod';

type CreateQuestionFormData = z.input<typeof questionCreateDTOSchema>;

interface CreateQuestionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateQuestionDialog({ open, onOpenChange }: CreateQuestionDialogProps) {
    const createQuestion = useCreateQuestion();
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
        },
    });

    const questionType = watch('questionType');

    const addOption = () => {
        const nextKey = String.fromCharCode(65 + optionKeys.length);
        setOptionKeys([...optionKeys, nextKey]);
        setOptions({ ...options, [nextKey]: '' });
    };

    const removeOption = (key: string) => {
        if (optionKeys.length <= 2) {
            toast.error('At least 2 options are required');
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
                options: questionType === QuestionType.MULTIPLE_CHOICE ? options : undefined,
            };

            await createQuestion.mutateAsync(submitData);
            toast.success('Question created successfully');
            reset();
            setOptions({ A: '', B: '' });
            setOptionKeys(['A', 'B']);
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create question');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl border-none shadow-2xl bg-background/95 backdrop-blur-xl rounded-2xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
                <DialogHeader className="p-8 pb-4 bg-muted/30">
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                        Create Question
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8 pt-4 space-y-6">
                    <Controller
                        name="questionText"
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel>Question Text *</FieldLabel>
                                <Textarea
                                    {...field}
                                    placeholder="Enter the question..."
                                    className="min-h-[100px] bg-background/50 border-border/40"
                                />
                                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                            </Field>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Controller
                            name="questionType"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Question Type *</FieldLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="bg-background/50 border-border/40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={QuestionType.MULTIPLE_CHOICE}>Multiple Choice</SelectItem>
                                            <SelectItem value={QuestionType.TRUE_FALSE}>True/False</SelectItem>
                                            <SelectItem value={QuestionType.FILL_BLANK}>Fill Blank</SelectItem>
                                            <SelectItem value={QuestionType.MATCHING}>Matching</SelectItem>
                                            <SelectItem value={QuestionType.ESSAY}>Essay</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                </Field>
                            )}
                        />

                        <Controller
                            name="category"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Category</FieldLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="bg-background/50 border-border/40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={QuestionCategory.VOCAB}>Vocab</SelectItem>
                                            <SelectItem value={QuestionCategory.GRAMMAR}>Grammar</SelectItem>
                                            <SelectItem value={QuestionCategory.READING}>Reading</SelectItem>
                                            <SelectItem value={QuestionCategory.LISTENING}>Listening</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
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
                                    <FieldLabel>JLPT Level</FieldLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="bg-background/50 border-border/40">
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
                                    {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                </Field>
                            )}
                        />

                        <Controller
                            name="difficulty"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Difficulty</FieldLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="bg-background/50 border-border/40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={QuestionDifficultyLevel.EASY}>Easy</SelectItem>
                                            <SelectItem value={QuestionDifficultyLevel.MEDIUM}>Medium</SelectItem>
                                            <SelectItem value={QuestionDifficultyLevel.HARD}>Hard</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                                </Field>
                            )}
                        />
                    </div>

                    {questionType === QuestionType.MULTIPLE_CHOICE && (
                        <Field>
                            <FieldLabel>Options *</FieldLabel>
                            <div className="space-y-2">
                                {optionKeys.map((key) => (
                                    <div key={key} className="flex gap-2">
                                        <Input
                                            value={options[key] || ''}
                                            onChange={(e) => setOptions({ ...options, [key]: e.target.value })}
                                            placeholder={`Option ${key}`}
                                            className="flex-1 bg-background/50 border-border/40"
                                        />
                                        {optionKeys.length > 2 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeOption(key)}
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
                                    className="w-full"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Option
                                </Button>
                            </div>
                        </Field>
                    )}

                    <Controller
                        name="correctAnswer"
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel>Correct Answer *</FieldLabel>
                                <Input
                                    {...field}
                                    placeholder={questionType === QuestionType.MULTIPLE_CHOICE ? "e.g., A" : "Enter correct answer"}
                                    className="bg-background/50 border-border/40"
                                />
                                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                            </Field>
                        )}
                    />

                    <Controller
                        name="explanation"
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel>Explanation</FieldLabel>
                                <Textarea
                                    {...field}
                                    placeholder="Explain why this is the correct answer..."
                                    className="min-h-[80px] bg-background/50 border-border/40"
                                />
                                {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                            </Field>
                        )}
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                reset();
                                setOptions({ A: '', B: '' });
                                setOptionKeys(['A', 'B']);
                                onOpenChange(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createQuestion.isPending}>
                            {createQuestion.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Question
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

