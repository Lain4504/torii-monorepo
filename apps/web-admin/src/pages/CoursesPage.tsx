import { useState } from 'react';
import { useCourses, useCreateCourse, useUpdateCourse, useDeleteCourse } from '../api/courses';
import { useModules, useCreateModule, useUpdateModule, useDeleteModule } from '../api/modules';
import { storageApi } from '../api/storage';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@workspace/ui/components/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@workspace/ui/components/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import type { CreateCourseDto, UpdateCourseDto, CourseQueryDto } from '@workspace/dtos';

export default function CoursesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [jlptLevelFilter, setJlptLevelFilter] = useState<string>('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);

  const queryParams: CourseQueryDto = {
    page,
    limit: 10,
    ...(search && { search }),
    ...(statusFilter && { status: statusFilter as any }),
    ...(jlptLevelFilter && { jlptLevel: jlptLevelFilter as any }),
  };

  const { data: coursesData, isLoading, error, refetch } = useCourses(queryParams);
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();

  const courses = coursesData?.data || [];
  const meta = coursesData?.meta;

  const handleCreate = async (courseData: CreateCourseDto) => {
    try {
      await createCourse.mutateAsync(courseData);
      setShowCreateDialog(false);
      refetch();
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleUpdate = async (id: string, courseData: UpdateCourseDto) => {
    try {
      await updateCourse.mutateAsync({ id, course: courseData });
      setEditingCourse(null);
      refetch();
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await deleteCourse.mutateAsync(id);
      refetch();
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading courses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-500 py-8">
          Error: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground">Manage all courses in the system</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>Create Course</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
            </DialogHeader>
            <CreateCourseForm onSubmit={handleCreate} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={jlptLevelFilter || "all"} onValueChange={(value) => setJlptLevelFilter(value === "all" ? "" : value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="JLPT Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="N5">N5</SelectItem>
            <SelectItem value="N4">N4</SelectItem>
            <SelectItem value="N3">N3</SelectItem>
            <SelectItem value="N2">N2</SelectItem>
            <SelectItem value="N1">N1</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Courses Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>JLPT Level</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">{course.title}</TableCell>
                <TableCell>{course.slug}</TableCell>
                <TableCell>{course.jlptLevel}</TableCell>
                <TableCell>${course.price}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${
                    course.status === 'published' ? 'bg-green-100 text-green-800' :
                    course.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {course.status}
                  </span>
                </TableCell>
                <TableCell>{course.totalStudents}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingCourse(course)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(course.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {meta && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing {courses.length} of {meta.total} courses
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm">
              Page {page} of {meta.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page >= meta.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      {editingCourse && (
        <Dialog open={!!editingCourse} onOpenChange={() => setEditingCourse(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Course</DialogTitle>
            </DialogHeader>
            <EditCourseForm
              course={editingCourse}
              onSubmit={(data) => handleUpdate(editingCourse.id, data)}
              onCancel={() => setEditingCourse(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Create Course Form Component
function CreateCourseForm({ onSubmit }: { onSubmit: (data: CreateCourseDto) => void }) {
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

// Edit Course Form Component
function EditCourseForm({
  course,
  onSubmit,
  onCancel
}: {
  course: any;
  onSubmit: (data: UpdateCourseDto) => void;
  onCancel: () => void;
}) {
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
