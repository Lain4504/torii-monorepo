import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import {
    QuestionType,
    QuestionJlptLevel,
    QuestionDifficultyLevel,
    QuestionStatus,
    questionBankUpdateDTOSchema,
    type QuestionBankUpdateDTO,
    type QuestionBankResponseDTO,
} from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';
import {useUpdateQuestionBank} from "@/api/services/question-bank.ts";

const updateQuestionSchema = questionBankUpdateDTOSchema.omit({
    tags: true,
    options: true
}).extend({
    questionText: z.string().min(1, 'Question text is required'),
    questionType: z.nativeEnum(QuestionType),
    tags: z.string().optional(),
    options: z.string().optional(),
});

type UpdateQuestionFormData = z.infer<typeof updateQuestionSchema>;

interface EditQuestionBankDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    question: QuestionBankResponseDTO | null;
}

export function EditQuestionBankDialog({
    open,
    onOpenChange,
    question,
}: EditQuestionBankDialogProps) {
    const updateQuestionBank = useUpdateQuestionBank();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<UpdateQuestionFormData>({
        resolver: zodResolver(updateQuestionSchema),
        defaultValues: {
            questionText: '',
            questionType: QuestionType.MULTIPLE_CHOICE,
            category: '',
            subcategory: '',
            correctAnswer: '',
            explanation: '',
            tags: '',
            options: '',
            status: QuestionStatus.ACTIVE,
        },
    });

    const questionType = watch('questionType');

    // Reset form when dialog opens or question changes
    useEffect(() => {
        if (open && question) {
            reset({
                questionText: question.questionText || '',
                questionType: question.questionType,
                jlptLevel: question.jlptLevel,
                category: question.category || '',
                subcategory: question.subcategory || '',
                difficulty: question.difficulty,
                options: question.options ? JSON.stringify(question.options, null, 2) : '',
                correctAnswer: question.correctAnswer || '',
                explanation: question.explanation || '',
                tags: question.tags ? question.tags.join(', ') : '',
                status: question.status,
            });
        } else if (!open) {
            reset();
        }
    }, [open, question, reset]);

    const handleClose = () => {
        if (!updateQuestionBank.isPending) {
            onOpenChange(false);
        }
    };

    const onSubmit = async (data: UpdateQuestionFormData) => {
        if (!question) return;

        try {
            // Parse tags
            const tags = data.tags
                ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
                : undefined;

            // Parse options
            let options: Record<string, string> | undefined = undefined;
            if (data.options && data.options.trim()) {
                try {
                    options = JSON.parse(data.options);
                } catch (e) {
                    console.error('Invalid JSON options');
                    // Could add setCheck error here ideally, avoiding full breakage for now
                }
            }

            const dto: QuestionBankUpdateDTO = {
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
                status: data.status,
            };

            await updateQuestionBank.mutateAsync({ id: question.id, question: dto });
            toast.success('Question updated successfully!', {
                description: `Changes have been saved.`,
            });
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Failed to update question', {
                description: error.response?.data?.error || error.message,
            });
        }
    };

    if (!question) return null;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Question</DialogTitle>
                    <DialogDescription>
                        Update the question details. Modify the fields as needed.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="questionText">
                            Question Text <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="questionText"
                            {...register('questionText')}
                            rows={3}
                            placeholder="Enter the question text..."
                        />
                        {errors.questionText && (
                            <p className="text-sm text-destructive">{errors.questionText.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="questionType">
                            Question Type <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={watch('questionType')}
                            onValueChange={(value) => setValue('questionType', value as QuestionType)}
                        >
                            <SelectTrigger id="questionType">
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
                        {errors.questionType && (
                            <p className="text-sm text-destructive">{errors.questionType.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="jlptLevel">JLPT Level</Label>
                            <Select
                                value={watch('jlptLevel') || undefined}
                                onValueChange={(value) => setValue('jlptLevel', value as QuestionJlptLevel)}
                            >
                                <SelectTrigger id="jlptLevel">
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
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="difficulty">Difficulty</Label>
                            <Select
                                value={watch('difficulty') || undefined}
                                onValueChange={(value) => setValue('difficulty', value as QuestionDifficultyLevel)}
                            >
                                <SelectTrigger id="difficulty">
                                    <SelectValue placeholder="Select Difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={QuestionDifficultyLevel.EASY}>Easy</SelectItem>
                                    <SelectItem value={QuestionDifficultyLevel.MEDIUM}>Medium</SelectItem>
                                    <SelectItem value={QuestionDifficultyLevel.HARD}>Hard</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Input
                                id="category"
                                {...register('category')}
                                placeholder="Enter category..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subcategory">Subcategory</Label>
                            <Input
                                id="subcategory"
                                {...register('subcategory')}
                                placeholder="Enter subcategory..."
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={watch('status')}
                            onValueChange={(value) => setValue('status', value as QuestionStatus)}
                        >
                            <SelectTrigger id="status">
                                <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={QuestionStatus.ACTIVE}>Active</SelectItem>
                                <SelectItem value={QuestionStatus.REVIEW}>Review</SelectItem>
                                <SelectItem value={QuestionStatus.ARCHIVED}>Archived</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {questionType === QuestionType.MULTIPLE_CHOICE && (
                        <div className="space-y-2">
                            <Label htmlFor="options">
                                Options (JSON format: {'{ "A": "option1", "B": "option2" }'})
                            </Label>
                            <Textarea
                                id="options"
                                {...register('options')}
                                rows={3}
                                className="font-mono text-sm"
                                placeholder='{"A": "Option 1", "B": "Option 2", "C": "Option 3"}'
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="correctAnswer">Correct Answer</Label>
                        <Input
                            id="correctAnswer"
                            {...register('correctAnswer')}
                            placeholder="Enter correct answer..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="explanation">Explanation</Label>
                        <Textarea
                            id="explanation"
                            {...register('explanation')}
                            rows={3}
                            placeholder="Enter explanation for the answer..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags</Label>
                        <Input
                            id="tags"
                            {...register('tags')}
                            placeholder="Enter tags separated by commas (e.g., grammar, vocabulary)"
                        />
                        <p className="text-xs text-muted-foreground">
                            Separate multiple tags with commas
                        </p>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={updateQuestionBank.isPending}>
                            {updateQuestionBank.isPending ? 'Updating...' : 'Update Question'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
