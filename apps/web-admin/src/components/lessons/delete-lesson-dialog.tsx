import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog';
import type { LessonResponseDTO } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';
import { useDeleteLesson } from "@/api/services/lesson.ts";
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';

interface DeleteLessonDialogProps {
    lesson: LessonResponseDTO | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DeleteLessonDialog({ lesson, open, onOpenChange }: DeleteLessonDialogProps) {
    const deleteLesson = useDeleteLesson();

    const handleDelete = async () => {
        if (!lesson) return;
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
        }
    };

    if (!lesson) return null;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive">
                        <AlertTriangle />
                    </AlertDialogMedia>
                    <AlertDialogTitle>Xóa bài học</AlertDialogTitle>
                    <AlertDialogDescription>
                        Hành động này sẽ xóa vĩnh viễn bài học <span className="font-semibold text-foreground">"{lesson.title}"</span> và tất cả dữ liệu liên quan. Thao tác này không thể hoàn tác.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                        <Button variant="outline" disabled={deleteLesson.isPending}>Hủy</Button>
                    </AlertDialogCancel>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleteLesson.isPending}
                    >
                        {deleteLesson.isPending ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            "Xóa bài học"
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
