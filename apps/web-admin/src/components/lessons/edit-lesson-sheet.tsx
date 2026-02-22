import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Checkbox } from '@workspace/ui/components/checkbox';
import {
    Field,
    FieldLabel,
    FieldError,
} from '@workspace/ui/components/field';
import { storageApi } from '@/api/services/storage-api';
import { LessonContentType, lessonUpdateDTOSchema, type LessonResponseDTO } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';
import { useUpdateLesson } from "@/api/services/lesson";
import { Loader2, Save, Video } from 'lucide-react';

const updateLessonSchema = lessonUpdateDTOSchema;

type UpdateLessonFormData = z.infer<typeof updateLessonSchema>;

interface EditLessonDialogProps {
    lesson: LessonResponseDTO | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditLessonSheet({ lesson, open, onOpenChange }: EditLessonDialogProps) {
    const updateLesson = useUpdateLesson();
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const {
        control,
        handleSubmit,
        watch,
        reset,
        formState: { isDirty },
    } = useForm<UpdateLessonFormData>({
        resolver: zodResolver(updateLessonSchema),
        defaultValues: {
            title: '',
            contentType: LessonContentType.VIDEO,
            orderIndex: 0,
            isPreview: false,
            isUnlocked: false,
        },
    });

    useEffect(() => {
        if (lesson) {
            reset({
                moduleId: lesson.moduleId,
                title: lesson.title,
                contentType: lesson.contentType as LessonContentType,
                videoUrl: lesson.videoUrl,
                articleContent: lesson.articleContent,
                orderIndex: lesson.orderIndex,
                isPreview: lesson.isPreview,
                isUnlocked: lesson.isUnlocked,
            });
        }
    }, [lesson, reset]);

    const handleFileUpload = async (file: File, module: string) => {
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
    };

    const onSubmitForm = async (data: UpdateLessonFormData) => {
        if (!lesson) return;

        setUploading(true);
        try {
            let videoUrl = data.videoUrl ?? lesson.videoUrl;

            if (videoFile) {
                videoUrl = await handleFileUpload(videoFile, 'lesson-videos');
            }

            const updateData = {
                ...data,
                videoUrl,
            };

            await updateLesson.mutateAsync({ id: lesson.id, lesson: updateData });
            toast.success('Đã cập nhật bài học', {
                description: `Thay đổi cho ${data.title ?? lesson.title} đã được lưu.`,
            });
            onOpenChange(false);
            setVideoFile(null);
        } catch (error: any) {
            toast.error('Cập nhật thất bại', {
                description: error.response?.data?.error || error.message,
            });
        } finally {
            setUploading(false);
        }
    };

    if (!lesson) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="!w-full sm:!max-w-[800px] flex flex-col">
                <SheetHeader>
                    <SheetTitle>Chỉnh Sửa Bài Học</SheetTitle>
                    <SheetDescription>
                        Cập nhật nội dung cho bài học {lesson.id.substring(0, 8)}...
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit(onSubmitForm)} className="flex flex-col h-full overflow-hidden" noValidate>
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
                                                placeholder="VD: Giới thiệu về ngữ pháp"
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
                                                <FieldLabel htmlFor={field.name}>Loại Nội Dung</FieldLabel>
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
                                        name="orderIndex"
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-1" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name}>Thứ Tự</FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
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
                                    <div className="space-y-4">
                                        <Field className="space-y-1.5">
                                            <FieldLabel>Cập Nhật Video</FieldLabel>
                                            <Input
                                                id="video-file"
                                                type="file"
                                                accept="video/*"
                                                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                            />
                                            <p className="text-[10px] text-muted-foreground">Ghi đè bản cũ nếu tải lên mới</p>
                                        </Field>

                                        {lesson.videoUrl && !videoFile && (
                                            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border text-xs">
                                                <Video className="size-3.5 text-primary" />
                                                <span className="truncate flex-1">Hiện tại: {lesson.videoUrl}</span>
                                            </div>
                                        )}
                                    </div>
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
                                                    value={field.value || ''}
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
                                                <label htmlFor={field.name} className="text-sm font-medium">Xem Thử Công Khai</label>
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
                                                <label htmlFor={field.name} className="text-sm font-medium">Mở Khóa Truy Cập</label>
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
                            onClick={() => onOpenChange(false)}
                        >
                            Hủy Bỏ
                        </Button>
                        <Button
                            type="submit"
                            disabled={uploading || !isDirty}
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang đồng bộ...
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
