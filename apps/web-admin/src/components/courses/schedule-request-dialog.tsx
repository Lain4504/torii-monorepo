import { useForm } from 'react-hook-form';
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
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@workspace/ui/components/form';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Textarea } from '@workspace/ui/components/textarea';
import { useCreateScheduleRequest, useCheckAvailabilityQuery } from '@/api/services/live-sessions';
import { toast } from '@workspace/ui/components/sonner';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';

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
        } catch (error) {
            toast.error('Có lỗi xảy ra khi gửi yêu cầu');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-none shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-sans font-black italic uppercase tracking-tight text-primary">
                        Yêu Cầu Thay Đổi Lịch
                    </DialogTitle>
                    <DialogDescription className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Đề xuất thời gian mới cho lịch dạy cố định của bạn.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control as any}
                                name="dayOfWeek"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ngày trong tuần</FormLabel>
                                        <Select
                                            onValueChange={(val) => field.onChange(parseInt(val))}
                                            defaultValue={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-none font-medium text-xs">
                                                    <SelectValue placeholder="Chọn ngày" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-xl">
                                                {DAYS.map((day) => (
                                                    <SelectItem key={day.value} value={day.value} className="text-xs font-medium">
                                                        {day.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control as any}
                                name="startTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Giờ bắt đầu</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="time"
                                                className="h-11 rounded-xl bg-muted/30 border-none font-medium text-xs"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control as any}
                            name="duration"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Thời lượng (phút)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            className="h-11 rounded-xl bg-muted/30 border-none font-medium text-xs"
                                            {...field}
                                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control as any}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Lý do thay đổi</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Vui lòng cung cấp lý do để quản trị viên dễ dàng phê duyệt..."
                                            className="min-h-[100px] rounded-2xl bg-muted/30 border-none font-medium resize-none p-4 text-xs"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />

                        {/* Conflict Status */}
                        <div className={cn(
                            "p-4 rounded-2xl flex items-center gap-3 transition-colors duration-300",
                            isAvailable ? "bg-emerald-50 text-emerald-700" : "bg-destructive/10 text-destructive"
                        )}>
                            {isAvailable ? <CheckCircle2 className="size-5 shrink-0" /> : <AlertCircle className="size-5 shrink-0" />}
                            <div className="space-y-0.5 text-xs">
                                <p className="font-bold uppercase tracking-tight">
                                    {isAvailable ? "Thời gian khả dụng" : "Xung đột lịch trình"}
                                </p>
                                <p className="text-[10px] opacity-80 leading-snug">
                                    {isAvailable
                                        ? "Bạn có thể yêu cầu thay đổi sang khung giờ này."
                                        : "Bạn đã có một lịch dạy khác trùng lặp với thời gian này."}
                                </p>
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                className="h-11 px-6 rounded-xl text-xs font-bold uppercase tracking-widest"
                            >
                                Hủy bỏ
                            </Button>
                            <Button
                                type="submit"
                                disabled={!isAvailable || isChecking || createMutation.isPending}
                                className="h-11 px-8 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest hover:shadow-lg transition-all"
                            >
                                {createMutation.isPending ? "Đang gửi..." : "Gửi yêu cầu"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
