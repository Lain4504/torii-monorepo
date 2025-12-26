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
import type {
    QuestionType,
    QuestionJlptLevel,
    QuestionDifficultyLevel,
    QuestionStatus,
    UpdateQuestionBankDto,
    QuestionBankDto,
} from '@workspace/dtos';
import { useQuestionBankForm } from '../../../hooks/useQuestionBankForm';

interface QuestionBankEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    question: QuestionBankDto | null;
    onSubmit: (id: string, data: UpdateQuestionBankDto) => void;
    isSubmitting?: boolean;
}

export function QuestionBankEditDialog({
    open,
    onOpenChange,
    question,
    onSubmit,
    isSubmitting,
}: QuestionBankEditDialogProps) {
    const { formData, tagsInput, setTagsInput, updateField, resetForm } =
        useQuestionBankForm({
            initialData: question || undefined,
            onSubmit: () => {}, // Will be handled in custom handleSubmit
        });

    const handleClose = () => {
        if (!isSubmitting) {
            resetForm();
            onOpenChange(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!question) return;

        // Validation
        if (!formData.questionText || !formData.questionType) {
            return;
        }

        // Parse tags from comma-separated string
        const tags = tagsInput
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0);

        const questionData: UpdateQuestionBankDto = {
            ...(formData.questionText && { questionText: formData.questionText }),
            ...(formData.questionType && { questionType: formData.questionType as QuestionType }),
            ...(formData.jlptLevel && { jlptLevel: formData.jlptLevel }),
            ...(formData.category && { category: formData.category }),
            ...(formData.subcategory && { subcategory: formData.subcategory }),
            ...(formData.difficulty && { difficulty: formData.difficulty }),
            ...(formData.options && { options: formData.options }),
            ...(formData.correctAnswer && { correctAnswer: formData.correctAnswer }),
            ...(formData.explanation && { explanation: formData.explanation }),
            ...(tags.length > 0 && { tags }),
            ...(formData.status && { status: formData.status as QuestionStatus }),
        };

        onSubmit(question.id, questionData);
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

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-question-text">
                            Question Text <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="edit-question-text"
                            value={formData.questionText || ''}
                            onChange={(e) => updateField('questionText', e.target.value)}
                            required
                            rows={3}
                            placeholder="Enter the question text..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-question-type">
                            Question Type <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={formData.questionType || ''}
                            onValueChange={(value) => updateField('questionType', value as QuestionType)}
                            required
                        >
                            <SelectTrigger id="edit-question-type">
                                <SelectValue placeholder="Select question type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                <SelectItem value="true_false">True/False</SelectItem>
                                <SelectItem value="fill_blank">Fill Blank</SelectItem>
                                <SelectItem value="matching">Matching</SelectItem>
                                <SelectItem value="essay">Essay</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-jlpt-level">JLPT Level</Label>
                            <Select
                                value={formData.jlptLevel || undefined}
                                onValueChange={(value) => updateField('jlptLevel', value as QuestionJlptLevel)}
                            >
                                <SelectTrigger id="edit-jlpt-level">
                                    <SelectValue placeholder="Select Level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="N5">N5</SelectItem>
                                    <SelectItem value="N4">N4</SelectItem>
                                    <SelectItem value="N3">N3</SelectItem>
                                    <SelectItem value="N2">N2</SelectItem>
                                    <SelectItem value="N1">N1</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-difficulty">Difficulty</Label>
                            <Select
                                value={formData.difficulty || undefined}
                                onValueChange={(value) => updateField('difficulty', value as QuestionDifficultyLevel)}
                            >
                                <SelectTrigger id="edit-difficulty">
                                    <SelectValue placeholder="Select Difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="easy">Easy</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="hard">Hard</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-category">Category</Label>
                            <Input
                                id="edit-category"
                                value={formData.category || ''}
                                onChange={(e) => updateField('category', e.target.value)}
                                placeholder="Enter category..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-subcategory">Subcategory</Label>
                            <Input
                                id="edit-subcategory"
                                value={formData.subcategory || ''}
                                onChange={(e) => updateField('subcategory', e.target.value)}
                                placeholder="Enter subcategory..."
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-status">Status</Label>
                        <Select
                            value={formData.status || question.status || 'active'}
                            onValueChange={(value) => updateField('status', value as QuestionStatus)}
                        >
                            <SelectTrigger id="edit-status">
                                <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="review">Review</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {formData.questionType === 'multiple_choice' && (
                        <div className="space-y-2">
                            <Label htmlFor="edit-options">
                                Options (JSON format: {'{A: "option1", B: "option2"}'})
                            </Label>
                            <Textarea
                                id="edit-options"
                                value={formData.options ? JSON.stringify(formData.options, null, 2) : ''}
                                onChange={(e) => {
                                    try {
                                        const parsed = JSON.parse(e.target.value);
                                        updateField('options', parsed);
                                    } catch {
                                        // Invalid JSON, keep as is for now
                                    }
                                }}
                                rows={3}
                                className="font-mono text-sm"
                                placeholder='{"A": "Option 1", "B": "Option 2", "C": "Option 3"}'
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="edit-correct-answer">Correct Answer</Label>
                        <Input
                            id="edit-correct-answer"
                            value={formData.correctAnswer || ''}
                            onChange={(e) => updateField('correctAnswer', e.target.value)}
                            placeholder="Enter correct answer..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-explanation">Explanation</Label>
                        <Textarea
                            id="edit-explanation"
                            value={formData.explanation || ''}
                            onChange={(e) => updateField('explanation', e.target.value)}
                            rows={3}
                            placeholder="Enter explanation for the answer..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-tags">Tags</Label>
                        <Input
                            id="edit-tags"
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
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
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Updating...' : 'Update Question'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

