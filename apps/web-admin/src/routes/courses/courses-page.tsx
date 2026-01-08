import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@workspace/ui/components/button';
import type { CourseQueryDTO, CourseResponseDTO } from '@workspace/schemas';
import { Can } from "@/lib/guard/can";
import { useCourses, useUnpublishCourse } from "@/api/services/courses.ts";
import { CoursesPrimaryToolbar } from "@/components/courses/courses-primary-toolbar.tsx";
import { CoursesTable } from "@/components/courses/courses-table.tsx";
import { CreateCourseDialog } from "@/components/courses/create-course-dialog.tsx";
import { EditCourseDialog } from "@/components/courses/edit-course-dialog.tsx";
import { DeleteCourseDialog } from "@/components/courses/delete-course-dialog.tsx";
import { ViewCourseDialog } from "@/components/courses/view-course-dialog.tsx";
import { ManageInstructorsDialog } from "@/components/courses/manage-instructors-dialog.tsx";
import { PublishCourseDialog } from "@/components/courses/publish-course-dialog.tsx";
import { CourseInfoSheet } from "@/components/courses/course-info-sheet.tsx";
import { useDebounceValue } from '@workspace/ui/hooks/use-debounce-value';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@workspace/ui/components/pagination";
import { toast } from '@workspace/ui/components/sonner';

export default function CoursesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounceValue(search, 500);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [jlptLevelFilter, setJlptLevelFilter] = useState<string>('');

  // Dialog States
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseResponseDTO | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<CourseResponseDTO | null>(null);
  const [viewingCourse, setViewingCourse] = useState<CourseResponseDTO | null>(null);
  const [managingInstructorsCourse, setManagingInstructorsCourse] = useState<CourseResponseDTO | null>(null);
  const [publishingCourse, setPublishingCourse] = useState<CourseResponseDTO | null>(null);
  const [hierarchyCourse, setHierarchyCourse] = useState<CourseResponseDTO | null>(null);

  const queryParams: CourseQueryDTO = {
    page,
    limit: 10,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(statusFilter && { status: statusFilter as any }),
    ...(jlptLevelFilter && { jlptLevel: jlptLevelFilter as any }),
  };

  const { data: coursesData, isLoading, error } = useCourses(queryParams);
  const unpublishMutation = useUnpublishCourse();

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, jlptLevelFilter]);

  const courses = coursesData?.data || [];
  const meta = coursesData ? {
    total: coursesData.total,
    totalPages: coursesData.totalPages,
    page: coursesData.page,
    limit: coursesData.limit
  } : null;

  const handleUnpublish = async (course: CourseResponseDTO) => {
    try {
      await unpublishMutation.mutateAsync(course.id);
      toast.success('Course unpublished successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to unpublish course');
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-rose-500 py-8">
          Error: {error.message}
        </div>
      </div>
    );
  }

  const renderPaginationItems = () => {
    if (!meta) return null;
    const items = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(meta.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink onClick={() => setPage(1)}>1</PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) items.push(<PaginationEllipsis key="start-ellipsis" />);
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={page === i}
            onClick={() => setPage(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < meta.totalPages) {
      if (endPage < meta.totalPages - 1) items.push(<PaginationEllipsis key="end-ellipsis" />);
      items.push(
        <PaginationItem key={meta.totalPages}>
          <PaginationLink onClick={() => setPage(meta.totalPages)}>{meta.totalPages}</PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-1 sm:space-y-1.5 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Courses
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Manage and publish learning content for your students.
          </p>
        </div>
        <Can permission="course.create">
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="w-full sm:w-auto rounded-full shadow-sm hover:shadow-md transition-all bg-primary min-h-[44px] px-6"
          >
            Create Course
          </Button>
        </Can>
      </div>

      <div className="border border-border/40 shadow-sm bg-card hover:shadow-md transition-shadow duration-300 rounded-xl p-0 overflow-hidden">
        <div className="p-6 pb-0">
          <CoursesPrimaryToolbar
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            jlptLevelFilter={jlptLevelFilter}
            onJlptLevelFilterChange={setJlptLevelFilter}
          />
        </div>

        <div className="mt-6">
          <CoursesTable
            data={courses}
            onEdit={setEditingCourse}
            onDelete={setDeletingCourse}
            onView={setViewingCourse}
            onTitleClick={(course) => navigate(`/courses/${course.id}`)}
            onModules={(course) => setHierarchyCourse(course)}
            onManageInstructors={setManagingInstructorsCourse}
            onPublish={setPublishingCourse}
            onUnpublish={handleUnpublish}
            page={page}
            limit={queryParams.limit || 10}
            isLoading={isLoading}
          />

          {/* Pagination */}
          {meta && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 py-4 sm:py-6 border-t border-border/30 px-4 sm:px-6">
              <div className="text-xs sm:text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{courses.length}</span> of <span className="font-semibold text-foreground">{meta.total}</span> courses
              </div>

              {meta.totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-muted/50 transition-colors"}
                      />
                    </PaginationItem>

                    {renderPaginationItems()}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                        className={page === meta.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer hover:bg-muted/50 transition-colors"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
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

      <ManageInstructorsDialog
        open={!!managingInstructorsCourse}
        onOpenChange={(open) => !open && setManagingInstructorsCourse(null)}
        course={managingInstructorsCourse}
      />

      <PublishCourseDialog
        open={!!publishingCourse}
        onOpenChange={(open) => !open && setPublishingCourse(null)}
        course={publishingCourse}
      />

      <CourseInfoSheet
        open={!!hierarchyCourse}
        onOpenChange={(open) => !open && setHierarchyCourse(null)}
        course={hierarchyCourse}
      />
    </div>
  );
}
