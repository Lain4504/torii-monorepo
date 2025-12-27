import { useState } from 'react';
import { useCourses } from '@/features/courses/api/courses';
import { Button } from '@workspace/ui/components/button';
import { CoursesTable } from '@/features/courses/components/courses-table';
import { CoursesPrimaryToolbar } from '@/features/courses/components/courses-primary-toolbar';
import { CreateCourseDialog } from '@/features/courses/components/create-course-dialog';
import { EditCourseDialog } from '@/features/courses/components/edit-course-dialog';
import { DeleteCourseDialog } from '@/features/courses/components/delete-course-dialog';
import { ViewCourseDialog } from '@/features/courses/components/view-course-dialog';
import type { CourseQueryDto, CourseResponseDto } from '@workspace/dtos';

export default function CoursesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [jlptLevelFilter, setJlptLevelFilter] = useState<string>('');

  // Dialog States
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseResponseDto | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<CourseResponseDto | null>(null);
  const [viewingCourse, setViewingCourse] = useState<CourseResponseDto | null>(null);

  const queryParams: CourseQueryDto = {
    page,
    limit: 10,
    ...(search && { search }),
    ...(statusFilter && { status: statusFilter as any }),
    ...(jlptLevelFilter && { jlptLevel: jlptLevelFilter as any }),
  };

  const { data: coursesData, isLoading, error } = useCourses(queryParams);

  const courses = coursesData?.data || [];
  const meta = coursesData?.meta;

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
        <Button onClick={() => setShowCreateDialog(true)}>Create Course</Button>
      </div>

      <CoursesPrimaryToolbar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        jlptLevelFilter={jlptLevelFilter}
        onJlptLevelFilterChange={setJlptLevelFilter}
      />

      <CoursesTable
        data={courses}
        onEdit={setEditingCourse}
        onDelete={setDeletingCourse}
        onView={setViewingCourse}
        page={page}
        limit={queryParams.limit || 10}
      />

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

      {/* Dialogs */}
      <CreateCourseDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      <EditCourseDialog
        open={!!editingCourse}
        onOpenChange={(open) => !open && setEditingCourse(null)}
        course={editingCourse}
      />

      <DeleteCourseDialog
        open={!!deletingCourse}
        onOpenChange={(open) => !open && setDeletingCourse(null)}
        course={deletingCourse}
      />

      <ViewCourseDialog
        open={!!viewingCourse}
        onOpenChange={(open) => !open && setViewingCourse(null)}
        course={viewingCourse}
      />
    </div>
  );
}
