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
    FieldGroup,
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
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import {
    liveSessionCreateDTOSchema,
    type CourseMasterResponseDTO,
    type CourseRunResponseDTO
} from '@workspace/schemas';
import { useCreateLiveSession } from '@/lib/api/services/live-sessions';
import { toast } from '@workspace/ui/components/sonner';

interface CreateLiveSessionSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    course: CourseMasterResponseDTO | null;
    run: CourseRunResponseDTO | null;
}

type FormValues = {
    courseRunId: string;
    title: string;
    description?: string;
    scheduledAt: string | Date;
    duration: number;
    lecturerId?: string;
};

export function CreateLiveSessionSheet({ open, onOpenChange, course, run }: CreateLiveSessionSheetProps) {
    const createMutation = useCreateLiveSession();

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<any>({
        resolver: zodResolver(liveSessionCreateDTOSchema),
        defaultValues: {
            courseRunId: run?.id || '',
            title: '',
            description: '',
            scheduledAt: '',
            duration: 90,
            lecturerId: run?.lecturerId || course?.lecturer?.id || '',
        },
    });

    const onSubmit = async (data: FormValues) => {
        try {
            await createMutation.mutateAsync({
                ...data,
                scheduledAt: new Date(data.scheduledAt).toISOString(),
            });
            toast.success('Đã tạo buổi học mới');
            reset();
            onOpenChange(false);
        } catch (error) {
            toast.error('Không thể tạo buổi học');
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[600px] flex flex-col p-0">
                <SheetHeader className="p-6 pb-0">
                    <SheetTitle>Tạo Buổi học Lẻ</SheetTitle>
                    <SheetDescription>
                        Tạo một buổi học riêng lẻ cho lớp học này.
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1">
                    <form id="create-session-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
                        <FieldGroup>
                            <Controller
                                name="title"
                                control={control}
                                render={({ field }) => (
                                    <Field>
                                        <FieldLabel htmlFor="title">Tiêu đề buổi học</FieldLabel>
                                        <Input id="title" {...field} placeholder="Ví dụ: Buổi ôn tập, Buổi bù..." />
                                        {errors.title && <FieldError errors={[errors.title]} />}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="lecturerId"
                                control={control}
                                render={({ field }) => (
                                    <Field>
                                        <FieldLabel htmlFor="lecturerId">Giảng viên</FieldLabel>
                                        <Select onValueChange={field.onChange} value={field.value || ''}>
                                            <SelectTrigger id="lecturerId">
                                                <SelectValue placeholder="Chọn giảng viên..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Giảng viên có sẵn</SelectLabel>
                                                    {run?.lecturer && (
                                                        <SelectItem value={run.lecturer.id}>
                                                            {run.lecturer.displayName} (Giảng viên lớp)
                                                        </SelectItem>
                                                    )}
                                                    {course?.lecturer && course.lecturer.id !== run?.lecturerId && (
                                                        <SelectItem value={course.lecturer.id}>
                                                            {course.lecturer.displayName} (Trưởng môn)
                                                        </SelectItem>
                                                    )}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        {errors.lecturerId && <FieldError errors={[errors.lecturerId]} />}
                                    </Field>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Controller
                                    name="scheduledAt"
                                    control={control}
                                    render={({ field }) => (
                                        <Field>
                                            <FieldLabel htmlFor="scheduledAt">Thời gian bắt đầu</FieldLabel>
                                            <Input
                                                id="scheduledAt"
                                                type="datetime-local"
                                                {...field}
                                                value={typeof field.value === 'string' ? field.value : ''}
                                            />
                                            {errors.scheduledAt && <FieldError errors={[errors.scheduledAt]} />}
                                        </Field>
                                    )}
                                />
                                <Controller
                                    name="duration"
                                    control={control}
                                    render={({ field }) => (
                                        <Field>
                                            <FieldLabel htmlFor="duration">Thời lượng (phút)</FieldLabel>
                                            <Input
                                                id="duration"
                                                type="number"
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                            />
                                            {errors.duration && <FieldError errors={[errors.duration]} />}
                                        </Field>
                                    )}
                                />
                            </div>

                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <Field>
                                        <FieldLabel htmlFor="description">Mô tả buổi học</FieldLabel>
                                        <Textarea
                                            id="description"
                                            {...field}
                                            placeholder="Nội dung chi tiết..."
                                            className="min-h-[100px]"
                                        />
                                        {errors.description && <FieldError errors={[errors.description]} />}
                                    </Field>
                                )}
                            />
                        </FieldGroup>
                    </form>
                </ScrollArea>

                <SheetFooter className="p-6 border-t bg-muted/5">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                        Hủy
                    </Button>
                    <Button type="submit" form="create-session-form" disabled={createMutation.isPending} className="flex-1">
                        {createMutation.isPending ? 'Đang tạo...' : 'Tạo buổi học'}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
