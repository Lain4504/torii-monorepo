
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from '@workspace/ui/components/sheet';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Checkbox } from '@workspace/ui/components/checkbox';
import {
    Field,
    FieldLabel,
    FieldError,
} from '@workspace/ui/components/field';
import { storageApi } from '@/lib/api/services/storage-api';
import { LessonContentType, lessonCreateDTOSchema } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';
import { useCreateLesson, lessonsApi } from "@/lib/api/services/lesson";
import { Plus } from 'lucide-react';
import { Spinner } from "@workspace/ui/components/spinner";

const createLessonSchema = lessonCreateDTOSchema;

type CreateLessonFormData = z.infer<typeof createLessonSchema>;

interface CreateLessonDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    moduleId: string;
}

export default function CreateLessonSheet({ open, onOpenChange, moduleId }: CreateLessonDialogProps) {
    const createLesson = useCreateLesson();
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const {
        control,
        handleSubmit,
        watch,
        reset,
        formState: { isDirty },
    } = useForm<CreateLessonFormData>({
        resolver: zodResolver(createLessonSchema),
        defaultValues: {
            moduleId: moduleId || '',
            title: '',
            contentType: LessonContentType.VIDEO,
            status: 'published',
            orderIndex: 0,
            isPreview: false,
            isUnlocked: false,
            durationMinutes: 0,
            videoUrl: '',
            articleContent: '',
        },
    });

    // Reset form when module changes
    useEffect(() => {
        if (moduleId) {
            reset({
                moduleId,
                title: '',
                contentType: LessonContentType.VIDEO,
                status: 'published',
                orderIndex: 0,
                isPreview: false,
                isUnlocked: false,
                durationMinutes: 0,
                articleContent: '',
                videoUrl: '',
            });
            setVideoFile(null);
        }
    }, [moduleId, reset]);

    const onSubmitForm = async (data: CreateLessonFormData) => {
        setUploading(true);
        try {
            let videoUrl = data.videoUrl;

            if (videoFile) {
                const uploadedVideo = await storageApi.uploadFile(videoFile, 'lesson-videos');
                videoUrl = uploadedVideo.fileUrl;
            }

            // Tự động tính orderIndex tiếp theo dựa trên số bài hiện có trong module
            const existingLessons = await lessonsApi.findByModuleId(moduleId);
            const nextOrderIndex =
                existingLessons.length === 0
                    ? 1
                    : Math.max(...existingLessons.map((l: any) => l.orderIndex ?? 0)) + 1;

            const payload = {
                ...data,
                status: (data as any).status ?? 'published',
                orderIndex: nextOrderIndex,
                aiMetadata: (data as any).aiMetadata ?? {},
                isPreview: data.isPreview ?? false,
                isUnlocked: data.isUnlocked ?? false,
                videoUrl,
            };

            await createLesson.mutateAsync(payload);
            toast.success('Đã tạo bài học', {
                description: `${data.title} đã được thêm vào học phần thành công.`,
            });
            handleClose();
        } catch (error: any) {
            toast.error('Tạo thất bại', {
                description: error.response?.data?.error || error.message,
            });
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        reset();
        setVideoFile(null);
    };

    return (
        <Sheet open={open} onOpenChange={handleClose}>
            <SheetContent className="w-full sm:max-w-[800px] flex flex-col">
                <SheetHeader>
                    <SheetTitle>Tạo Bài Học Mới</SheetTitle>
                    <SheetDescription>
                        Cấu hình nội dung bài học mới cho học phần {moduleId.substring(0, 8)}...
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit(onSubmitForm)} className="flex flex-col h-full overflow-hidden">
                    <ScrollArea className="flex-1 min-h-0">
                        <div className="space-y-6 p-6">
                            {/* Basic Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                    Chi Tiết Bài Học
                                </h3>

                                <Controller
                                    control={control}
                                    name="title"
                                    render={({ field, fieldState }) => (
                                        <Field className="space-y-1" data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name}>Tiêu Đề</FieldLabel>
                                            <Input
                                                id={field.name}
                                                {...field}
                                                placeholder="VD: Giới thiệu về Trợ từ"
                                            />
                                            <FieldError errors={[fieldState.error]} />
                                        </Field>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <Controller
                                        control={control}
                                        name="contentType"
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-1" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name}>Loại Bài Học</FieldLabel>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={(value) => field.onChange(value as LessonContentType)}
                                                >
                                                    <SelectTrigger id={field.name}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value={LessonContentType.VIDEO}>Video</SelectItem>
                                                        <SelectItem value={LessonContentType.ARTICLE}>Bài viết</SelectItem>
                                                        <SelectItem value={LessonContentType.QUIZ}>Trắc nghiệm</SelectItem>
                                                        <SelectItem value={LessonContentType.ASSIGNMENT}>Bài tập</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        control={control}
                                        name="durationMinutes"
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-1" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name}>Thời Lượng (phút)</FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.value === '' ? 0 : e.target.valueAsNumber)}
                                                />
                                            </Field>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Content Specifics */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                    Cấu Hình Nội Dung
                                </h3>

                                {watch('contentType') === LessonContentType.VIDEO && (
                                    <Field className="space-y-1.5">
                                        <FieldLabel>Tải Lên Video</FieldLabel>
                                        <Input
                                            type="file"
                                            accept="video/*"
                                            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                        />
                                        <p className="text-[10px] text-muted-foreground">MP4, WebM • Tối đa 50MB</p>
                                    </Field>
                                )}

                                {watch('contentType') === LessonContentType.ARTICLE && (
                                    <Controller
                                        control={control}
                                        name="articleContent"
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-1" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name}>Nội Dung Bài Viết</FieldLabel>
                                                <Textarea
                                                    id={field.name}
                                                    {...field}
                                                    placeholder="Nội dung Markdown hoặc HTML..."
                                                    className="min-h-[200px]"
                                                />
                                                <FieldError errors={[fieldState.error]} />
                                            </Field>
                                        )}
                                    />
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <Controller
                                        control={control}
                                        name="isPreview"
                                        render={({ field }) => (
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    id={field.name}
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                                <FieldLabel htmlFor={field.name} className="cursor-pointer mb-0">Xem Thử Công Khai</FieldLabel>
                                            </div>
                                        )}
                                    />

                                    <Controller
                                        control={control}
                                        name="isUnlocked"
                                        render={({ field }) => (
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    id={field.name}
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                                <FieldLabel htmlFor={field.name} className="cursor-pointer mb-0">Mở Khóa Truy Cập</FieldLabel>
                                            </div>
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
                            onClick={handleClose}
                        >
                            Hủy Bỏ
                        </Button>
                        <Button
                            type="submit"
                            disabled={uploading || !isDirty}
                        >
                            {uploading ? (
                                <>
                                    <Spinner className="mr-2" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tạo Bài Học
                                </>
                            )}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
