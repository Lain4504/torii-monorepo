import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { storageApi } from '../../api/storage';
import type { UpdateCourseDto } from '@workspace/dtos';

interface EditCourseFormProps {
  course: any;
  onSubmit: (data: UpdateCourseDto) => void;
  onCancel: () => void;
}

export function EditCourseForm({ course, onSubmit, onCancel }: EditCourseFormProps) {
  const [formData, setFormData] = useState<UpdateCourseDto>({
    title: course.title,
    description: course.description,
    price: course.price,
    status: course.status || 'draft',
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        ...formData,
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <Input
          value={formData.title || ''}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Input
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Price</label>
        <Input
          type="number"
          value={formData.price || 0}
          onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value as any })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
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
