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
import { Badge } from '@workspace/ui/components/badge';
import {
    Field,
    FieldLabel,
    FieldError,
} from '@workspace/ui/components/field';
import { BookOpen, Users, Calendar, Save, Film, X, ImageIcon } from 'lucide-react';
import type { CourseResponseDTO } from '@workspace/schemas';
import { courseUpdateDTOSchema, type CourseUpdateDTO, JlptLevel } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';
import { useUpdateCourse } from "@/api/services/courses.ts";
import { storageApi } from '@/api/services/storage-api.ts';
import { cn } from '@workspace/ui/lib/utils';
import { Loader2 } from 'lucide-react';

type UpdateCourseFormData = CourseUpdateDTO;

interface EditCourseSheetProps {
    course: CourseResponseDTO | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditCourseSheet({ course, open, onOpenChange }: EditCourseSheetProps) {
    const updateCourse = useUpdateCourse();
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { isDirty },
    } = useForm<CourseUpdateDTO>({
        resolver: zodResolver(courseUpdateDTOSchema),
        defaultValues: {
            title: '',
            description: '',
            price: 0,
            shortDescription: '',
            discountPrice: 0,
            jlptLevel: undefined,
            type: 'vod',
            tags: [],
            durationWeeks: undefined,
            isFree: false,
            learningOutcomes: [],
            requirements: [],
        },
    });

    const isFree = watch('isFree', course?.isFree ?? false);
    const courseType = watch('type', course?.type ?? 'vod');

    // Reset form when course changes
    useEffect(() => {
        if (course) {
            reset({
                title: course.title,
                description: course.description || '',
                price: Number(course.price),
                jlptLevel: course.jlptLevel as JlptLevel,
                shortDescription: course.shortDescription || '',
                discountPrice: course.discountPrice ? Number(course.discountPrice) : 0,
                type: course.type,
                tags: course.tags || [],
                durationWeeks: course.durationWeeks ?? undefined,
                isFree: course.isFree ?? false,
                learningOutcomes: Array.isArray(course.learningOutcomes) ? course.learningOutcomes : [],
                requirements: Array.isArray(course.requirements) ? course.requirements : [],
                expirationMonths: (course as any).expirationMonths ?? undefined,
                startDate: (course as any).startDate ?? undefined,
                expiresAt: (course as any).expiresAt ?? undefined,
                registrationClosedAt: (course as any).registrationClosedAt ?? undefined,
            });
            setThumbnailFile(null);
            setVideoFile(null);
        }
    }, [course, reset]);

    const handleFileUpload = async (file: File, module: string) => {
        try {
            const uploadData = {
                filename: file.name,
                contentType: file.type,
                module,
            };
            const { uploadUrl, fileId } = await storageApi.generateUploadUrl(uploadData);

            await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type,
                },
            });

            const confirmResult = await storageApi.confirmUpload({ fileId });
            return confirmResult.fileUrl;
        } catch (error) {
            console.error('Upload failed:', error);
            throw error;
        }
    };

    const onSubmitForm = async (data: UpdateCourseFormData) => {
        if (!course) return;

        // Validation: Paid courses must have price > 0
        if (!data.isFree && (data.price === undefined || data.price <= 0)) {
            toast.error('Giá tiền không hợp lệ', {
                description: 'Khóa học trả phí bắt buộc phải có học phí lớn hơn 0.',
            });
            return;
        }

        setUploading(true);
        try {
            let thumbnailUrl = course.thumbnailUrl;
            let previewVideoUrl = course.previewVideoUrl;

            if (thumbnailFile) {
                thumbnailUrl = await handleFileUpload(thumbnailFile, 'course-thumbnails');
            }
            if (videoFile) {
                previewVideoUrl = await handleFileUpload(videoFile, 'course-videos');
            }

            const updateData = {
                ...data,
                thumbnailUrl,
                previewVideoUrl,
            };

            await updateCourse.mutateAsync({ id: course.id, course: updateData });
            toast.success('Đã Cập Nhật Khóa Học', {
                description: `Thông tin chi tiết khóa học đã được cập nhật.`,
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
            <SheetContent className="w-full sm:max-w-[800px] flex flex-col p-0 gap-0 border-l border-border/50 shadow-2xl bg-background">
                <SheetHeader className="px-8 py-6 border-b border-border/10 bg-muted/5 relative overflow-hidden">
                    <div className="relative flex items-center justify-between z-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                                <SheetTitle className="text-2xl font-sans font-bold italic tracking-tight text-foreground uppercase">
                                    Chỉnh Sửa Khóa Học
                                </SheetTitle>
                                <SheetDescription className="text-xs font-medium text-muted-foreground/60 leading-relaxed">
                                    Cập nhật thông tin chi tiết và cấu hình khóa học.
                                </SheetDescription>
                            </div>
                        </div>
                        <Badge
                            variant="secondary"
                            className={cn(
                                "px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider shadow-sm",
                                course.status === 'published'
                                    ? "border-emerald-500/20 text-emerald-600 bg-emerald-500/10"
                                    : "border-muted-foreground/20 text-muted-foreground bg-muted/30"
                            )}>
                            {course.status}
                        </Badge>
                    </div>
                </SheetHeader>

                <form onSubmit={handleSubmit(onSubmitForm)} className="flex flex-col flex-1 min-h-0 overflow-hidden relative">
                    <ScrollArea className="flex-1 min-h-0">
                        <div className="px-8 py-10 space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
                            {/* Key Metrics */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 rounded-2xl bg-background border border-border transition-all shadow-sm">
                                    <div className="flex items-center gap-2.5 text-muted-foreground/60 mb-2">
                                        <Users className="h-3.5 w-3.5" />
                                        <span className="text-[10px] font-sans font-bold italic uppercase tracking-wider">Học Viên Hoạt Động</span>
                                    </div>
                                    <div className="text-2xl font-bold text-foreground tracking-tight pl-1">
                                        {course.totalStudents || 0}
                                    </div>
                                </div>
                                <div className="p-5 rounded-2xl bg-background border border-border transition-all shadow-sm">
                                    <div className="flex items-center gap-2.5 text-muted-foreground/60 mb-2">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span className="text-[10px] font-sans font-bold italic uppercase tracking-wider">Cập Nhật Lần Cuối</span>
                                    </div>
                                    <div className="text-lg font-bold text-foreground tracking-tight pl-1">
                                        {new Date(course.updatedAt).toLocaleDateString('vi-VN', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric'
                                        })}
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-border/20" />

                            {/* Form Fields */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 pb-2 border-b border-border/40">
                                    <div className="h-px flex-1 bg-border/20" />
                                    <h3 className="text-[10px] font-sans font-bold italic uppercase tracking-wider text-muted-foreground/50 text-center">
                                        Thông Tin Cơ Bản
                                    </h3>
                                    <div className="h-px flex-1 bg-border/20" />
                                </div>

                                <Controller
                                    control={control}
                                    name="title"
                                    render={({ field, fieldState }) => (
                                        <Field className="space-y-1.5" data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name} className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                                Tên Khóa Học <span className="text-destructive">*</span>
                                            </FieldLabel>
                                            <Input
                                                id={field.name}
                                                {...field}
                                                placeholder="Nhập tên khóa học..."
                                                className="h-11 px-4 rounded-xl border-border bg-background hover:bg-muted/5 focus-visible:ring-primary/20 transition-all font-semibold text-sm"
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
                                            <FieldLabel htmlFor={field.name} className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                                Mô Tả <span className="text-destructive">*</span>
                                            </FieldLabel>
                                            <Textarea
                                                id={field.name}
                                                {...field}
                                                placeholder="Nhập mô tả chi tiết khóa học..."
                                                className="min-h-[120px] rounded-xl bg-background border-border hover:bg-muted/5 focus-visible:ring-primary/20 text-sm font-medium placeholder:text-muted-foreground/30 transition-all resize-none p-4"
                                                aria-invalid={fieldState.invalid}
                                            />
                                            <FieldError errors={[fieldState.error]} className="text-xs font-medium text-rose-500 pl-2" />
                                        </Field>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-6">
                                    <Controller
                                        control={control}
                                        name="price"
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name} className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                                    Học Phí <span className="text-destructive">*</span>
                                                </FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    type="number"
                                                    {...field}
                                                    disabled={isFree}
                                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                                    placeholder="0.00"
                                                    className="h-11 px-4 rounded-xl bg-background border-border hover:bg-muted/5 focus-visible:ring-primary/20 text-sm font-bold placeholder:text-muted-foreground/30 transition-all font-mono tracking-tight disabled:opacity-50 disabled:bg-muted"
                                                    aria-invalid={fieldState.invalid}
                                                />
                                                <FieldError errors={[fieldState.error]} className="text-xs font-medium text-rose-500 pl-2" />
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        control={control}
                                        name="jlptLevel"
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name} className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                                    Trình Độ JLPT
                                                </FieldLabel>
                                                <Select value={field.value || ''} onValueChange={field.onChange}>
                                                    <SelectTrigger id={field.name} className="h-11 px-4 rounded-xl border-border bg-background hover:bg-muted/5 focus:ring-primary/20 transition-all font-medium text-sm" aria-invalid={fieldState.invalid}>
                                                        <SelectValue placeholder="Chọn Trình Độ" />
                                                    </SelectTrigger>
                                                    <SelectContent className="border-border shadow-xl bg-background rounded-xl overflow-hidden p-1">
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
                                            <FieldLabel htmlFor={field.name} className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                                Mô Tả Ngắn
                                            </FieldLabel>
                                            <Textarea
                                                id={field.name}
                                                {...field}
                                                placeholder="Tóm tắt ngắn gọn hiển thị trên thẻ..."
                                                className="min-h-[80px] rounded-xl bg-background border-border hover:bg-muted/5 focus-visible:ring-primary/20 text-sm font-medium placeholder:text-muted-foreground/30 transition-all resize-none p-4"
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
                                                <FieldLabel htmlFor={field.name} className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                                    Loại Khóa Học
                                                </FieldLabel>
                                                <Select value={field.value || ''} onValueChange={field.onChange}>
                                                    <SelectTrigger id={field.name} className="h-11 px-4 rounded-xl border-border bg-background hover:bg-muted/5 focus:ring-primary/20 transition-all font-medium text-sm" aria-invalid={fieldState.invalid}>
                                                        <SelectValue placeholder="Chọn loại khóa học" />
                                                    </SelectTrigger>
                                                    <SelectContent className="border-border shadow-xl bg-background rounded-xl overflow-hidden p-1">
                                                        <SelectItem value="vod" className="rounded-lg cursor-pointer text-xs font-medium focus:bg-primary/10 focus:text-primary py-2.5">Video theo yêu cầu (VOD)</SelectItem>
                                                        <SelectItem value="live" className="rounded-lg cursor-pointer text-xs font-medium focus:bg-primary/10 focus:text-primary py-2.5">Phát trực tiếp</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FieldError errors={[fieldState.error]} className="text-xs font-medium text-rose-500 pl-2" />
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        control={control}
                                        name="isFree"
                                        render={({ field }) => (
                                            <Field className="space-y-2">
                                                <FieldLabel htmlFor="isFree" className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                                    Giá Cả
                                                </FieldLabel>
                                                <div className="flex items-center gap-3 mt-1.5 p-3 rounded-xl bg-background border border-border cursor-pointer hover:bg-muted/5 transition-all"
                                                    onClick={() => {
                                                        const newValue = !field.value;
                                                        field.onChange(newValue);
                                                        if (newValue) {
                                                            setValue('price', 0);
                                                            setValue('discountPrice', 0);
                                                        }
                                                    }}>
                                                    <input
                                                        id="isFree"
                                                        type="checkbox"
                                                        checked={!!field.value}
                                                        onChange={(e) => {
                                                            field.onChange(e.target.checked);
                                                            if (e.target.checked) {
                                                                setValue('price', 0);
                                                                setValue('discountPrice', 0);
                                                            }
                                                        }}
                                                        className="h-4 w-4 rounded border-border/60 text-primary focus:ring-primary/20 cursor-pointer accent-primary"
                                                    />
                                                    <span className="text-xs font-medium text-foreground/80">
                                                        Truy cập mở / Khóa học miễn phí
                                                    </span>
                                                </div>
                                            </Field>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <Controller
                                        control={control}
                                        name="discountPrice"
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name} className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                                    Giá Khuyến Mãi
                                                </FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    type="number"
                                                    {...field}
                                                    disabled={isFree}
                                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                                    placeholder="0.00"
                                                    className="h-11 px-4 rounded-xl bg-background border-border hover:bg-muted/5 focus-visible:ring-primary/20 text-sm font-bold placeholder:text-muted-foreground/30 transition-all font-mono tracking-tight disabled:opacity-50 disabled:bg-muted"
                                                    aria-invalid={fieldState.invalid}
                                                />
                                                <FieldError errors={[fieldState.error]} className="text-xs font-medium text-rose-500 pl-2" />
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        control={control}
                                        name="durationWeeks"
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name} className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                                    Thời Lượng (Tuần)
                                                </FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                                    placeholder="ví dụ: 8"
                                                    className="h-11 px-4 rounded-xl border-border bg-background hover:bg-muted/5 focus-visible:ring-primary/20 transition-all font-mono font-medium text-sm"
                                                    aria-invalid={fieldState.invalid}
                                                />
                                                <FieldError errors={[fieldState.error]} className="text-xs font-medium text-rose-500 pl-2" />
                                            </Field>
                                        )}
                                    />
                                </div>

                                {/* VOD: Thời hạn truy cập */}
                                {courseType === 'vod' && (
                                    <Controller
                                        control={control}
                                        name={'expirationMonths' as any}
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name} className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                                    Thời Hạn Truy Cập (Tháng)
                                                </FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    type="number"
                                                    min="1"
                                                    max="6"
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                                    placeholder="1-6 tháng (để trống = trọn đời)"
                                                    className="h-11 px-4 rounded-xl border-border bg-background hover:bg-muted/5 focus-visible:ring-primary/20 transition-all font-mono font-medium text-sm"
                                                />
                                                <FieldError errors={[fieldState.error]} className="text-xs font-medium text-rose-500 pl-2" />
                                            </Field>
                                        )}
                                    />
                                )}

                                {/* WebRTC: Lịch học */}
                                {courseType === 'live' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 pb-1 border-b border-border/40">
                                            <h3 className="text-[10px] font-sans font-bold italic uppercase tracking-wider text-muted-foreground/50">Lịch Học</h3>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <Controller
                                                control={control}
                                                name={'startDate' as any}
                                                render={({ field }) => (
                                                    <Field className="space-y-2">
                                                        <FieldLabel htmlFor={field.name} className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                                            Ngày Khai Giảng
                                                        </FieldLabel>
                                                        <Input
                                                            id={field.name}
                                                            type="datetime-local"
                                                            {...field}
                                                            className="h-11 px-4 rounded-xl bg-background border-border hover:bg-muted/5 focus-visible:ring-primary/20 text-sm font-medium transition-all"
                                                        />
                                                    </Field>
                                                )}
                                            />
                                            <Controller
                                                control={control}
                                                name={'expiresAt' as any}
                                                render={({ field }) => (
                                                    <Field className="space-y-2">
                                                        <FieldLabel htmlFor={field.name} className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                                            Ngày Kết Thúc Khóa Học
                                                        </FieldLabel>
                                                        <Input
                                                            id={field.name}
                                                            type="datetime-local"
                                                            {...field}
                                                            className="h-11 px-4 rounded-xl bg-background border-border hover:bg-muted/5 focus-visible:ring-primary/20 text-sm font-medium transition-all"
                                                        />
                                                    </Field>
                                                )}
                                            />
                                        </div>
                                        <Controller
                                            control={control}
                                            name={'registrationClosedAt' as any}
                                            render={({ field, fieldState }) => (
                                                <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                                    <FieldLabel htmlFor={field.name} className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                                        Hạn Đăng Ký <span className="text-rose-500">*</span>
                                                    </FieldLabel>
                                                    <Input
                                                        id={field.name}
                                                        type="datetime-local"
                                                        {...field}
                                                        className="h-11 px-4 rounded-xl bg-background border-border hover:bg-muted/5 focus-visible:ring-primary/20 text-sm font-medium transition-all"
                                                    />
                                                    <FieldError errors={[fieldState.error]} className="text-xs font-medium text-rose-500 pl-2" />
                                                </Field>
                                            )}
                                        />
                                    </div>
                                )}

                                <div className="space-y-6 pt-6">
                                    <div className="flex items-center gap-3 pb-2 border-b border-border/40">
                                        <div className="h-px flex-1 bg-border/20" />
                                        <h3 className="text-[10px] font-sans font-bold italic uppercase tracking-wider text-muted-foreground/50 text-center">
                                            Chương Trình Học
                                        </h3>
                                        <div className="h-px flex-1 bg-border/20" />
                                    </div>

                                    <Controller
                                        control={control}
                                        name="tags"
                                        render={({ field }) => (
                                            <Field className="space-y-2">
                                                <FieldLabel htmlFor="tags" className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
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
                                                    className="h-11 px-4 rounded-xl bg-background border-border hover:bg-muted/5 focus-visible:ring-primary/20 text-sm font-medium placeholder:text-muted-foreground/30 transition-all"
                                                />
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        control={control}
                                        name="learningOutcomes"
                                        render={({ field }) => (
                                            <Field className="space-y-2">
                                                <FieldLabel htmlFor="learningOutcomes" className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
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
                                                    className="rounded-xl bg-background border-border hover:bg-muted/5 focus-visible:ring-primary/20 text-sm font-medium placeholder:text-muted-foreground/30 transition-all resize-none p-4"
                                                />
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        control={control}
                                        name="requirements"
                                        render={({ field }) => (
                                            <Field className="space-y-2">
                                                <FieldLabel htmlFor="requirements" className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
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
                                                    className="rounded-xl bg-background border-border hover:bg-muted/5 focus-visible:ring-primary/20 text-sm font-medium placeholder:text-muted-foreground/30 transition-all resize-none p-4"
                                                />
                                            </Field>
                                        )}
                                    />
                                </div>

                                {/* Media Upload */}
                                <div className="space-y-6 pt-6">
                                    <div className="flex items-center gap-3 pb-2 border-b border-border/40">
                                        <div className="h-px flex-1 bg-border/20" />
                                        <h3 className="text-[10px] font-sans font-bold italic uppercase tracking-wider text-muted-foreground/50 text-center">
                                            Phương Tiện
                                        </h3>
                                        <div className="h-px flex-1 bg-border/20" />
                                    </div>

                                    <Field className="space-y-2">
                                        <FieldLabel htmlFor="thumbnail-upload" className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                            Ảnh Bìa
                                        </FieldLabel>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="relative flex-1">
                                                    <Input
                                                        id="thumbnail-upload"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                                                        className="h-11 px-4 pt-2 rounded-xl bg-background border-border hover:bg-muted/5 focus-visible:ring-primary/20 text-xs font-medium file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer text-muted-foreground"
                                                    />
                                                    <ImageIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 pointer-events-none" />
                                                </div>
                                                {thumbnailFile && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setThumbnailFile(null)}
                                                        className="h-11 w-11 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/10"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>

                                            {(thumbnailFile || course.thumbnailUrl) && (
                                                <div className="rounded-2xl overflow-hidden border border-border/40 bg-muted/30 aspect-video relative shadow-sm max-w-xs group">
                                                    <img
                                                        src={thumbnailFile ? URL.createObjectURL(thumbnailFile) : course.thumbnailUrl}
                                                        alt="Thumbnail"
                                                        className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            )}
                                        </div>
                                    </Field>

                                    <Field className="space-y-2">
                                        <FieldLabel htmlFor="video-upload" className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                            Video Giới Thiệu
                                        </FieldLabel>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="relative flex-1">
                                                    <Input
                                                        id="video-upload"
                                                        type="file"
                                                        accept="video/*"
                                                        onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                                        className="h-11 px-4 pt-2 rounded-xl bg-background border-border hover:bg-muted/5 focus-visible:ring-primary/20 text-xs font-medium file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer text-muted-foreground"
                                                    />
                                                    <Film className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 pointer-events-none" />
                                                </div>
                                                {videoFile && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setVideoFile(null)}
                                                        className="h-11 w-11 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/10"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>

                                            {(course.previewVideoUrl && !videoFile) && (
                                                <div className="flex items-center gap-2 p-3 rounded-xl bg-background border border-border">
                                                    <Film className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-xs font-bold text-foreground/80">Đã có video giới thiệu đính kèm</span>
                                                </div>
                                            )}
                                            {videoFile && (
                                                <div className="flex items-center gap-2 p-3 rounded-xl bg-background border border-border">
                                                    <Film className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-xs font-bold text-foreground/80">Đã chọn video mới</span>
                                                </div>
                                            )}
                                        </div>
                                    </Field>
                                </div>

                                {/* AI & Metadata */}

                            </div>
                        </div>
                    </ScrollArea>

                    <SheetFooter className="flex-shrink-0 px-8 py-6 border-t border-border/10 bg-background flex flex-row items-center justify-between gap-4 relative z-20">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="flex-1 rounded-xl h-11 bg-background border border-border text-[10px] font-bold uppercase tracking-wider hover:bg-muted/5 transition-all text-muted-foreground/80 hover:text-foreground"
                        >
                            <X className="mr-2 h-3.5 w-3.5" />
                            Hủy Bỏ
                        </Button>
                        <Button
                            type="submit"
                            disabled={uploading || (!isDirty && !thumbnailFile && !videoFile)}
                            className="flex-1 rounded-xl h-11 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:-translate-y-0.5 transition-all"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
