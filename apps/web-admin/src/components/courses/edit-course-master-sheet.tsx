import { useState, useEffect } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Separator } from '@workspace/ui/components/separator';
import {
    Field,
    FieldLabel,
    FieldError,
} from '@workspace/ui/components/field';
import { Calendar, Save, X } from 'lucide-react';
import type { CourseMasterResponseDTO } from '@workspace/schemas';
import { courseMasterUpdateDTOSchema, type CourseMasterUpdateDTO, JlptLevel } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';
import { formatDate } from '@/lib/format-utils';
import { useUpdateCourse } from "@/lib/api/services/courses.ts";
import { Spinner } from "@workspace/ui/components/spinner";

interface EditCourseMasterSheetProps {
    course: CourseMasterResponseDTO | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditCourseMasterSheet({ course, open, onOpenChange }: EditCourseMasterSheetProps) {
    const updateCourse = useUpdateCourse();
    const [uploading, setUploading] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { isDirty },
    } = useForm<CourseMasterUpdateDTO>({
        resolver: zodResolver(courseMasterUpdateDTOSchema),
        defaultValues: {
            title: '',
            description: '',
            shortDescription: '',
            jlptLevel: undefined,
            type: 'vod',
            tags: [],
            durationWeeks: undefined,
            learningOutcomes: [],
            requirements: [],
        },
    });

    const courseType = watch('type', course?.type ?? 'vod');

    // Reset form when course changes
    useEffect(() => {
        if (course) {
            reset({
                title: course.title,
                description: course.description || '',
                jlptLevel: course.jlptLevel as JlptLevel,
                shortDescription: course.shortDescription || '',
                type: course.type,
                tags: course.tags || [],
                durationWeeks: course.durationWeeks ?? undefined,
                learningOutcomes: Array.isArray(course.learningOutcomes) ? course.learningOutcomes : [],
                requirements: Array.isArray(course.requirements) ? course.requirements : [],
                expirationMonths: (course as any).expirationMonths ?? undefined,
            });
        }
    }, [course, reset]);

    const onSubmitForm = async (data: CourseMasterUpdateDTO) => {
        if (!course) return;

        setUploading(true);
        try {
            await updateCourse.mutateAsync({ id: course.id, course: data });
            toast.success('Đã Cập Nhật Khung Chương Trình', {
                description: `Thông tin chi tiết khung chương trình đã được cập nhật.`,
            });
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Cập nhật thất bại', {
                description: error.response?.data?.error || error.message,
            });
        } finally {
            setUploading(false);
        }
    };

    if (!course) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="!w-full sm:!max-w-[800px] flex flex-col">
                <SheetHeader>
                    <SheetTitle>Chỉnh Sửa Khung Chương Trình</SheetTitle>
                    <SheetDescription>
                        Cập nhật thông tin chi tiết và cấu hình cho khung chương trình (Syllabus).
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit(onSubmitForm)} className="flex flex-col flex-1 overflow-hidden min-h-0" noValidate>
                    <ScrollArea className="flex-1 min-h-0">
                        <div className="space-y-6 p-6">
                            {/* Key Metrics */}
                            <div className="flex justify-end p-2">
                                <div className="flex items-center gap-2 text-muted-foreground/60">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span className="text-[10px] font-sans font-bold italic uppercase tracking-wider">Cập Nhật Lần Cuối:</span>
                                    <span className="text-xs font-bold text-foreground">
                                        {formatDate(course.updatedAt)}
                                    </span>
                                </div>
                            </div>

                            <Separator className="bg-border/20" />

                            {/* Form Fields */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 pb-2 border-b border-border/40">
                                    <div className="h-px flex-1 bg-border/20 min-h-0" />
                                    <h3 className="text-[10px] font-sans font-bold italic uppercase tracking-wider text-muted-foreground/50 text-center">
                                        Thông Tin Cơ Bản
                                    </h3>
                                    <div className="h-px flex-1 bg-border/20 min-h-0" />
                                </div>

                                <Controller
                                    control={control}
                                    name="title"
                                    render={({ field, fieldState }) => (
                                        <Field className="space-y-1.5" data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Tên Khung Chương Trình <span className="text-destructive">*</span>
                                            </FieldLabel>
                                            <Input
                                                id={field.name}
                                                {...field}
                                                placeholder="Nhập tên khung chương trình..."
                                                className="mt-1"
                                                aria-invalid={fieldState.invalid}
                                            />
                                            <FieldError errors={[fieldState.error]} className="text-xs font-medium text-rose-500 pl-2" />
                                        </Field>
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="description"
                                    render={({ field, fieldState }) => (
                                        <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Mô Tả <span className="text-destructive">*</span>
                                            </FieldLabel>
                                            <Textarea
                                                id={field.name}
                                                {...field}
                                                placeholder="Nhập mô tả chi tiết khung chương trình..."
                                                className="mt-1 resize-none"
                                                aria-invalid={fieldState.invalid}
                                            />
                                            <FieldError errors={[fieldState.error]} className="text-xs font-medium text-rose-500 pl-2" />
                                        </Field>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-6">
                                    <Controller
                                        control={control}
                                        name="jlptLevel"
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name}>
                                                    Trình Độ JLPT
                                                </FieldLabel>
                                                <Select value={field.value || ''} onValueChange={field.onChange}>
                                                    <SelectTrigger id={field.name} className="mt-1" aria-invalid={fieldState.invalid}>
                                                        <SelectValue placeholder="Chọn Trình Độ" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.values(JlptLevel).map((level) => (
                                                            <SelectItem key={level} value={level} className="rounded-lg cursor-pointer text-xs font-medium focus:bg-primary/10 focus:text-primary py-2.5">{level}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FieldError errors={[fieldState.error]} className="text-xs font-medium text-rose-500 pl-2" />
                                            </Field>
                                        )}
                                    />
                                </div>

                                <Controller
                                    control={control}
                                    name="shortDescription"
                                    render={({ field, fieldState }) => (
                                        <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Mô Tả Ngắn
                                            </FieldLabel>
                                            <Textarea
                                                id={field.name}
                                                {...field}
                                                placeholder="Tóm tắt ngắn gọn hiển thị trên thẻ..."
                                                className="mt-1 resize-none"
                                                aria-invalid={fieldState.invalid}
                                            />
                                            <FieldError errors={[fieldState.error]} className="text-xs font-medium text-rose-500 pl-2" />
                                        </Field>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-6">
                                    <Controller
                                        control={control}
                                        name="type"
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name}>
                                                    Loại Khóa Học
                                                </FieldLabel>
                                                <Select value={field.value || ''} onValueChange={field.onChange}>
                                                    <SelectTrigger id={field.name} className="mt-1" aria-invalid={fieldState.invalid}>
                                                        <SelectValue placeholder="Chọn loại khóa học" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="vod" className="rounded-lg cursor-pointer text-xs font-medium focus:bg-primary/10 focus:text-primary py-2.5">Video theo yêu cầu (VOD)</SelectItem>
                                                        <SelectItem value="live" className="rounded-lg cursor-pointer text-xs font-medium focus:bg-primary/10 focus:text-primary py-2.5">Phát trực tiếp</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FieldError errors={[fieldState.error]} className="text-xs font-medium text-rose-500 pl-2" />
                                            </Field>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <Controller
                                        control={control}
                                        name="durationWeeks"
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name}>
                                                    Thời Lượng (Tuần)
                                                </FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    type="number"
                                                    {...field}
                                                    min="0"
                                                    max="26"
                                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                                    placeholder="Tối đa 26 tuần (6 tháng)"
                                                    className="mt-1 font-mono"
                                                    aria-invalid={fieldState.invalid}
                                                />
                                                <p className="text-[10px] text-muted-foreground/60 mt-1 ml-1 px-1">
                                                    Thời lượng nội dung chương trình học.
                                                </p>
                                                <FieldError errors={[fieldState.error]} className="text-xs font-medium text-rose-500 pl-2" />
                                            </Field>
                                        )}
                                    />
                                </div>

                                {courseType === 'vod' && (
                                    <Controller
                                        control={control}
                                        name={'expirationMonths' as any}
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name}>
                                                    Thời Hạn Truy Cập (Tháng)
                                                </FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    type="number"
                                                    min="1"
                                                    max="6"
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                                    placeholder="1-6 tháng (mặc định 6)"
                                                    className="mt-1 font-mono"
                                                />
                                                <p className="text-[10px] text-muted-foreground/60 mt-1 ml-1 px-1 leading-relaxed">
                                                    Hạn truy cập cho học viên. Mặc định là 6 tháng. <br />
                                                    Học viên cần gia hạn nếu muốn xem lại sau thời gian này.
                                                </p>
                                                <FieldError errors={[fieldState.error]} className="text-xs font-medium text-rose-500 pl-2" />
                                            </Field>
                                        )}
                                    />
                                )}

                                <div className="space-y-6 pt-6">
                                    <div className="flex items-center gap-3 pb-2 border-b border-border/40">
                                        <div className="h-px flex-1 bg-border/20 min-h-0" />
                                        <h3 className="text-[10px] font-sans font-bold italic uppercase tracking-wider text-muted-foreground/50 text-center">
                                            Chương Trình Học
                                        </h3>
                                        <div className="h-px flex-1 bg-border/20 min-h-0" />
                                    </div>

                                    <Controller
                                        control={control}
                                        name="tags"
                                        render={({ field }) => (
                                            <Field className="space-y-2">
                                                <FieldLabel htmlFor="tags">
                                                    Thẻ (Tags)
                                                </FieldLabel>
                                                <Input
                                                    id="tags"
                                                    value={(field.value || []).join(', ')}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value
                                                                .split(',')
                                                                .map((t) => t.trim())
                                                                .filter(Boolean),
                                                        )
                                                    }
                                                    placeholder="ví dụ: JLPT, Ngữ pháp, Sơ cấp (phân cách bằng dấu phẩy)"
                                                    className="mt-1"
                                                />
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        control={control}
                                        name="learningOutcomes"
                                        render={({ field }) => (
                                            <Field className="space-y-2">
                                                <FieldLabel htmlFor="learningOutcomes">
                                                    Mục Tiêu Khóa Học
                                                </FieldLabel>
                                                <Textarea
                                                    id="learningOutcomes"
                                                    value={Array.isArray(field.value) ? field.value.join('\n') : ''}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value
                                                                .split('\n')
                                                                .map((line) => line.trim())
                                                                .filter(Boolean),
                                                        )
                                                    }
                                                    placeholder="Nhập mỗi mục tiêu một dòng..."
                                                    rows={4}
                                                    className="mt-1 resize-none"
                                                />
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        control={control}
                                        name="requirements"
                                        render={({ field }) => (
                                            <Field className="space-y-2">
                                                <FieldLabel htmlFor="requirements">
                                                    Yêu Cầu
                                                </FieldLabel>
                                                <Textarea
                                                    id="requirements"
                                                    value={Array.isArray(field.value) ? field.value.join('\n') : ''}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value
                                                                .split('\n')
                                                                .map((line) => line.trim())
                                                                .filter(Boolean),
                                                        )
                                                    }
                                                    placeholder="Nhập mỗi yêu cầu một dòng..."
                                                    rows={4}
                                                    className="mt-1 resize-none"
                                                />
                                            </Field>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                    <SheetFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}>
                            <X className="mr-2 h-3.5 w-3.5" />
                            Hủy Bỏ
                        </Button>
                        <Button
                            type="submit"
                            disabled={uploading || !isDirty}>
                            {uploading ? (
                                <>
                                    <Spinner className="mr-2" />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Lưu Thay Đổi
                                </>
                            )}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
