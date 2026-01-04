import { useState } from 'react';
import { z } from 'zod'; // Add z import
import { useForm } from 'react-hook-form';
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
import { storageApi } from '@/api/services/storage-api.ts';
import { JlptLevel, CourseStatus, courseCreateDTOSchema, type CourseCreateDTO } from '@workspace/schemas';
import { toast } from '@workspace/ui/components/sonner';
import {useCreateCourse} from "@/api/services/courses.ts";

type CreateCourseFormData = z.input<typeof courseCreateDTOSchema>;

interface CreateCourseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateCourseDialog({ open, onOpenChange }: CreateCourseDialogProps) {
    const createCourse = useCreateCourse();
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
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
        onOpenChange(false);
        reset();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Course</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <Input
                            {...register('title')}
                            placeholder="Enter course title"
                        />
                        {errors.title && (
                            <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">JLPT Level</label>
                        <Select
                            value={watch('jlptLevel')}
                            onValueChange={(value) => setValue('jlptLevel', value as JlptLevel)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={JlptLevel.N5}>N5</SelectItem>
                                <SelectItem value={JlptLevel.N4}>N4</SelectItem>
                                <SelectItem value={JlptLevel.N3}>N3</SelectItem>
                                <SelectItem value={JlptLevel.N2}>N2</SelectItem>
                                <SelectItem value={JlptLevel.N1}>N1</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.jlptLevel && (
                            <p className="text-sm text-red-500 mt-1">{errors.jlptLevel.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Price</label>
                        <Input
                            type="number"
                            {...register('price', { valueAsNumber: true })}
                            placeholder="Enter price"
                        />
                        {errors.price && (
                            <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <Input
                            {...register('description')}
                            placeholder="Enter course description"
                        />
                        {errors.description && (
                            <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <Select
                            value={watch('status')}
                            onValueChange={(value) => setValue('status', value as CourseStatus)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={CourseStatus.DRAFT}>Draft</SelectItem>
                                <SelectItem value={CourseStatus.PUBLISHED}>Published</SelectItem>
                                <SelectItem value={CourseStatus.ARCHIVED}>Archived</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.status && (
                            <p className="text-sm text-red-500 mt-1">{errors.status.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Thumbnail</label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Preview Video</label>
                        <Input
                            type="file"
                            accept="video/*"
                            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="submit" disabled={uploading}>
                            {uploading ? 'Uploading...' : 'Create Course'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
