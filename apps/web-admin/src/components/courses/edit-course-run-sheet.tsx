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
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import {
    Field,
    FieldLabel,
    FieldError,
} from '@workspace/ui/components/field';
import { X, Save } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';
import { courseRunUpdateDTOSchema, type CourseRunUpdateDTO, CourseRunStatus, type CourseRunResponseDTO } from '@workspace/schemas';
import { useUpdateCourseRun } from '@/lib/api/services/course-runs';
import { Spinner } from '@workspace/ui/components/spinner';
import { FileUpload } from '@/components/common/file-upload';

interface EditCourseRunSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    run: CourseRunResponseDTO | null;
    courseType?: 'vod' | 'live';
}

export function EditCourseRunSheet({ open, onOpenChange, run, courseType }: EditCourseRunSheetProps) {
    const updateMutation = useUpdateCourseRun();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isDirty },
        reset,
    } = useForm<CourseRunUpdateDTO>({
        resolver: zodResolver(courseRunUpdateDTOSchema) as any,
    });

    useEffect(() => {
        if (run && open) {
            reset({
                title: run.title,
                lecturerId: run.lecturerId ?? undefined,
                startDate: run.startDate ? new Date(run.startDate) : undefined,
                endDate: run.endDate ? new Date(run.endDate) : undefined,
                enrollmentStart: run.enrollmentStart ? new Date(run.enrollmentStart) : undefined,
                enrollmentEnd: run.enrollmentEnd ? new Date(run.enrollmentEnd) : undefined,
                maxStudents: run.maxStudents ?? undefined,
                minStudents: run.minStudents ?? 1,
                price: run.price ?? undefined,
                discountPrice: run.discountPrice ?? undefined,
                coverUrl: run.coverUrl ?? undefined,
                previewVideoUrl: run.previewVideoUrl ?? undefined,
                status: run.status,
            });
        }
    }, [run, open, reset]);

    const handleClose = () => {
        onOpenChange(false);
        reset({});
    };

    const onSubmit = async (data: CourseRunUpdateDTO) => {
        if (!run) return;
        try {
            await updateMutation.mutateAsync({ id: run.id, run: data });
            toast.success('Đã cập nhật lớp học', {
                description: 'Thông tin Course Run đã được lưu.',
            });
            handleClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Cập nhật thất bại', {
                description: 'Đã xảy ra lỗi khi cập nhật lớp học. Vui lòng thử lại.',
            });
        }
    };

    return (
        <Sheet open={open} onOpenChange={handleClose}>
            <SheetContent className="w-full sm:max-w-[800px] flex flex-col">
                <SheetHeader>
                    <SheetTitle>
                        Chỉnh sửa Lớp học (Course Run)
                    </SheetTitle>
                    <SheetDescription>
                        Cập nhật nhanh thông tin lớp học hiện tại.
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
                                    placeholder="Tên lớp học"
                                    className="mt-1"
                                />
                                {errors.title && <FieldError>{errors.title.message}</FieldError>}
                            </Field>

                            <div className="grid grid-cols-2 gap-6">
                                <Field>
                                    <FieldLabel htmlFor="status">Trạng Thái</FieldLabel>
                                    <Controller
                                        name={'status' as any}
                                        control={control}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger id="status" className="mt-1">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={CourseRunStatus.PLANNING}>Đang lập kế hoạch</SelectItem>
                                                    <SelectItem value={CourseRunStatus.ENROLLING}>Đang tuyển sinh</SelectItem>
                                                    <SelectItem value={CourseRunStatus.IN_PROGRESS}>Đang diễn ra</SelectItem>
                                                    <SelectItem value={CourseRunStatus.COMPLETED}>Đã kết thúc</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="price">Học Phí</FieldLabel>
                                    <Input
                                        id="price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        {...register('price', { valueAsNumber: true })}
                                        className="mt-1 font-mono"
                                    />
                                </Field>
                            </div>

                            {courseType === 'live' && (
                                <>
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
                                </>
                            )}

                            <div className="grid grid-cols-2 gap-6">
                                <Field>
                                    <FieldLabel htmlFor="maxStudents">Sĩ Số Tối Đa</FieldLabel>
                                    <Input
                                        id="maxStudents"
                                        type="number"
                                        {...register('maxStudents', { valueAsNumber: true })}
                                        className="mt-1"
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="minStudents">Sĩ Số Tối Thiểu</FieldLabel>
                                    <Input
                                        id="minStudents"
                                        type="number"
                                        min="1"
                                        {...register('minStudents', { valueAsNumber: true })}
                                        className="mt-1"
                                    />
                                </Field>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <Field>
                                    <FieldLabel htmlFor="discountPrice">Giá Ưu Đãi</FieldLabel>
                                    <Input
                                        id="discountPrice"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        {...register('discountPrice', { valueAsNumber: true })}
                                        className="mt-1 font-mono"
                                    />
                                </Field>
                            </div>

                            <div className="space-y-4 pt-4">
                                <Field>
                                    <FieldLabel>
                                        Ảnh bìa đợt khai giảng
                                    </FieldLabel>
                                    <Controller
                                        name="coverUrl"
                                        control={control}
                                        render={({ field }) => (
                                            <FileUpload
                                                accept="image/*"
                                                label="Tải lên ảnh bìa (JPEG/PNG)"
                                                currentValue={field.value || undefined}
                                                onUploadComplete={(url) => field.onChange(url || null)}
                                            />
                                        )}
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel>
                                        Video giới thiệu (tùy chọn)
                                    </FieldLabel>
                                    <Controller
                                        name="previewVideoUrl"
                                        control={control}
                                        render={({ field }) => (
                                            <FileUpload
                                                accept="video/*"
                                                label="Tải lên video giới thiệu"
                                                currentValue={field.value || undefined}
                                                onUploadComplete={(url) => field.onChange(url || null)}
                                            />
                                        )}
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
                            disabled={updateMutation.isPending}
                        >
                            <X className="mr-2 h-4 w-4" />
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={updateMutation.isPending || !isDirty}
                        >
                            {updateMutation.isPending ? (
                                <>
                                    <Spinner className="mr-2" />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Lưu thay đổi
                                </>
                            )}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}

