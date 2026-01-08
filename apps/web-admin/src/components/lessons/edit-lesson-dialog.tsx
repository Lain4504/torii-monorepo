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
} from '@workspace/ui/components/sheet';
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
import { storageApi } from '@/api/services/storage-api';
import { LessonContentType, lessonUpdateDTOSchema, type LessonResponseDTO } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';
import { useUpdateLesson } from "@/api/services/lesson";

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
            orderIndex: 0,
            isPreview: false,
            isUnlocked: false,
            aiMetadata: {},
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
                aiMetadata: lesson.aiMetadata || {},
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
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[600px] overflow-y-auto border-l-0 shadow-2xl bg-background/95 backdrop-blur-xl">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Edit Lesson</SheetTitle>
                    <SheetDescription className="text-muted-foreground/70">Update lesson details and content.</SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6" noValidate>
                    <Controller
                        control={control}
                        name="title"
                        render={({ field, fieldState }) => (
                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Title</FieldLabel>
                                <Input
                                    id={field.name}
                                    {...field}
                                    placeholder="Enter lesson title"
                                    className="h-11 border-none bg-muted/30 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl transition-all"
                                    aria-invalid={fieldState.invalid}
                                />
                                <FieldError errors={[fieldState.error]} className="text-[10px] font-medium text-destructive ml-1" />
                            </Field>
                        )}
                    />

                    <Controller
                        control={control}
                        name="contentType"
                        render={({ field, fieldState }) => (
                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Content Type</FieldLabel>
                                <Select
                                    value={field.value}
                                    onValueChange={(value) => field.onChange(value as LessonContentType)}
                                >
                                    <SelectTrigger id={field.name} aria-invalid={fieldState.invalid} className="h-11 border-none bg-muted/30 hover:bg-muted/50 focus:ring-1 focus:ring-primary/20 rounded-xl transition-all">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="border-none shadow-xl bg-card rounded-xl">
                                        <SelectItem value={LessonContentType.VIDEO} className="rounded-lg cursor-pointer focus:bg-primary/10 focus:text-primary">Video</SelectItem>
                                        <SelectItem value={LessonContentType.ARTICLE} className="rounded-lg cursor-pointer focus:bg-primary/10 focus:text-primary">Article</SelectItem>
                                        <SelectItem value={LessonContentType.QUIZ} className="rounded-lg cursor-pointer focus:bg-primary/10 focus:text-primary">Quiz</SelectItem>
                                        <SelectItem value={LessonContentType.ASSIGNMENT} className="rounded-lg cursor-pointer focus:bg-primary/10 focus:text-primary">Assignment</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FieldError errors={[fieldState.error]} className="text-[10px] font-medium text-destructive ml-1" />
                            </Field>
                        )}
                    />

                    {watch('contentType') === LessonContentType.VIDEO && (
                        <Field className="space-y-2">
                            <FieldLabel htmlFor="video-file" className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Video File</FieldLabel>
                            <Input
                                id="video-file"
                                type="file"
                                accept="video/*"
                                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                className="h-11 border-none bg-muted/30 hover:bg-muted/50 file:bg-primary/10 file:text-primary file:border-0 file:rounded-lg file:mr-4 file:px-4 file:h-full cursor-pointer rounded-xl transition-all pt-1.5"
                            />
                            {lesson.videoUrl && <p className="text-xs text-muted-foreground ml-1">Current: {lesson.videoUrl}</p>}
                        </Field>
                    )}

                    {watch('contentType') === LessonContentType.ARTICLE && (
                        <Controller
                            control={control}
                            name="articleContent"
                            render={({ field, fieldState }) => (
                                <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Article Content</FieldLabel>
                                    <Textarea
                                        id={field.name}
                                        {...field}
                                        value={field.value || ''}
                                        placeholder="Enter article content"
                                        className="min-h-[120px] border-none bg-muted/30 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl transition-all resize-none p-4"
                                        aria-invalid={fieldState.invalid}
                                    />
                                    <FieldError errors={[fieldState.error]} className="text-[10px] font-medium text-destructive ml-1" />
                                </Field>
                            )}
                        />
                    )}

                    <Controller
                        control={control}
                        name="orderIndex"
                        render={({ field, fieldState }) => (
                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Order Index</FieldLabel>
                                <Input
                                    id={field.name}
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                    placeholder="Enter order"
                                    className="h-11 border-none bg-muted/30 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl transition-all"
                                    aria-invalid={fieldState.invalid}
                                />
                                <FieldError errors={[fieldState.error]} className="text-[10px] font-medium text-destructive ml-1" />
                            </Field>
                        )}
                    />

                    <div className="flex gap-6 pt-1">
                        <Controller
                            control={control}
                            name="isPreview"
                            render={({ field }) => (
                                <div className="flex items-center gap-2.5">
                                    <Checkbox
                                        id={field.name}
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        className="border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                    />
                                    <label htmlFor={field.name} className="text-sm font-medium text-muted-foreground cursor-pointer select-none">
                                        Is Preview
                                    </label>
                                </div>
                            )}
                        />

                        <Controller
                            control={control}
                            name="isUnlocked"
                            render={({ field }) => (
                                <div className="flex items-center gap-2.5">
                                    <Checkbox
                                        id={field.name}
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        className="border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                    />
                                    <label htmlFor={field.name} className="text-sm font-medium text-muted-foreground cursor-pointer select-none">
                                        Is Unlocked
                                    </label>
                                </div>
                            )}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="rounded-xl h-11 px-6 hover:bg-primary/5"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={uploading}
                            className="rounded-xl h-11 px-8 bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                        >
                            {uploading ? 'Uploading...' : 'Update Lesson'}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
