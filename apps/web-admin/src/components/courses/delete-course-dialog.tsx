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
import type { CourseResponseDTO } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';
import {useDeleteCourse} from "@/api/services/courses.ts";

interface DeleteCourseDialogProps {
    course: CourseResponseDTO | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DeleteCourseDialog({
    course,
    open,
    onOpenChange,
}: DeleteCourseDialogProps) {
    const deleteCourse = useDeleteCourse();

    const handleDelete = async () => {
        if (!course) return;
        try {
            await deleteCourse.mutateAsync(course.id);
            toast.success('Course deleted successfully!', {
                description: `${course.title} has been removed from the system.`,
            });
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Failed to delete course', {
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
                        This action cannot be undone. This will permanently delete the course
                        "{course?.title}" and remove its data from our servers.
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
