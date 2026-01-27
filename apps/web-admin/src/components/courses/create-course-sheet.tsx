import { useState } from 'react';
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
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import {
    Field,
    FieldLabel,
    FieldError,
} from '@workspace/ui/components/field';
import { Loader2, Image as ImageIcon, Film, BookOpen, X, UploadCloud } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';
import { storageApi } from '@/api/services/storage-api.ts';
import { JlptLevel, courseCreateDTOSchema, type CourseCreateDTO } from '@workspace/schemas';
import { useCreateCourse } from "@/api/services/courses.ts";


interface CreateCourseSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateCourseSheet({ open, onOpenChange }: CreateCourseSheetProps) {
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const createMutation = useCreateCourse();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isDirty },
        reset,
        watch,
        setValue,
    } = useForm<CourseCreateDTO>({
        resolver: zodResolver(courseCreateDTOSchema) as any,
        defaultValues: {
            title: '',
            description: '',
            shortDescription: '',
            price: 0,
            discountPrice: 0,
            jlptLevel: undefined, // Will be set by user
            thumbnailUrl: undefined,
            previewVideoUrl: undefined,
            type: 'vod', // Default to vod
            isFree: false,
            durationWeeks: undefined,
            tags: [],
            learningOutcomes: [],
            requirements: [],
        },
    });

    const isFree = watch('isFree');

    const handleClose = () => {
        if (!uploading) {
            onOpenChange(false);
            reset();
            setThumbnailFile(null);
            setVideoFile(null);
        }
    };

    const onSubmit = async (data: CourseCreateDTO) => {
        // Validation: Paid courses must have price > 0
        if (!data.isFree && (data.price === undefined || data.price <= 0)) {
            toast.error('Giá tiền không hợp lệ', {
                description: 'Khóa học trả phí bắt buộc phải có học phí lớn hơn 0.',
            });
            return;
        }

        setUploading(true);
        try {
            // Upload thumbnail if provided
            let thumbnailUrl = data.thumbnailUrl;
            if (thumbnailFile) {
                const uploadedThumbnail = await storageApi.uploadFile(thumbnailFile);
                thumbnailUrl = uploadedThumbnail.fileUrl;
            }

            // Upload video if provided
            let previewVideoUrl = data.previewVideoUrl;
            if (videoFile) {
                const uploadedVideo = await storageApi.uploadFile(videoFile);
                previewVideoUrl = uploadedVideo.fileUrl;
            }

            // Create course
            await createMutation.mutateAsync({
                ...data,
                // normalize optional numeric and array fields
                discountPrice: data.discountPrice ?? 0,
                durationWeeks: data.durationWeeks ?? undefined,
                tags: data.tags && data.tags.length ? data.tags : undefined,
                learningOutcomes: data.learningOutcomes && (data.learningOutcomes as any[]).length ? data.learningOutcomes : [],
                requirements: data.requirements && (data.requirements as any[]).length ? data.requirements : [],
                thumbnailUrl,
                previewVideoUrl,
            });

            toast.success('Đã tạo khóa học', {
                description: 'Khóa học mới đã được tạo thành công.',
            });
            handleClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Tạo thất bại', {
                description: 'Đã xảy ra lỗi khi tạo khóa học. Vui lòng thử lại.',
            });
        } finally {
            setUploading(false);
        }
    };

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Định dạng không hợp lệ', { description: 'Vui lòng chọn tệp hình ảnh.' });
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Tệp quá lớn', { description: 'Kích thước hình ảnh phải nhỏ hơn 5MB.' });
                return;
            }
            setThumbnailFile(file);
        }
    };

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('video/')) {
                toast.error('Định dạng không hợp lệ', { description: 'Vui lòng chọn tệp video.' });
                return;
            }
            if (file.size > 50 * 1024 * 1024) {
                toast.error('Tệp quá lớn', { description: 'Kích thước video phải nhỏ hơn 50MB.' });
                return;
            }
            setVideoFile(file);
        }
    };

    return (
        <Sheet open={open} onOpenChange={handleClose}>
            <SheetContent className="w-full sm:max-w-[800px] flex flex-col p-0 gap-0 border-l border-border/50 shadow-2xl bg-background space-y-0">
                <SheetHeader className="px-8 pt-8 pb-6 border-b border-border/10 bg-muted/5">
                    <div className="relative flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <SheetTitle className="text-2xl font-serif font-bold italic tracking-tight text-foreground uppercase">
                                Tạo Khóa Học Mới
                            </SheetTitle>
                            <SheetDescription className="text-xs font-medium text-muted-foreground/60">
                                Nhập thông tin chi tiết khóa học và chương trình giảng dạy bên dưới.
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden relative">
                    <ScrollArea className="flex-1 min-h-0">
                        <div className="px-8 py-10 space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">

                            {/* Basic Information */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 pb-2 border-b border-border/40">
                                    <div className="h-px flex-1 bg-border/20" />
                                    <h3 className="text-[10px] font-serif font-bold italic uppercase tracking-wider text-muted-foreground/50 text-center">
                                        Thông Tin Cơ Bản
                                    </h3>
                                    <div className="h-px flex-1 bg-border/20" />
                                </div>

                                <Field>
                                    <FieldLabel htmlFor="title" className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                        Tên Khóa Học <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="title"
                                        {...register('title')}
                                        placeholder="Nhập tên khóa học..."
                                        className="h-11 px-4 rounded-xl bg-background border-border hover:bg-muted/5 focus-visible:ring-primary/20 text-sm font-semibold placeholder:text-muted-foreground/30 transition-all"
                                    />
                                    {errors.title && <FieldError className="text-xs font-medium text-rose-500 pl-2">{errors.title.message}</FieldError>}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="description" className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                        Mô Tả <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Textarea
                                        id="description"
                                        {...register('description')}
                                        placeholder="Nhập mô tả chi tiết khóa học..."
                                        rows={4}
                                        className="rounded-xl bg-background border-border hover:bg-muted/5 focus-visible:ring-primary/20 text-sm font-medium placeholder:text-muted-foreground/30 transition-all resize-none p-4"
                                    />
                                    {errors.description && <FieldError className="text-xs font-medium text-rose-500 pl-2">{errors.description.message}</FieldError>}
                                </Field>

                                <div className="grid grid-cols-2 gap-6">
                                    <Field>
                                        <FieldLabel htmlFor="price" className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                            Học Phí <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <Input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            {...register('price', { valueAsNumber: true })}
                                            disabled={isFree}
                                            placeholder="0.00"
                                            className="h-11 px-4 rounded-xl bg-background border-border hover:bg-muted/5 focus-visible:ring-primary/20 text-sm font-bold placeholder:text-muted-foreground/30 transition-all font-mono tracking-tight disabled:opacity-50 disabled:bg-muted"
                                        />
                                        {errors.price && <FieldError className="text-xs font-medium text-rose-500 pl-2">{errors.price.message}</FieldError>}
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="jlptLevel" className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                            Trình Độ JLPT
                                        </FieldLabel>
                                        <Controller
                                            name="jlptLevel"
                                            control={control}
                                            render={({ field }) => (
                                                <Select value={field.value || ''} onValueChange={field.onChange}>
                                                    <SelectTrigger id="jlptLevel" className="h-11 px-4 rounded-xl bg-background border-border hover:bg-muted/5 focus:ring-primary/20 text-sm font-medium transition-all">
                                                        <SelectValue placeholder="Chọn Trình Độ" />
                                                    </SelectTrigger>
                                                    <SelectContent className="border-border shadow-xl bg-background rounded-xl overflow-hidden p-1">
                                                        {Object.values(JlptLevel).map((level) => (
                                                            <SelectItem key={level} value={level} className="rounded-lg cursor-pointer text-xs font-medium focus:bg-primary/10 focus:text-primary py-2.5">
                                                                {level}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.jlptLevel && <FieldError className="text-xs font-medium text-rose-500 pl-2">{errors.jlptLevel.message}</FieldError>}
                                    </Field>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <Field>
                                        <FieldLabel htmlFor="shortDescription" className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                            Mô Tả Ngắn
                                        </FieldLabel>
                                        <Textarea
                                            id="shortDescription"
                                            {...register('shortDescription')}
                                            placeholder="Tóm tắt ngắn gọn hiển thị trên thẻ..."
                                            rows={3}
                                            className="rounded-xl bg-background border-border hover:bg-muted/5 focus-visible:ring-primary/20 text-sm font-medium placeholder:text-muted-foreground/30 transition-all resize-none p-4"
                                        />
                                        {errors.shortDescription && <FieldError className="text-xs font-medium text-rose-500 pl-2">{errors.shortDescription.message}</FieldError>}
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="type" className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                            Loại Khóa Học
                                        </FieldLabel>
                                        <Controller
                                            name="type"
                                            control={control}
                                            render={({ field }) => (
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger id="type" className="h-11 px-4 rounded-xl bg-background border-border hover:bg-muted/5 focus:ring-primary/20 text-sm font-medium transition-all">
                                                        <SelectValue placeholder="Chọn loại khóa học" />
                                                    </SelectTrigger>
                                                    <SelectContent className="border-border shadow-xl bg-background rounded-xl overflow-hidden p-1">
                                                        <SelectItem value="vod" className="rounded-lg cursor-pointer text-xs font-medium focus:bg-primary/10 focus:text-primary py-2.5">
                                                            Video theo yêu cầu (VOD)
                                                        </SelectItem>
                                                        <SelectItem value="live" className="rounded-lg cursor-pointer text-xs font-medium focus:bg-primary/10 focus:text-primary py-2.5">
                                                            Phát trực tiếp
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </Field>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <Field>
                                        <FieldLabel htmlFor="discountPrice" className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                            Giá Khuyến Mãi
                                        </FieldLabel>
                                        <Input
                                            id="discountPrice"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            {...register('discountPrice', { valueAsNumber: true })}
                                            disabled={isFree}
                                            placeholder="0.00"
                                            className="h-11 px-4 rounded-xl bg-background border-border hover:bg-muted/5 focus-visible:ring-primary/20 text-sm font-bold placeholder:text-muted-foreground/30 transition-all font-mono tracking-tight disabled:opacity-50 disabled:bg-muted"
                                        />
                                        {errors.discountPrice && <FieldError className="text-xs font-medium text-rose-500 pl-2">{errors.discountPrice.message}</FieldError>}
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="durationWeeks" className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                            Thời Lượng (Tuần)
                                        </FieldLabel>
                                        <Input
                                            id="durationWeeks"
                                            type="number"
                                            min="0"
                                            {...register('durationWeeks', { valueAsNumber: true })}
                                            placeholder="ví dụ: 8"
                                            className="h-11 px-4 rounded-xl bg-background border-border hover:bg-muted/5 focus-visible:ring-primary/20 text-sm font-medium placeholder:text-muted-foreground/30 transition-all font-mono"
                                        />
                                    </Field>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <Field>
                                        <FieldLabel htmlFor="isFree" className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                            Giá Cả
                                        </FieldLabel>
                                        <Controller
                                            name="isFree"
                                            control={control}
                                            render={({ field }) => (
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
                                                        checked={field.value} // Controlled checked attribute
                                                        onChange={(e) => {
                                                            field.onChange(e.target.checked);
                                                            if (e.target.checked) {
                                                                setValue('price', 0);
                                                                setValue('discountPrice', 0);
                                                            }
                                                        }}
                                                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                                                    />
                                                    <span className="text-xs font-medium text-foreground/80">
                                                        Truy cập mở / Khóa học miễn phí
                                                    </span>
                                                </div>
                                            )}
                                        />
                                    </Field>
                                </div>

                                <div className="space-y-6 pt-6">
                                    <div className="flex items-center gap-3 pb-2 border-b border-border/40">
                                        <div className="h-px flex-1 bg-border/20" />
                                        <h3 className="text-[10px] font-serif font-bold italic uppercase tracking-wider text-muted-foreground/50 text-center">
                                            Chương Trình Học
                                        </h3>
                                        <div className="h-px flex-1 bg-border/20" />
                                    </div>

                                    <Controller
                                        name="tags"
                                        control={control}
                                        render={({ field }) => (
                                            <Field>
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
                                        name="learningOutcomes"
                                        control={control}
                                        render={({ field }) => (
                                            <Field>
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
                                        name="requirements"
                                        control={control}
                                        render={({ field }) => (
                                            <Field>
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
                            </div>

                            {/* Media Files */}
                            <div className="space-y-6 pt-6">
                                <div className="flex items-center gap-3 pb-2 border-b border-border/40">
                                    <div className="h-px flex-1 bg-border/20" />
                                    <h3 className="text-[10px] font-serif font-bold italic uppercase tracking-wider text-muted-foreground/50 text-center">
                                        Phương Tiện
                                    </h3>
                                    <div className="h-px flex-1 bg-border/20" />
                                </div>

                                <Field>
                                    <FieldLabel htmlFor="thumbnail" className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                        Ảnh Bìa
                                    </FieldLabel>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="relative flex-1">
                                                <Input
                                                    id="thumbnail"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleThumbnailChange}
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
                                        {thumbnailFile && (
                                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary/5 border border-primary/10">
                                                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                                    <ImageIcon className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-foreground truncate">{thumbnailFile.name}</p>
                                                    <p className="text-[10px] text-muted-foreground font-mono">{(thumbnailFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="video" className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wide">
                                        Video Giới Thiệu
                                    </FieldLabel>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="relative flex-1">
                                                <Input
                                                    id="video"
                                                    type="file"
                                                    accept="video/*"
                                                    onChange={handleVideoChange}
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
                                        {videoFile && (
                                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary/5 border border-primary/10">
                                                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                                    <Film className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-foreground truncate">{videoFile.name}</p>
                                                    <p className="text-[10px] text-muted-foreground font-mono">{(videoFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Field>
                            </div>

                            {/* AI & Metadata */}

                        </div>
                    </ScrollArea>

                    {/* Footer */}
                    <SheetFooter className="px-8 py-6 bg-background border-t border-border/10 flex flex-row items-center justify-between gap-4 relative z-20 flex-shrink-0">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleClose}
                            disabled={uploading}
                            className="rounded-xl h-11 px-6 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 hover:text-foreground hover:bg-muted/10 group transition-all"
                        >
                            <X className="mr-2 h-3.5 w-3.5 transition-transform group-hover:rotate-90" />
                            Hủy Bỏ
                        </Button>
                        <Button
                            type="submit"
                            disabled={uploading || !isDirty}
                            className="rounded-xl h-11 px-8 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang tạo...
                                </>
                            ) : (
                                <>
                                    <UploadCloud className="mr-2 h-4 w-4" />
                                    Tạo Khóa Học
                                </>
                            )}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
