import { useState, useEffect } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Separator } from '@workspace/ui/components/separator';
import { Badge } from '@workspace/ui/components/badge';
import {
    Field,
    FieldLabel,
    FieldError,
} from '@workspace/ui/components/field';
import { BookOpen, Users, Calendar, Layers, Save, BrainCircuit, Database, Film, UploadCloud, X } from 'lucide-react';
import type { CourseResponseDTO } from '@workspace/schemas';
import { courseUpdateDTOSchema, type CourseUpdateDTO, JlptLevel } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';
import { useUpdateCourse } from "@/api/services/courses.ts";
import { storageApi } from '@/api/services/storage-api.ts';
import { useNavigate } from 'react-router-dom';
import { cn } from '@workspace/ui/lib/utils';
import { Loader2 } from 'lucide-react';

type UpdateCourseFormData = CourseUpdateDTO;

interface EditCourseSheetProps {
    course: CourseResponseDTO | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditCourseSheet({ course, open, onOpenChange }: EditCourseSheetProps) {
    const navigate = useNavigate();
    const updateCourse = useUpdateCourse();
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { isDirty },
    } = useForm<UpdateCourseFormData>({
        resolver: zodResolver(courseUpdateDTOSchema),
        defaultValues: {
            title: '',
            description: '',
            price: 0,
            shortDescription: '',
            discountPrice: 0,
            jlptLevel: undefined,
            type: 'vod',
            aiMetadata: {},
            tags: [],
            durationWeeks: undefined,
            isFree: false,
            learningOutcomes: [],
            requirements: [],
        },
    });

    // Reset form when course changes
    useEffect(() => {
        if (course) {
            reset({
                title: course.title,
                description: course.description || '',
                price: Number(course.price),
                jlptLevel: course.jlptLevel as JlptLevel,
                shortDescription: course.shortDescription || '',
                discountPrice: course.discountPrice ? Number(course.discountPrice) : 0,
                type: course.type,
                aiMetadata: course.aiMetadata || {},
                tags: course.tags || [],
                durationWeeks: course.durationWeeks ?? undefined,
                isFree: course.isFree ?? false,
                learningOutcomes: Array.isArray(course.learningOutcomes) ? course.learningOutcomes : [],
                requirements: Array.isArray(course.requirements) ? course.requirements : [],
            });
            setThumbnailFile(null);
            setVideoFile(null);
        }
    }, [course, reset]);

    const handleFileUpload = async (file: File, module: string) => {
        try {
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
        } catch (error) {
            console.error('Upload failed:', error);
            throw error;
        }
    };

    const onSubmitForm = async (data: UpdateCourseFormData) => {
        if (!course) return;

        setUploading(true);
        try {
            let thumbnailUrl = course.thumbnailUrl;
            let previewVideoUrl = course.previewVideoUrl;

            if (thumbnailFile) {
                thumbnailUrl = await handleFileUpload(thumbnailFile, 'course-thumbnails');
            }
            if (videoFile) {
                previewVideoUrl = await handleFileUpload(videoFile, 'course-videos');
            }

            const updateData = {
                ...data,
                thumbnailUrl,
                previewVideoUrl,
            };

            await updateCourse.mutateAsync({ id: course.id, course: updateData });
            toast.success('Course Updated', {
                description: `Details for ${data.title} successfully updated.`,
            });
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Update Failed', {
                description: error.response?.data?.error || error.message,
            });
        } finally {
            setUploading(false);
        }
    };

    const handleManageCurriculum = () => {
        if (course) {
            onOpenChange(false);
            navigate(`/courses/${course.id}`);
        }
    };

    if (!course) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[800px] flex flex-col p-0 gap-0 border-l border-border/10 shadow-2xl bg-background/95 backdrop-blur-xl overflow-hidden">
                <SheetHeader className="px-8 py-6 border-b border-border/10 relative overflow-hidden">
                    <div className="relative flex items-center justify-between z-10">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
                                <BookOpen className="h-5 w-5" />
                            </div>
                            <div className="space-y-0.5">
                                <SheetTitle className="text-xl font-semibold tracking-tight text-foreground">
                                    Edit Course
                                </SheetTitle>
                                <SheetDescription className="text-xs font-medium text-muted-foreground/60 leading-relaxed">
                                    Update curriculum and metadata configuration.
                                </SheetDescription>
                            </div>
                        </div>
                        <Badge
                            variant="secondary"
                            className={cn(
                                "px-2.5 py-0.5 rounded-full text-[10px] font-medium border uppercase tracking-wider",
                                course.status === 'published'
                                    ? "border-emerald-500/20 text-emerald-600 bg-emerald-500/10"
                                    : "border-muted-foreground/20 text-muted-foreground bg-muted/30"
                            )}>
                            {course.status}
                        </Badge>
                    </div>
                </SheetHeader>

                <form onSubmit={handleSubmit(onSubmitForm)} className="flex flex-col flex-1 min-h-0 overflow-hidden relative z-10">
                    <ScrollArea className="flex-1 min-h-0">
                        <div className="px-8 py-10 space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
                            {/* Key Metrics */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-muted/10 border border-border/5 transition-all">
                                    <div className="flex items-center gap-2.5 text-muted-foreground/60 mb-2">
                                        <Users className="h-3.5 w-3.5" />
                                        <span className="text-[10px] font-medium uppercase tracking-wider">Active Students</span>
                                    </div>
                                    <div className="text-2xl font-semibold text-foreground tracking-tight">
                                        {course.totalStudents || 0}
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-muted/10 border border-border/5 transition-all">
                                    <div className="flex items-center gap-2.5 text-muted-foreground/60 mb-2">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span className="text-[10px] font-medium uppercase tracking-wider">Last Modified</span>
                                    </div>
                                    <div className="text-lg font-medium text-foreground tracking-tight">
                                        {new Date(course.updatedAt).toLocaleDateString(undefined, {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-border/20" />

                            {/* Form Fields */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 pb-2 border-b border-border/20">
                                    <div className="h-px flex-1 bg-border/20" />
                                    <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/50 text-center">
                                        Basic Information
                                    </h3>
                                    <div className="h-px flex-1 bg-border/20" />
                                </div>

                                <Controller
                                    control={control}
                                    name="title"
                                    render={({ field, fieldState }) => (
                                        <Field className="space-y-1.5" data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name} className="text-xs font-medium text-muted-foreground/80 ml-1">Title</FieldLabel>
                                            <Input
                                                id={field.name}
                                                {...field}
                                                placeholder="Enter course title"
                                                className="h-10 px-4 rounded-xl border-border/20 bg-muted/20 hover:bg-muted/30 focus-visible:ring-primary/20 transition-all font-medium text-sm"
                                                aria-invalid={fieldState.invalid}
                                            />
                                            <FieldError errors={[fieldState.error]} className="text-xs font-medium text-rose-500 pl-2" />
                                        </Field>
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="description"
                                    render={({ field, fieldState }) => (
                                        <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name} className="text-xs font-medium text-muted-foreground ml-1">Description</FieldLabel>
                                            <Textarea
                                                id={field.name}
                                                {...field}
                                                placeholder="Enter detailed course description..."
                                                className="min-h-[120px] rounded-xl bg-muted/20 border-border/20 hover:bg-muted/30 focus-visible:ring-primary/20 text-sm font-medium placeholder:text-muted-foreground/30 transition-all resize-none p-4"
                                                aria-invalid={fieldState.invalid}
                                            />
                                            <FieldError errors={[fieldState.error]} className="text-xs font-medium text-rose-500 pl-2" />
                                        </Field>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-6">
                                    <Controller
                                        control={control}
                                        name="price"
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name} className="text-xs font-medium text-muted-foreground ml-1">Price (USD)</FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                                    placeholder="0.00"
                                                    className="h-12 px-4 rounded-xl bg-muted/20 border-border/20 hover:bg-muted/30 focus-visible:ring-primary/20 text-sm font-medium placeholder:text-muted-foreground/30 transition-all font-mono"
                                                    aria-invalid={fieldState.invalid}
                                                />
                                                <FieldError errors={[fieldState.error]} className="text-xs font-medium text-rose-500 pl-2" />
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        control={control}
                                        name="jlptLevel"
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name} className="text-xs font-medium text-muted-foreground ml-1">JLPT Level</FieldLabel>
                                                <Select value={field.value || ''} onValueChange={field.onChange}>
                                                    <SelectTrigger id={field.name} className="h-10 px-4 rounded-xl border-border/20 bg-muted/20 hover:bg-muted/30 focus:ring-primary/20 transition-all font-medium text-sm" aria-invalid={fieldState.invalid}>
                                                        <SelectValue placeholder="Select Level" />
                                                    </SelectTrigger>
                                                    <SelectContent className="border-border/10 shadow-xl bg-background/95 backdrop-blur-3xl rounded-xl overflow-hidden p-1">
                                                        {Object.values(JlptLevel).map((level) => (
                                                            <SelectItem key={level} value={level} className="rounded-lg cursor-pointer text-xs font-medium focus:bg-primary/10 focus:text-primary py-2.5">{level}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FieldError errors={[fieldState.error]} className="text-xs font-medium text-rose-500 pl-2" />
                                            </Field>
                                        )}
                                    />
                                </div>

                                <Controller
                                    control={control}
                                    name="shortDescription"
                                    render={({ field, fieldState }) => (
                                        <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name} className="text-xs font-medium text-muted-foreground ml-1">
                                                Short Description
                                            </FieldLabel>
                                            <Textarea
                                                id={field.name}
                                                {...field}
                                                placeholder="Brief summary used for cards..."
                                                className="min-h-[80px] rounded-xl bg-muted/20 border-border/20 hover:bg-muted/30 focus-visible:ring-primary/20 text-sm font-medium placeholder:text-muted-foreground/30 transition-all resize-none p-4"
                                                aria-invalid={fieldState.invalid}
                                            />
                                            <FieldError errors={[fieldState.error]} className="text-xs font-medium text-rose-500 pl-2" />
                                        </Field>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-6">
                                    <Controller
                                        control={control}
                                        name="type"
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name} className="text-xs font-medium text-muted-foreground ml-1">
                                                    Course Type
                                                </FieldLabel>
                                                <Select value={field.value || ''} onValueChange={field.onChange}>
                                                    <SelectTrigger id={field.name} className="h-10 px-4 rounded-xl border-border/20 bg-muted/20 hover:bg-muted/30 focus:ring-primary/20 transition-all font-medium text-sm" aria-invalid={fieldState.invalid}>
                                                        <SelectValue placeholder="Select Type" />
                                                    </SelectTrigger>
                                                    <SelectContent className="border-border/10 shadow-xl bg-background/95 backdrop-blur-3xl rounded-xl overflow-hidden p-1">
                                                        <SelectItem value="vod" className="rounded-lg cursor-pointer text-xs font-medium focus:bg-primary/10 focus:text-primary py-2.5">Video on Demand</SelectItem>
                                                        <SelectItem value="live" className="rounded-lg cursor-pointer text-xs font-medium focus:bg-primary/10 focus:text-primary py-2.5">Live Stream</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FieldError errors={[fieldState.error]} className="text-xs font-medium text-rose-500 pl-2" />
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        control={control}
                                        name="isFree"
                                        render={({ field }) => (
                                            <Field className="space-y-2">
                                                <FieldLabel htmlFor="isFree" className="text-xs font-medium text-muted-foreground ml-1">
                                                    Access Control
                                                </FieldLabel>
                                                <div className="flex items-center gap-3 mt-2 p-3.5 rounded-xl bg-muted/20 border border-border/20 cursor-pointer hover:bg-muted/30 transition-all" onClick={() => field.onChange(!field.value)}>
                                                    <input
                                                        id="isFree"
                                                        type="checkbox"
                                                        checked={!!field.value}
                                                        onChange={(e) => field.onChange(e.target.checked)}
                                                        className="h-4 w-4 rounded border-border/60 text-primary focus:ring-primary/20 cursor-pointer accent-primary"
                                                    />
                                                    <span className="text-sm font-medium text-foreground/80">
                                                        Open Access / Free Course
                                                    </span>
                                                </div>
                                            </Field>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <Controller
                                        control={control}
                                        name="discountPrice"
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name} className="text-xs font-medium text-muted-foreground ml-1">
                                                    Discount Price (USD)
                                                </FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                                    placeholder="0.00"
                                                    className="h-12 px-4 rounded-xl bg-muted/20 border-border/20 hover:bg-muted/30 focus-visible:ring-primary/20 text-sm font-medium placeholder:text-muted-foreground/30 transition-all font-mono"
                                                    aria-invalid={fieldState.invalid}
                                                />
                                                <FieldError errors={[fieldState.error]} className="text-xs font-medium text-rose-500 pl-2" />
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        control={control}
                                        name="durationWeeks"
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name} className="text-xs font-medium text-muted-foreground ml-1">
                                                    Duration (weeks)
                                                </FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                                    placeholder="e.g. 8"
                                                    className="h-10 px-4 rounded-xl border-border/20 bg-muted/20 hover:bg-muted/30 focus-visible:ring-primary/20 transition-all font-mono font-medium text-sm"
                                                    aria-invalid={fieldState.invalid}
                                                />
                                                <FieldError errors={[fieldState.error]} className="text-xs font-medium text-rose-500 pl-2" />
                                            </Field>
                                        )}
                                    />
                                </div>

                                <div className="space-y-6 pt-6">
                                    <div className="flex items-center gap-3 pb-2 border-b border-border/20">
                                        <div className="h-px flex-1 bg-border/20" />
                                        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/50 text-center">
                                            Curriculum Details
                                        </h3>
                                        <div className="h-px flex-1 bg-border/20" />
                                    </div>

                                    <Controller
                                        control={control}
                                        name="tags"
                                        render={({ field }) => (
                                            <Field className="space-y-2">
                                                <FieldLabel htmlFor="tags" className="text-xs font-medium text-muted-foreground ml-1">
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
                                                    placeholder="e.g. JLPT, Grammar, Beginner (comma separated)"
                                                    className="h-12 px-4 rounded-xl bg-muted/20 border-border/20 hover:bg-muted/30 focus-visible:ring-primary/20 text-sm font-medium placeholder:text-muted-foreground/30 transition-all"
                                                />
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        control={control}
                                        name="learningOutcomes"
                                        render={({ field }) => (
                                            <Field className="space-y-2">
                                                <FieldLabel htmlFor="learningOutcomes" className="text-xs font-medium text-muted-foreground ml-1">
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
                                                    placeholder="Enter one outcome per line..."
                                                    rows={4}
                                                    className="rounded-xl bg-muted/20 border-border/20 hover:bg-muted/30 focus-visible:ring-primary/20 text-sm font-medium placeholder:text-muted-foreground/30 transition-all resize-none p-4"
                                                />
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        control={control}
                                        name="requirements"
                                        render={({ field }) => (
                                            <Field className="space-y-2">
                                                <FieldLabel htmlFor="requirements" className="text-xs font-medium text-muted-foreground ml-1">
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
                                                    placeholder="Enter one requirement per line..."
                                                    rows={4}
                                                    className="rounded-xl bg-muted/20 border-border/20 hover:bg-muted/30 focus-visible:ring-primary/20 text-sm font-medium placeholder:text-muted-foreground/30 transition-all resize-none p-4"
                                                />
                                            </Field>
                                        )}
                                    />
                                </div>

                                {/* Media Upload */}
                                <div className="space-y-6 pt-6">
                                    <div className="flex items-center gap-3 pb-2 border-b border-border/20">
                                        <div className="h-px flex-1 bg-border/20" />
                                        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/50 text-center">
                                            Course Media
                                        </h3>
                                        <div className="h-px flex-1 bg-border/20" />
                                    </div>

                                    <Field className="space-y-2">
                                        <FieldLabel htmlFor="thumbnail-upload" className="text-xs font-medium text-muted-foreground ml-1">Thumbnail</FieldLabel>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="relative flex-1">
                                                    <Input
                                                        id="thumbnail-upload"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                                                        className="h-12 px-4 pt-2.5 rounded-xl bg-muted/20 border-border/20 hover:bg-muted/30 focus-visible:ring-primary/20 text-xs font-medium file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-medium file:uppercase file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all"
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

                                            {(thumbnailFile || course.thumbnailUrl) && (
                                                <div className="rounded-2xl overflow-hidden border border-border/40 bg-muted/30 aspect-video relative shadow-sm max-w-xs group">
                                                    <img
                                                        src={thumbnailFile ? URL.createObjectURL(thumbnailFile) : course.thumbnailUrl}
                                                        alt="Thumbnail"
                                                        className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            )}
                                        </div>
                                    </Field>

                                    <Field className="space-y-2">
                                        <FieldLabel htmlFor="video-upload" className="text-xs font-medium text-muted-foreground ml-1">Preview Video</FieldLabel>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="relative flex-1">
                                                    <Input
                                                        id="video-upload"
                                                        type="file"
                                                        accept="video/*"
                                                        onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                                        className="h-12 px-4 pt-2.5 rounded-xl bg-muted/20 border-border/20 hover:bg-muted/30 focus-visible:ring-primary/20 text-xs font-medium file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-medium file:uppercase file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all"
                                                    />
                                                    <Film className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
                                                </div>
                                                {videoFile && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setVideoFile(null)}
                                                        className="h-12 w-12 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>

                                            {(course.previewVideoUrl && !videoFile) && (
                                                <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/20 border border-border/40">
                                                    <Film className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-xs font-bold text-foreground/80">Current Video Attached</span>
                                                </div>
                                            )}
                                            {videoFile && (
                                                <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/20 border border-border/40">
                                                    <Film className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-xs font-bold text-foreground/80">New Video Selected</span>
                                                </div>
                                            )}
                                        </div>
                                    </Field>
                                </div>

                                {/* AI & Metadata */}
                                <div className="space-y-6 pt-6">
                                    <div className="flex items-center gap-3 pb-2 border-b border-border/20">
                                        <div className="h-px flex-1 bg-border/20" />
                                        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/50 text-center flex items-center gap-2">
                                            <BrainCircuit className="h-3 w-3" />
                                            <span>AI Analysis Settings</span>
                                        </h3>
                                        <div className="h-px flex-1 bg-border/20" />
                                    </div>

                                    <Field>
                                        <FieldLabel htmlFor="aiSummary" className="text-xs font-medium text-muted-foreground ml-1">
                                            AI Summary
                                        </FieldLabel>
                                        <Textarea
                                            id="aiSummary"
                                            {...register('aiMetadata.summary')}
                                            placeholder="Summary for AI agents..."
                                            rows={3}
                                            className="rounded-xl bg-muted/20 border-border/20 hover:bg-muted/30 focus-visible:ring-primary/20 text-sm font-medium placeholder:text-muted-foreground/30 transition-all resize-none p-4"
                                        />
                                        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/60 ml-2 mt-1 flex items-center gap-1">
                                            <Database className="h-3 w-3" />
                                            Used by inference engine for content analysis.
                                        </p>
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="aiKeywords" className="text-xs font-medium text-muted-foreground ml-1">
                                            Keywords / Tags
                                        </FieldLabel>
                                        <Input
                                            id="aiKeywords"
                                            {...register('aiMetadata.keywords')}
                                            placeholder="e.g. JLPT, Grammar, N5, Beginner"
                                            className="h-12 px-4 rounded-xl bg-muted/20 border-border/20 hover:bg-muted/20 focus-visible:ring-primary/20 text-sm font-medium placeholder:text-muted-foreground/30 transition-all"
                                        />
                                    </Field>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    <SheetFooter className="flex-shrink-0 px-8 py-6 border-t border-border/10 bg-background/50 backdrop-blur-md flex flex-row items-center justify-between gap-4 relative z-20">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleManageCurriculum}
                            className="flex-1 rounded-xl h-11 bg-muted/10 border border-border/5 text-[10px] font-semibold uppercase tracking-wider hover:bg-muted/20 transition-all text-muted-foreground/80 hover:text-foreground"
                        >
                            <Layers className="mr-2 h-3.5 w-3.5" />
                            Curriculum
                        </Button>
                        <Button
                            type="submit"
                            disabled={uploading || (!isDirty && !thumbnailFile && !videoFile)}
                            className="flex-1 rounded-xl h-11 bg-primary text-primary-foreground text-[10px] font-semibold uppercase tracking-wider shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:-translate-y-0.5 transition-all"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
