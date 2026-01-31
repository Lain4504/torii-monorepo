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
import { useCreateLiveSession, useUpdateLiveSession } from '@/api/services/live-sessions';
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
    description: string;
    scheduledAt: string;
    duration: number;
    lecturerId?: string;
}

export function CreateLiveSessionDialog({ open, onOpenChange, courseId, initialData }: CreateLiveSessionDialogProps) {
    const createMutation = useCreateLiveSession();
    const updateMutation = useUpdateLiveSession();

    const form = useForm<LiveSessionFormValues>({
        defaultValues: {
            courseId,
            title: '',
            description: '',
            scheduledAt: '',
            duration: 90,
            lecturerId: '',
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
            });
        } else {
            form.reset({
                courseId,
                title: '',
                description: '',
                scheduledAt: '',
                duration: 90,
                lecturerId: '',
            });
        }
    }, [initialData, courseId, form]);

    const onSubmit = async (values: LiveSessionFormValues) => {
        try {
            const dto = {
                ...values,
                scheduledAt: new Date(values.scheduledAt),
            } as any;

            if (initialData) {
                await updateMutation.mutateAsync({
                    id: initialData.id,
                    dto
                });
                toast.success('Đã cập nhật lịch dạy');
            } else {
                await createMutation.mutateAsync(dto);
                toast.success('Đã lên lịch buổi học mới');
            }
            onOpenChange(false);
        } catch (error) {
            toast.error('Có lỗi xảy ra khi lưu lịch dạy');
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
