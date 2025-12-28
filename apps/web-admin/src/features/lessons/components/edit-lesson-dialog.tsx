import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateLesson } from '@/features/lessons/api/lesson';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { storageApi } from '@/lib/storage-api';
import { LessonContentType } from '@workspace/dtos';
import type { LessonResponseDto } from '@workspace/dtos';
import { toast } from '@workspace/ui/components/sonner';

const updateLessonSchema = z.object({
    moduleId: z.string().uuid().optional(),
    title: z.string().min(1, 'Title is required').optional(),
    contentType: z.nativeEnum(LessonContentType).optional(),
    videoUrl: z.string().optional(),
    articleContent: z.string().optional(),
    order: z.number().min(0).optional(),
    isPreview: z.boolean().optional(),
    isUnlocked: z.boolean().optional(),
});

type UpdateLessonFormData = z.infer<typeof updateLessonSchema>;

interface EditLessonDialogProps {
    lesson: LessonResponseDto | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditLessonDialog({ lesson, open, onOpenChange }: EditLessonDialogProps) {
    const updateLesson = useUpdateLesson();
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<UpdateLessonFormData>({
        resolver: zodResolver(updateLessonSchema),
        defaultValues: {
            title: '',
            contentType: LessonContentType.VIDEO,
            order: 0,
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
                order: lesson.order,
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
            toast.success('Lesson updated successfully!', {
                description: `Changes to ${data.title ?? lesson.title} have been saved.`,
            });
            onOpenChange(false);
            setVideoFile(null);
        } catch (error: any) {
            toast.error('Failed to update lesson', {
                description: error.response?.data?.error || error.message,
            });
        } finally {
            setUploading(false);
        }
    };

    if (!lesson) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Lesson</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <Input {...register('title')} placeholder="Enter lesson title" />
                        {errors.title && (
                            <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Content Type</label>
                        <Select
                            value={watch('contentType')}
                            onValueChange={(value) => setValue('contentType', value as LessonContentType)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={LessonContentType.VIDEO}>Video</SelectItem>
                                <SelectItem value={LessonContentType.ARTICLE}>Article</SelectItem>
                                <SelectItem value={LessonContentType.QUIZ}>Quiz</SelectItem>
                                <SelectItem value={LessonContentType.ASSIGNMENT}>Assignment</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {watch('contentType') === LessonContentType.VIDEO && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Video File</label>
                            <Input
                                type="file"
                                accept="video/*"
                                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                            />
                            {lesson.videoUrl && <p className="text-sm text-muted-foreground">Current: {lesson.videoUrl}</p>}
                        </div>
                    )}

                    {watch('contentType') === LessonContentType.ARTICLE && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Article Content</label>
                            <Textarea {...register('articleContent')} placeholder="Enter article content" />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1">Order</label>
                        <Input type="number" {...register('order', { valueAsNumber: true })} />
                    </div>

                    <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" {...register('isPreview')} />
                            <span className="text-sm">Is Preview</span>
                        </label>

                        <label className="flex items-center gap-2">
                            <input type="checkbox" {...register('isUnlocked')} />
                            <span className="text-sm">Is Unlocked</span>
                        </label>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={uploading}>
                            {uploading ? 'Uploading...' : 'Update Lesson'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
