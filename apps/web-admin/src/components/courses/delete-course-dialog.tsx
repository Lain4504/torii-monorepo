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
import { useDeleteCourse } from "@/api/services/courses";

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
            <AlertDialogContent className="border-none shadow-2xl bg-background/95 backdrop-blur-xl rounded-2xl p-0 overflow-hidden max-w-[500px]">
                <AlertDialogHeader className="p-6 pb-4 bg-muted/30">
                    <AlertDialogTitle className="text-xl font-bold bg-gradient-to-r from-destructive to-destructive/70 bg-clip-text text-transparent">
                        Delete Course
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground/70">
                        Are you sure you want to delete <strong>{course?.title}</strong>?
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="px-6 py-4">
                    <div className="rounded-xl bg-destructive/5 p-4 border border-destructive/10">
                        <p className="text-sm text-destructive/80 font-medium">
                            This action cannot be undone. This will permanently delete the course and all its associated data (modules, lessons, uploads) from our servers.
                        </p>
                    </div>
                </div>

                <AlertDialogFooter className="p-6 pt-2 bg-transparent">
                    <AlertDialogCancel className="rounded-xl h-11 px-6 hover:bg-primary/5 border-none bg-transparent hover:text-foreground">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="rounded-xl h-11 px-8 bg-destructive shadow-lg shadow-destructive/20 hover:bg-destructive/90 hover:scale-[1.02] transition-transform text-destructive-foreground focus:ring-destructive"
                    >
                        Delete Course
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
