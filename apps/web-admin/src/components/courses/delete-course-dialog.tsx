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
            toast.success('Đã Xóa Khóa Học', {
                description: `Khóa học ${course.title} đã được xóa thành công.`,
            });
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Xóa Thất Bại', {
                description: error.response?.data?.error || error.message,
            });
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-[480px] p-0 gap-0 border border-border/50 shadow-2xl bg-background rounded-3xl">
                <AlertDialogHeader className="px-8 py-6 border-b border-border/10 bg-muted/5">
                    <div className="flex items-start gap-5">
                        <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/20 shadow-sm flex-shrink-0">
                            <Trash2 className="size-6 text-destructive" />
                        </div>
                        <div className="space-y-1.5 pt-1">
                            <AlertDialogTitle className="text-xl font-sans font-bold italic uppercase tracking-tight text-foreground">
                                Xóa Khóa Học
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-sm font-medium text-muted-foreground/60 leading-relaxed">
                                Bạn có chắc chắn muốn xóa khóa học <span className="text-foreground font-semibold">"{course?.title}"</span>?
                            </AlertDialogDescription>
                        </div>
                    </div>
                </AlertDialogHeader>

                <div className="px-8 py-6">
                    <p className="text-sm font-medium text-muted-foreground/80 leading-relaxed bg-destructive/5 p-4 rounded-xl border border-destructive/10 text-destructive">
                        Hành động này sẽ xóa vĩnh viễn khóa học này cùng với tất cả các học phần, bài học và tài nguyên liên quan. Thao tác này không thể hoàn tác.
                    </p>
                </div>

                <AlertDialogFooter className="p-6 pt-2 bg-background border-t border-border/10 gap-3">
                    <AlertDialogCancel
                        className="rounded-xl h-11 px-6 text-xs font-bold uppercase tracking-wider border-border/10 bg-background hover:bg-muted/50 hover:text-foreground shadow-sm"
                    >
                        Hủy Bỏ
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="rounded-xl h-11 px-6 text-xs font-bold uppercase tracking-wider bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/20 hover:shadow-destructive/30 transition-all hover:-translate-y-0.5"
                    >
                        Xóa Ngay
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
