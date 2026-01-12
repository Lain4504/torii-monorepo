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
            toast.success('Course Re-calibrated', {
                description: `Parameters for ${data.title} successfully updated.`,
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
            <SheetContent className="w-full sm:w-[900px] sm:max-w-[900px] max-h-screen flex flex-col p-0 gap-0 border-l border-border/20 shadow-2xl bg-background/80 backdrop-blur-3xl overflow-hidden">
                <SheetHeader className="px-8 pt-8 pb-6 border-b border-border/10 bg-muted/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-50 pointer-events-none" />
                    <div className="relative flex items-center justify-between z-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                                <SheetTitle className="text-2xl font-black uppercase tracking-tight italic">
                                    Modify <span className="text-primary not-italic">Repository</span>
                                </SheetTitle>
                                <SheetDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                                    ID: <span className="font-mono text-primary">{course.id.substring(0, 8)}</span>
                                </SheetDescription>
                            </div>
                        </div>
                        <Badge
                            variant="outline"
                            className={cn(
                                "px-3 py-1.5 uppercase tracking-widest text-[10px] font-black border-2",
                                course.status === 'published'
                                    ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/10"
                                    : "border-muted-foreground/20 text-muted-foreground bg-muted/10"
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
                                <div className="p-5 rounded-3xl bg-muted/5 border border-border/10 hover:border-primary/20 hover:bg-muted/10 transition-all group">
                                    <div className="flex items-center gap-3 text-muted-foreground mb-3">
                                        <div className="p-2 rounded-xl bg-background/50 text-primary border border-border/10">
                                            <Users className="h-4 w-4" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Active Users</span>
                                    </div>
                                    <div className="text-4xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
                                        {course.totalStudents || 0}
                                    </div>
                                </div>
                                <div className="p-5 rounded-3xl bg-muted/5 border border-border/10 hover:border-primary/20 hover:bg-muted/10 transition-all group">
                                    <div className="flex items-center gap-3 text-muted-foreground mb-3">
                                        <div className="p-2 rounded-xl bg-background/50 text-blue-500 border border-border/10">
                                            <Calendar className="h-4 w-4" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Last Updated</span>
                                    </div>
                                    <div className="text-xl font-bold text-foreground font-mono tracking-tight group-hover:text-blue-500 transition-colors pt-2">
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
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-center">
                                        Core Specifications
                                    </h3>
                                    <div className="h-px flex-1 bg-border/20" />
                                </div>

                                <Controller
                                    control={control}
                                    name="title"
                                    render={({ field, fieldState }) => (
                                        <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name} className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">Title</FieldLabel>
                                            <Input
                                                id={field.name}
                                                {...field}
                                                placeholder="COURSE DESIGNATION"
                                                className="h-14 px-5 rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus-visible:ring-primary/20 text-sm font-bold placeholder:text-muted-foreground/20 transition-all uppercase"
                                                aria-invalid={fieldState.invalid}
                                            />
                                            <FieldError errors={[fieldState.error]} className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2" />
                                        </Field>
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="description"
                                    render={({ field, fieldState }) => (
                                        <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name} className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">Description</FieldLabel>
                                            <Textarea
                                                id={field.name}
                                                {...field}
                                                placeholder="DETAILED SYLLABUS AND OBJECTIVES..."
                                                className="min-h-[120px] rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus-visible:ring-primary/20 text-sm font-bold placeholder:text-muted-foreground/20 transition-all resize-none p-4"
                                                aria-invalid={fieldState.invalid}
                                            />
                                            <FieldError errors={[fieldState.error]} className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2" />
                                        </Field>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-6">
                                    <Controller
                                        control={control}
                                        name="price"
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name} className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">Price (USD)</FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                                    placeholder="0.00"
                                                    className="h-14 px-5 rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus-visible:ring-primary/20 text-sm font-bold placeholder:text-muted-foreground/20 transition-all font-mono"
                                                    aria-invalid={fieldState.invalid}
                                                />
                                                <FieldError errors={[fieldState.error]} className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2" />
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        control={control}
                                        name="jlptLevel"
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name} className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">JLPT Level</FieldLabel>
                                                <Select value={field.value || ''} onValueChange={field.onChange}>
                                                    <SelectTrigger id={field.name} className="h-14 px-5 rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus:ring-primary/20 text-sm font-bold uppercase transition-all" aria-invalid={fieldState.invalid}>
                                                        <SelectValue placeholder="SELECT LEVEL" />
                                                    </SelectTrigger>
                                                    <SelectContent className="border-border/10 shadow-2xl bg-background/95 backdrop-blur-3xl rounded-2xl overflow-hidden p-1">
                                                        {Object.values(JlptLevel).map((level) => (
                                                            <SelectItem key={level} value={level} className="rounded-xl cursor-pointer text-xs font-bold uppercase tracking-wide focus:bg-primary/10 focus:text-primary py-3">{level}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FieldError errors={[fieldState.error]} className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2" />
                                            </Field>
                                        )}
                                    />
                                </div>

                                <Controller
                                    control={control}
                                    name="shortDescription"
                                    render={({ field, fieldState }) => (
                                        <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name} className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">
                                                Short Description
                                            </FieldLabel>
                                            <Textarea
                                                id={field.name}
                                                {...field}
                                                placeholder="BRIEF SUMMARY FOR CARDS..."
                                                className="min-h-[80px] rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus-visible:ring-primary/20 text-sm font-bold placeholder:text-muted-foreground/20 transition-all resize-none p-4"
                                                aria-invalid={fieldState.invalid}
                                            />
                                            <FieldError errors={[fieldState.error]} className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2" />
                                        </Field>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-6">
                                    <Controller
                                        control={control}
                                        name="type"
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name} className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">
                                                    Course Type
                                                </FieldLabel>
                                                <Select value={field.value || ''} onValueChange={field.onChange}>
                                                    <SelectTrigger id={field.name} className="h-14 px-5 rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus:ring-primary/20 text-sm font-bold uppercase transition-all" aria-invalid={fieldState.invalid}>
                                                        <SelectValue placeholder="SELECT TYPE" />
                                                    </SelectTrigger>
                                                    <SelectContent className="border-border/10 shadow-2xl bg-background/95 backdrop-blur-3xl rounded-2xl overflow-hidden p-1">
                                                        <SelectItem value="vod" className="rounded-xl cursor-pointer text-xs font-bold uppercase tracking-wide focus:bg-primary/10 focus:text-primary py-3">Video on demand</SelectItem>
                                                        <SelectItem value="live" className="rounded-xl cursor-pointer text-xs font-bold uppercase tracking-wide focus:bg-primary/10 focus:text-primary py-3">Live Stream</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FieldError errors={[fieldState.error]} className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2" />
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        control={control}
                                        name="isFree"
                                        render={({ field }) => (
                                            <Field className="space-y-2">
                                                <FieldLabel htmlFor="isFree" className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">
                                                    Access Control
                                                </FieldLabel>
                                                <div className="flex items-center gap-3 mt-2 p-4 rounded-xl bg-muted/5 border border-border/10 cursor-pointer hover:bg-muted/10 transition-all" onClick={() => field.onChange(!field.value)}>
                                                    <input
                                                        id="isFree"
                                                        type="checkbox"
                                                        checked={!!field.value}
                                                        onChange={(e) => field.onChange(e.target.checked)}
                                                        className="h-5 w-5 rounded-md border-border/60 text-primary focus:ring-primary/20 cursor-pointer"
                                                    />
                                                    <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
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
                                                <FieldLabel htmlFor={field.name} className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">
                                                    Discount Price (USD)
                                                </FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                                    placeholder="0.00"
                                                    className="h-14 px-5 rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus-visible:ring-primary/20 text-sm font-bold placeholder:text-muted-foreground/20 transition-all font-mono"
                                                    aria-invalid={fieldState.invalid}
                                                />
                                                <FieldError errors={[fieldState.error]} className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2" />
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        control={control}
                                        name="durationWeeks"
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name} className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">
                                                    Duration (weeks)
                                                </FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                                    placeholder="e.g. 8"
                                                    className="h-14 px-5 rounded-2xl bg-muted/10 border-border/20 hover:bg-muted/20 focus-visible:ring-primary/20 text-sm font-bold placeholder:text-muted-foreground/20 transition-all font-mono"
                                                    aria-invalid={fieldState.invalid}
                                                />
                                                <FieldError errors={[fieldState.error]} className="text-[10px] uppercase font-bold text-rose-500 tracking-wider pl-2" />
                                            </Field>
                                        )}
                                    />
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
                                        control={control}
                                        name="tags"
                                        render={({ field }) => (
                                            <Field className="space-y-2">
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
                                        control={control}
                                        name="learningOutcomes"
                                        render={({ field }) => (
                                            <Field className="space-y-2">
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
                                        control={control}
                                        name="requirements"
                                        render={({ field }) => (
                                            <Field className="space-y-2">
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

                                {/* Media Upload */}
                                <div className="space-y-6 pt-6">
                                    <div className="flex items-center gap-3 pb-2 border-b border-border/20">
                                        <div className="h-px flex-1 bg-border/20" />
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-center">
                                            Data Assets (Optional)
                                        </h3>
                                        <div className="h-px flex-1 bg-border/20" />
                                    </div>

                                    <Field className="space-y-2">
                                        <FieldLabel htmlFor="thumbnail-upload" className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">Thumbnail</FieldLabel>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="relative flex-1">
                                                    <Input
                                                        id="thumbnail-upload"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
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
                                        <FieldLabel htmlFor="video-upload" className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground ml-1">Preview Video</FieldLabel>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="relative flex-1">
                                                    <Input
                                                        id="video-upload"
                                                        type="file"
                                                        accept="video/*"
                                                        onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
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
                        </div>
                    </ScrollArea>

                    <SheetFooter className="flex-shrink-0 px-8 py-6 border-t border-border/10 bg-background/50 backdrop-blur-md flex flex-row items-center justify-between gap-4 relative z-20">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleManageCurriculum}
                            className="flex-1 rounded-xl h-12 bg-background/50 border border-border/20 text-[11px] font-black uppercase tracking-widest hover:bg-muted/30"
                        >
                            <Layers className="mr-2 h-4 w-4" />
                            Manage Curriculum
                        </Button>
                        <Button
                            type="submit"
                            disabled={uploading || (!isDirty && !thumbnailFile && !videoFile)}
                            className="flex-1 rounded-xl h-12 bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Syncing...
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
