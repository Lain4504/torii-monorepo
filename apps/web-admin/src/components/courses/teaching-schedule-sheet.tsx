import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@workspace/ui/components/form';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select";
import { InstructorRole, type CourseResponseDTO } from '@workspace/schemas';
import { useCourseInstructors } from '@/api/services/course-instructors';
import {
    useTeachingSchedules,
    useAssignTeachingSchedule,
    useRemoveTeachingSchedule,
    useCheckAvailability
} from '@/api/services/live-sessions';
import { toast } from '@workspace/ui/components/sonner';
import { Calendar, Clock, Trash, AlertCircle } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { Card } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';

interface TeachingScheduleSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    course: CourseResponseDTO | null;
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

    const { data: instructors } = useCourseInstructors(course?.id || '');
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
                    courseId: course.id,
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

    const handleRemove = async (scheduleId: string) => {
        if (!confirm('Xóa lịch cố định này? Các buổi học tương lai chưa diễn ra sẽ bị hủy.')) return;
        try {
            await removeMutation.mutateAsync(scheduleId);
            toast.success('Đã xóa lịch cố định');
            refetch();
        } catch (error) {
            toast.error('Không thể xóa lịch dạy');
        }
    };

    if (!course) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:w-[800px] !max-w-[800px] overflow-y-auto bg-background/95 backdrop-blur-xl border-l border-border/40">
                <SheetHeader className="pb-6 border-b border-border/20">
                    <SheetTitle className="text-2xl font-sans font-bold italic tracking-tight">
                        Lịch dạy <span className="text-primary not-italic">Cố định</span>
                    </SheetTitle>
                    <SheetDescription className="text-xs font-medium text-muted-foreground/60 uppercase tracking-widest pt-1">
                        {course.title}
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-8 py-6">
                    {/* Current Schedules */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                            Lịch hiện tại
                        </h3>
                        {schedules && schedules.length > 0 ? (
                            <div className="space-y-3">
                                {schedules.map((schedule) => (
                                    <Card key={schedule.id} className="p-4 rounded-2xl border-border/40 bg-muted/20 hover:bg-muted/30 transition-colors">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-[10px] font-bold uppercase">
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
                                                className="size-8 rounded-lg text-destructive hover:bg-destructive/10">
                                                <Trash className="size-4" />
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center border-2 border-dashed border-border/40 rounded-2xl bg-muted/5">
                                <AlertCircle className="size-8 mx-auto mb-3 text-muted-foreground/20" />
                                <p className="text-sm text-muted-foreground/60">Chưa có lịch cố định nào</p>
                            </div>
                        )}
                    </div>

                    {/* Add New Schedule */}
                    <div className="space-y-4 pt-6 border-t border-border/20">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                            Thêm lịch mới
                        </h3>

                        <Form {...(form as any)}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                <FormField
                                    control={form.control as any}
                                    name="lecturerId"
                                    render={({ field }: any) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                                Giảng viên
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="rounded-xl border-border/40 h-11">
                                                        <SelectValue placeholder="Chọn giảng viên..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-2xl">
                                                    <SelectGroup>
                                                        <SelectLabel className="text-[10px] uppercase tracking-widest font-black opacity-30">
                                                            Danh sách giảng viên
                                                        </SelectLabel>
                                                        {instructors?.map((instructor) => (
                                                            <SelectItem
                                                                key={instructor.id}
                                                                value={instructor.lecturerId}
                                                                className="rounded-lg"
                                                            >
                                                                {instructor.lecturer?.displayName || instructor.lecturerId}
                                                                {' '}
                                                                ({instructor.role === InstructorRole.MAIN ? 'Chính' : 'Phụ'})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-[10px] pl-1 font-bold" />
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-2">
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                        Chọn các ngày trong tuần
                                    </FormLabel>
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
                                                        "size-11 rounded-xl text-[10px] font-bold",
                                                        isSelected && "shadow-md shadow-primary/20"
                                                    )}>
                                                    {day}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control as any}
                                        name="startTime"
                                        render={({ field }: any) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                                    Giờ bắt đầu
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="time"
                                                        {...field}
                                                        className="rounded-xl border-border/40 h-11"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-[10px] pl-1 font-bold" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control as any}
                                        name="duration"
                                        render={({ field }: any) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                                    Thời lượng (phút)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                        className="rounded-xl border-border/40 h-11"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-[10px] pl-1 font-bold" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {lecturerId && selectedDays.length > 0 && (
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={handleCheckAvailability}
                                        disabled={availabilityMutation.isPending}
                                        className="w-full h-10 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                                        {availabilityMutation.isPending ? 'Đang kiểm tra...' : 'Kiểm tra lịch trùng'}
                                    </Button>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => onOpenChange(false)}
                                        className="flex-1 h-11 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                                        Hủy bỏ
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={assignMutation.isPending || selectedDays.length === 0}
                                        className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-sans font-bold italic text-xs uppercase tracking-wide shadow-sm">
                                        Lưu lịch cố định
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
