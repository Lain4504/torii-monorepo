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
import { Button } from '@workspace/ui/components/button';
import type { CourseMasterResponseDTO } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';
import { useDeleteCourse } from "@/lib/api/services/courses";
import { AlertTriangle } from "lucide-react";
import { Spinner } from "@workspace/ui/components/spinner";

interface DeleteCourseDialogProps {
    course: CourseMasterResponseDTO | null;
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
            toast.success('Đã xóa khóa học', {
                description: `Khóa học "${course.title}" đã được xóa thành công.`,
            });
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Xóa thất bại', {
                description: error.response?.data?.error || error.message,
            });
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive">
                        <AlertTriangle />
                    </AlertDialogMedia>
                    <AlertDialogTitle>Xóa khóa học</AlertDialogTitle>
                    <AlertDialogDescription>
                        Hành động này sẽ xóa vĩnh viễn khóa học <span className="font-semibold text-foreground">"{course?.title}"</span> cùng với tất cả học phần, bài học và tài nguyên liên quan. Bạn có chắc chắn muốn tiếp tục?
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                        <Button variant="outline" disabled={deleteCourse.isPending}>Hủy</Button>
                    </AlertDialogCancel>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleteCourse.isPending}
                    >
                        {deleteCourse.isPending ? (
                            <Spinner />
                        ) : (
                            "Xóa khóa học"
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
