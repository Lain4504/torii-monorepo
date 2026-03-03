import { useEffect } from 'react';
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
    type LiveSessionResponseDTO,
    liveSessionUpdateDTOSchema,
    type CourseMasterResponseDTO
} from '@workspace/schemas';
import { useUpdateLiveSession } from '@/lib/api/services/live-sessions';
import { toast } from '@workspace/ui/components/sonner';
import { format } from 'date-fns';

interface EditLiveSessionSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    session: LiveSessionResponseDTO | null;
    course: CourseMasterResponseDTO | null;
}

export function EditLiveSessionSheet({ open, onOpenChange, session, course }: EditLiveSessionSheetProps) {
    const updateMutation = useUpdateLiveSession();

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<any>({
        resolver: zodResolver(liveSessionUpdateDTOSchema),
        defaultValues: {
            title: '',
            description: '',
            scheduledAt: '',
            duration: 90,
            lecturerId: '',
        },
    });

    useEffect(() => {
        if (open && session) {
            reset({
                title: session.title,
                description: session.description || '',
                scheduledAt: format(new Date(session.scheduledAt), "yyyy-MM-dd'T'HH:mm"),
                duration: session.duration,
                lecturerId: session.lecturerId || '',
            });
        }
    }, [open, session, reset]);

    const onSubmit = async (data: any) => {
        if (!session) return;
        try {
            await updateMutation.mutateAsync({
                id: session.id,
                dto: {
                    ...data,
                    scheduledAt: new Date(data.scheduledAt as string).toISOString(),
                }
            });
            toast.success('Đã cập nhật buổi học');
            onOpenChange(false);
        } catch (error) {
            toast.error('Không thể cập nhật buổi học');
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="!w-full sm:!max-w-[800px] flex flex-col p-0">
                <SheetHeader className="p-6 pb-0">
                    <SheetTitle>Chỉnh sửa Buổi học</SheetTitle>
                    <SheetDescription>
                        Cập nhật thông tin chi tiết cho buổi học này.
                    </SheetDescription>
                </SheetHeader>

                <form id="edit-session-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden min-h-0">
                    <ScrollArea className="flex-1 min-h-0">
                        <div className="space-y-6 p-6">
                            <FieldGroup>
                                <Controller
                                    name="title"
                                    control={control}
                                    render={({ field }) => (
                                        <Field>
                                            <FieldLabel htmlFor="title">Tiêu đề buổi học</FieldLabel>
                                            <Input id="title" {...field} placeholder="Nhập tiêu đề..." />
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
                                            <span className="text-[10px] text-muted-foreground mt-1 px-1 italic">
                                                * Giảng viên được cố định theo buổi học.
                                            </span>
                                            <Select onValueChange={field.onChange} value={field.value || ''} disabled>
                                                <SelectTrigger id="lecturerId">
                                                    <SelectValue placeholder="Chọn giảng viên..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectLabel>Giảng viên có sẵn</SelectLabel>
                                                        {course?.lecturer && (
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
                                                placeholder="Nội dung buổi học..."
                                                className="min-h-[100px]"
                                            />
                                            {errors.description && <FieldError errors={[errors.description]} />}
                                        </Field>
                                    )}
                                />
                            </FieldGroup>
                        </div>
                    </ScrollArea>

                    <SheetFooter className="p-6 border-t bg-muted/5">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                            Hủy
                        </Button>
                        <Button type="submit" disabled={updateMutation.isPending} className="flex-1">
                            {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
