import { useState } from 'react';
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
import { Checkbox } from '@workspace/ui/components/checkbox';
import {
    Field,
    FieldLabel,
    FieldError,
} from '@workspace/ui/components/field';
import { storageApi } from '@/api/services/storage-api.ts';
import { LessonContentType, lessonCreateDTOSchema } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';
import { useCreateLesson } from "@/api/services/lesson.ts";

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
        control,
        handleSubmit,
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
                        <Controller
                            control={control}
                            name="articleContent"
                            render={({ field, fieldState }) => (
                                <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Article Content</FieldLabel>
                                    <Textarea
                                        id={field.name}
                                        {...field}
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
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id={field.name}
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                    <label htmlFor={field.name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                        Is Preview
                                    </label>
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
                                    <label htmlFor={field.name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                        Is Unlocked
                                    </label>
                                </div>
                            )}
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="submit" disabled={uploading}>{uploading ? 'Uploading...' : 'Create Lesson'}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
