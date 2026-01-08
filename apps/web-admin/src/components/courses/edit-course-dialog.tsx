import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import {
    Field,
    FieldLabel,
    FieldError,
} from '@workspace/ui/components/field';
import { storageApi } from '@/api/services/storage-api.ts';
import { CourseStatus, type CourseResponseDTO, courseUpdateDTOSchema, type CourseUpdateDTO } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';
import { useUpdateCourse } from "@/api/services/courses.ts";

type UpdateCourseFormData = CourseUpdateDTO;

interface EditCourseDialogProps {
    course: CourseResponseDTO | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditCourseDialog({ course, open, onOpenChange }: EditCourseDialogProps) {
    const updateCourse = useUpdateCourse();
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
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
            setThumbnailFile(null);
            setVideoFile(null);
        } catch (error: any) {
            toast.error('Failed to update course', {
                description: error.response?.data?.error || error.message,
            });
        } finally {
            setUploading(false);
        }
    };

    if (!course) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl border-none shadow-2xl bg-background/95 backdrop-blur-xl rounded-2xl p-0 overflow-hidden">
                <DialogHeader className="p-8 pb-4 bg-muted/30">
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">Edit Course</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmitForm)} className="p-8 pt-4 space-y-6" noValidate>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            name="price"
                            render={({ field, fieldState }) => (
                                <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Price</FieldLabel>
                                    <Input
                                        id={field.name}
                                        type="number"
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                        placeholder="Enter price"
                                        className="h-11 border-none bg-muted/30 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl transition-all"
                                        aria-invalid={fieldState.invalid}
                                    />
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
                                            <SelectItem value={CourseStatus.DRAFT} className="rounded-lg focus:bg-primary/5">Draft</SelectItem>
                                            <SelectItem value={CourseStatus.PUBLISHED} className="rounded-lg focus:bg-primary/5">Published</SelectItem>
                                            <SelectItem value={CourseStatus.ARCHIVED} className="rounded-lg focus:bg-primary/5">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FieldError errors={[fieldState.error]} className="text-[10px] font-medium text-destructive ml-1" />
                                </Field>
                            )}
                        />
                    </div>

                    <Controller
                        control={control}
                        name="description"
                        render={({ field, fieldState }) => (
                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Description</FieldLabel>
                                <Input
                                    id={field.name}
                                    {...field}
                                    placeholder="Enter course description"
                                    className="h-12 border-none bg-muted/30 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl transition-all"
                                    aria-invalid={fieldState.invalid}
                                />
                                <FieldError errors={[fieldState.error]} className="text-[10px] font-medium text-destructive ml-1" />
                            </Field>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Field className="space-y-2">
                            <FieldLabel htmlFor="thumbnail-upload" className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Thumbnail</FieldLabel>
                            <Input
                                id="thumbnail-upload"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                                className="h-11 border-none bg-muted/30 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl transition-all p-2.5"
                            />
                            {course?.thumbnailUrl && <p className="text-[10px] text-muted-foreground truncate pl-1">Current: {course.thumbnailUrl}</p>}
                        </Field>

                        <Field className="space-y-2">
                            <FieldLabel htmlFor="video-upload" className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-bold ml-1">Preview Video</FieldLabel>
                            <Input
                                id="video-upload"
                                type="file"
                                accept="video/*"
                                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                className="h-11 border-none bg-muted/30 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl transition-all p-2.5"
                            />
                            {course?.previewVideoUrl && <p className="text-[10px] text-muted-foreground truncate pl-1">Current: {course.previewVideoUrl}</p>}
                        </Field>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
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
                            disabled={uploading}
                            className="rounded-xl h-11 px-8 bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                        >
                            {uploading ? 'Uploading...' : 'Update Course'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
