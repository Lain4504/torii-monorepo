import { useNavigate } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Separator } from '@workspace/ui/components/separator';
import { Database, BookOpen, GraduationCap, Calendar, FileQuestion } from 'lucide-react';
import type { QuestionPoolResponseDTO } from '@workspace/schemas';

interface ViewQuestionPoolDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pool: QuestionPoolResponseDTO | null;
    onEdit: (pool: QuestionPoolResponseDTO) => void;
}

export function ViewQuestionPoolDialog({ open, onOpenChange, pool, onEdit }: ViewQuestionPoolDialogProps) {
    const navigate = useNavigate();

    if (!pool) return null;

    const handleViewQuestions = () => {
        onOpenChange(false);
        navigate(`/question-bank/pools/${pool.id}/questions`);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl border border-border/50 shadow-2xl bg-background rounded-3xl p-0 overflow-hidden">
                <DialogHeader className="p-8 pb-4 bg-muted/5 border-b border-border/10">
                    <DialogTitle className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                        <Database className="h-6 w-6 text-primary" />
                        Pool Details
                    </DialogTitle>
                </DialogHeader>

                <div className="p-8 pt-4 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">{pool.name}</h3>
                            {pool.description && (
                                <p className="text-sm text-muted-foreground">{pool.description}</p>
                            )}
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">JLPT Level</p>
                                    <p className="text-sm font-medium">
                                        {pool.jlptLevel ? (
                                            <Badge variant="outline">{pool.jlptLevel}</Badge>
                                        ) : (
                                            <span className="text-muted-foreground">Not set</span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Course</p>
                                    <p className="text-sm font-medium">
                                        {pool.courseId ? (
                                            <Badge variant="outline">Linked</Badge>
                                        ) : (
                                            <span className="text-muted-foreground">Not linked</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Created</p>
                                <p className="text-sm font-medium">
                                    {new Date(pool.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-border/10">
                        <Button
                            variant="ghost"
                            className="rounded-xl h-12 px-6"
                            onClick={() => onOpenChange(false)}
                        >
                            Close
                        </Button>
                        <Button
                            variant="outline"
                            className="rounded-xl h-12 px-6"
                            onClick={() => {
                                onOpenChange(false);
                                onEdit(pool);
                            }}
                        >
                            Edit
                        </Button>
                        <Button
                            onClick={handleViewQuestions}
                            className="rounded-xl h-12 px-8 flex items-center gap-2 font-semibold"
                        >
                            <FileQuestion className="h-4 w-4" />
                            Questions
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

