import { useNavigate } from 'react-router-dom';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from '@workspace/ui/components/sheet';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Separator } from '@workspace/ui/components/separator';
import { BookOpen, GraduationCap, Calendar, FileQuestion } from 'lucide-react';
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
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Chi tiết Kho đề</SheetTitle>
                </SheetHeader>

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

                    <SheetFooter>
                        <Button
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                        >
                            Đóng
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                onOpenChange(false);
                                onEdit(pool);
                            }}
                        >
                            Chỉnh sửa
                        </Button>
                        <Button
                            onClick={handleViewQuestions}
                            className="flex items-center gap-2"
                        >
                            <FileQuestion className="h-4 w-4" />
                            Câu hỏi
                        </Button>
                    </SheetFooter>
                </div>
            </SheetContent>
        </Sheet>
    );
}

