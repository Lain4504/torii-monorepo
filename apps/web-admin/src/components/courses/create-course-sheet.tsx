import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import {
    Field,
    FieldLabel,
    FieldError,
} from '@workspace/ui/components/field';
import { Loader2, Image as ImageIcon, Film, BookOpen, X, Sparkles, BrainCircuit, Database, UploadCloud } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';
import { storageApi } from '@/api/services/storage-api.ts';
import { JlptLevel, courseCreateDTOSchema, type CourseCreateDTO } from '@workspace/schemas';
import { useCreateCourse } from "@/api/services/courses.ts";
import { cn } from '@workspace/ui/lib/utils';

interface CreateCourseSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateCourseSheet({ open, onOpenChange }: CreateCourseSheetProps) {
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const createMutation = useCreateCourse();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isDirty },
        reset,
    } = useForm<CourseCreateDTO>({
        resolver: zodResolver(courseCreateDTOSchema) as any,
        defaultValues: {
            title: '',
            description: '',
            shortDescription: '',
            price: 0,
            discountPrice: 0,
            jlptLevel: undefined, // Will be set by user
            thumbnailUrl: undefined,
            previewVideoUrl: undefined,
            type: 'vod', // Default to vod
            isFree: false,
            durationWeeks: undefined,
            tags: [],
            learningOutcomes: [],
            requirements: [],
            aiMetadata: {},
        },
    });

    const handleClose = () => {
        if (!uploading) {
            onOpenChange(false);
            reset();
            setThumbnailFile(null);
            setVideoFile(null);
        }
    };

    const onSubmit = async (data: CourseCreateDTO) => {
        setUploading(true);
        try {
            // Upload thumbnail if provided
            let thumbnailUrl = data.thumbnailUrl;
            if (thumbnailFile) {
                const uploadedThumbnail = await storageApi.uploadFile(thumbnailFile);
                thumbnailUrl = uploadedThumbnail.fileUrl;
            }

            // Upload video if provided
            let previewVideoUrl = data.previewVideoUrl;
            if (videoFile) {
                const uploadedVideo = await storageApi.uploadFile(videoFile);
                previewVideoUrl = uploadedVideo.fileUrl;
            }

            // Create course
            await createMutation.mutateAsync({
                ...data,
                // normalize optional numeric and array fields
                discountPrice: data.discountPrice ?? 0,
                durationWeeks: data.durationWeeks ?? undefined,
                tags: data.tags && data.tags.length ? data.tags : undefined,
                learningOutcomes: data.learningOutcomes && (data.learningOutcomes as any[]).length ? data.learningOutcomes : [],
                requirements: data.requirements && (data.requirements as any[]).length ? data.requirements : [],
                thumbnailUrl,
                previewVideoUrl,
            });

            toast.success('Repository Initialized', {
                description: 'Course structure established. Modules can now be appended.',
            });
            handleClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Initialization Failed');
        } finally {
            setUploading(false);
        }
    };

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Invalid Format', { description: 'Please select an image file.' });
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Oversize Payload', { description: 'Image size should be less than 5MB.' });
                return;
            }
            setThumbnailFile(file);
        }
    };

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('video/')) {
                toast.error('Invalid Format', { description: 'Please select a video file.' });
                return;
            }
            if (file.size > 50 * 1024 * 1024) {
                toast.error('Oversize Payload', { description: 'Video size should be less than 50MB.' });
                return;
            }
            setVideoFile(file);
        }
    };

    return (
        <Sheet open={open} onOpenChange={handleClose}>
            <SheetContent className="w-full sm:w-[900px] sm:max-w-[900px] max-h-screen flex flex-col p-0 gap-0 border-l border-border/20 shadow-2xl bg-background/80 backdrop-blur-3xl overflow-hidden">
                <SheetHeader className="px-8 pt-8 pb-6 border-b border-border/10 bg-muted/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-50 pointer-events-none" />
                    <div className="relative flex items-center gap-4 z-10">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <SheetTitle className="text-2xl font-black uppercase tracking-tight italic">
                                Initialize <span className="text-primary not-italic">Repository</span>
                            </SheetTitle>
                            <SheetDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                                Step 01: Define Course Specifications
                            </SheetDescription>
                        </div>
                        <div className="p-2 bg-background/50 backdrop-blur-md rounded-full border border-border/20 text-muted-foreground">
                            <Sparkles className="size-4 animate-pulse text-primary" />
                        </div>
                    </div>
                </SheetHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden relative z-10">
                    <ScrollArea className="flex-1 overflow-y-auto px-8 py-8">
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">

                            {/* Basic Information */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 pb-2 border-b border-border/20">
                                    <div className="h-px flex-1 bg-border/20" />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-center">
                                        Core Specifications
                                    </h3>
                                    <div className="h-px flex-1 bg-border/20" />
                                </div>

                                <Field>
                                    <FieldLabel htmlFor="title" className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">
                                        Course Title <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="title"
                                        {...register('title')}
                                        placeholder="COURSE DESIGNATION"
                                        className="h-14 px-5 rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus-visible:ring-primary/20 text-sm font-bold placeholder:text-muted-foreground/20 transition-all uppercase"
                                    />
                                    {errors.title && <FieldError className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2">{errors.title.message}</FieldError>}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="description" className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">
                                        Description <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Textarea
                                        id="description"
                                        {...register('description')}
                                        placeholder="DETAILED SYLLABUS AND OBJECTIVES..."
                                        rows={4}
                                        className="rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus-visible:ring-primary/20 text-sm font-bold placeholder:text-muted-foreground/20 transition-all resize-none p-4"
                                    />
                                    {errors.description && <FieldError className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2">{errors.description.message}</FieldError>}
                                </Field>

                                <div className="grid grid-cols-2 gap-6">
                                    <Field>
                                        <FieldLabel htmlFor="price" className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">
                                            Price (USD) <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <Input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            {...register('price', { valueAsNumber: true })}
                                            placeholder="0.00"
                                            className="h-14 px-5 rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus-visible:ring-primary/20 text-sm font-bold placeholder:text-muted-foreground/20 transition-all font-mono"
                                        />
                                        {errors.price && <FieldError className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2">{errors.price.message}</FieldError>}
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="jlptLevel" className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">
                                            JLPT Level
                                        </FieldLabel>
                                        <Controller
                                            name="jlptLevel"
                                            control={control}
                                            render={({ field }) => (
                                                <Select value={field.value || ''} onValueChange={field.onChange}>
                                                    <SelectTrigger id="jlptLevel" className="h-14 px-5 rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus:ring-primary/20 text-sm font-bold uppercase transition-all">
                                                        <SelectValue placeholder="SELECT LEVEL" />
                                                    </SelectTrigger>
                                                    <SelectContent className="border-border/10 shadow-2xl bg-background/95 backdrop-blur-3xl rounded-2xl overflow-hidden p-1">
                                                        {Object.values(JlptLevel).map((level) => (
                                                            <SelectItem key={level} value={level} className="rounded-xl cursor-pointer text-xs font-bold uppercase tracking-wide focus:bg-primary/10 focus:text-primary py-3">
                                                                {level}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.jlptLevel && <FieldError className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2">{errors.jlptLevel.message}</FieldError>}
                                    </Field>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <Field>
                                        <FieldLabel htmlFor="shortDescription" className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">
                                            Short Description
                                        </FieldLabel>
                                        <Textarea
                                            id="shortDescription"
                                            {...register('shortDescription')}
                                            placeholder="BRIEF SUMMARY FOR CARDS..."
                                            rows={3}
                                            className="rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus-visible:ring-primary/20 text-sm font-bold placeholder:text-muted-foreground/20 transition-all resize-none p-4"
                                        />
                                        {errors.shortDescription && <FieldError className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2">{errors.shortDescription.message}</FieldError>}
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="type" className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">
                                            Course Type
                                        </FieldLabel>
                                        <Controller
                                            name="type"
                                            control={control}
                                            render={({ field }) => (
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger id="type" className="h-14 px-5 rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus:ring-primary/20 text-sm font-bold uppercase transition-all">
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                    <SelectContent className="border-border/10 shadow-2xl bg-background/95 backdrop-blur-3xl rounded-2xl overflow-hidden p-1">
                                                        <SelectItem value="vod" className="rounded-xl cursor-pointer text-xs font-bold uppercase tracking-wide focus:bg-primary/10 focus:text-primary py-3">
                                                            Video on demand
                                                        </SelectItem>
                                                        <SelectItem value="live" className="rounded-xl cursor-pointer text-xs font-bold uppercase tracking-wide focus:bg-primary/10 focus:text-primary py-3">
                                                            Live Stream
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </Field>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <Field>
                                        <FieldLabel htmlFor="discountPrice" className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">
                                            Discount Price (USD)
                                        </FieldLabel>
                                        <Input
                                            id="discountPrice"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            {...register('discountPrice', { valueAsNumber: true })}
                                            placeholder="0.00"
                                            className="h-14 px-5 rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus-visible:ring-primary/20 text-sm font-bold placeholder:text-muted-foreground/20 transition-all font-mono"
                                        />
                                        {errors.discountPrice && <FieldError className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2">{errors.discountPrice.message}</FieldError>}
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="durationWeeks" className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">
                                            Duration (weeks)
                                        </FieldLabel>
                                        <Input
                                            id="durationWeeks"
                                            type="number"
                                            min="0"
                                            {...register('durationWeeks', { valueAsNumber: true })}
                                            placeholder="e.g. 8"
                                            className="h-14 px-5 rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus-visible:ring-primary/20 text-sm font-bold placeholder:text-muted-foreground/20 transition-all font-mono"
                                        />
                                    </Field>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <Field>
                                        <FieldLabel htmlFor="isFree" className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">
                                            Access Control
                                        </FieldLabel>
                                        <Controller
                                            name="isFree"
                                            control={control}
                                            render={({ field }) => (
                                                <div className="flex items-center gap-3 mt-2 p-4 rounded-xl bg-muted/5 border border-border/10 cursor-pointer hover:bg-muted/10 transition-all" onClick={() => field.onChange(!field.value)}>
                                                    <input
                                                        id="isFree"
                                                        type="checkbox"
                                                        checked={field.value} // Controlled checked attribute
                                                        onChange={(e) => field.onChange(e.target.checked)}
                                                        className="h-5 w-5 rounded-md border-border/60 text-primary focus:ring-primary/20 cursor-pointer"
                                                    />
                                                    <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
                                                        Open Access / Free Course
                                                    </span>
                                                </div>
                                            )}
                                        />
                                    </Field>
                                </div>

                                <div className="space-y-6 pt-6">
                                    <div className="flex items-center gap-3 pb-2 border-b border-border/20">
                                        <div className="h-px flex-1 bg-border/20" />
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-center">
                                            Curriculum Metadata
                                        </h3>
                                        <div className="h-px flex-1 bg-border/20" />
                                    </div>

                                    <Controller
                                        name="tags"
                                        control={control}
                                        render={({ field }) => (
                                            <Field>
                                                <FieldLabel htmlFor="tags" className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">
                                                    Tags
                                                </FieldLabel>
                                                <Input
                                                    id="tags"
                                                    value={(field.value || []).join(', ')}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value
                                                                .split(',')
                                                                .map((t) => t.trim())
                                                                .filter(Boolean),
                                                        )
                                                    }
                                                    placeholder="JLPT, GRAMMAR, BEGINNER (COMMA SEPARATED)"
                                                    className="h-14 px-5 rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus-visible:ring-primary/20 text-sm font-bold placeholder:text-muted-foreground/20 transition-all uppercase"
                                                />
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        name="learningOutcomes"
                                        control={control}
                                        render={({ field }) => (
                                            <Field>
                                                <FieldLabel htmlFor="learningOutcomes" className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">
                                                    Learning Outcomes
                                                </FieldLabel>
                                                <Textarea
                                                    id="learningOutcomes"
                                                    value={Array.isArray(field.value) ? field.value.join('\n') : ''}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value
                                                                .split('\n')
                                                                .map((line) => line.trim())
                                                                .filter(Boolean),
                                                        )
                                                    }
                                                    placeholder="ONE OUTCOME PER LINE..."
                                                    rows={4}
                                                    className="rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus-visible:ring-primary/20 text-sm font-bold placeholder:text-muted-foreground/20 transition-all resize-none p-4 uppercase"
                                                />
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        name="requirements"
                                        control={control}
                                        render={({ field }) => (
                                            <Field>
                                                <FieldLabel htmlFor="requirements" className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">
                                                    Requirements / Prerequisites
                                                </FieldLabel>
                                                <Textarea
                                                    id="requirements"
                                                    value={Array.isArray(field.value) ? field.value.join('\n') : ''}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value
                                                                .split('\n')
                                                                .map((line) => line.trim())
                                                                .filter(Boolean),
                                                        )
                                                    }
                                                    placeholder="ONE REQUIREMENT PER LINE..."
                                                    rows={4}
                                                    className="rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus-visible:ring-primary/20 text-sm font-bold placeholder:text-muted-foreground/20 transition-all resize-none p-4 uppercase"
                                                />
                                            </Field>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Media Files */}
                            <div className="space-y-6 pt-6">
                                <div className="flex items-center gap-3 pb-2 border-b border-border/20">
                                    <div className="h-px flex-1 bg-border/20" />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-center">
                                        Data Assets (Optional)
                                    </h3>
                                    <div className="h-px flex-1 bg-border/20" />
                                </div>

                                <Field>
                                    <FieldLabel htmlFor="thumbnail" className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">
                                        Thumbnail Image
                                    </FieldLabel>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="relative flex-1">
                                                <Input
                                                    id="thumbnail"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleThumbnailChange}
                                                    className="h-14 px-4 pt-3.5 rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus-visible:ring-primary/20 text-xs font-bold file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all"
                                                />
                                                <UploadCloud className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
                                            </div>
                                            {thumbnailFile && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setThumbnailFile(null)}
                                                    className="h-12 w-12 rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive/20"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                        {thumbnailFile && (
                                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary/5 border border-primary/10">
                                                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                                    <ImageIcon className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-foreground truncate">{thumbnailFile.name}</p>
                                                    <p className="text-[10px] text-muted-foreground font-mono">{(thumbnailFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="video" className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">
                                        Preview Video
                                    </FieldLabel>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="relative flex-1">
                                                <Input
                                                    id="video"
                                                    type="file"
                                                    accept="video/*"
                                                    onChange={handleVideoChange}
                                                    className="h-14 px-4 pt-3.5 rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus-visible:ring-primary/20 text-xs font-bold file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all"
                                                />
                                                <Film className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
                                            </div>
                                            {videoFile && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setVideoFile(null)}
                                                    className="h-12 w-12 rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive/20"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                        {videoFile && (
                                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary/5 border border-primary/10">
                                                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                                    <Film className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-foreground truncate">{videoFile.name}</p>
                                                    <p className="text-[10px] text-muted-foreground font-mono">{(videoFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Field>
                            </div>

                            {/* AI & Metadata */}
                            <div className="space-y-6 pt-6">
                                <div className="flex items-center gap-3 pb-2 border-b border-border/20">
                                    <div className="h-px flex-1 bg-border/20" />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-center flex items-center gap-2">
                                        <BrainCircuit className="h-3 w-3" />
                                        Advanced Neural Parameters
                                    </h3>
                                    <div className="h-px flex-1 bg-border/20" />
                                </div>

                                <Field>
                                    <FieldLabel htmlFor="aiSummary" className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">
                                        AI Summary
                                    </FieldLabel>
                                    <Textarea
                                        id="aiSummary"
                                        {...register('aiMetadata.summary')}
                                        placeholder="SUMMARY FOR AI AGENTS..."
                                        rows={3}
                                        className="rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus-visible:ring-primary/20 text-sm font-bold placeholder:text-muted-foreground/20 transition-all resize-none p-4"
                                    />
                                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/60 ml-2 mt-1 flex items-center gap-1">
                                        <Database className="h-3 w-3" />
                                        Used by inference engine for content analysis.
                                    </p>
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="aiKeywords" className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">
                                        Keywords / Tags
                                    </FieldLabel>
                                    <Input
                                        id="aiKeywords"
                                        {...register('aiMetadata.keywords')}
                                        placeholder="JLPT, GRAMMAR, N5, BEGINNER"
                                        className="h-14 px-5 rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus-visible:ring-primary/20 text-sm font-bold placeholder:text-muted-foreground/20 transition-all uppercase"
                                    />
                                </Field>
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Footer */}
                    <div className="px-8 py-6 bg-background/50 backdrop-blur-xl border-t border-border/10 flex items-center justify-between gap-4 relative z-20">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleClose}
                            disabled={uploading}
                            className="rounded-xl h-12 px-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/20 group"
                        >
                            <X className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
                            Discard
                        </Button>
                        <Button
                            type="submit"
                            disabled={uploading || !isDirty}
                            className="rounded-xl h-12 px-8 bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Initializing...
                                </>
                            ) : (
                                <>
                                    <UploadCloud className="mr-2 h-4 w-4" />
                                    Initialize Course
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
