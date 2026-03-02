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
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import {
    Field,
    FieldLabel,
    FieldError,
} from '@workspace/ui/components/field';
import { X, Save } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';
import { courseRunCreateDTOSchema, type CourseRunCreateDTO, CourseRunStatus } from '@workspace/schemas';
import { useCreateCourseRun } from "@/lib/api/services/course-runs";
import { useUsers } from "@/lib/api/services/users";
import { Spinner } from "@workspace/ui/components/spinner";

interface CreateCourseRunSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    courseId: string;
}

export function CreateCourseRunSheet({ open, onOpenChange, courseId }: CreateCourseRunSheetProps) {
    const createMutation = useCreateCourseRun();
    const { data: lecturersData, isLoading: isLoadingLecturers } = useUsers({ role: 'LECTURE', limit: 100 });

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isDirty },
        reset,
    } = useForm<CourseRunCreateDTO>({
        resolver: zodResolver(courseRunCreateDTOSchema) as any,
        defaultValues: {
            courseMasterId: courseId,
            title: '',
            status: CourseRunStatus.PLANNING,
            maxStudents: 30,
        },
    });

    const handleClose = () => {
        onOpenChange(false);
        reset();
    };

    const onSubmit = async (data: CourseRunCreateDTO) => {
        try {
            await createMutation.mutateAsync(data);
            toast.success('Đã tạo lớp học mới', {
                description: 'Lớp học (Course Run) đã được tạo thành công.',
            });
            handleClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Tạo thất bại', {
                description: 'Đã xảy ra lỗi khi tạo lớp học. Vui lòng thử lại.',
            });
        }
    };

    return (
        <Sheet open={open} onOpenChange={handleClose}>
            <SheetContent className="!w-full sm:!max-w-[800px] flex flex-col">
                <SheetHeader>
                    <SheetTitle>Tạo Lớp Học Mới (Course Run)</SheetTitle>
                    <SheetDescription>
                        Thiết lập lịch học, giảng viên và sĩ số cho khóa khai giảng này.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden min-h-0" noValidate>
                    <ScrollArea className="flex-1 min-h-0">
                        <div className="space-y-6 p-6">

                            <Field>
                                <FieldLabel htmlFor="title">
                                    Tên Lớp / Khóa <span className="text-destructive">*</span>
                                </FieldLabel>
                                <Input
                                    id="title"
                                    {...register('title')}
                                    placeholder="ví dụ: Khóa K01 - Tháng 3/2026"
                                    className="mt-1"
                                />
                                {errors.title && <FieldError>{errors.title.message}</FieldError>}
                            </Field>

                            <div className="grid grid-cols-2 gap-6">
                                <Field>
                                    <FieldLabel htmlFor="lecturerId">Giảng Viên Phụ Trách</FieldLabel>
                                    <Controller
                                        name="lecturerId"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                value={field.value || ''}
                                                onValueChange={field.onChange}
                                                disabled={isLoadingLecturers}
                                            >
                                                <SelectTrigger id="lecturerId" className="mt-1">
                                                    <SelectValue placeholder={isLoadingLecturers ? "Đang tải..." : "Chọn giảng viên"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {lecturersData?.data?.map((lecturer) => (
                                                        <SelectItem key={lecturer.id} value={lecturer.id}>
                                                            {lecturer.displayName || lecturer.email}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.lecturerId && <FieldError>{errors.lecturerId.message}</FieldError>}
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="status">Trạng Thái Khởi Tạo</FieldLabel>
                                    <Controller
                                        name={"status" as any}
                                        control={control}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger id="status" className="mt-1">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={CourseRunStatus.PLANNING}>Đang lập kế hoạch</SelectItem>
                                                    <SelectItem value={CourseRunStatus.ENROLLING}>Đang tuyển sinh</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </Field>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <Field>
                                    <FieldLabel htmlFor="startDate">Ngày Khai Giảng</FieldLabel>
                                    <Controller
                                        name="startDate"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                id="startDate"
                                                type="datetime-local"
                                                value={field.value ? new Date(field.value as any).toISOString().slice(0, 16) : ''}
                                                onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                                                className="mt-1"
                                            />
                                        )}
                                    />
                                    {errors.startDate && <FieldError>{errors.startDate.message}</FieldError>}
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="endDate">Ngày Kết Thúc Dự Kiến</FieldLabel>
                                    <Controller
                                        name="endDate"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                id="endDate"
                                                type="datetime-local"
                                                value={field.value ? new Date(field.value as any).toISOString().slice(0, 16) : ''}
                                                onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                                                className="mt-1"
                                            />
                                        )}
                                    />
                                    {errors.endDate && <FieldError>{errors.endDate.message}</FieldError>}
                                </Field>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <Field>
                                    <FieldLabel htmlFor="enrollmentStart">Ngày Mở Đăng Ký</FieldLabel>
                                    <Controller
                                        name="enrollmentStart"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                id="enrollmentStart"
                                                type="datetime-local"
                                                value={field.value ? new Date(field.value as any).toISOString().slice(0, 16) : ''}
                                                onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                                                className="mt-1"
                                            />
                                        )}
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="enrollmentEnd">Ngày Đóng Đăng Ký</FieldLabel>
                                    <Controller
                                        name="enrollmentEnd"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                id="enrollmentEnd"
                                                type="datetime-local"
                                                value={field.value ? new Date(field.value as any).toISOString().slice(0, 16) : ''}
                                                onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                                                className="mt-1"
                                            />
                                        )}
                                    />
                                </Field>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <Field>
                                    <FieldLabel htmlFor="price">Học Phí (Lớp Này)</FieldLabel>
                                    <Input
                                        id="price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        {...register('price', { valueAsNumber: true })}
                                        placeholder="0 = Miễn phí"
                                        className="mt-1 font-mono"
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-1 ml-1">Giá được quy định theo từng đợt khai giảng.</p>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="maxStudents">Sĩ Số Tối Đa</FieldLabel>
                                    <Input
                                        id="maxStudents"
                                        type="number"
                                        {...register('maxStudents', { valueAsNumber: true })}
                                        className="mt-1"
                                    />
                                </Field>
                            </div>
                        </div>
                    </ScrollArea>

                    <SheetFooter className="p-6 pt-2 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={createMutation.isPending}
                        >
                            <X className="mr-2 h-4 w-4" />
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={createMutation.isPending || !isDirty}
                        >
                            {createMutation.isPending ? (
                                <>
                                    <Spinner className="mr-2" />
                                    Đang tạo...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Tạo Lớp Học
                                </>
                            )}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet >
    );
}
