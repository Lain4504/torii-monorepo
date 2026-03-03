import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from '@workspace/ui/components/sheet';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import {
    Field,
    FieldLabel,
    FieldError,
} from '@workspace/ui/components/field';
import { type LiveSessionResponseDTO, type ScheduleRequestCreateDTO, scheduleRequestCreateDTOSchema } from '@workspace/schemas';
import { z } from 'zod';
import { useCreateScheduleRequest } from '@/lib/api/services/live-sessions';
import { toast } from '@workspace/ui/components/sonner';

interface CreateScheduleRequestSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    session: LiveSessionResponseDTO | null;
}

export function CreateScheduleRequestSheet({ open, onOpenChange, session }: CreateScheduleRequestSheetProps) {
    const createMutation = useCreateScheduleRequest();

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ScheduleRequestCreateDTO & { newTime: string }>({
        resolver: zodResolver(scheduleRequestCreateDTOSchema.extend({
            newTime: z.string().min(1, 'Vui lòng chọn thời gian mới'),
        })),
        values: {
            reason: '',
            newTime: '',
            lecturerId: session?.lecturerId || '00000000-0000-0000-0000-000000000000',
            courseRunId: session?.courseRunId || '00000000-0000-0000-0000-000000000000',
            dayOfWeek: session ? new Date(session.scheduledAt).getDay() : 0,
            startTime: session ? new Date(session.scheduledAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
            duration: session?.duration || 90,
        },
    });

    const onSubmit = async (data: ScheduleRequestCreateDTO & { newTime: string }) => {
        try {
            const date = new Date(data.newTime);
            const dayOfWeek = date.getDay();
            const startTime = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

            const { newTime: _, ...dto } = data;
            await createMutation.mutateAsync({
                ...dto,
                dayOfWeek,
                startTime
            });
            toast.success('Đã gửi yêu cầu thay đổi lịch');
            onOpenChange(false);
        } catch (error) {
            toast.error('Không thể gửi yêu cầu');
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="!w-full sm:!max-w-[800px] flex flex-col p-0">
                <SheetHeader className="p-6 pb-0">
                    <SheetTitle>Yêu cầu thay đổi lịch học</SheetTitle>
                    <SheetDescription>
                        Đề xuất một thời gian mới cho buổi học này và cung cấp lý do.
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden min-h-0">
                    <ScrollArea className="flex-1 min-h-0">
                        <div className="space-y-6 p-6">
                            <Controller
                                name="newTime"
                                control={control}
                                render={({ field }) => (
                                    <Field>
                                        <FieldLabel htmlFor="newTime">Thời gian mới</FieldLabel>
                                        <Input id="newTime" type="datetime-local" {...field} value={field.value || ''} />
                                        {errors.newTime && <FieldError>{errors.newTime.message}</FieldError>}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="reason"
                                control={control}
                                render={({ field }) => (
                                    <Field>
                                        <FieldLabel htmlFor="reason">Lý do</FieldLabel>
                                        <Textarea id="reason" {...field} value={field.value || ''} />
                                        {errors.reason && <FieldError>{errors.reason.message}</FieldError>}
                                    </Field>
                                )}
                            />
                        </div>
                    </ScrollArea>
                    <SheetFooter className="p-6 border-t bg-muted/5">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                            Hủy
                        </Button>
                        <Button type="submit" className="flex-1">Gửi yêu cầu</Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
