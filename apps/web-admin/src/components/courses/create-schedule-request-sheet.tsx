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
import {
    Field,
    FieldLabel,
    FieldError,
} from '@workspace/ui/components/field';
import type { LiveSessionResponseDTO, ScheduleRequestCreateDTO } from '@workspace/schemas';
import { scheduleRequestCreateDTOSchema } from '@workspace/schemas';
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
    } = useForm<ScheduleRequestCreateDTO>({
        resolver: zodResolver(scheduleRequestCreateDTOSchema),
        values: {
            liveSessionId: session?.id || '',
            reason: '',
            newTime: '',
            // Provide dummy values for required fields that are not in this form
            // but are required by the schema. These will be ignored or overwritten by backend
            // for "adjusting" a specific session if we implement it that way.
            lecturerId: session?.lecturerId || '00000000-0000-0000-0000-000000000000',
            courseMasterId: session?.courseMasterId || '00000000-0000-0000-0000-000000000000',
            dayOfWeek: 0,
            startTime: '',
            duration: session?.duration || 90,
        },
    });

    const onSubmit = async (data: ScheduleRequestCreateDTO) => {
        try {
            await createMutation.mutateAsync({ ...data, liveSessionId: session?.id || '' });
            toast.success('Đã gửi yêu cầu thay đổi lịch');
            onOpenChange(false);
        } catch (error) {
            toast.error('Không thể gửi yêu cầu');
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Yêu cầu thay đổi lịch học</SheetTitle>
                    <SheetDescription>
                        Đề xuất một thời gian mới cho buổi học này và cung cấp lý do.
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-6">
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
                    <SheetFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Hủy
                        </Button>
                        <Button type="submit">Gửi yêu cầu</Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
