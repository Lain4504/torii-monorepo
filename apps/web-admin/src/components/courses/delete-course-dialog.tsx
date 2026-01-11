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
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Button } from '@workspace/ui/components/button';

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
            toast.success('Repository Purged', {
                description: `${course.title} has been permanently removed from the matrix.`,
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
            <AlertDialogContent className="border-none shadow-2xl bg-background/80 backdrop-blur-3xl rounded-[2rem] p-0 overflow-hidden max-w-[500px]">
                <AlertDialogHeader className="p-8 pb-6 bg-red-500/5 border-b border-red-500/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-red-500/5 blur-3xl opacity-50 pointer-events-none" />
                    <div className="relative z-10 flex flex-col gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-lg shadow-red-500/10">
                            <AlertTriangle className="h-6 w-6 text-red-500" />
                        </div>
                        <div className="space-y-1">
                            <AlertDialogTitle className="text-xl font-black uppercase tracking-tight text-red-500">
                                Purge Repository
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-500/60">
                                Irreversible Action Sequence
                            </AlertDialogDescription>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onOpenChange(false)}
                        className="absolute right-4 top-4 rounded-xl hover:bg-red-500/10 text-red-500/50 hover:text-red-500"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </AlertDialogHeader>

                <div className="px-8 py-6 space-y-4">
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                        You are initiating a destructive sequence for <strong>{course?.title}</strong>. This will permanently eliminate all associated modules, lessons, and data assets from the core system.
                    </p>
                    <div className="rounded-2xl bg-red-500/5 p-4 border border-red-500/10 flex items-center gap-3">
                        <Trash2 className="h-5 w-5 text-red-500 opacity-50" />
                        <span className="text-[10px] font-bold text-red-500/80 uppercase tracking-wider">
                            Data recovery impossible after confirmation
                        </span>
                    </div>
                </div>

                <AlertDialogFooter className="p-8 pt-2 bg-transparent">
                    <AlertDialogCancel className="rounded-xl h-12 px-6 hover:bg-muted/20 border-none bg-transparent hover:text-foreground text-[11px] font-black uppercase tracking-widest">
                        Abort
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="rounded-xl h-12 px-8 bg-red-500 shadow-xl shadow-red-500/20 hover:bg-red-600 hover:scale-[1.02] transition-all text-white focus:ring-red-500 text-[11px] font-black uppercase tracking-widest"
                    >
                        Execute Purge
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
