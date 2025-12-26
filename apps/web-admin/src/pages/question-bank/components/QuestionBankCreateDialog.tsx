import { useState } from 'react';
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
    CreateQuestionBankDto,
} from '@workspace/dtos';
import { useQuestionBankForm } from '../../../hooks/useQuestionBankForm';

interface QuestionBankCreateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CreateQuestionBankDto) => void;
    isSubmitting?: boolean;
}

export function QuestionBankCreateDialog({
    open,
    onOpenChange,
    onSubmit,
    isSubmitting,
}: QuestionBankCreateDialogProps) {
    const { formData, tagsInput, setTagsInput, updateField, resetForm, handleSubmit } =
        useQuestionBankForm({
            onSubmit: (data) => {
                onSubmit(data as CreateQuestionBankDto);
            },
        });

    const handleClose = () => {
        if (!isSubmitting) {
            resetForm();
            onOpenChange(false);
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

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="question-text">
                            Question Text <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="question-text"
                            value={formData.questionText || ''}
                            onChange={(e) => updateField('questionText', e.target.value)}
                            required
                            rows={3}
                            placeholder="Enter the question text..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="question-type">
                            Question Type <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={formData.questionType || ''}
                            onValueChange={(value) => updateField('questionType', value as QuestionType)}
                            required
                        >
                            <SelectTrigger id="question-type">
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
                            <Label htmlFor="jlpt-level">JLPT Level</Label>
                            <Select
                                value={formData.jlptLevel || undefined}
                                onValueChange={(value) => updateField('jlptLevel', value as QuestionJlptLevel)}
                            >
                                <SelectTrigger id="jlpt-level">
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
                            <Label htmlFor="difficulty">Difficulty</Label>
                            <Select
                                value={formData.difficulty || undefined}
                                onValueChange={(value) => updateField('difficulty', value as QuestionDifficultyLevel)}
                            >
                                <SelectTrigger id="difficulty">
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
                            <Label htmlFor="category">Category</Label>
                            <Input
                                id="category"
                                value={formData.category || ''}
                                onChange={(e) => updateField('category', e.target.value)}
                                placeholder="Enter category..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subcategory">Subcategory</Label>
                            <Input
                                id="subcategory"
                                value={formData.subcategory || ''}
                                onChange={(e) => updateField('subcategory', e.target.value)}
                                placeholder="Enter subcategory..."
                            />
                        </div>
                    </div>

                    {formData.questionType === 'multiple_choice' && (
                        <div className="space-y-2">
                            <Label htmlFor="options">
                                Options (JSON format: {'{A: "option1", B: "option2"}'})
                            </Label>
                            <Textarea
                                id="options"
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
                        <Label htmlFor="correct-answer">Correct Answer</Label>
                        <Input
                            id="correct-answer"
                            value={formData.correctAnswer || ''}
                            onChange={(e) => updateField('correctAnswer', e.target.value)}
                            placeholder="Enter correct answer..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="explanation">Explanation</Label>
                        <Textarea
                            id="explanation"
                            value={formData.explanation || ''}
                            onChange={(e) => updateField('explanation', e.target.value)}
                            rows={3}
                            placeholder="Enter explanation for the answer..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags</Label>
                        <Input
                            id="tags"
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
                            {isSubmitting ? 'Creating...' : 'Create Question'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

