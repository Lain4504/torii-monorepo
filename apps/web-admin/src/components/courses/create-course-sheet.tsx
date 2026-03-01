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
import { Image as ImageIcon, Film, X, UploadCloud } from 'lucide-react';
import { Checkbox } from '@workspace/ui/components/checkbox';
import {
    Item,
    ItemMedia,
    ItemContent,
    ItemTitle,
    ItemDescription,
} from '@workspace/ui/components/item';

import { toast } from '@workspace/ui/components/sonner';
import { storageApi } from '@/lib/api/services/storage-api.ts';
import { JlptLevel, courseMasterCreateDTOSchema, type CourseMasterCreateDTO } from '@workspace/schemas';
import { useCreateCourse } from "@/lib/api/services/courses.ts";
import { Spinner } from "@workspace/ui/components/spinner";

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
    } = useForm<CourseMasterCreateDTO>({
        resolver: zodResolver(courseMasterCreateDTOSchema) as any,
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
    const courseType = watch('type');

    const handleClose = () => {
        if (!uploading) {
            onOpenChange(false);
            reset();
            setThumbnailFile(null);
            setVideoFile(null);
        }
    };

    const onSubmit = async (data: CourseMasterCreateDTO) => {
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
            <SheetContent className="!w-full sm:!max-w-[800px] flex flex-col">
                <SheetHeader>
                    <SheetTitle>Tạo Khóa Học Mới</SheetTitle>
                    <SheetDescription>
                        Nhập thông tin chi tiết khóa học và chương trình giảng dạy bên dưới.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden min-h-0" noValidate>
                    <ScrollArea className="flex-1 min-h-0">
                        <div className="space-y-6 p-6">

                            {/* Basic Information */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 pb-2 border-b border-border/40">
                                    <div className="h-px flex-1 bg-border/20 min-h-0" />
                                    <h3 className="text-[10px] font-sans font-bold italic uppercase tracking-wider text-muted-foreground/50 text-center">
                                        Thông Tin Cơ Bản
                                    </h3>
                                    <div className="h-px flex-1 bg-border/20 min-h-0" />
                                </div>

                                <Field>
                                    <FieldLabel htmlFor="title" className="">
                                        Tên Khóa Học <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="title"
                                        {...register('title')}
                                        placeholder="Nhập tên khóa học..."
                                        className="mt-1"
                                    />
                                    {errors.title && <FieldError className="text-xs font-medium text-rose-500 pl-2">{errors.title.message}</FieldError>}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="description" className="">
                                        Mô Tả <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Textarea
                                        id="description"
                                        {...register('description')}
                                        placeholder="Nhập mô tả chi tiết khóa học..."
                                        rows={4}
                                        className="mt-1 resize-none"
                                    />
                                    {errors.description && <FieldError className="text-xs font-medium text-rose-500 pl-2">{errors.description.message}</FieldError>}
                                </Field>

                                <div className="grid grid-cols-2 gap-6">
                                    <Field>
                                        <FieldLabel htmlFor="price" className="">
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
                                            className="mt-1 font-mono tracking-tight"
                                        />
                                        {errors.price && <FieldError className="text-xs font-medium text-rose-500 pl-2">{errors.price.message}</FieldError>}
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="jlptLevel" className="">
                                            Trình Độ JLPT
                                        </FieldLabel>
                                        <Controller
                                            name="jlptLevel"
                                            control={control}
                                            render={({ field }) => (
                                                <Select value={field.value || ''} onValueChange={field.onChange}>
                                                    <SelectTrigger id="jlptLevel" className="mt-1">
                                                        <SelectValue placeholder="Chọn Trình Độ" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.values(JlptLevel).map((level) => (
                                                            <SelectItem key={level} value={level}>{level}</SelectItem>
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
                                        <FieldLabel htmlFor="shortDescription" className="">
                                            Mô Tả Ngắn
                                        </FieldLabel>
                                        <Textarea
                                            id="shortDescription"
                                            {...register('shortDescription')}
                                            placeholder="Tóm tắt ngắn gọn hiển thị trên thẻ..."
                                            rows={3}
                                            className="mt-1 resize-none"
                                        />
                                        {errors.shortDescription && <FieldError className="text-xs font-medium text-rose-500 pl-2">{errors.shortDescription.message}</FieldError>}
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="type" className="">
                                            Loại Khóa Học
                                        </FieldLabel>
                                        <Controller
                                            name="type"
                                            control={control}
                                            render={({ field }) => (
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger id="type" className="">
                                                        <SelectValue placeholder="Chọn loại khóa học" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="vod">Video theo yêu cầu (VOD)</SelectItem>
                                                        <SelectItem value="live">Phát trực tiếp</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </Field>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <Field>
                                        <FieldLabel htmlFor="discountPrice" className="">
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
                                            className="mt-1 font-mono tracking-tight disabled:opacity-50 disabled:bg-muted"
                                        />
                                        {errors.discountPrice && <FieldError className="text-xs font-medium text-rose-500 pl-2">{errors.discountPrice.message}</FieldError>}
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="durationWeeks" className="">
                                            Thời Lượng (Tuần)
                                        </FieldLabel>
                                        <Input
                                            id="durationWeeks"
                                            type="number"
                                            min="0"
                                            max="26"
                                            {...register('durationWeeks', { valueAsNumber: true })}
                                            placeholder="Tối đa 26 tuần (6 tháng)"
                                            className="mt-1 font-mono"
                                        />
                                        <p className="text-[10px] text-muted-foreground/60 mt-1.5 ml-1">
                                            Thời lượng nội dung chương trình học.
                                        </p>
                                    </Field>
                                </div>

                                {/* VOD: Thời hạn truy cập */}
                                {courseType === 'vod' && (
                                    <Field>
                                        <FieldLabel htmlFor="expirationMonths" className="">
                                            Thời Hạn Truy Cập (Tháng)
                                        </FieldLabel>
                                        <Input
                                            id="expirationMonths"
                                            type="number"
                                            min="1"
                                            max="6"
                                            {...register('expirationMonths' as any, { valueAsNumber: true })}
                                            placeholder="1-6 tháng (mặc định 6)"
                                            className="mt-1 font-mono"
                                        />
                                        <p className="text-[10px] text-muted-foreground/60 mt-1.5 ml-1 leading-relaxed">
                                            Hạn truy cập mặc định cho mô hình "Mua cả khóa". <br />
                                            Học viên cần gia hạn nếu muốn xem lại sau thời gian này.
                                        </p>
                                    </Field>
                                )}

                                <div className="grid grid-cols-2 gap-6">
                                    <Field>
                                        <FieldLabel htmlFor="isFree" className="">
                                            Giá Cả
                                        </FieldLabel>
                                        <Controller
                                            name="isFree"
                                            control={control}
                                            render={({ field }) => (
                                                <div className="flex items-center gap-3 mt-1.5">
                                                    <Checkbox
                                                        id="isFree"
                                                        checked={field.value}
                                                        onCheckedChange={(checked) => {
                                                            field.onChange(checked);
                                                            if (checked) {
                                                                setValue('price', 0);
                                                                setValue('discountPrice', 0);
                                                            }
                                                        }}
                                                    />
                                                    <FieldLabel htmlFor="isFree" className="cursor-pointer mb-0">
                                                        Truy cập mở / Khóa học miễn phí
                                                    </FieldLabel>
                                                </div>
                                            )}
                                        />
                                    </Field>
                                </div>

                                <div className="space-y-6 pt-6">
                                    <div className="flex items-center gap-3 pb-2 border-b border-border/40">
                                        <div className="h-px flex-1 bg-border/20 min-h-0" />
                                        <h3 className="text-[10px] font-sans font-bold italic uppercase tracking-wider text-muted-foreground/50 text-center">
                                            Chương Trình Học
                                        </h3>
                                        <div className="h-px flex-1 bg-border/20 min-h-0" />
                                    </div>

                                    <Controller
                                        name="tags"
                                        control={control}
                                        render={({ field }) => (
                                            <Field>
                                                <FieldLabel htmlFor="tags" className="">
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
                                        name="learningOutcomes"
                                        control={control}
                                        render={({ field }) => (
                                            <Field>
                                                <FieldLabel htmlFor="learningOutcomes" className="">
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
                                        name="requirements"
                                        control={control}
                                        render={({ field }) => (
                                            <Field>
                                                <FieldLabel htmlFor="requirements" className="">
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

                            {/* Media Files */}
                            <div className="space-y-6 pt-6">
                                <div className="flex items-center gap-3 pb-2 border-b border-border/40">
                                    <div className="h-px flex-1 bg-border/20 min-h-0" />
                                    <h3 className="text-[10px] font-sans font-bold italic uppercase tracking-wider text-muted-foreground/50 text-center">
                                        Phương Tiện
                                    </h3>
                                    <div className="h-px flex-1 bg-border/20 min-h-0" />
                                </div>

                                <Field>
                                    <FieldLabel htmlFor="thumbnail" className="">
                                        Ảnh Bìa
                                    </FieldLabel>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="relative flex-1 min-h-0">
                                                <Input
                                                    id="thumbnail"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleThumbnailChange}
                                                    className="mt-1 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer text-muted-foreground"
                                                />
                                                <ImageIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 pointer-events-none" />
                                            </div>
                                            {thumbnailFile && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setThumbnailFile(null)}
                                                    className="h-11 w-11 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/10">
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                        {thumbnailFile && (
                                            <Item variant="outline">
                                                <ItemMedia>
                                                    <ImageIcon className="h-4 w-4" />
                                                </ItemMedia>
                                                <ItemContent>
                                                    <ItemTitle className="text-xs font-bold truncate">{thumbnailFile.name}</ItemTitle>
                                                    <ItemDescription>{(thumbnailFile.size / 1024 / 1024).toFixed(2)} MB</ItemDescription>
                                                </ItemContent>
                                            </Item>
                                        )}
                                    </div>
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="video" className="">
                                        Video Giới Thiệu
                                    </FieldLabel>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="relative flex-1 min-h-0">
                                                <Input
                                                    id="video"
                                                    type="file"
                                                    accept="video/*"
                                                    onChange={handleVideoChange}
                                                    className="mt-1 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer text-muted-foreground"
                                                />
                                                <Film className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 pointer-events-none" />
                                            </div>
                                            {videoFile && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setVideoFile(null)}
                                                    className="h-11 w-11 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/10">
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                        {videoFile && (
                                            <Item variant="outline">
                                                <ItemMedia>
                                                    <Film className="h-4 w-4" />
                                                </ItemMedia>
                                                <ItemContent>
                                                    <ItemTitle className="text-xs font-bold truncate">{videoFile.name}</ItemTitle>
                                                    <ItemDescription>{(videoFile.size / 1024 / 1024).toFixed(2)} MB</ItemDescription>
                                                </ItemContent>
                                            </Item>
                                        )}
                                    </div>
                                </Field>
                            </div>

                            {/* AI & Metadata */}

                        </div>
                    </ScrollArea>
                    <SheetFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={uploading}>
                            <X className="mr-2 h-3.5 w-3.5 transition-transform group-hover:rotate-90" />
                            Hủy Bỏ
                        </Button>
                        <Button
                            type="submit"
                            disabled={uploading || !isDirty}>
                            {uploading ? (
                                <>
                                    <Spinner className="mr-2" />
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
        </Sheet >
    );
}
