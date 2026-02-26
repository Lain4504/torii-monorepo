'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select";
import {
    Field,
    FieldLabel,
    FieldGroup,
    FieldSet,
    FieldLegend
} from '@workspace/ui/components/field';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { TicketType } from '@workspace/schemas';
import { useCreateTicket } from '@/lib/api/services/ticket-api';
import { useEnrollments } from '@/lib/api/services/enrollment-api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const createTicketSchema = z.object({
    type: z.nativeEnum(TicketType),
    subject: z.string().min(5, 'Tiêu đề phải ít nhất 5 ký tự'),
    description: z.string().min(10, 'Nội dung phải ít nhất 10 ký tự'),
    courseId: z.string().optional(),
}).refine((data) => {
    if (data.type === TicketType.REFUND && !data.courseId) {
        return false;
    }
    return true;
}, {
    message: "Vui lòng chọn khóa học cần hoàn tiền",
    path: ["courseId"],
});

type CreateTicketFormValues = z.infer<typeof createTicketSchema>;

interface CreateTicketDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateTicketDialog({ open, onOpenChange }: CreateTicketDialogProps) {
    const createTicketMutation = useCreateTicket();
    const { data: enrollmentsData, isLoading: isLoadingEnrollments } = useEnrollments({ page: 1, limit: 100 });
    const enrollments = enrollmentsData?.data || [];

    const form = useForm<CreateTicketFormValues>({
        resolver: zodResolver(createTicketSchema),
        defaultValues: {
            type: TicketType.SUPPORT,
            subject: '',
            description: '',
            courseId: '',
        },
    });

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = form;

    const selectedType = watch('type');

    useEffect(() => {
        if (!open) {
            reset();
        }
    }, [open, reset]);

    const onSubmit = async (values: CreateTicketFormValues) => {
        try {
            const selectedEnrollment = (enrollments as any[]).find((en: any) => en.courseId === values.courseId);
            const orderId = selectedEnrollment?.orderId;

            await createTicketMutation.mutateAsync({
                type: values.type,
                subject: values.subject,
                description: values.description,
                metadata: values.type === TicketType.REFUND ? {
                    courseId: values.courseId,
                    orderId: orderId
                } : {},
            });
            toast.success('Yêu cầu của bạn đã được gửi thành công.');
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
                <DialogHeader className="p-6 border-b">
                    <DialogTitle>Gửi yêu cầu hỗ trợ</DialogTitle>
                    <DialogDescription>
                        Đội ngũ Torii luôn sẵn sàng giải quyết các thắc mắc và vấn đề của bạn.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
                    <ScrollArea className="max-h-[60vh]">
                        <div className="space-y-6 p-6">
                            <FieldGroup>
                                <FieldSet>
                                    <FieldLegend>Thông tin yêu cầu</FieldLegend>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Field>
                                            <FieldLabel>Loại yêu cầu</FieldLabel>
                                            <Select
                                                value={selectedType}
                                                onValueChange={(val) => setValue('type', val as TicketType)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn loại yêu cầu" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={TicketType.SUPPORT}>Hỗ trợ kỹ thuật</SelectItem>
                                                    <SelectItem value={TicketType.REFUND}>Yêu cầu hoàn tiền</SelectItem>
                                                    <SelectItem value={TicketType.ERROR_REPORT}>Báo lỗi ứng dụng</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
                                        </Field>

                                        <Field>
                                            <FieldLabel>Tiêu đề</FieldLabel>
                                            <Input
                                                {...register('subject')}
                                                placeholder="VD: Lỗi thanh toán..."
                                            />
                                            {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
                                        </Field>
                                    </div>
                                </FieldSet>

                                {selectedType === TicketType.REFUND && (
                                    <FieldSet>
                                        <FieldLegend>Chi tiết khóa học</FieldLegend>
                                        <Field>
                                            <FieldLabel>Khóa học hoàn tiền</FieldLabel>
                                            {isLoadingEnrollments ? (
                                                <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-muted/50 text-muted-foreground text-sm italic">
                                                    <Loader2 className="size-4 animate-spin" />
                                                    Đang tải...
                                                </div>
                                            ) : enrollments.length > 0 ? (
                                                <Select
                                                    onValueChange={(val) => setValue('courseId', val)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Chọn khóa học" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {enrollments.map((en: any) => (
                                                            <SelectItem key={en.courseId} value={en.courseId}>
                                                                {en.course?.title || `Khóa học ${en.courseId.slice(0, 8).toUpperCase()}`}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <div className="text-sm text-destructive font-medium border border-destructive/20 bg-destructive/5 p-3 rounded-md">
                                                    Bạn chưa có khóa học nào để yêu cầu hoàn tiền.
                                                </div>
                                            )}
                                            {errors.courseId && <p className="text-xs text-destructive">{errors.courseId.message}</p>}
                                        </Field>
                                    </FieldSet>
                                )}

                                <Field>
                                    <FieldLabel>Nội dung chi tiết</FieldLabel>
                                    <Textarea
                                        {...register('description')}
                                        placeholder="Hãy mô tả chi tiết vấn đề của bạn..."
                                        className="min-h-[150px]"
                                    />
                                    {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
                                </Field>
                            </FieldGroup>
                        </div>
                    </ScrollArea>

                    <DialogFooter className="p-6 border-t bg-muted/10">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={createTicketMutation.isPending}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={createTicketMutation.isPending}
                        >
                            {createTicketMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang gửi...
                                </>
                            ) : (
                                'Gửi yêu cầu'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
