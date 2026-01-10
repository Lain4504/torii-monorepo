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
import { Loader2, Video, FileText, ClipboardList, BookOpen, Box, LayoutDashboard, CloudUpload, Lock, Eye, FileType, Save } from 'lucide-react';

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
            toast.success('Unit Reconfigured', {
                description: `Modifications to ${data.title ?? lesson.title} applied globally.`,
            });
            onOpenChange(false);
            setVideoFile(null);
        } catch (error: any) {
            toast.error('Update Failed', {
                description: error.response?.data?.error || error.message,
            });
        } finally {
            setUploading(false);
        }
    };

    if (!lesson) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:w-[800px] sm:max-w-[800px] max-h-screen flex flex-col p-0 gap-0 border-l border-border/10 shadow-2xl bg-background/80 backdrop-blur-3xl overflow-hidden [&>button]:top-6 [&>button]:right-6 [&>button]:bg-background/20 [&>button]:rounded-xl [&>button]:w-10 [&>button]:h-10">

                {/* Header Section with Ambient Glow */}
                <SheetHeader className="px-8 py-8 border-b border-border/10 relative overflow-hidden flex-shrink-0">
                    <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-50" />
                    <div className="relative z-10 space-y-2">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-lg shadow-primary/5">
                                <Box className="size-5" />
                            </div>
                            <div className="space-y-0.5">
                                <SheetTitle className="text-2xl font-black uppercase tracking-tight italic">
                                    Edit <span className="text-primary not-italic">Unit</span>
                                </SheetTitle>
                                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                    Modification Target: {lesson.id.substring(0, 8)}...
                                </p>
                            </div>
                        </div>
                        <SheetDescription className="text-sm font-medium text-muted-foreground/80 leading-relaxed max-w-md">
                            Modify unit configuration, update assets, or adjust access protocols.
                        </SheetDescription>
                    </div>
                </SheetHeader>

                <form onSubmit={handleSubmit(onSubmitForm)} className="flex flex-col h-full overflow-hidden">
                    <ScrollArea className="flex-1 min-h-0">
                        <div className="px-8 py-8 space-y-8">
                            {/* Basic Info */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 pb-2 border-b border-border/10">
                                    <LayoutDashboard className="size-4 text-primary opacity-60" />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                                        Core Specifications
                                    </h3>
                                </div>

                                <Controller
                                    control={control}
                                    name="title"
                                    render={({ field, fieldState }) => (
                                        <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name} className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">
                                                Unit Designation
                                            </FieldLabel>
                                            <Input
                                                id={field.name}
                                                {...field}
                                                placeholder="ENTER UNIT TITLE..."
                                                className="h-14 pl-4 rounded-2xl border-border/20 bg-background/50 hover:bg-background/80 focus-visible:ring-primary/20 transition-all font-bold text-base"
                                                aria-invalid={fieldState.invalid}
                                            />
                                            <FieldError errors={[fieldState.error]} className="text-[10px] font-bold uppercase tracking-wider text-red-500 ml-1" />
                                        </Field>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-6">
                                    <Controller
                                        control={control}
                                        name="contentType"
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name} className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">
                                                    Format Type
                                                </FieldLabel>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={(value) => field.onChange(value as LessonContentType)}
                                                >
                                                    <SelectTrigger id={field.name} className="h-14 rounded-2xl border-border/20 bg-background/50 hover:bg-background/80 transition-all font-bold">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="border-border/20 shadow-2xl bg-background/80 backdrop-blur-3xl rounded-[1.5rem] p-2">
                                                        <SelectItem value={LessonContentType.VIDEO} className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer focus:bg-primary/5 focus:text-primary">
                                                            <div className="flex items-center gap-3">
                                                                <Video className="h-4 w-4 opacity-50" />
                                                                Video Stream
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value={LessonContentType.ARTICLE} className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer focus:bg-primary/5 focus:text-primary">
                                                            <div className="flex items-center gap-3">
                                                                <FileText className="h-4 w-4 opacity-50" />
                                                                Text Article
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value={LessonContentType.QUIZ} className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer focus:bg-primary/5 focus:text-primary">
                                                            <div className="flex items-center gap-3">
                                                                <ClipboardList className="h-4 w-4 opacity-50" />
                                                                Quiz Assessment
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value={LessonContentType.ASSIGNMENT} className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer focus:bg-primary/5 focus:text-primary">
                                                            <div className="flex items-center gap-3">
                                                                <BookOpen className="h-4 w-4 opacity-50" />
                                                                Assignment Task
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
                                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name} className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">
                                                    Sequence
                                                </FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                                    className="h-14 rounded-2xl border-border/20 bg-background/50 hover:bg-background/80 focus-visible:ring-primary/20 transition-all font-mono font-bold"
                                                />
                                            </Field>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Content Specifics */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 pb-2 border-b border-border/10">
                                    <FileType className="size-4 text-primary opacity-60" />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                                        Asset Configuration
                                    </h3>
                                </div>

                                {watch('contentType') === LessonContentType.VIDEO && (
                                    <div className="space-y-3 p-6 rounded-3xl bg-muted/5 border border-border/10">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-2">
                                                <CloudUpload className="size-3" />
                                                Media Update
                                            </label>
                                            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50">Override Existing</span>
                                        </div>
                                        <div className="relative group/upload">
                                            <div className="absolute inset-0 bg-primary/5 rounded-2xl opacity-0 group-hover/upload:opacity-100 transition-opacity pointer-events-none" />
                                            <Input
                                                id="video-file"
                                                type="file"
                                                accept="video/*"
                                                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                                className="h-20 border-2 border-dashed border-border/20 bg-background/50 file:bg-primary/10 file:text-primary file:border-0 file:rounded-xl file:mr-4 file:px-6 file:h-12 file:font-bold file:uppercase file:text-[10px] file:tracking-widest cursor-pointer rounded-2xl transition-all pt-3 pl-4 text-xs font-medium text-muted-foreground hover:border-primary/30"
                                            />
                                        </div>
                                        {lesson.videoUrl && (
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                                                <div className="p-1.5 rounded-lg bg-primary/20 text-primary">
                                                    <Video className="size-3" />
                                                </div>
                                                <div className="flex flex-col gap-0.5 min-w-0">
                                                    <span className="text-[10px] font-bold uppercase tracking-wide text-primary/80">Active Protocol</span>
                                                    <span className="text-[10px] font-medium text-muted-foreground truncate font-mono">{lesson.videoUrl}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {watch('contentType') === LessonContentType.ARTICLE && (
                                    <Controller
                                        control={control}
                                        name="articleContent"
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name} className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">
                                                    Text Content
                                                </FieldLabel>
                                                <Textarea
                                                    id={field.name}
                                                    {...field}
                                                    value={field.value || ''}
                                                    placeholder="HTML OR MARKDOWN CONTENT..."
                                                    className="min-h-[240px] p-6 rounded-3xl border-border/20 bg-background/50 hover:bg-background/80 focus-visible:ring-primary/20 transition-all resize-none font-mono text-xs leading-relaxed"
                                                    aria-invalid={fieldState.invalid}
                                                />
                                                <FieldError errors={[fieldState.error]} className="text-[10px] font-bold uppercase tracking-wider text-red-500 ml-1" />
                                            </Field>
                                        )}
                                    />
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Controller
                                        control={control}
                                        name="isPreview"
                                        render={({ field }) => (
                                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/5 border border-border/10 hover:border-primary/20 hover:bg-muted/10 transition-all cursor-pointer group/check" onClick={() => field.onChange(!field.value)}>
                                                <div className="p-2 rounded-xl bg-background border border-border/20 group-hover/check:border-primary/40 transition-colors">
                                                    <Checkbox
                                                        id={field.name}
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        className="h-5 w-5 border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded-md"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label htmlFor={field.name} className="text-[11px] font-black uppercase tracking-wider text-foreground cursor-pointer select-none flex items-center gap-2">
                                                        <Eye className="size-3 opacity-50" />
                                                        Public Preview
                                                    </label>
                                                    <p className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
                                                        Accessible without enrollment
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    />

                                    <Controller
                                        control={control}
                                        name="isUnlocked"
                                        render={({ field }) => (
                                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/5 border border-border/10 hover:border-primary/20 hover:bg-muted/10 transition-all cursor-pointer group/check" onClick={() => field.onChange(!field.value)}>
                                                <div className="p-2 rounded-xl bg-background border border-border/20 group-hover/check:border-primary/40 transition-colors">
                                                    <Checkbox
                                                        id={field.name}
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        className="h-5 w-5 border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded-md"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label htmlFor={field.name} className="text-[11px] font-black uppercase tracking-wider text-foreground cursor-pointer select-none flex items-center gap-2">
                                                        <Lock className="size-3 opacity-50" />
                                                        Open Access
                                                    </label>
                                                    <p className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
                                                        Unlocked upon enrollment
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    <SheetFooter className="px-8 py-6 border-t border-border/10 bg-muted/5 flex-shrink-0">
                        <div className="flex w-full gap-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                className="flex-1 h-12 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-muted/10 border border-transparent hover:border-border/10"
                            >
                                Discard Changes
                            </Button>
                            <Button
                                type="submit"
                                disabled={uploading || !isDirty}
                                className="flex-[2] h-12 rounded-xl text-[11px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Syncing Changes...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Commit Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
