import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateLesson } from '@/features/lessons/api/lesson';
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
import { LessonContentType, lessonCreateDTOSchema } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';

const createLessonSchema = lessonCreateDTOSchema;

type CreateLessonFormData = z.input<typeof createLessonSchema>;

interface CreateLessonDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    moduleId: string;
}

export function CreateLessonDialog({ open, onOpenChange, moduleId }: CreateLessonDialogProps) {
    const createLesson = useCreateLesson();
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<CreateLessonFormData>({
        resolver: zodResolver(createLessonSchema),
        defaultValues: {
            moduleId: moduleId || '',
            title: '',
            contentType: LessonContentType.VIDEO,
            order: 0,
            isPreview: false,
            isUnlocked: false,
        },
    });

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

    const onSubmitForm = async (data: CreateLessonFormData) => {
        setUploading(true);
        try {
            let videoUrl = data.videoUrl;

            if (videoFile) {
                videoUrl = await handleFileUpload(videoFile, 'lesson-videos');
            }

            const payload = {
                ...data,
                isPreview: data.isPreview ?? false,
                isUnlocked: data.isUnlocked ?? false,
                videoUrl,
            };

            await createLesson.mutateAsync(payload);
            toast.success('Lesson created successfully!', {
                description: `${data.title} has been added.`,
            });
            onOpenChange(false);
            reset();
            setVideoFile(null);
        } catch (error: any) {
            toast.error('Failed to create lesson', {
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
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Lesson</DialogTitle>
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
                        <Button type="submit" disabled={uploading}>{uploading ? 'Uploading...' : 'Create Lesson'}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
