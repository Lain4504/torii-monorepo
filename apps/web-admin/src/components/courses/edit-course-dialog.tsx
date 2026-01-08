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
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Course</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4" noValidate>
                    <Controller
                        control={control}
                        name="title"
                        render={({ field, fieldState }) => (
                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                                <Input
                                    id={field.name}
                                    {...field}
                                    placeholder="Enter course title"
                                    aria-invalid={fieldState.invalid}
                                />
                                <FieldError errors={[fieldState.error]} />
                            </Field>
                        )}
                    />

                    <Controller
                        control={control}
                        name="description"
                        render={({ field, fieldState }) => (
                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                                <Input
                                    id={field.name}
                                    {...field}
                                    placeholder="Enter course description"
                                    aria-invalid={fieldState.invalid}
                                />
                                <FieldError errors={[fieldState.error]} />
                            </Field>
                        )}
                    />

                    <Controller
                        control={control}
                        name="price"
                        render={({ field, fieldState }) => (
                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Price</FieldLabel>
                                <Input
                                    id={field.name}
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                    placeholder="Enter price"
                                    aria-invalid={fieldState.invalid}
                                />
                                <FieldError errors={[fieldState.error]} />
                            </Field>
                        )}
                    />

                    <Controller
                        control={control}
                        name="status"
                        render={({ field, fieldState }) => (
                            <Field className="space-y-2" data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Status</FieldLabel>
                                <Select
                                    value={field.value}
                                    onValueChange={(value) => field.onChange(value as CourseStatus)}
                                >
                                    <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={CourseStatus.DRAFT}>Draft</SelectItem>
                                        <SelectItem value={CourseStatus.PUBLISHED}>Published</SelectItem>
                                        <SelectItem value={CourseStatus.ARCHIVED}>Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FieldError errors={[fieldState.error]} />
                            </Field>
                        )}
                    />

                    <Field className="space-y-2">
                        <FieldLabel htmlFor="thumbnail-upload">Thumbnail</FieldLabel>
                        <Input
                            id="thumbnail-upload"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                        />
                        {course.thumbnailUrl && <p className="text-sm text-muted-foreground">Current: {course.thumbnailUrl}</p>}
                    </Field>

                    <Field className="space-y-2">
                        <FieldLabel htmlFor="video-upload">Preview Video</FieldLabel>
                        <Input
                            id="video-upload"
                            type="file"
                            accept="video/*"
                            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                        />
                        {course.previewVideoUrl && <p className="text-sm text-muted-foreground">Current: {course.previewVideoUrl}</p>}
                    </Field>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={uploading}>
                            {uploading ? 'Uploading...' : 'Update Course'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
