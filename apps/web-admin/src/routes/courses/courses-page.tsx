import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@workspace/ui/components/button';
import type { CourseQueryDTO, CourseResponseDTO } from '@workspace/schemas';
import { Can } from "@/lib/guard/can";
import { useCourses } from "@/api/services/courses.ts";
import { CoursesPrimaryToolbar } from "@/components/courses/courses-primary-toolbar.tsx";
import { CoursesTable } from "@/components/courses/courses-table.tsx";
import { CreateCourseDialog } from "@/components/courses/create-course-dialog.tsx";
import { EditCourseDialog } from "@/components/courses/edit-course-dialog.tsx";
import { DeleteCourseDialog } from "@/components/courses/delete-course-dialog.tsx";
import { ViewCourseDialog } from "@/components/courses/view-course-dialog.tsx";

export default function CoursesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [jlptLevelFilter, setJlptLevelFilter] = useState<string>('');

  // Dialog States
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseResponseDTO | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<CourseResponseDTO | null>(null);
  const [viewingCourse, setViewingCourse] = useState<CourseResponseDTO | null>(null);

  const queryParams: CourseQueryDTO = {
    page,
    limit: 10,
    ...(search && { search }),
    ...(statusFilter && { status: statusFilter as any }),
    ...(jlptLevelFilter && { jlptLevel: jlptLevelFilter as any }),
  };

  const { data: coursesData, isLoading, error } = useCourses(queryParams);

  const navigate = useNavigate();

  const courses = coursesData?.data || [];
  const meta = coursesData ? {
    total: coursesData.total,
    totalPages: coursesData.totalPages,
    page: coursesData.page,
    limit: coursesData.limit
  } : null;

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
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground">Manage and publish learning content.</p>
        </div>
        <Can permission="course.create">
          <Button onClick={() => setShowCreateDialog(true)}>Create Course</Button>
        </Can>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <CoursesPrimaryToolbar
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            jlptLevelFilter={jlptLevelFilter}
            onJlptLevelFilterChange={setJlptLevelFilter}
          />

          <div className="mt-6 rounded-md border">
            <CoursesTable
              data={courses}
              onEdit={setEditingCourse}
              onDelete={setDeletingCourse}
              onView={setViewingCourse}
              onModules={(course) => navigate(`/modules?courseId=${course.id}`)}
              page={page}
              limit={queryParams.limit || 10}
            />
          </div>

          {/* Pagination */}
          {meta && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="flex-1 text-sm text-muted-foreground">
                Showing {courses.length} of {meta.total} courses
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <div className="text-sm font-medium">
                  Page {page} of {meta.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

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
