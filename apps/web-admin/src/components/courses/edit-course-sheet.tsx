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
import { BookOpen, Users, Calendar, DollarSign, Layers, Save, Image as ImageIcon } from 'lucide-react';
import type { CourseResponseDTO } from '@workspace/schemas';
import { CourseStatus, courseUpdateDTOSchema, type CourseUpdateDTO } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';
import { useUpdateCourse } from "@/api/services/courses.ts";
import { storageApi } from '@/api/services/storage-api.ts';
import { useNavigate } from 'react-router-dom';

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
        handleSubmit,
        reset,
        formState: { isDirty },
    } = useForm<UpdateCourseFormData>({
        resolver: zodResolver(courseUpdateDTOSchema),
        defaultValues: {
            title: '',
            description: '',
            price: 0,
            status: CourseStatus.DRAFT,
        },
    });

    // Reset form when course changes
    useEffect(() => {
        if (course) {
            reset({
                title: course.title,
                description: course.description,
                price: course.price,
                status: course.status as CourseStatus,
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
            toast.success('Course updated successfully!', {
                description: `Changes to ${data.title} have been saved.`,
            });
            onOpenChange(false);
        } catch (error: any) {
            toast.error('Failed to update course', {
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
            <SheetContent className="w-full sm:w-[600px] max-h-screen flex flex-col p-0 gap-0 border-l border-border/40 shadow-2xl bg-background/95 backdrop-blur-md overflow-hidden">
                <SheetHeader className="px-6 py-6 border-b border-border/40 bg-muted/5 space-y-4">
                    <div className="flex items-center justify-between">
                        <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground border-border/60 bg-background/50">
                            {course.id.substring(0, 8)}
                        </Badge>
                        <Badge variant={course.status === 'published' ? 'default' : 'secondary'} className="uppercase tracking-wider font-semibold text-[10px] px-2.5 py-0.5 shadow-none">
                            {course.status}
                        </Badge>
                    </div>
                    <div className="space-y-1.5">
                        <SheetTitle className="text-2xl font-bold leading-tight tracking-tight text-foreground">
                            Edit Course
                        </SheetTitle>
                        <SheetDescription className="text-sm text-muted-foreground/80">
                            Update course information and manage curriculum
                        </SheetDescription>
                    </div>
                </SheetHeader>

                <form onSubmit={handleSubmit(onSubmitForm)} className="flex-1 flex flex-col overflow-hidden">
                    <ScrollArea className="flex-1 h-full">
                        <div className="px-6 py-6 space-y-6">
                            {/* Key Metrics */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/40 shadow-sm">
                                    <div className="flex items-center gap-2.5 text-muted-foreground mb-2">
                                        <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                                            <Users className="h-4 w-4" />
                                        </div>
                                        <span className="text-xs font-semibold uppercase tracking-wide">Students</span>
                                    </div>
                                    <div className="text-3xl font-bold text-foreground tracking-tight">{course.totalStudents || 0}</div>
                                </div>
                                <div className="p-5 rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/40 shadow-sm">
                                    <div className="flex items-center gap-2.5 text-muted-foreground mb-2">
                                        <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                            <Calendar className="h-4 w-4" />
                                        </div>
                                        <span className="text-xs font-semibold uppercase tracking-wide">Updated</span>
                                    </div>
                                    <div className="text-sm font-medium text-foreground">
                                        {new Date(course.updatedAt).toLocaleDateString(undefined, {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-border/40" />

                            {/* Form Fields */}
                            <div className="space-y-5">
                                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-primary" />
                                    Course Information
                                </h3>

                                <Controller
                                    control={control}
                                    name="title"
                                    render={({ field, fieldState }) => (
                                        <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Title</FieldLabel>
                                            <Input
                                                id={field.name}
                                                {...field}
                                                placeholder="Enter course title"
                                                className="h-11 border-none bg-muted/30 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl transition-all"
                                                aria-invalid={fieldState.invalid}
                                            />
                                            <FieldError errors={[fieldState.error]} className="text-[10px] font-medium text-destructive ml-1" />
                                        </Field>
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="description"
                                    render={({ field, fieldState }) => (
                                        <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Description</FieldLabel>
                                            <Textarea
                                                id={field.name}
                                                {...field}
                                                placeholder="Enter course description"
                                                className="min-h-[100px] border-none bg-muted/30 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl transition-all resize-none"
                                                aria-invalid={fieldState.invalid}
                                            />
                                            <FieldError errors={[fieldState.error]} className="text-[10px] font-medium text-destructive ml-1" />
                                        </Field>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <Controller
                                        control={control}
                                        name="price"
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Price (USD)</FieldLabel>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                                                    <Input
                                                        id={field.name}
                                                        type="number"
                                                        {...field}
                                                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                                        placeholder="99.00"
                                                        className="h-11 pl-9 border-none bg-muted/30 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl transition-all"
                                                        aria-invalid={fieldState.invalid}
                                                    />
                                                </div>
                                                <FieldError errors={[fieldState.error]} className="text-[10px] font-medium text-destructive ml-1" />
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        control={control}
                                        name="status"
                                        render={({ field, fieldState }) => (
                                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                                <FieldLabel htmlFor={field.name} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Status</FieldLabel>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={(value) => field.onChange(value as CourseStatus)}
                                                >
                                                    <SelectTrigger id={field.name} className="h-11 border-none bg-muted/30 hover:bg-muted/50 focus:ring-1 focus:ring-primary/20 rounded-xl transition-all" aria-invalid={fieldState.invalid}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="border-none shadow-2xl bg-popover/95 backdrop-blur-xl rounded-xl">
                                                        <SelectItem value={CourseStatus.DRAFT} className="rounded-lg focus:bg-primary/5 capitalize">Draft</SelectItem>
                                                        <SelectItem value={CourseStatus.PUBLISHED} className="rounded-lg focus:bg-primary/5 capitalize">Published</SelectItem>
                                                        <SelectItem value={CourseStatus.ARCHIVED} className="rounded-lg focus:bg-primary/5 capitalize">Archived</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FieldError errors={[fieldState.error]} className="text-[10px] font-medium text-destructive ml-1" />
                                            </Field>
                                        )}
                                    />
                                </div>

                                <Separator className="bg-border/40" />

                                {/* Media Upload */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        <ImageIcon className="h-4 w-4 text-primary" />
                                        Media
                                    </h3>

                                    <Field className="space-y-2">
                                        <FieldLabel htmlFor="thumbnail-upload" className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Thumbnail</FieldLabel>
                                        <Input
                                            id="thumbnail-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                                            className="h-11 border-none bg-muted/30 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl transition-all p-2.5 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                        />
                                        {course.thumbnailUrl && !thumbnailFile && (
                                            <div className="mt-2 rounded-xl overflow-hidden border border-border/40 bg-muted/30 aspect-video relative shadow-sm max-w-xs">
                                                <img src={course.thumbnailUrl} alt={course.title} className="object-cover w-full h-full" />
                                            </div>
                                        )}
                                    </Field>

                                    <Field className="space-y-2">
                                        <FieldLabel htmlFor="video-upload" className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Preview Video</FieldLabel>
                                        <Input
                                            id="video-upload"
                                            type="file"
                                            accept="video/*"
                                            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                            className="h-11 border-none bg-muted/30 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl transition-all p-2.5 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                        />
                                        {course.previewVideoUrl && !videoFile && (
                                            <p className="text-xs text-muted-foreground ml-1">Current video uploaded</p>
                                        )}
                                    </Field>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    <SheetFooter className="p-6 border-t border-border/40 bg-muted/5 backdrop-blur-sm flex-row gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleManageCurriculum}
                            className="flex-1 gap-2 rounded-xl h-11 border-border/50"
                        >
                            <Layers className="h-4 w-4" />
                            Manage Curriculum
                        </Button>
                        <Button
                            type="submit"
                            disabled={uploading || !isDirty}
                            className="flex-1 gap-2 shadow-lg hover:shadow-xl transition-all rounded-xl h-11 font-medium"
                        >
                            {uploading ? (
                                <>Saving...</>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
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
