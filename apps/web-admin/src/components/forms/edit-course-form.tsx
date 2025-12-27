import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { storageApi } from '../../api/storage';
import type { UpdateCourseDto, CourseResponseDto } from '@workspace/dtos';
import { CourseStatus } from '@workspace/dtos';

const updateCourseSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be positive').optional(),
  status: z.nativeEnum(CourseStatus).optional(),
  thumbnailUrl: z.string().optional(),
  previewVideoUrl: z.string().optional(),
});

type UpdateCourseFormData = z.infer<typeof updateCourseSchema>;

interface EditCourseFormProps {
  course: CourseResponseDto;
  onSubmit: (data: UpdateCourseDto) => void;
  onCancel: () => void;
}

export function EditCourseForm({ course, onSubmit, onCancel }: EditCourseFormProps) {
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UpdateCourseFormData>({
    resolver: zodResolver(updateCourseSchema),
    defaultValues: {
      title: course.title,
      description: course.description,
      price: course.price,
      status: course.status as CourseStatus,
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

  const onSubmitForm = async (data: UpdateCourseFormData) => {
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
      
      onSubmit({
        ...data,
        thumbnailUrl,
        previewVideoUrl,
      });
    } catch (error) {
      alert('Upload failed: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
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
        {course.thumbnailUrl && <p className="text-sm text-muted-foreground">Current: {course.thumbnailUrl}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Preview Video</label>
        <Input
          type="file"
          accept="video/*"
          onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
        />
        {course.previewVideoUrl && <p className="text-sm text-muted-foreground">Current: {course.previewVideoUrl}</p>}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Update Course'}
        </Button>
      </div>
    </form>
  );
}
