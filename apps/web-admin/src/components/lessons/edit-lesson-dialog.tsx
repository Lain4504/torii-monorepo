import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import {
    Field,
    FieldLabel,
    FieldError,
} from '@workspace/ui/components/field';
import { storageApi } from '@/api/services/storage-api.ts';
import { LessonContentType, lessonUpdateDTOSchema, type LessonResponseDTO } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';
import { useUpdateLesson } from "@/api/services/lesson.ts";

const updateLessonSchema = lessonUpdateDTOSchema;

type UpdateLessonFormData = z.infer<typeof updateLessonSchema>;

interface EditLessonDialogProps {
    lesson: LessonResponseDTO | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditLessonDialog({ lesson, open, onOpenChange }: EditLessonDialogProps) {
    const updateLesson = useUpdateLesson();
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const {
        control,
        handleSubmit,
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
                <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4" noValidate>
                    <Controller
                        control={control}
                        name="title"
                        render={({ field, fieldState }) => (
                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                                <Input
                                    id={field.name}
                                    {...field}
                                    placeholder="Enter lesson title"
                                    aria-invalid={fieldState.invalid}
                                />
                                <FieldError errors={[fieldState.error]} />
                            </Field>
                        )}
                    />

                    <Controller
                        control={control}
                        name="contentType"
                        render={({ field, fieldState }) => (
                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Content Type</FieldLabel>
                                <Select
                                    value={field.value}
                                    onValueChange={(value) => field.onChange(value as LessonContentType)}
                                >
                                    <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={LessonContentType.VIDEO}>Video</SelectItem>
                                        <SelectItem value={LessonContentType.ARTICLE}>Article</SelectItem>
                                        <SelectItem value={LessonContentType.QUIZ}>Quiz</SelectItem>
                                        <SelectItem value={LessonContentType.ASSIGNMENT}>Assignment</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FieldError errors={[fieldState.error]} />
                            </Field>
                        )}
                    />

                    {watch('contentType') === LessonContentType.VIDEO && (
                        <Field className="space-y-2">
                            <FieldLabel htmlFor="video-file">Video File</FieldLabel>
                            <Input
                                id="video-file"
                                type="file"
                                accept="video/*"
                                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                            />
                            {lesson.videoUrl && <p className="text-sm text-muted-foreground">Current: {lesson.videoUrl}</p>}
                        </Field>
                    )}

                    {watch('contentType') === LessonContentType.ARTICLE && (
                        <Controller
                            control={control}
                            name="articleContent"
                            render={({ field, fieldState }) => (
                                <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Article Content</FieldLabel>
                                    <Textarea
                                        id={field.name}
                                        {...field}
                                        value={field.value || ''}
                                        placeholder="Enter article content"
                                        aria-invalid={fieldState.invalid}
                                    />
                                    <FieldError errors={[fieldState.error]} />
                                </Field>
                            )}
                        />
                    )}

                    <Controller
                        control={control}
                        name="order"
                        render={({ field, fieldState }) => (
                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Order</FieldLabel>
                                <Input
                                    id={field.name}
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                    placeholder="Enter order"
                                    aria-invalid={fieldState.invalid}
                                />
                                <FieldError errors={[fieldState.error]} />
                            </Field>
                        )}
                    />

                    <div className="flex gap-4">
                        <Controller
                            control={control}
                            name="isPreview"
                            render={({ field }) => (
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={field.value}
                                        onChange={field.onChange}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm">Is Preview</span>
                                </label>
                            )}
                        />

                        <Controller
                            control={control}
                            name="isUnlocked"
                            render={({ field }) => (
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={field.value}
                                        onChange={field.onChange}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm">Is Unlocked</span>
                                </label>
                            )}
                        />
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
