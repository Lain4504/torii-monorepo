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
import { Loader2, Image as ImageIcon, Film, BookOpen, X } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';
import { storageApi } from '@/api/services/storage-api.ts';
import { JlptLevel, CourseStatus, courseCreateDTOSchema, type CourseCreateDTO } from '@workspace/schemas';
import { useCreateCourse } from "@/api/services/courses.ts";

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
        resolver: zodResolver(courseCreateDTOSchema),
        defaultValues: {
            title: '',
            description: '',
            price: 0,
            status: CourseStatus.DRAFT,
            jlptLevel: undefined,
            thumbnailUrl: undefined,
            previewVideoUrl: undefined,
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
                thumbnailUrl = uploadedThumbnail.url;
            }

            // Upload video if provided
            let previewVideoUrl = data.previewVideoUrl;
            if (videoFile) {
                const uploadedVideo = await storageApi.uploadFile(videoFile);
                previewVideoUrl = uploadedVideo.url;
            }

            // Create course
            await createMutation.mutateAsync({
                ...data,
                thumbnailUrl,
                previewVideoUrl,
            });

            toast.success('Course created successfully', {
                description: 'You can now add modules and lessons.',
            });
            handleClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create course');
        } finally {
            setUploading(false);
        }
    };

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }
            setThumbnailFile(file);
        }
    };

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('video/')) {
                toast.error('Please select a video file');
                return;
            }
            if (file.size > 50 * 1024 * 1024) {
                toast.error('Video size should be less than 50MB');
                return;
            }
            setVideoFile(file);
        }
    };

    return (
        <Sheet open={open} onOpenChange={handleClose}>
            <SheetContent className="w-full sm:w-[600px] max-h-screen flex flex-col p-0 gap-0 border-l border-border/40 shadow-2xl bg-background/95 backdrop-blur-md overflow-hidden">
                <SheetHeader className="px-6 py-6 border-b border-border/40 bg-muted/5 space-y-4">
                    <div className="space-y-1.5">
                        <SheetTitle className="text-2xl font-bold leading-tight tracking-tight text-foreground flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            Create New Course
                        </SheetTitle>
                        <SheetDescription className="text-sm text-muted-foreground/80">
                            Fill in the course details below. You can add modules and lessons after creation.
                        </SheetDescription>
                    </div>
                </SheetHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full overflow-hidden">
                    <ScrollArea className="flex-1 min-h-0">
                        <div className="px-6 py-6 space-y-6">
                            {/* Basic Information */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                                    Basic Information
                                </h3>

                                <Field>
                                    <FieldLabel htmlFor="title" className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">
                                        Course Title <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="title"
                                        {...register('title')}
                                        placeholder="e.g., Japanese for Beginners"
                                        className="h-11 border-none bg-muted/30 hover:bg-muted/50 focus:ring-1 focus:ring-primary/20 rounded-xl transition-all"
                                    />
                                    {errors.title && <FieldError>{errors.title.message}</FieldError>}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="description" className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">
                                        Description <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Textarea
                                        id="description"
                                        {...register('description')}
                                        placeholder="Describe what students will learn in this course..."
                                        rows={4}
                                        className="border-none bg-muted/30 hover:bg-muted/50 focus:ring-1 focus:ring-primary/20 rounded-xl transition-all resize-none"
                                    />
                                    {errors.description && <FieldError>{errors.description.message}</FieldError>}
                                </Field>

                                <div className="grid grid-cols-2 gap-4">
                                    <Field>
                                        <FieldLabel htmlFor="price" className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">
                                            Price (USD) <span className="text-destructive">*</span>
                                        </FieldLabel>
                                        <Input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            {...register('price', { valueAsNumber: true })}
                                            placeholder="0.00"
                                            className="h-11 border-none bg-muted/30 hover:bg-muted/50 focus:ring-1 focus:ring-primary/20 rounded-xl transition-all"
                                        />
                                        {errors.price && <FieldError>{errors.price.message}</FieldError>}
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="jlptLevel" className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">
                                            JLPT Level
                                        </FieldLabel>
                                        <Controller
                                            name="jlptLevel"
                                            control={control}
                                            render={({ field }) => (
                                                <Select value={field.value || ''} onValueChange={field.onChange}>
                                                    <SelectTrigger id="jlptLevel" className="h-11 border-none bg-muted/30 hover:bg-muted/50 focus:ring-1 focus:ring-primary/20 rounded-xl transition-all">
                                                        <SelectValue placeholder="Select level" />
                                                    </SelectTrigger>
                                                    <SelectContent className="border-none shadow-xl bg-popover/95 backdrop-blur-xl rounded-xl">
                                                        {Object.values(JlptLevel).map((level) => (
                                                            <SelectItem key={level} value={level} className="rounded-lg focus:bg-primary/5 cursor-pointer">
                                                                {level}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.jlptLevel && <FieldError>{errors.jlptLevel.message}</FieldError>}
                                    </Field>
                                </div>

                                <Field>
                                    <FieldLabel htmlFor="status" className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">
                                        Status <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Controller
                                        name="status"
                                        control={control}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger id="status" className="h-11 border-none bg-muted/30 hover:bg-muted/50 focus:ring-1 focus:ring-primary/20 rounded-xl transition-all">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="border-none shadow-xl bg-popover/95 backdrop-blur-xl rounded-xl">
                                                    {Object.values(CourseStatus).map((status) => (
                                                        <SelectItem key={status} value={status} className="rounded-lg focus:bg-primary/5 cursor-pointer capitalize">
                                                            {status}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.status && <FieldError>{errors.status.message}</FieldError>}
                                </Field>
                            </div>

                            {/* Media Files */}
                            <div className="space-y-4 pt-4 border-t border-border/40">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                                    Media Files (Optional)
                                </h3>

                                <Field>
                                    <FieldLabel htmlFor="thumbnail" className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">
                                        Thumbnail Image
                                    </FieldLabel>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <Input
                                                id="thumbnail"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleThumbnailChange}
                                                className="h-11 border-none bg-muted/30 hover:bg-muted/50 focus:ring-1 focus:ring-primary/20 rounded-xl transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                            />
                                            {thumbnailFile && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setThumbnailFile(null)}
                                                    className="h-11 w-11 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                        {thumbnailFile && (
                                            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/20 border border-border/40">
                                                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm text-foreground/80 truncate flex-1">{thumbnailFile.name}</span>
                                                <span className="text-xs text-muted-foreground">{(thumbnailFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                            </div>
                                        )}
                                    </div>
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="video" className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">
                                        Preview Video
                                    </FieldLabel>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <Input
                                                id="video"
                                                type="file"
                                                accept="video/*"
                                                onChange={handleVideoChange}
                                                className="h-11 border-none bg-muted/30 hover:bg-muted/50 focus:ring-1 focus:ring-primary/20 rounded-xl transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                            />
                                            {videoFile && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setVideoFile(null)}
                                                    className="h-11 w-11 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                        {videoFile && (
                                            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/20 border border-border/40">
                                                <Film className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm text-foreground/80 truncate flex-1">{videoFile.name}</span>
                                                <span className="text-xs text-muted-foreground">{(videoFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                            </div>
                                        )}
                                    </div>
                                </Field>
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Footer */}
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
                                    disabled={uploading}
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
                                    {uploading ? 'Creating...' : 'Create Course'}
                                </Button>
                            </div>
                        </div>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
