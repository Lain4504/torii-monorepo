import { useForm, Controller } from "react-hook-form";
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
    Field,
    FieldError,
    FieldLabel,
} from "@workspace/ui/components/field";
import { Textarea } from "@workspace/ui/components/textarea";
import { useRejectCourse } from "@/lib/api/services/courses";
import type { CourseMasterResponseDTO } from "@workspace/schemas";
import { toast } from "@workspace/ui/components/sonner";
import { Spinner } from "@workspace/ui/components/spinner";

const formSchema = z.object({
    reason: z.string().min(10, {
        message: "Lý do từ chối phải có ít nhất 10 ký tự.",
    }),
});

interface RejectCourseMasterDialogProps {
    course: CourseMasterResponseDTO | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function RejectCourseMasterDialog({
    course,
    open,
    onOpenChange,
}: RejectCourseMasterDialogProps) {
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
            toast.success("Đã từ chối khung chương trình và gửi phản hồi");
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
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Từ chối khung chương trình</DialogTitle>
                    <DialogDescription>
                        Bạn có chắc chắn muốn từ chối khung chương trình{' '}
                        <span className="font-semibold text-foreground">
                            {course?.title}
                        </span>
                        ? Hành động này sẽ chuyển trạng thái về "Bị từ chối" và gửi lý do phản hồi.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <Controller
                        control={form.control as any}
                        name="reason"
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Lý do từ chối & Phản hồi</FieldLabel>
                                <Textarea
                                    id={field.name}
                                    placeholder="Nhập lý do từ chối và hướng dẫn chỉnh sửa..."
                                    className="min-h-[120px] resize-none"
                                    {...field}
                                />
                                <FieldError errors={[fieldState.error]} />
                            </Field>
                        )}
                    />

                    <DialogFooter className="gap-2 sm:gap-0 mt-4">
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
                                <Spinner className="mr-2" />
                            )}
                            Xác nhận Từ chối
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
