import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@workspace/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@workspace/ui/components/form";
import { Textarea } from "@workspace/ui/components/textarea";
import { useRejectCourse } from "@/api/services/courses";
import type { CourseResponseDTO } from "@workspace/schemas";
import { toast } from "@workspace/ui/components/sonner";
import { Loader2, XCircle } from "lucide-react";

const formSchema = z.object({
    reason: z.string().min(10, {
        message: "Lý do từ chối phải có ít nhất 10 ký tự.",
    }),
});

interface RejectCourseDialogProps {
    course: CourseResponseDTO | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function RejectCourseDialog({
    course,
    open,
    onOpenChange,
}: RejectCourseDialogProps) {
    const mutation = useRejectCourse();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            reason: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!course) return;

        try {
            await mutation.mutateAsync({
                id: course.id,
                reason: values.reason,
            });
            toast.success("Đã từ chối khóa học và gửi phản hồi");
            onOpenChange(false);
            form.reset();
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "Có lỗi xảy ra khi từ chối khóa học"
            );
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] border-destructive/20 bg-background/95 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive font-sans italic text-xl">
                        <XCircle className="w-5 h-5" />
                        Từ chối khóa học
                    </DialogTitle>
                    <DialogDescription>
                        Bạn có chắc chắn muốn từ chối khóa học{' '}
                        <span className="font-semibold text-foreground">
                            {course?.title}
                        </span>
                        ? Hành động này sẽ chuyển trạng thái về "Bị từ chối" và gửi lý do cho giảng viên.
                    </DialogDescription>
                </DialogHeader>

                <Form {...(form as any)}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control as any}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Lý do từ chối & Phản hồi</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Nhập lý do từ chối và hướng dẫn chỉnh sửa..."
                                            className="min-h-[120px] resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Hủy bỏ
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={mutation.isPending}
                            >
                                {mutation.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Xác nhận Từ chối
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
