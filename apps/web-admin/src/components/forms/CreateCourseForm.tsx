import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { storageApi } from '../../api/storage';
import type { CreateCourseDto } from '@workspace/dtos';

interface CreateCourseFormProps {
  onSubmit: (data: CreateCourseDto) => void;
}

export function CreateCourseForm({ onSubmit }: CreateCourseFormProps) {
  const [formData, setFormData] = useState<CreateCourseDto>({
    title: '',
    jlptLevel: 'N5' as any,
    price: 0,
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
      let thumbnailUrl = '';
      let previewVideoUrl = '';

      if (thumbnailFile) {
        thumbnailUrl = await handleFileUpload(thumbnailFile, 'course-thumbnails');
      }
      if (videoFile) {
        previewVideoUrl = await handleFileUpload(videoFile, 'course-videos');
      }

      onSubmit({
        ...formData,
        thumbnailUrl: thumbnailUrl || undefined,
        previewVideoUrl: previewVideoUrl || undefined,
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
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">JLPT Level</label>
        <Select
          value={formData.jlptLevel}
          onValueChange={(value) => setFormData({ ...formData, jlptLevel: value as any })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="N5">N5</SelectItem>
            <SelectItem value="N4">N4</SelectItem>
            <SelectItem value="N3">N3</SelectItem>
            <SelectItem value="N2">N2</SelectItem>
            <SelectItem value="N1">N1</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Price</label>
        <Input
          type="number"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
          required
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
        <Button type="button" variant="outline" onClick={() => { setFormData({ title: '', jlptLevel: 'N5' as any, price: 0 }); setThumbnailFile(null); setVideoFile(null); }}>
          Reset
        </Button>
        <Button type="submit" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Create Course'}
        </Button>
      </div>
    </form>
  );
}
