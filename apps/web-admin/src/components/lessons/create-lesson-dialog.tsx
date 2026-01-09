import { useState } from 'react';
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
import { storageApi } from '@/api/services/storage-api.ts';
import { LessonContentType, lessonCreateDTOSchema } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';
import { useCreateLesson } from "@/api/services/lesson";
import { Loader2, Plus, Video, FileText, ClipboardList, BookOpen, Sparkles } from 'lucide-react';

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
        register,
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
            orderIndex: 0,
            isPreview: false,
            isUnlocked: false,
            aiMetadata: {},
        },
    });

    const onSubmitForm = async (data: CreateLessonFormData) => {
        setUploading(true);
        try {
            let videoUrl = data.videoUrl;

            if (videoFile) {
                const uploadedVideo = await storageApi.uploadFile(videoFile, 'lesson-videos');
                videoUrl = uploadedVideo.fileUrl;
            }

            const payload = {
                ...data,
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
            handleClose();
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
        <Sheet open={open} onOpenChange={handleClose}>
            <SheetContent className="w-full sm:w-[600px] max-h-screen flex flex-col p-0 gap-0 border-l border-border/40 shadow-2xl bg-background/95 backdrop-blur-md overflow-hidden">
                <SheetHeader className="px-6 py-6 border-b border-border/40 bg-muted/5 space-y-1">
                    <SheetTitle className="text-xl font-bold flex items-center gap-2">
                        <Plus className="h-5 w-5 text-primary" />
                        Add New Lesson
                    </SheetTitle>
                    <SheetDescription className="text-sm text-muted-foreground">
                        Create a new lesson for your module. Add content like video, article, or quiz.
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
                                                placeholder="e.g., Introduction to Hiragana"
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
                                                type="file"
                                                accept="video/*"
                                                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                                className="h-11 border-none bg-muted/30 hover:bg-muted/50 file:bg-primary/10 file:text-primary file:border-0 file:rounded-lg file:mr-4 file:px-4 file:h-full cursor-pointer rounded-xl transition-all pt-1.5 pl-2"
                                            />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground ml-1">
                                            Supported formats: MP4, WebM. Max size: 50MB.
                                        </p>
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

                            {/* AI & Metadata */}
                            <div className="space-y-4 pt-4 border-t border-border/40">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-2">
                                    <Sparkles className="h-3 w-3 text-primary" />
                                    AI & Data
                                </h3>

                                <Field>
                                    <FieldLabel htmlFor="aiSummary" className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">
                                        AI Summary
                                    </FieldLabel>
                                    <Textarea
                                        id="aiSummary"
                                        {...register('aiMetadata.summary')}
                                        placeholder="Summary for AI agents (optional)"
                                        rows={3}
                                        className="border-none bg-muted/30 hover:bg-muted/50 focus:ring-1 focus:ring-primary/20 rounded-xl transition-all resize-none"
                                    />
                                    <p className="text-[10px] text-muted-foreground ml-1 mt-1">
                                        Used by AI agents to understand the lesson content.
                                    </p>
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="aiKeywords" className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">
                                        Keywords / Tags
                                    </FieldLabel>
                                    <Input
                                        id="aiKeywords"
                                        {...register('aiMetadata.keywords')}
                                        placeholder="e.g. grammar, syntax, particles (comma separated)"
                                        className="h-11 border-none bg-muted/30 hover:bg-muted/50 focus:ring-1 focus:ring-primary/20 rounded-xl transition-all"
                                    />
                                </Field>
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
                                    onClick={handleClose}
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
                                    {uploading ? 'Creating...' : 'Create Lesson'}
                                </Button>
                            </div>
                        </div>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
