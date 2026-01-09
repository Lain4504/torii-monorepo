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
import { Loader2, Video, FileText, ClipboardList, BookOpen, Pencil } from 'lucide-react';

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
        formState: { isDirty },
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
            <SheetContent className="w-full sm:w-[900px] sm:max-w-[900px] max-h-screen flex flex-col p-0 gap-0 border-l border-border/40 shadow-2xl bg-background/95 backdrop-blur-md overflow-hidden">
                <SheetHeader className="px-6 py-6 border-b border-border/40 bg-muted/5 space-y-1">
                    <SheetTitle className="text-xl font-bold flex items-center gap-2">
                        <Pencil className="h-5 w-5 text-primary" />
                        Edit Lesson
                    </SheetTitle>
                    <SheetDescription className="text-sm text-muted-foreground">
                        Update details and content for this lesson.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit(onSubmitForm)} className="flex flex-col h-full overflow-hidden">
                    <ScrollArea className="flex-1 min-h-0">
                        <div className="px-6 py-6 space-y-6">
                            {/* Basic Info */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                                    Lesson Details
                                </h3>

                                <Controller
                                    control={control}
                                    name="title"
                                    render={({ field, fieldState }) => (
                                        <Field className="space-y-1.5" data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Title <span className="text-destructive">*</span></FieldLabel>
                                            <Input
                                                id={field.name}
                                                {...field}
                                                placeholder="Enter lesson title"
                                                className="h-11 border-none bg-muted/30 hover:bg-muted/50 focus:ring-1 focus:ring-primary/20 rounded-xl transition-all"
                                                aria-invalid={fieldState.invalid}
                                            />
                                            <FieldError errors={[fieldState.error]} className="text-[10px] font-medium text-destructive ml-1" />
                                        </Field>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <Controller
                                        control={control}
                                        name="contentType"
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-1.5" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Content Type</FieldLabel>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={(value) => field.onChange(value as LessonContentType)}
                                                >
                                                    <SelectTrigger id={field.name} className="h-11 border-none bg-muted/30 hover:bg-muted/50 focus:ring-1 focus:ring-primary/20 rounded-xl transition-all">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="border-none shadow-xl bg-popover/95 backdrop-blur-xl rounded-xl">
                                                        <SelectItem value={LessonContentType.VIDEO} className="rounded-lg cursor-pointer">
                                                            <div className="flex items-center gap-2">
                                                                <Video className="h-4 w-4" /> Video
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value={LessonContentType.ARTICLE} className="rounded-lg cursor-pointer">
                                                            <div className="flex items-center gap-2">
                                                                <FileText className="h-4 w-4" /> Article
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value={LessonContentType.QUIZ} className="rounded-lg cursor-pointer">
                                                            <div className="flex items-center gap-2">
                                                                <ClipboardList className="h-4 w-4" /> Quiz
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value={LessonContentType.ASSIGNMENT} className="rounded-lg cursor-pointer">
                                                            <div className="flex items-center gap-2">
                                                                <BookOpen className="h-4 w-4" /> Assignment
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        control={control}
                                        name="orderIndex"
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-1.5" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Order</FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                                    className="h-11 border-none bg-muted/30 hover:bg-muted/50 focus:ring-1 focus:ring-primary/20 rounded-xl transition-all"
                                                />
                                            </Field>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Content Specifics */}
                            <div className="space-y-4 pt-4 border-t border-border/40">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                                    Content & Settings
                                </h3>

                                {watch('contentType') === LessonContentType.VIDEO && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Video File</label>
                                        </div>
                                        <div className="relative">
                                            <Input
                                                id="video-file"
                                                type="file"
                                                accept="video/*"
                                                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                                className="h-11 border-none bg-muted/30 hover:bg-muted/50 file:bg-primary/10 file:text-primary file:border-0 file:rounded-lg file:mr-4 file:px-4 file:h-full cursor-pointer rounded-xl transition-all pt-1.5 pl-2"
                                            />
                                        </div>
                                        {lesson.videoUrl && (
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground ml-1">
                                                <Video className="h-3 w-3" />
                                                <span className="truncate max-w-[300px]">Current: {lesson.videoUrl}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {watch('contentType') === LessonContentType.ARTICLE && (
                                    <Controller
                                        control={control}
                                        name="articleContent"
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-1.5" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Article Content</FieldLabel>
                                                <Textarea
                                                    id={field.name}
                                                    {...field}
                                                    value={field.value || ''}
                                                    placeholder="Write your lesson content here..."
                                                    className="min-h-[200px] border-none bg-muted/30 hover:bg-muted/50 focus:ring-1 focus:ring-primary/20 rounded-xl transition-all resize-none p-4 font-mono text-sm"
                                                    aria-invalid={fieldState.invalid}
                                                />
                                                <FieldError errors={[fieldState.error]} className="text-[10px] font-medium text-destructive ml-1" />
                                            </Field>
                                        )}
                                    />
                                )}

                                <div className="flex flex-col gap-3 pt-2">
                                    <Controller
                                        control={control}
                                        name="isPreview"
                                        render={({ field }) => (
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-transparent hover:border-border/40 transition-colors">
                                                <Checkbox
                                                    id={field.name}
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    className="h-5 w-5 border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                />
                                                <div className="flex flex-col gap-0.5">
                                                    <label htmlFor={field.name} className="text-sm font-medium text-foreground cursor-pointer select-none">
                                                        Allow Preview
                                                    </label>
                                                    <p className="text-xs text-muted-foreground">
                                                        Students can view this lesson without purchasing content
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    />

                                    <Controller
                                        control={control}
                                        name="isUnlocked"
                                        render={({ field }) => (
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-transparent hover:border-border/40 transition-colors">
                                                <Checkbox
                                                    id={field.name}
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    className="h-5 w-5 border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                />
                                                <div className="flex flex-col gap-0.5">
                                                    <label htmlFor={field.name} className="text-sm font-medium text-foreground cursor-pointer select-none">
                                                        Unlocked by Default
                                                    </label>
                                                    <p className="text-xs text-muted-foreground">
                                                        Lesson is available immediately upon enrollment
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    <SheetFooter className="flex-shrink-0 px-6 py-4 border-t border-border/40 bg-muted/5 backdrop-blur-sm flex-row gap-3">
                        <div className="flex items-center justify-between w-full gap-3">
                            <p className="text-xs text-muted-foreground">
                                <span className="text-destructive">*</span> Required fields
                            </p>
                            <div className="flex items-center gap-3">
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
                                    disabled={uploading || !isDirty}
                                    className="rounded-xl h-11 px-8 bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform font-medium"
                                >
                                    {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {uploading ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </div>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
