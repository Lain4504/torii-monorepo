import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog';
import type { LessonResponseDTO } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';
import { useDeleteLesson } from "@/api/services/lesson.ts";
import { Trash, FileText, Loader2, Video, ClipboardList, BookOpen } from 'lucide-react';
import { LessonContentType } from '@workspace/schemas';
import { useState } from 'react';

interface DeleteLessonDialogProps {
    lesson: LessonResponseDTO | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const getLessonIcon = (type: string) => {
    switch (type) {
        case LessonContentType.VIDEO:
            return <Video className="size-5 opacity-70" />;
        case LessonContentType.ARTICLE:
            return <FileText className="size-5 opacity-70" />;
        case LessonContentType.QUIZ:
            return <ClipboardList className="size-5 opacity-70" />;
        case LessonContentType.ASSIGNMENT:
            return <BookOpen className="size-5 opacity-70" />;
        default:
            return <FileText className="size-5 opacity-70" />;
    }
};

export function DeleteLessonDialog({ lesson, open, onOpenChange }: DeleteLessonDialogProps) {
    const deleteLesson = useDeleteLesson();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!lesson) return;
        setIsDeleting(true);
        try {
            await deleteLesson.mutateAsync(lesson.id);
            toast.success('Unit De-initialized', {
                description: `Instructional unit ${lesson.title} has been removed.`,
            });
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Purge Failed', {
                description: error.response?.data?.error || error.message,
            });
        } finally {
            setIsDeleting(false);
        }
    };

    if (!lesson) return null;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden border-border/20 bg-background/95 backdrop-blur-xl shadow-2xl flex flex-col rounded-3xl">
                <div className="p-6 pb-0">
                    <div className="flex items-start gap-5">
                        <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/20 shadow-inner flex-shrink-0">
                            <Trash className="size-6 text-destructive" />
                        </div>
                        <div className="space-y-1.5 pt-1">
                            <AlertDialogHeader className="space-y-1.5 text-left">
                                <AlertDialogTitle className="text-lg font-semibold tracking-tight text-foreground">
                                    Delete Unit?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-sm font-medium text-muted-foreground leading-relaxed">
                                    Are you sure you want to delete <span className="text-foreground font-semibold">"{lesson.title}"</span>?
                                    <br />
                                    This action cannot be undone and all associated data will be removed.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                        </div>
                    </div>
                </div>

                {/* Lesson Preview Card */}
                <div className="mx-6 mt-6 p-3 rounded-xl bg-muted/30 border border-border/40 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-background border border-border/40 flex items-center justify-center text-muted-foreground/70">
                        {getLessonIcon(lesson.contentType)}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-foreground truncate">{lesson.title}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-medium text-muted-foreground capitalize">{lesson.contentType.toLowerCase()}</span>
                            <span className="text-[10px] font-mono text-muted-foreground/40">{lesson.id.slice(0, 8)}...</span>
                        </div>
                    </div>
                </div>

                <AlertDialogFooter className="p-6 mt-4 bg-muted/5 border-t border-border/10 gap-3">
                    <AlertDialogCancel
                        disabled={isDeleting}
                        className="rounded-xl h-11 text-xs font-medium border-border/20 bg-background hover:bg-muted/50 hover:text-foreground shadow-sm"
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="rounded-xl h-11 px-6 text-xs font-medium bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/20 hover:shadow-destructive/30 transition-all hover:-translate-y-0.5"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash className="mr-2 h-3.5 w-3.5" />
                                Delete Unit
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
