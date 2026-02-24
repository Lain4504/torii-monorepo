import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    type ScheduleRequestCreateDTO,
    scheduleRequestCreateDTOSchema
} from '@workspace/schemas';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@workspace/ui/components/dialog';
import {
    Field,
    FieldLabel,
    FieldError,
} from '@workspace/ui/components/field';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Textarea } from '@workspace/ui/components/textarea';
import { useCreateScheduleRequest, useCheckAvailabilityQuery } from '@/lib/api/services/live-sessions';
import { toast } from '@workspace/ui/components/sonner';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { Spinner } from "@workspace/ui/components/spinner";

interface ScheduleRequestDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    courseId: string;
    scheduleId: string;
    lecturerId: string;
    currentDay: number;
    currentStart: string;
    currentDuration: number;
}

const DAYS = [
    { label: 'Chủ Nhật', value: '0' },
    { label: 'Thứ 2', value: '1' },
    { label: 'Thứ 3', value: '2' },
    { label: 'Thứ 4', value: '3' },
    { label: 'Thứ 5', value: '4' },
    { label: 'Thứ 6', value: '5' },
    { label: 'Thứ 7', value: '6' },
];

export function ScheduleRequestDialog({
    open,
    onOpenChange,
    courseId,
    scheduleId,
    lecturerId,
    currentDay,
    currentStart,
    currentDuration
}: ScheduleRequestDialogProps) {
    const createMutation = useCreateScheduleRequest();

    const form = useForm<ScheduleRequestCreateDTO>({
        // @ts-ignore - Zod resolver type mismatch with optional/default fields
        resolver: zodResolver(scheduleRequestCreateDTOSchema),
        defaultValues: {
            lecturerId,
            courseId,
            originalScheduleId: scheduleId,
            dayOfWeek: currentDay,
            startTime: currentStart,
            duration: currentDuration || 90,
            reason: '',
        }
    });

    const requestedDay = form.watch('dayOfWeek');
    const requestedStart = form.watch('startTime');
    const requestedDuration = form.watch('duration');

    const { data: availabilityResult, isFetching: isChecking } = useCheckAvailabilityQuery({
        lecturerId,
        dayOfWeek: requestedDay,
        startTime: requestedStart,
        duration: requestedDuration,
        excludeScheduleId: scheduleId
    }, open && !!requestedStart);

    const isAvailable = availabilityResult?.available ?? true;

    const onSubmit = async (data: ScheduleRequestCreateDTO) => {
        if (!isAvailable) {
            toast.error('Thời gian yêu cầu đang bị trùng với lịch khác của bạn');
            return;
        }

        try {
            await createMutation.mutateAsync(data);
            toast.success('Đã gửi yêu cầu thay đổi lịch dạy. Vui lòng chờ quản trị viên phê duyệt.');
            onOpenChange(false);
            form.reset();
        } catch {
            toast.error('Có lỗi xảy ra khi gửi yêu cầu');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Yêu Cầu Thay Đổi Lịch</DialogTitle>
                    <DialogDescription>
                        Đề xuất thời gian mới cho lịch dạy cố định của bạn.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Controller
                            name="dayOfWeek"
                            control={form.control as any}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="dayOfWeek">Ngày trong tuần</FieldLabel>
                                    <Select
                                        onValueChange={(val) => field.onChange(parseInt(val))}
                                        defaultValue={field.value?.toString()}
                                    >
                                        <SelectTrigger
                                            id="dayOfWeek"
                                            aria-invalid={fieldState.invalid}
                                        >
                                            <SelectValue placeholder="Chọn ngày" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DAYS.map((day) => (
                                                <SelectItem key={day.value} value={day.value}>
                                                    {day.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <Controller
                            name="startTime"
                            control={form.control as any}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="startTime">Giờ bắt đầu</FieldLabel>
                                    <Input
                                        {...field}
                                        id="startTime"
                                        type="time"
                                        aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                    </div>

                    <Controller
                        name="duration"
                        control={form.control as any}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="duration">Thời lượng (phút)</FieldLabel>
                                <Input
                                    {...field}
                                    id="duration"
                                    type="number"
                                    aria-invalid={fieldState.invalid}
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />

                    <Controller
                        name="reason"
                        control={form.control as any}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="reason">Lý do thay đổi</FieldLabel>
                                <Textarea
                                    {...field}
                                    id="reason"
                                    placeholder="Vui lòng cung cấp lý do để quản trị viên dễ dàng phê duyệt..."
                                    className="min-h-[100px] resize-none"
                                    aria-invalid={fieldState.invalid}
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />

                    {/* Conflict Status */}
                    <div className={cn(
                        "p-4 rounded-lg border flex items-center gap-3 transition-colors",
                        isAvailable ? "border-border" : "border-destructive/30 bg-destructive/5 text-destructive"
                    )}>
                        {isChecking ? (
                            <Spinner className="size-5 shrink-0 text-muted-foreground" />
                        ) : isAvailable ? (
                            <CheckCircle2 className="size-5 shrink-0 text-muted-foreground" />
                        ) : (
                            <AlertCircle className="size-5 shrink-0" />
                        )}
                        <div className="space-y-0.5 text-xs">
                            <p className="font-semibold">
                                {isChecking ? 'Đang kiểm tra...' : isAvailable ? 'Thời gian khả dụng' : 'Xung đột lịch trình'}
                            </p>
                            <p className="text-muted-foreground text-[11px]">
                                {isAvailable
                                    ? 'Bạn có thể yêu cầu thay đổi sang khung giờ này.'
                                    : 'Bạn đã có một lịch dạy khác trùng lặp với thời gian này.'}
                            </p>
                        </div>
                    </div>

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
                            disabled={!isAvailable || isChecking || createMutation.isPending}
                        >
                            {createMutation.isPending && (
                                <Spinner className="mr-2" />
                            )}
                            Gửi yêu cầu
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
