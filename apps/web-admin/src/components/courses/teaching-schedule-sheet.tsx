import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@workspace/ui/components/sheet';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
    Field,
    FieldLabel,
    FieldError,
} from '@workspace/ui/components/field';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select";
import { type CourseMasterResponseDTO } from '@workspace/schemas';
import {
    useTeachingSchedules,
    useAssignTeachingSchedule,
    useRemoveTeachingSchedule,
    useCheckAvailability
} from '@/lib/api/services/live-sessions';
import { toast } from '@workspace/ui/components/sonner';
import { Calendar, Clock, Trash, AlertCircle } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { Card } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { ScrollArea } from '@workspace/ui/components/scroll-area';

interface TeachingScheduleSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    course: CourseMasterResponseDTO | null;
}

interface ScheduleFormValues {
    lecturerId: string;
    dayOfWeek: number;
    startTime: string;
    duration: number;
}

const DAYS_OF_WEEK = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
const DAYS_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export function TeachingScheduleSheet({ open, onOpenChange, course }: TeachingScheduleSheetProps) {
    const [selectedDays, setSelectedDays] = useState<number[]>([]);

    const form = useForm<ScheduleFormValues>({
        defaultValues: {
            lecturerId: '',
            dayOfWeek: 1,
            startTime: '19:00',
            duration: 90,
        },
    });

    const { data: schedules, refetch } = useTeachingSchedules(course?.id || '');
    const assignMutation = useAssignTeachingSchedule();
    const removeMutation = useRemoveTeachingSchedule();
    const availabilityMutation = useCheckAvailability();

    useEffect(() => {
        if (open && course) {
            form.reset({
                lecturerId: '',
                dayOfWeek: 1,
                startTime: '19:00',
                duration: 90,
            });
            setSelectedDays([]);
            refetch();
        }
    }, [open, course, form, refetch]);

    const lecturerId = form.watch('lecturerId');
    const startTime = form.watch('startTime');
    const duration = form.watch('duration');

    const handleCheckAvailability = async () => {
        if (!lecturerId || selectedDays.length === 0) {
            toast.error('Vui lòng chọn giảng viên và ít nhất một ngày trong tuần');
            return;
        }

        for (const day of selectedDays) {
            const res = await availabilityMutation.mutateAsync({
                lecturerId,
                dayOfWeek: day,
                startTime,
                duration,
            });
            if (!res.available) {
                toast.error(`Trùng lịch vào ${DAYS_OF_WEEK[day]} với khóa: ${res.conflicts?.[0]?.courseTitle}`);
                return;
            }
        }
        toast.success('Giảng viên sẵn sàng cho tất cả các buổi đã chọn');
    };

    const onSubmit = async (values: ScheduleFormValues) => {
        if (!course) return;
        if (selectedDays.length === 0) {
            toast.error('Vui lòng chọn ít nhất một ngày trong tuần');
            return;
        }

        try {
            for (const day of selectedDays) {
                await assignMutation.mutateAsync({
                    courseMasterId: course.id,
                    lecturerId: values.lecturerId,
                    dayOfWeek: day,
                    startTime: values.startTime,
                    duration: values.duration,
                });
            }
            toast.success(`Đã lên lịch cố định ${selectedDays.length} buổi/tuần`);
            refetch();
            form.reset();
            setSelectedDays([]);
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Có lỗi xảy ra khi lưu lịch dạy';
            toast.error(msg);
        }
    };

    if (!course) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[800px] flex flex-col">
                <SheetHeader>
                    <SheetTitle>Lịch dạy Cố định</SheetTitle>
                    <SheetDescription>
                        {course.title}
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1 min-h-0">
                    <div className="space-y-8 p-6">
                        {/* Current Schedules */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                                Lịch hiện tại
                            </h3>
                            {schedules && schedules.length > 0 ? (
                                <div className="space-y-3">
                                    {schedules.map((schedule) => (
                                        <Card key={schedule.id} className="p-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 space-y-2 min-h-0">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline">
                                                            {DAYS_OF_WEEK[schedule.dayOfWeek]}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground">
                                                            {schedule.lecturer?.displayName || 'Chưa chỉ định'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="size-3.5 text-primary" />
                                                            {schedule.startTime}
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar className="size-3.5 text-primary" />
                                                            {schedule.duration} phút
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemove(schedule.id)}
                                                    className="size-8 text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash className="size-4" />
                                                </Button>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center border border-dashed rounded-lg">
                                    <AlertCircle className="size-8 mx-auto mb-3 text-muted-foreground/40" />
                                    <p className="text-sm text-muted-foreground">Chưa có lịch cố định nào</p>
                                </div>
                            )}
                        </div>

                        {/* Add New Schedule */}
                        <div className="space-y-4 pt-6 border-t">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                                Thêm lịch mới
                            </h3>

                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                <Controller
                                    name="lecturerId"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="lecturerId">Giảng viên</FieldLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger id="lecturerId" aria-invalid={fieldState.invalid}>
                                                    <SelectValue placeholder="Chọn giảng viên..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectLabel>Danh sách giảng viên</SelectLabel>
                                                        {course?.lecturer && (
                                                            <SelectItem key={course.lecturer.id} value={course.lecturer.id}>
                                                                {course.lecturer.displayName} (Chính)
                                                            </SelectItem>
                                                        )}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />

                                <div className="space-y-2">
                                    <FieldLabel>Chọn các ngày trong tuần</FieldLabel>
                                    <div className="flex flex-wrap gap-2">
                                        {DAYS_SHORT.map((day, idx) => {
                                            const isSelected = selectedDays.includes(idx);
                                            return (
                                                <Button
                                                    key={idx}
                                                    type="button"
                                                    variant={isSelected ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedDays(prev =>
                                                            isSelected
                                                                ? prev.filter(d => d !== idx)
                                                                : [...prev, idx]
                                                        );
                                                    }}
                                                    className={cn(
                                                        "size-11",
                                                        isSelected && "shadow-sm"
                                                    )}
                                                >
                                                    {day}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Controller
                                        name="startTime"
                                        control={form.control}
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
                                    <Controller
                                        name="duration"
                                        control={form.control}
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
                                </div>

                                {lecturerId && selectedDays.length > 0 && (
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={handleCheckAvailability}
                                        disabled={availabilityMutation.isPending}
                                        className="w-full"
                                    >
                                        {availabilityMutation.isPending ? 'Đang kiểm tra...' : 'Kiểm tra lịch trùng'}
                                    </Button>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => onOpenChange(false)}
                                        className="flex-1"
                                    >
                                        Hủy bỏ
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={assignMutation.isPending || selectedDays.length === 0}
                                        className="flex-1"
                                    >
                                        Lưu lịch cố định
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );

    async function handleRemove(scheduleId: string) {
        if (!confirm('Xóa lịch cố định này? Các buổi học tương lai chưa diễn ra sẽ bị hủy.')) return;
        try {
            await removeMutation.mutateAsync(scheduleId);
            toast.success('Đã xóa lịch cố định');
            refetch();
        } catch {
            toast.error('Không thể xóa lịch dạy');
        }
    }
}
