import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Badge } from '@workspace/ui/components/badge';
import { Label } from '@workspace/ui/components/label';
import type { QuestionBankDto } from '@workspace/dtos';

interface ViewQuestionBankDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    question: QuestionBankDto | null;
}

export function ViewQuestionBankDialog({
    open,
    onOpenChange,
    question,
}: ViewQuestionBankDialogProps) {
    if (!question) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Question Details</DialogTitle>
                    <DialogDescription>
                        View the complete details of the question.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Question Text</Label>
                        <p className="text-sm">{question.questionText}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Question Type</Label>
                            <div>
                                <Badge>{question.questionType.replace('_', ' ')}</Badge>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Status</Label>
                            <div>
                                <Badge variant={question.status === 'active' ? 'default' : 'secondary'}>
                                    {question.status}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>JLPT Level</Label>
                            <p className="text-sm">{question.jlptLevel || '-'}</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Difficulty</Label>
                            <p className="text-sm">{question.difficulty || '-'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <p className="text-sm">{question.category || '-'}</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Subcategory</Label>
                            <p className="text-sm">{question.subcategory || '-'}</p>
                        </div>
                    </div>

                    {question.options && (
                        <div className="space-y-2">
                            <Label>Options</Label>
                            <pre className="text-sm bg-muted p-3 rounded-md overflow-auto">
                                {JSON.stringify(question.options, null, 2)}
                            </pre>
                        </div>
                    )}

                    {question.correctAnswer && (
                        <div className="space-y-2">
                            <Label>Correct Answer</Label>
                            <p className="text-sm">{question.correctAnswer}</p>
                        </div>
                    )}

                    {question.explanation && (
                        <div className="space-y-2">
                            <Label>Explanation</Label>
                            <p className="text-sm whitespace-pre-wrap">{question.explanation}</p>
                        </div>
                    )}

                    {question.tags && question.tags.length > 0 && (
                        <div className="space-y-2">
                            <Label>Tags</Label>
                            <div className="flex flex-wrap gap-2">
                                {question.tags.map((tag, idx) => (
                                    <Badge key={idx} variant="outline">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Usage Count</Label>
                        <p className="text-sm">{question.usageCount || 0}</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}



