import { useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
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
    FieldGroup,
    FieldSeparator,
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
import {
    useTeachingSchedules,
    useAssignTeachingSchedule,
    useRemoveTeachingSchedule,
    useCheckAvailability
} from '@/lib/api/services/live-sessions';
import { toast } from '@workspace/ui/components/sonner';
import { Calendar, Clock, Trash, AlertCircle, Info } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { Card } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { apiClient } from '@/lib/api/api-client';
import { type StandardApiResponse } from '@workspace/schemas';

interface TeachingScheduleSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    run: any; // CourseRunResponseDTO
}

interface ScheduleEntry {
    dayOfWeek: number;
    startTime: string;
    duration: number;
}

interface ScheduleFormValues {
    lecturerId: string;
    schedules: ScheduleEntry[];
}

const DAYS_OF_WEEK = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
const DAYS_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export function TeachingScheduleSheet({ open, onOpenChange, run }: TeachingScheduleSheetProps) {
    const { data: schedules, refetch } = useTeachingSchedules(run?.id || '');
    const assignMutation = useAssignTeachingSchedule();
    const removeMutation = useRemoveTeachingSchedule();
    const availabilityMutation = useCheckAvailability();

    const form = useForm<ScheduleFormValues>({
        defaultValues: {
            lecturerId: '',
            schedules: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "schedules",
    });

    useEffect(() => {
        if (open && run) {
            form.reset({
                lecturerId: run.lecturerId || '',
                schedules: [],
            });
            refetch();
        }
    }, [open, run, form, refetch]);

    const handleDayToggle = (dayIdx: number) => {
        const existingIdx = fields.findIndex(f => f.dayOfWeek === dayIdx);
        if (existingIdx > -1) {
            remove(existingIdx);
        } else {
            append({
                dayOfWeek: dayIdx,
                startTime: '19:00',
                duration: 90,
            });
        }
    };

    const handleCheckAvailability = async (index: number) => {
        const entry = form.getValues(`schedules.${index}`);
        const lecturerId = form.getValues('lecturerId');

        if (!lecturerId) {
            toast.error('Vui lòng chọn giảng viên trước');
            return;
        }

        if (!run) {
            toast.error('Thiếu thông tin lớp học');
            return;
        }

        try {
            const res = await availabilityMutation.mutateAsync({
                lecturerId,
                dayOfWeek: entry.dayOfWeek,
                startTime: entry.startTime,
                duration: entry.duration,
            });
            if (res.available) {
                toast.success(`Giảng viên sẵn sàng cho ${DAYS_OF_WEEK[entry.dayOfWeek]}`);
            } else {
                toast.error(`Trùng lịch vào ${DAYS_OF_WEEK[entry.dayOfWeek]} với khóa: ${res.conflicts?.[0]?.courseTitle}`);
            }
        } catch (error) {
            toast.error('Lỗi khi kiểm tra lịch trống');
        }
    };

    const onSubmit = async (values: ScheduleFormValues) => {
        if (!run) return;
        if (values.schedules.length === 0) {
            toast.error('Vui lòng thêm ít nhất một lịch dạy');
            return;
        }

        try {
            // Validate readiness
            await apiClient.get<StandardApiResponse<{ isReady: boolean; message?: string }>>(`/api/course-masters/${run.courseMasterId}/validate-scheduling`);

            for (const entry of values.schedules) {
                await assignMutation.mutateAsync({
                    courseRunId: run.id,
                    lecturerId: values.lecturerId || run.lecturerId,
                    dayOfWeek: entry.dayOfWeek,
                    startTime: entry.startTime,
                    duration: entry.duration,
                });
            }
            toast.success(`Đã lưu ${values.schedules.length} lịch dạy mới`);
            refetch();
            form.reset({
                lecturerId: values.lecturerId,
                schedules: [],
            });
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Có lỗi xảy ra khi lưu lịch dạy';
            toast.error(msg);
        }
    };

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

    if (!run) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="!w-full sm:!max-w-[800px] flex flex-col p-0">
                <SheetHeader className="p-6 pb-0">
                    <SheetTitle>Lịch dạy Cố định</SheetTitle>
                    <SheetDescription>
                        Thiết lập lịch giảng dạy cố định hàng tuần cho lớp {run?.title}.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden min-h-0">
                    <ScrollArea className="flex-1 min-h-0">
                        <div className="space-y-6 p-6">
                            {/* Current Schedules */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Info className="size-3" />
                                    Lịch hiện tại
                                </h3>
                                {schedules && schedules.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {schedules.map((schedule) => (
                                            <Card key={schedule.id} className="p-4 bg-muted/30 border-muted-foreground/10 hover:border-primary/20 transition-colors">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="secondary" className="font-bold text-[10px]">
                                                                {DAYS_OF_WEEK[schedule.dayOfWeek]}
                                                            </Badge>
                                                            <span className="text-[10px] text-muted-foreground font-medium">
                                                                {schedule.lecturer?.displayName}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-sm font-semibold">
                                                            <div className="flex items-center gap-1.5 grayscale opacity-70">
                                                                <Clock className="size-3.5" />
                                                                {schedule.startTime}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 grayscale opacity-70">
                                                                <Calendar className="size-3.5" />
                                                                {schedule.duration}ph
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRemove(schedule.id)}
                                                        className="size-7 text-destructive hover:bg-destructive/10 -mt-1 -mr-1"
                                                    >
                                                        <Trash className="size-3.5" />
                                                    </Button>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center border border-dashed rounded-2xl bg-muted/5">
                                        <AlertCircle className="size-8 mx-auto mb-3 text-muted-foreground/20" />
                                        <p className="text-xs text-muted-foreground font-medium">Chưa có lịch cố định nào</p>
                                    </div>
                                )}
                            </div>

                            {/* Add New Schedule Section */}
                            <FieldGroup className="pt-6 border-t">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                                    Thiết lập lịch học mới
                                </h3>

                                <div className="space-y-6">
                                    <Controller
                                        name="lecturerId"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor="lecturerId">Giảng viên phụ trách</FieldLabel>
                                                <Select onValueChange={field.onChange} value={field.value} disabled={!!run?.lecturerId}>
                                                    <SelectTrigger id="lecturerId" aria-invalid={fieldState.invalid} className="h-11">
                                                        <SelectValue placeholder="Chọn giảng viên..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            <SelectLabel>Giảng viên</SelectLabel>
                                                            {run?.lecturer && (
                                                                <SelectItem key={run.lecturer.id} value={run.lecturer.id}>
                                                                    {run.lecturer.displayName} (Giảng viên lớp)
                                                                </SelectItem>
                                                            )}
                                                            {run?.courseMaster?.lecturer && run.courseMaster.lecturer.id !== run?.lecturerId && (
                                                                <SelectItem key={run.courseMaster.lecturer.id} value={run.courseMaster.lecturer.id}>
                                                                    {run.courseMaster.lecturer.displayName} (Trưởng môn)
                                                                </SelectItem>
                                                            )}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                                {run?.lecturerId && (
                                                    <p className="text-[10px] text-muted-foreground mt-1 px-1 italic">
                                                        * Giảng viên được cố định theo lớp (Course Run).
                                                    </p>
                                                )}
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />

                                    <div className="space-y-3">
                                        <FieldLabel>Chọn các ngày trong tuần</FieldLabel>
                                        <div className="flex flex-wrap gap-2">
                                            {DAYS_SHORT.map((day, idx) => {
                                                const isSelected = fields.some(f => f.dayOfWeek === idx);
                                                return (
                                                    <Button
                                                        key={idx}
                                                        type="button"
                                                        variant={isSelected ? "default" : "outline"}
                                                        className={cn(
                                                            "size-12 rounded-xl transition-all font-bold",
                                                            isSelected ? "ring-2 ring-primary ring-offset-2" : "text-muted-foreground"
                                                        )}
                                                        onClick={() => handleDayToggle(idx)}
                                                    >
                                                        {day}
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {fields.length > 0 && (
                                        <div className="space-y-4 pt-4">
                                            <FieldSeparator />
                                            <div className="space-y-6">
                                                {fields.map((field, index) => (
                                                    <Card key={field.id} className="p-5 border-primary/10 shadow-sm relative overflow-hidden">
                                                        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                                                        <div className="flex flex-col gap-4">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <Badge className="h-6 px-3 rounded-full text-[11px] font-black uppercase">
                                                                        {DAYS_OF_WEEK[field.dayOfWeek]}
                                                                    </Badge>
                                                                    <span className="text-xs text-muted-foreground italic font-medium">Cấu hình thời gian</span>
                                                                </div>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    type="button"
                                                                    className="h-7 text-[10px] font-bold uppercase tracking-tighter text-blue-600 border-blue-200 hover:bg-blue-50"
                                                                    onClick={() => handleCheckAvailability(index)}
                                                                >
                                                                    Check lịch
                                                                </Button>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <Controller
                                                                    name={`schedules.${index}.startTime`}
                                                                    control={form.control}
                                                                    render={({ field: inputField, fieldState }) => (
                                                                        <Field data-invalid={fieldState.invalid}>
                                                                            <FieldLabel className="text-[10px] uppercase font-bold tracking-widest opacity-70">Bắt đầu</FieldLabel>
                                                                            <Input
                                                                                {...inputField}
                                                                                type="time"
                                                                                className="h-10 bg-muted/20"
                                                                            />
                                                                        </Field>
                                                                    )}
                                                                />
                                                                <Controller
                                                                    name={`schedules.${index}.duration`}
                                                                    control={form.control}
                                                                    render={({ field: inputField, fieldState }) => (
                                                                        <Field data-invalid={fieldState.invalid}>
                                                                            <FieldLabel className="text-[10px] uppercase font-bold tracking-widest opacity-70">Lượng (phút)</FieldLabel>
                                                                            <Input
                                                                                {...inputField}
                                                                                type="number"
                                                                                onChange={(e) => inputField.onChange(parseInt(e.target.value))}
                                                                                className="h-10 bg-muted/20"
                                                                            />
                                                                        </Field>
                                                                    )}
                                                                />
                                                            </div>
                                                        </div>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </FieldGroup>
                        </div>
                    </ScrollArea>
                    <div className="p-6 border-t flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1 h-11 rounded-xl text-xs font-bold uppercase tracking-widest"
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            type="submit"
                            disabled={assignMutation.isPending || fields.length === 0}
                            className="flex-1 h-11 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20"
                        >
                            {assignMutation.isPending ? 'Đang lưu...' : 'Gán lịch chọn'}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
