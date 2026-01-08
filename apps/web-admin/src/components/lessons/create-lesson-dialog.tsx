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
            orderIndex: 0,
            isPreview: false,
            isUnlocked: false,
            aiMetadata: {},
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
                // Ensure required fields on LessonCreateDTO are always present
                orderIndex: data.orderIndex ?? 0,
                aiMetadata: data.aiMetadata ?? {},
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
            <DialogContent className="max-w-lg border-none shadow-2xl bg-background/95 backdrop-blur-xl rounded-2xl p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-4 bg-muted/30">
                    <DialogTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Create New Lesson</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmitForm)} className="p-6 pt-4 space-y-5" noValidate>
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
                        <div>
                            <label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1 mb-2 block">Video File</label>
                            <Input
                                type="file"
                                accept="video/*"
                                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                className="h-11 border-none bg-muted/30 hover:bg-muted/50 file:bg-primary/10 file:text-primary file:border-0 file:rounded-lg file:mr-4 file:px-4 file:h-full cursor-pointer rounded-xl transition-all pt-1.5"
                            />
                        </div>
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
                                <FieldLabel htmlFor={field.name} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Order</FieldLabel>
                                <Input
                                    id={field.name}
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
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
                            onClick={handleClose}
                            className="rounded-xl h-11 px-6 hover:bg-primary/5"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={uploading}
                            className="rounded-xl h-11 px-8 bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                        >
                            {uploading ? 'Uploading...' : 'Create Lesson'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
