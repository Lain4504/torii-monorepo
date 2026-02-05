import { useForm } from 'react-hook-form';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@workspace/ui/components/form';
import {
    type LiveSessionResponseDTO,
    InstructorRole
} from '@workspace/schemas';
import {
    useCreateLiveSession,
    useUpdateLiveSession,
    useBulkCreateLiveSession,
    useAssignTeachingSchedule,
    useCheckAvailability
} from '@/api/services/live-sessions';
import { useCourseInstructors } from '@/api/services/course-instructors';
import { toast } from '@workspace/ui/components/sonner';
import { useEffect } from 'react';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select";

interface CreateLiveSessionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    courseId: string;
    initialData?: LiveSessionResponseDTO | null;
}

interface LiveSessionFormValues {
    courseId: string;
    title: string;
    titlePrefix: string;
    description: string;
    scheduledAt: string;
    dates: string[];
    startTime: string;
    daysOfWeek: number[];
    duration: number;
    lecturerId?: string;
    mode: 'single' | 'bulk' | 'weekly';
}

export function CreateLiveSessionDialog({ open, onOpenChange, courseId, initialData }: CreateLiveSessionDialogProps) {
    const createMutation = useCreateLiveSession();
    const updateMutation = useUpdateLiveSession();

    const form = useForm<LiveSessionFormValues>({
        defaultValues: {
            courseId,
            title: '',
            titlePrefix: '',
            description: '',
            scheduledAt: '',
            dates: [''],
            startTime: '19:00',
            daysOfWeek: [],
            duration: 90,
            lecturerId: '',
            mode: 'single',
        },
    });

    const { data: instructors } = useCourseInstructors(courseId);

    useEffect(() => {
        if (initialData) {
            form.reset({
                courseId,
                title: initialData.title,
                description: initialData.description || '',
                scheduledAt: new Date(initialData.scheduledAt).toISOString().slice(0, 16),
                duration: initialData.duration,
                lecturerId: initialData.lecturerId || '',
                mode: 'single',
            });
        } else {
            form.reset({
                courseId,
                title: '',
                titlePrefix: '',
                description: '',
                scheduledAt: '',
                dates: [''],
                startTime: '19:00',
                daysOfWeek: [],
                duration: 90,
                lecturerId: '',
                mode: 'single',
            });
        }
    }, [initialData, courseId, form]);

    const mode = form.watch('mode');
    const bulkDates = form.watch('dates');
    const lecturerId = form.watch('lecturerId');
    const startTime = form.watch('startTime');
    const daysOfWeek = form.watch('daysOfWeek');
    const duration = form.watch('duration');

    const bulkCreateMutation = useBulkCreateLiveSession();
    const assignWeeklyMutation = useAssignTeachingSchedule();
    const availabilityMutation = useCheckAvailability();

    const onSubmit = async (values: LiveSessionFormValues) => {
        try {
            if (initialData) {
                await updateMutation.mutateAsync({
                    id: initialData.id,
                    dto: { ...values, scheduledAt: new Date(values.scheduledAt) }
                });
                toast.success('Đã cập nhật lịch dạy');
            } else if (values.mode === 'weekly') {
                if (values.daysOfWeek.length === 0) {
                    toast.error('Vui lòng chọn ít nhất một ngày trong tuần');
                    return;
                }
                for (const day of values.daysOfWeek) {
                    await assignWeeklyMutation.mutateAsync({
                        courseId: values.courseId,
                        lecturerId: values.lecturerId!,
                        dayOfWeek: day,
                        startTime: values.startTime,
                        duration: values.duration,
                    });
                }
                toast.success(`Đã lên lịch cố định ${values.daysOfWeek.length} buổi/tuần`);
            } else if (values.mode === 'bulk') {
                await bulkCreateMutation.mutateAsync({
                    courseId: values.courseId,
                    titlePrefix: values.titlePrefix,
                    description: values.description,
                    dates: values.dates.filter(d => !!d).map(d => new Date(d)),
                    duration: values.duration,
                    lecturerId: values.lecturerId,
                });
                toast.success(`Đã tạo ${values.dates.length} buổi học mới`);
            } else {
                await createMutation.mutateAsync({
                    ...values,
                    scheduledAt: new Date(values.scheduledAt),
                } as any);
                toast.success('Đã lên lịch buổi học mới');
            }
            onOpenChange(false);
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Có lỗi xảy ra khi lưu lịch dạy';
            toast.error(msg);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] rounded-[2rem] bg-background/95 backdrop-blur-xl border-border/40 overflow-hidden shadow-2xl">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-xl font-sans font-bold italic tracking-tight uppercase">
                        {initialData ? 'Cập nhật' : 'Lên lịch'} <span className="text-primary not-italic">Buổi Live</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs font-medium text-muted-foreground/60 uppercase tracking-widest pt-1">
                        Thiết lập thời gian và nội dung buổi học trực tuyến
                    </DialogDescription>
                </DialogHeader>

                <Form {...(form as any)}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-6 pt-0">
                        {!initialData && (
                            <div className="flex bg-muted/50 p-1 rounded-2xl mb-4 border border-border/20">
                                <Button
                                    type="button"
                                    variant={mode === 'single' ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => form.setValue('mode', 'single')}
                                    className={`rounded-xl grow text-[10px] uppercase font-bold tracking-widest ${mode === 'single' ? 'shadow-sm' : ''}`}
                                >
                                    Đơn lẻ
                                </Button>
                                <Button
                                    type="button"
                                    variant={mode === 'bulk' ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => form.setValue('mode', 'bulk')}
                                    className={`rounded-xl grow text-[10px] uppercase font-bold tracking-widest ${mode === 'bulk' ? 'shadow-sm' : ''}`}
                                >
                                    Hàng loạt
                                </Button>
                                <Button
                                    type="button"
                                    variant={mode === 'weekly' ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => form.setValue('mode', 'weekly')}
                                    className={`rounded-xl grow text-[10px] uppercase font-bold tracking-widest ${mode === 'weekly' ? 'shadow-sm' : ''}`}
                                >
                                    Tố định
                                </Button>
                            </div>
                        )}

                        {(mode === 'bulk' || mode === 'weekly') ? (
                            <FormField
                                control={form.control as any}
                                name="titlePrefix"
                                render={({ field }: any) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tiền tố tiêu đề</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ví dụ: Khóa học N4 - Lớp K15"
                                                {...field}
                                                className="rounded-xl border-border/40 focus:ring-primary/20 h-10 text-sm font-medium"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px] pl-1 font-bold" />
                                    </FormItem>
                                )}
                            />
                        ) : (
                            <FormField
                                control={form.control as any}
                                name="title"
                                render={({ field }: any) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tiêu đề buổi học</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ví dụ: Buổi 01 - Nhập môn Hiragana"
                                                {...field}
                                                className="rounded-xl border-border/40 focus:ring-primary/20 h-10 text-sm font-medium"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px] pl-1 font-bold" />
                                    </FormItem>
                                )}
                            />
                        )}

                        {mode === 'single' && (
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control as any}
                                    name="scheduledAt"
                                    render={({ field }: any) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Thời gian bắt đầu</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="datetime-local"
                                                    {...field}
                                                    className="rounded-xl border-border/40 focus:ring-primary/20 h-10 text-xs font-medium tabular-nums"
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
                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Thời lượng (phút)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    className="rounded-xl border-border/40 focus:ring-primary/20 h-10 text-sm font-medium tabular-nums"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px] pl-1 font-bold" />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {mode === 'weekly' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control as any}
                                        name="startTime"
                                        render={({ field }: any) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Giờ bắt đầu</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="time"
                                                        {...field}
                                                        className="rounded-xl border-border/40 focus:ring-primary/20 h-10 text-sm font-medium tabular-nums"
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
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Thời lượng (phút)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                        className="rounded-xl border-border/40 focus:ring-primary/20 h-10 text-sm font-medium tabular-nums"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-[10px] pl-1 font-bold" />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control as any}
                                    name="daysOfWeek"
                                    render={({ field }: any) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Chọn thứ trong tuần</FormLabel>
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day, idx) => {
                                                    const isSelected = field.value.includes(idx);
                                                    return (
                                                        <Button
                                                            key={idx}
                                                            type="button"
                                                            variant={isSelected ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => {
                                                                const newValue = isSelected
                                                                    ? field.value.filter((v: number) => v !== idx)
                                                                    : [...field.value, idx];
                                                                field.onChange(newValue);
                                                            }}
                                                            className={`size-10 rounded-xl text-[10px] font-bold ${isSelected ? 'shadow-md shadow-primary/20' : ''}`}
                                                        >
                                                            {day}
                                                        </Button>
                                                    );
                                                })}
                                            </div>
                                            <FormMessage className="text-[10px] pl-1 font-bold" />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {mode === 'bulk' && (
                            <div className="space-y-3">
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Danh sách ngày học</FormLabel>
                                {bulkDates.map((_, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <FormField
                                            control={form.control as any}
                                            name={`dates.${index}`}
                                            render={({ field }: any) => (
                                                <FormItem className="grow">
                                                    <FormControl>
                                                        <Input
                                                            type="datetime-local"
                                                            {...field}
                                                            className="rounded-xl border-border/40 focus:ring-primary/20 h-10 text-xs font-medium tabular-nums"
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        {bulkDates.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    const newDates = [...bulkDates];
                                                    newDates.splice(index, 1);
                                                    form.setValue('dates', newDates);
                                                }}
                                                className="size-10 rounded-xl text-destructive hover:bg-destructive/10"
                                            >
                                                ×
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => form.setValue('dates', [...bulkDates, ''])}
                                    className="w-full rounded-xl border-dashed py-2 h-auto text-[10px] font-bold uppercase tracking-widest"
                                >
                                    + Thêm ngày học
                                </Button>
                            </div>
                        )}

                        <FormField
                            control={form.control as any}
                            name="lecturerId"
                            render={({ field }: any) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Giảng viên phụ trách (Tùy chọn)</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="rounded-xl border-border/40 focus:ring-primary/20 h-10 text-sm font-medium">
                                                <SelectValue placeholder="Chọn giảng viên..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="rounded-2xl border-border/40 shadow-xl">
                                            <SelectGroup>
                                                <SelectLabel className="text-[10px] uppercase tracking-widest font-black opacity-30 px-4 py-2">Danh sách giảng viên</SelectLabel>
                                                <SelectItem value="" className="text-sm rounded-lg mx-1">Không chỉ định</SelectItem>
                                                {instructors?.map((instructor) => (
                                                    <SelectItem
                                                        key={instructor.id}
                                                        value={instructor.lecturerId}
                                                        className="text-sm rounded-lg mx-1"
                                                    >
                                                        {instructor.lecturer?.displayName || instructor.lecturerId} ({instructor.role === InstructorRole.MAIN ? 'Chính' : 'Phụ'})
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    {mode === 'weekly' && lecturerId && daysOfWeek.length > 0 && (
                                        <div className="mt-2 p-3 bg-muted/30 rounded-2xl border border-border/20">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                disabled={availabilityMutation.isPending}
                                                onClick={async () => {
                                                    for (const day of daysOfWeek) {
                                                        const res = await availabilityMutation.mutateAsync({
                                                            lecturerId: lecturerId!,
                                                            dayOfWeek: day,
                                                            startTime,
                                                            duration,
                                                        });
                                                        if (!res.available) {
                                                            toast.error(`Trùng lịch vào thứ ${['CN', '2', '3', '4', '5', '6', '7'][day]} với khóa: ${res.conflicts?.[0]?.courseTitle}`);
                                                            return;
                                                        }
                                                    }
                                                    toast.success('Giảng viên sẵn sàng cho tất cả các buổi đã chọn');
                                                }}
                                                className="w-full h-8 text-[10px] font-bold uppercase tracking-widest rounded-xl"
                                            >
                                                {availabilityMutation.isPending ? 'Đang kiểm tra...' : 'Kiểm tra lịch trùng'}
                                            </Button>
                                        </div>
                                    )}
                                    <FormMessage className="text-[10px] pl-1 font-bold" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control as any}
                            name="description"
                            render={({ field }: any) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Mô tả nội dung (Tùy chọn)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Lời nhắn cho học viên hoặc nội dung bài học..."
                                            {...field}
                                            className="rounded-xl border-border/40 focus:ring-primary/20 min-h-[80px] text-sm resize-none"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px] pl-1 font-bold" />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4 border-t border-border/20">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                className="rounded-xl text-[10px] font-bold uppercase tracking-widest"
                            >
                                Hủy bỏ
                            </Button>
                            <Button
                                type="submit"
                                disabled={createMutation.isPending || updateMutation.isPending}
                                className="rounded-xl bg-primary text-primary-foreground font-sans font-bold italic text-xs uppercase tracking-wide px-6 shadow-sm hover:shadow-md transition-all"
                            >
                                {initialData ? 'Cập nhật lịch' : 'Lên lịch ngay'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
