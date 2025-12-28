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
import { useDeleteLesson } from '@/features/lessons/api/lesson';
import type { LessonResponseDTO } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';

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
            toast.success('Lesson deleted successfully!', {
                description: `${lesson.title} has been removed from the system.`,
            });
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Failed to delete lesson', {
                description: error.response?.data?.error || error.message,
            });
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the lesson
                        "{lesson?.title}" and remove its data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
