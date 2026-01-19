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
import { Loader2, Plus, Video, FileText, ClipboardList, BookOpen, LayoutDashboard, CloudUpload, Lock, Eye, BookMarked, FileType } from 'lucide-react';

const createLessonSchema = lessonCreateDTOSchema;

type CreateLessonFormData = z.input<typeof createLessonSchema>;

interface CreateLessonDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    moduleId: string;
}

export function CreateLessonSheet({ open, onOpenChange, moduleId }: CreateLessonDialogProps) {
    const createLesson = useCreateLesson();
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const {
        control,
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
                status: (data as any).status ?? 'draft',
                orderIndex: data.orderIndex ?? 0,
                aiMetadata: (data as any).aiMetadata ?? {},
                isPreview: data.isPreview ?? false,
                isUnlocked: data.isUnlocked ?? false,
                videoUrl,
            };

            await createLesson.mutateAsync(payload);
            toast.success('Unit Created', {
                description: `${data.title} successfully added to module.`,
            });
            handleClose();
        } catch (error: any) {
            toast.error('Creation Failed', {
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
            <SheetContent className="w-full sm:w-[800px] sm:max-w-[800px] max-h-screen flex flex-col p-0 gap-0 border-l border-border/50 shadow-2xl bg-background overflow-hidden [&>button]:top-6 [&>button]:right-6 [&>button]:bg-background/20 [&>button]:rounded-xl [&>button]:w-10 [&>button]:h-10">
                <SheetHeader className="px-6 py-6 border-b border-border/10 relative overflow-hidden flex-shrink-0">
                    <div className="relative z-10 space-y-2">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                                <BookMarked className="size-4" />
                            </div>
                            <div className="space-y-0.5">
                                <SheetTitle className="text-xl font-semibold tracking-tight">
                                    Create Unit
                                </SheetTitle>
                                <p className="text-xs font-medium text-muted-foreground/60">
                                    Target Module: {moduleId.substring(0, 8)}...
                                </p>
                            </div>
                        </div>
                        <SheetDescription className="text-sm text-muted-foreground leading-relaxed">
                            Create a new learning unit and configure its content.
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
                                    <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Details
                                    </h3>
                                </div>

                                <Controller
                                    control={control}
                                    name="title"
                                    render={({ field, fieldState }) => (
                                        <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name} className="text-xs font-medium text-muted-foreground ml-1">
                                                Title
                                            </FieldLabel>
                                            <Input
                                                id={field.name}
                                                {...field}
                                                placeholder="e.g. Introduction to Particles"
                                                className="h-12 pl-4 rounded-xl border-border/20 bg-muted/20 hover:bg-muted/30 focus-visible:ring-primary/20 transition-all font-medium text-sm"
                                                aria-invalid={fieldState.invalid}
                                            />
                                            <FieldError errors={[fieldState.error]} className="text-xs font-medium text-red-500 ml-1" />
                                        </Field>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-6">
                                    <Controller
                                        control={control}
                                        name="contentType"
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name} className="text-xs font-medium text-muted-foreground ml-1">
                                                    Type
                                                </FieldLabel>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={(value) => field.onChange(value as LessonContentType)}
                                                >
                                                    <SelectTrigger id={field.name} className="h-12 rounded-xl border-border/20 bg-muted/20 hover:bg-muted/30 transition-all font-medium text-sm">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="border-border/20 shadow-xl bg-background/95 backdrop-blur-xl rounded-xl p-1">
                                                        <SelectItem value={LessonContentType.VIDEO} className="rounded-lg px-3 py-2.5 text-xs font-medium cursor-pointer focus:bg-primary/10 focus:text-primary">
                                                            <div className="flex items-center gap-2">
                                                                <Video className="h-3.5 w-3.5 opacity-70" />
                                                                Video
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value={LessonContentType.ARTICLE} className="rounded-lg px-3 py-2.5 text-xs font-medium cursor-pointer focus:bg-primary/10 focus:text-primary">
                                                            <div className="flex items-center gap-2">
                                                                <FileText className="h-3.5 w-3.5 opacity-70" />
                                                                Article
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value={LessonContentType.QUIZ} className="rounded-lg px-3 py-2.5 text-xs font-medium cursor-pointer focus:bg-primary/10 focus:text-primary">
                                                            <div className="flex items-center gap-2">
                                                                <ClipboardList className="h-3.5 w-3.5 opacity-70" />
                                                                Quiz
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value={LessonContentType.ASSIGNMENT} className="rounded-lg px-3 py-2.5 text-xs font-medium cursor-pointer focus:bg-primary/10 focus:text-primary">
                                                            <div className="flex items-center gap-2">
                                                                <BookOpen className="h-3.5 w-3.5 opacity-70" />
                                                                Assignment
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
                                                <FieldLabel htmlFor={field.name} className="text-xs font-medium text-muted-foreground ml-1">
                                                    Index
                                                </FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                                    className="h-12 rounded-xl border-border/20 bg-muted/20 hover:bg-muted/30 focus-visible:ring-primary/20 transition-all font-mono font-medium text-sm"
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
                                    <div className="space-y-3 p-6 rounded-2xl bg-muted/5 border border-border/10">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                                                <CloudUpload className="size-3.5" />
                                                Video Upload
                                            </label>
                                            <span className="text-[10px] font-medium text-muted-foreground/50">MP4, WebM • Max 50MB</span>
                                        </div>
                                        <div className="relative group/upload">
                                            <div className="absolute inset-0 bg-primary/5 rounded-xl opacity-0 group-hover/upload:opacity-100 transition-opacity pointer-events-none" />
                                            <Input
                                                type="file"
                                                accept="video/*"
                                                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                                className="h-16 border border-dashed border-border/20 bg-background/50 file:bg-primary/10 file:text-primary file:border-0 file:rounded-lg file:mr-4 file:px-4 file:h-10 file:font-medium file:text-xs cursor-pointer rounded-xl transition-all pt-2.5 pl-4 text-xs font-medium text-muted-foreground hover:border-primary/30"
                                            />
                                        </div>
                                    </div>
                                )}

                                {watch('contentType') === LessonContentType.ARTICLE && (
                                    <Controller
                                        control={control}
                                        name="articleContent"
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name} className="text-xs font-medium text-muted-foreground ml-1">
                                                    Content
                                                </FieldLabel>
                                                <Textarea
                                                    id={field.name}
                                                    {...field}
                                                    placeholder="Markdown or HTML content..."
                                                    className="min-h-[200px] p-4 rounded-xl border-border/20 bg-muted/20 hover:bg-muted/30 focus-visible:ring-primary/20 transition-all resize-none font-mono text-xs leading-relaxed"
                                                    aria-invalid={fieldState.invalid}
                                                />
                                                <FieldError errors={[fieldState.error]} className="text-xs font-medium text-red-500 ml-1" />
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
                                                    <label htmlFor={field.name} className="text-xs font-medium text-foreground cursor-pointer select-none flex items-center gap-2">
                                                        <Eye className="size-3.5 opacity-50" />
                                                        Public Preview
                                                    </label>
                                                    <p className="text-[10px] text-muted-foreground/60">
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
                                                    <label htmlFor={field.name} className="text-xs font-medium text-foreground cursor-pointer select-none flex items-center gap-2">
                                                        <Lock className="size-3.5 opacity-50" />
                                                        Open Access
                                                    </label>
                                                    <p className="text-[10px] text-muted-foreground/60">
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

                    <SheetFooter className="px-6 py-6 border-t border-border/10 bg-background flex-shrink-0">
                        <div className="flex w-full gap-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleClose}
                                className="flex-1 h-12 rounded-xl text-xs font-medium uppercase tracking-wider hover:bg-muted/10 border border-transparent hover:border-border/10"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={uploading || !isDirty}
                                className="flex-[2] h-12 rounded-xl text-xs font-medium uppercase tracking-wider bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Unit
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
