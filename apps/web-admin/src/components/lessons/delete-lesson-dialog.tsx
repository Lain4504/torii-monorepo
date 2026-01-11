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
import { AlertTriangle, Trash, FileText, Loader2, Video, ClipboardList, BookOpen } from 'lucide-react';
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
            <AlertDialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden border-destructive/20 bg-background/80 backdrop-blur-3xl shadow-2xl flex flex-col rounded-[2.5rem]">
                <div className="p-8 pb-0">
                    <div className="flex items-start gap-6">
                        <div className="p-4 rounded-[1.5rem] bg-destructive/10 border border-destructive/20 shadow-inner flex-shrink-0">
                            <AlertTriangle className="size-8 text-destructive animate-pulse" />
                        </div>
                        <div className="space-y-2 pt-1">
                            <AlertDialogHeader className="space-y-2 text-left">
                                <AlertDialogTitle className="text-xl font-black uppercase tracking-tight text-destructive">
                                    Purge Instructional Unit?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-xs font-medium text-muted-foreground leading-relaxed">
                                    This action will permanently delete the unit <span className="text-foreground font-black italic">"{lesson.title}"</span> along with all embedded assets and student progress data.
                                    <br /><br />
                                    <span className="text-destructive/80 text-[10px] font-bold uppercase tracking-wider">
                                        This operation is irreversible.
                                    </span>
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                        </div>
                    </div>
                </div>

                {/* Lesson Preview Card */}
                <div className="mx-8 mt-6 p-4 rounded-2xl bg-muted/30 border border-border/20 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-background border border-border/40 flex items-center justify-center text-muted-foreground">
                        {getLessonIcon(lesson.contentType)}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-xs font-black uppercase tracking-wide truncate">{lesson.title}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-md">{lesson.contentType}</span>
                            <span className="text-[9px] font-mono text-muted-foreground/40">{lesson.id.slice(0, 8)}...</span>
                        </div>
                    </div>
                </div>

                <AlertDialogFooter className="p-6 mt-2 bg-destructive/5 border-t border-destructive/10 gap-3">
                    <AlertDialogCancel
                        disabled={isDeleting}
                        className="rounded-xl h-12 text-[11px] font-black uppercase tracking-widest border-transparent bg-background hover:bg-muted/50 hover:text-foreground shadow-sm"
                    >
                        Cancel Protocol
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="rounded-xl h-12 px-6 text-[11px] font-black uppercase tracking-widest bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/20 hover:shadow-destructive/40 transition-all hover:-translate-y-0.5"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                Purging...
                            </>
                        ) : (
                            <>
                                <Trash className="mr-2 h-3 w-3" />
                                Execute Purge
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
