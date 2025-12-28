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
    type QuestionBankCreateDTO,
} from '@workspace/schemas';
import { useCreateQuestionBank } from '@/features/question-bank/api/question-bank';
import { toast } from '@workspace/ui/components/sonner';

const createQuestionSchema = z.object({
    questionText: z.string().min(1, 'Question text is required'),
    questionType: z.nativeEnum(QuestionType),
    jlptLevel: z.nativeEnum(QuestionJlptLevel).optional(),
    category: z.string().optional(),
    subcategory: z.string().optional(),
    difficulty: z.nativeEnum(QuestionDifficultyLevel).optional(),
    options: z.string().optional(), // We'll parse this string to JSON
    correctAnswer: z.string().optional(),
    explanation: z.string().optional(),
    tags: z.string().optional(), // We'll parse comma-separated string
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
        register,
        handleSubmit,
        formState: { errors },
        setValue,
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
                        <Button type="submit" disabled={createQuestionBank.isPending}>
                            {createQuestionBank.isPending ? 'Creating...' : 'Create Question'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
