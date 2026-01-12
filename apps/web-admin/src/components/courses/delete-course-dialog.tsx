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
import { Trash2 } from "lucide-react";

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
            toast.success('Course Deleted', {
                description: `${course.title} has been successfully removed.`,
            });
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Deletion Failed', {
                description: error.response?.data?.error || error.message,
            });
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden border-border/20 shadow-2xl bg-background/95 backdrop-blur-xl rounded-3xl">
                <AlertDialogHeader className="px-8 py-6 border-b border-border/10">
                    <div className="flex items-start gap-5">
                        <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/20 shadow-sm flex-shrink-0">
                            <Trash2 className="size-6 text-destructive" />
                        </div>
                        <div className="space-y-1.5 pt-1">
                            <AlertDialogTitle className="text-lg font-semibold tracking-tight text-foreground">
                                Delete Course
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-sm font-medium text-muted-foreground/60 leading-relaxed">
                                Are you sure you want to delete <span className="text-foreground font-semibold">"{course?.title}"</span>?
                            </AlertDialogDescription>
                        </div>
                    </div>
                </AlertDialogHeader>

                <div className="px-8 py-6">
                    <p className="text-sm font-medium text-muted-foreground/80 leading-relaxed">
                        This action will permanently remove this course and all its associated modules, lessons, and assets. This cannot be undone.
                    </p>
                </div>

                <AlertDialogFooter className="p-6 mt-2 bg-muted/5 border-t border-border/10 gap-3">
                    <AlertDialogCancel
                        className="rounded-xl h-10 text-xs font-medium border-border/10 bg-background hover:bg-muted/50 hover:text-foreground shadow-sm"
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="rounded-xl h-10 px-6 text-xs font-medium bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/20 hover:shadow-destructive/30 transition-all"
                    >
                        Delete Course
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
