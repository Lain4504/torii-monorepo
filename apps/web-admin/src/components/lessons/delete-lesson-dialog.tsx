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
            toast.success('Đã xóa bài học', {
                description: `Bài học "${lesson.title}" đã được xóa khỏi hệ thống.`,
            });
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Xóa thất bại', {
                description: error.response?.data?.error || error.message,
            });
        } finally {
            setIsDeleting(false);
        }
    };

    if (!lesson) return null;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-[480px] p-0 gap-0 border border-border/50 bg-background shadow-2xl flex flex-col rounded-3xl">
                <div className="p-6 pb-0">
                    <div className="flex items-start gap-5">
                        <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/20 shadow-inner flex-shrink-0">
                            <Trash className="size-6 text-destructive" />
                        </div>
                        <div className="space-y-1.5 pt-1">
                            <AlertDialogHeader className="space-y-1.5 text-left">
                                <AlertDialogTitle className="text-lg font-bold tracking-tight text-foreground">
                                    Xóa Bài Học?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-sm font-medium text-muted-foreground leading-relaxed">
                                    Bạn có chắc chắn muốn xóa bài học <span className="text-foreground font-bold">"{lesson.title}"</span>?
                                    <br />
                                    Hành động này không thể hoàn tác và tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn.
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
                        <span className="text-xs font-bold text-foreground truncate">{lesson.title}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{getLessonTypeLabel(lesson.contentType)}</span>
                            <span className="text-[10px] font-mono text-muted-foreground/40">{lesson.id.slice(0, 8)}...</span>
                        </div>
                    </div>
                </div>

                <AlertDialogFooter className="p-6 mt-4 bg-background border-t border-border/10 gap-3">
                    <AlertDialogCancel
                        disabled={isDeleting}
                        className="rounded-xl h-11 text-xs font-bold uppercase tracking-wider border-border/20 bg-background hover:bg-muted/50 hover:text-foreground shadow-sm"
                    >
                        Hủy Bỏ
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="rounded-xl h-11 px-6 text-xs font-bold uppercase tracking-wider bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/20 hover:shadow-destructive/30 transition-all hover:-translate-y-0.5"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                Đang xóa...
                            </>
                        ) : (
                            <>
                                <Trash className="mr-2 h-3.5 w-3.5" />
                                Xóa Bài Học
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

const getLessonTypeLabel = (type: string) => {
    switch (type) {
        case LessonContentType.VIDEO:
            return "Video";
        case LessonContentType.ARTICLE:
            return "Bài Viết";
        case LessonContentType.QUIZ:
            return "Trắc Nghiệm";
        case LessonContentType.ASSIGNMENT:
            return "Bài Tập";
        default:
            return type;
    }
};
