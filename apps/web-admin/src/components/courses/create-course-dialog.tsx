import { useState, useRef, useEffect, useContext } from 'react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
    DialogStack,
    DialogStackBody,
    DialogStackContent,
    DialogStackHeader,
    DialogStackTitle,
    DialogStackDescription,
    DialogStackFooter,
    DialogStackOverlay,
    DialogStackNext,
    DialogStackPrevious,
    DialogStackContext,
} from '@workspace/ui/components/ui/shadcn-io/dialog-stack';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import {
    Field,
    FieldLabel,
    FieldError,
} from '@workspace/ui/components/field';
import { Loader2, X, Image as ImageIcon, Film, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { storageApi } from '@/api/services/storage-api.ts';
import { JlptLevel, CourseStatus, courseCreateDTOSchema, type CourseCreateDTO } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';
import { useCreateCourse } from "@/api/services/courses.ts";
import { cn } from '@workspace/ui/lib/utils';

type CreateCourseFormData = z.input<typeof courseCreateDTOSchema>;

interface CreateCourseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface MediaUploadProps {
    file: File | null;
    onChange: (file: File | null) => void;
    accept: string;
    label: string;
    icon: React.ReactNode;
}

function DialogStepReset({ isOpen }: { isOpen: boolean }) {
    const context = useContext(DialogStackContext);
    
    useEffect(() => {
        if (isOpen && context && context.activeIndex > 0) {
            // Reset to first step when dialog opens
            context.setActiveIndex(0);
        }
    }, [isOpen, context]);

    return null;
}

function ValidatedNextButton({ trigger }: { trigger: (fields: string[]) => Promise<boolean> }) {
    const context = useContext(DialogStackContext);
    
    if (!context) {
        throw new Error('ValidatedNextButton must be used within a DialogStack');
    }

    const handleClick = async () => {
        const isValid = await trigger(['title', 'jlptLevel', 'price', 'status', 'description']);
        if (isValid) {
            if (context.activeIndex < context.totalDialogs - 1) {
                context.setActiveIndex(context.activeIndex + 1);
            }
        } else {
            toast.error('Please fill in all required fields correctly', {
                description: 'Check the form for validation errors.',
            });
        }
    };

    return (
        <Button
            type="button"
            onClick={handleClick}
            className="rounded-xl h-11 px-8 bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
        >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
    );
}

function MediaUpload({ file, onChange, accept, label, icon }: MediaUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPreviewUrl(null);
        }
    }, [file]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            onChange(selectedFile);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile && droppedFile.type.match(accept.replace('*', '.*'))) {
            onChange(droppedFile);
        }
    };

    return (
        <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">{label}</span>
            <div
                className={cn(
                    "relative h-48 w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all overflow-hidden group",
                    file ? "border-primary/50 bg-primary/5" : "border-muted-foreground/20 hover:border-primary/30 hover:bg-muted/30"
                )}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => !file && inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    className="hidden"
                    onChange={handleFileChange}
                />

                {file && previewUrl ? (
                    <div className="relative w-full h-full">
                        {accept.startsWith('image') ? (
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-black/5">
                                <Film className="w-12 h-12 text-muted-foreground mb-2" />
                                <p className="text-xs text-muted-foreground px-4 text-center truncate w-full">{file.name}</p>
                            </div>
                        )}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 hover:bg-destructive hover:text-destructive-foreground backdrop-blur-sm transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange(null);
                            }}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground/50 group-hover:text-primary/60 transition-colors p-4 text-center">
                        <div className="p-4 rounded-full bg-background/50 shadow-sm mb-3 group-hover:scale-110 transition-transform">
                            {icon}
                        </div>
                        <p className="text-sm font-medium">Click to upload or drag & drop</p>
                        <p className="text-xs text-muted-foreground/40 mt-1 uppercase tracking-wide">
                            {accept === 'image/*' ? 'PNG, JPG, WEBP' : 'MP4, MOV, WEBM'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export function CreateCourseDialog({ open, onOpenChange }: CreateCourseDialogProps) {
    const createCourse = useCreateCourse();
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        trigger,
        formState: { errors },
    } = useForm<CreateCourseFormData>({
        resolver: zodResolver(courseCreateDTOSchema),
        defaultValues: {
            title: '',
            jlptLevel: JlptLevel.N5,
            price: 0,
            status: CourseStatus.DRAFT,
            featured: false,
            isFree: false,
        },
    });

    const handleFileUpload = async (file: File, module: string) => {
        try {
            const uploadData = {
                filename: file.name,
                contentType: file.type,
                module,
            };
            const { uploadUrl, fileId } = await storageApi.generateUploadUrl(uploadData);

            // Upload file to presigned URL
            await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type,
                },
            });

            // Confirm upload
            const confirmResult = await storageApi.confirmUpload({ fileId });
            return confirmResult.fileUrl;
        } catch (error) {
            console.error('Upload failed:', error);
            throw error;
        }
    };

    const onSubmitForm = async (data: CreateCourseFormData) => {
        setUploading(true);
        try {
            let thumbnailUrl = data.thumbnailUrl;
            let previewVideoUrl = data.previewVideoUrl;

            if (thumbnailFile) {
                thumbnailUrl = await handleFileUpload(thumbnailFile, 'course-thumbnails');
            }
            if (videoFile) {
                previewVideoUrl = await handleFileUpload(videoFile, 'course-videos');
            }

            const courseData = {
                ...data,
                thumbnailUrl,
                previewVideoUrl,
            } as CourseCreateDTO;

            await createCourse.mutateAsync(courseData);
            toast.success('Course created successfully!', {
                description: `${data.title} has been added to the system.`,
            });
            onOpenChange(false);
            reset(); // Reset form after successful creation
            setThumbnailFile(null);
            setVideoFile(null);
        } catch (error: any) {
            toast.error('Failed to create course', {
                description: error.response?.data?.error || error.message,
            });
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        if (!uploading) {
            onOpenChange(false);
            reset();
            setThumbnailFile(null);
            setVideoFile(null);
        }
    };

    // Reset to first step when dialog closes
    useEffect(() => {
        if (!open) {
            // Dialog is closed, step will reset when it opens again
        }
    }, [open]);


    return (
        <DialogStack open={open} onOpenChange={handleClose}>
            <DialogStackOverlay />
            <DialogStackBody>
                <DialogStepReset isOpen={open} />
                {/* Step 1: Course Information */}
                <DialogStackContent index={0} className="max-w-2xl border-none shadow-2xl bg-background/95 backdrop-blur-xl rounded-2xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
                    <DialogStackHeader className="p-8 pb-4 bg-muted/30 shrink-0">
                        <DialogStackTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                            Course Information
                        </DialogStackTitle>
                        <DialogStackDescription className="text-sm text-muted-foreground mt-2">
                            Step 1 of 2 - Fill in the basic course details
                        </DialogStackDescription>
                    </DialogStackHeader>
                    <form className="flex-1 overflow-y-auto p-8 pt-4 space-y-6" noValidate>
                        <div className="space-y-6">
                            <Controller
                                control={control}
                                name="title"
                                render={({ field, fieldState }) => (
                                    <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Title</FieldLabel>
                                        <Input
                                            id={field.name}
                                            {...field}
                                            placeholder="Quantum Nihongo N5"
                                            className="h-11 border-none bg-muted/30 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl transition-all"
                                            aria-invalid={fieldState.invalid}
                                        />
                                        <FieldError errors={[fieldState.error]} className="text-[10px] font-medium text-destructive ml-1" />
                                    </Field>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Controller
                                    control={control}
                                    name="jlptLevel"
                                    render={({ field, fieldState }) => (
                                        <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor={field.name} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">JLPT Level</FieldLabel>
                                            <Select
                                                value={field.value}
                                                onValueChange={(value) => field.onChange(value as JlptLevel)}
                                            >
                                                <SelectTrigger id={field.name} className="h-11 border-none bg-muted/30 hover:bg-muted/50 focus:ring-1 focus:ring-primary/20 rounded-xl transition-all" aria-invalid={fieldState.invalid}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="border-none shadow-2xl bg-popover/95 backdrop-blur-xl rounded-xl">
                                                    {Object.values(JlptLevel).map((level) => (
                                                        <SelectItem key={level} value={level} className="rounded-lg focus:bg-primary/5">{level}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
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
                                                    {Object.values(CourseStatus).map((status) => (
                                                        <SelectItem key={status} value={status} className="rounded-lg focus:bg-primary/5 capitalize">{status}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FieldError errors={[fieldState.error]} className="text-[10px] font-medium text-destructive ml-1" />
                                        </Field>
                                    )}
                                />
                            </div>

                            <Controller
                                control={control}
                                name="price"
                                render={({ field, fieldState }) => (
                                    <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Price (USD)</FieldLabel>
                                        <Input
                                            id={field.name}
                                            type="number"
                                            {...field}
                                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                            placeholder="99.00"
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
                                        <Input
                                            id={field.name}
                                            {...field}
                                            placeholder="Briefly describe what students will learn..."
                                            className="h-12 border-none bg-muted/30 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl transition-all"
                                            aria-invalid={fieldState.invalid}
                                        />
                                        <FieldError errors={[fieldState.error]} className="text-[10px] font-medium text-destructive ml-1" />
                                    </Field>
                                )}
                            />
                        </div>

                        <DialogStackFooter className="pt-6 border-t border-border/50">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleClose}
                                className="rounded-xl h-11 px-6 hover:bg-primary/5"
                                disabled={uploading}
                            >
                                Cancel
                            </Button>
                            <ValidatedNextButton trigger={trigger} />
                        </DialogStackFooter>
                    </form>
                </DialogStackContent>

                {/* Step 2: Media Upload */}
                <DialogStackContent index={1} className="max-w-2xl border-none shadow-2xl bg-background/95 backdrop-blur-xl rounded-2xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
                    <DialogStackHeader className="p-8 pb-4 bg-muted/30 shrink-0">
                        <DialogStackTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                            Upload Media
                        </DialogStackTitle>
                        <DialogStackDescription className="text-sm text-muted-foreground mt-2">
                            Step 2 of 2 - Upload course thumbnail and preview video
                        </DialogStackDescription>
                    </DialogStackHeader>
                    <form onSubmit={handleSubmit(onSubmitForm)} className="flex-1 overflow-y-auto p-8 pt-4 space-y-6" noValidate>
                        <div className="space-y-6">
                            <MediaUpload
                                label="Course Thumbnail"
                                file={thumbnailFile}
                                onChange={setThumbnailFile}
                                accept="image/*"
                                icon={<ImageIcon className="w-6 h-6" />}
                            />

                            <MediaUpload
                                label="Preview Video"
                                file={videoFile}
                                onChange={setVideoFile}
                                accept="video/*"
                                icon={<Film className="w-6 h-6" />}
                            />
                        </div>

                        <DialogStackFooter className="pt-6 border-t border-border/50">
                            <DialogStackPrevious
                                className="rounded-xl h-11 px-6 hover:bg-primary/5"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Previous
                            </DialogStackPrevious>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleClose}
                                className="rounded-xl h-11 px-6 hover:bg-primary/5"
                                disabled={uploading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={uploading}
                                className={cn(
                                    "rounded-xl h-11 px-8 bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all",
                                    uploading && "opacity-80 cursor-not-allowed"
                                )}
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating Course...
                                    </>
                                ) : (
                                    <>
                                        <Check className="mr-2 h-4 w-4" />
                                        Create Course
                                    </>
                                )}
                            </Button>
                        </DialogStackFooter>
                    </form>
                </DialogStackContent>
            </DialogStackBody>
        </DialogStack>
    );
}
