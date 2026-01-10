import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@workspace/ui/components/button';
import type { CourseQueryDTO, CourseResponseDTO } from '@workspace/schemas';
import { Can } from "@/lib/guard/can";
import { useCourses, useUnpublishCourse } from "@/api/services/courses.ts";
import { CoursesPrimaryToolbar } from "@/components/courses/courses-primary-toolbar.tsx";
import { CoursesTable } from "@/components/courses/courses-table.tsx";
import { CreateCourseSheet } from "@/components/courses/create-course-sheet.tsx";
import { EditCourseSheet } from "@/components/courses/edit-course-sheet.tsx";
import { DeleteCourseDialog } from "@/components/courses/delete-course-dialog.tsx";
import { ManageInstructorsSheet } from "@/components/courses/manage-instructors-sheet.tsx";
import { PublishCourseDialog } from "@/components/courses/publish-course-dialog.tsx";
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
import { cn } from '@workspace/ui/lib/utils';

export default function CoursesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounceValue(search, 500);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [jlptLevelFilter, setJlptLevelFilter] = useState<string>('');

  // Dialog/Sheet States
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseResponseDTO | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<CourseResponseDTO | null>(null);
  const [managingInstructorsCourse, setManagingInstructorsCourse] = useState<CourseResponseDTO | null>(null);
  const [publishingCourse, setPublishingCourse] = useState<CourseResponseDTO | null>(null);

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
          <PaginationLink
            onClick={(e) => {
              e.preventDefault();
              setPage(1);
            }}
            className="cursor-pointer hover:bg-muted/50 transition-colors"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) items.push(<PaginationEllipsis key="start-ellipsis" />);
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={page === i}
            onClick={(e) => {
              e.preventDefault();
              setPage(i);
            }}
            className={cn(
              "cursor-pointer transition-colors",
              page === i ? "bg-primary/10" : "hover:bg-muted/50"
            )}
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
          <PaginationLink
            onClick={(e) => {
              e.preventDefault();
              setPage(meta.totalPages);
            }}
            className="cursor-pointer hover:bg-muted/50 transition-colors"
          >
            {meta.totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">Courses</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage and publish learning content for your students.</p>
        </div>
        <Can permission="course.create">
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="w-full sm:w-auto rounded-lg shadow-lg shadow-primary/20 bg-primary text-sm sm:text-base"
            size="sm"
          >
            Create Course
          </Button>
        </Can>
      </div>

      <div className="border border-border shadow-sm bg-card backdrop-blur-sm hover:bg-card hover:shadow-md transition-all duration-300 rounded-xl rounded-2xl">
        <div className="p-3 sm:p-6">
          <CoursesPrimaryToolbar
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            jlptLevelFilter={jlptLevelFilter}
            onJlptLevelFilterChange={setJlptLevelFilter}
          />

          <div className="mt-4 sm:mt-6 rounded-xl border border-border/40 overflow-visible sm:overflow-hidden">
            <div className="overflow-x-auto">
              <CoursesTable
                data={courses}
                onEdit={setEditingCourse}
                onDelete={setDeletingCourse}
                onView={setEditingCourse}
                onTitleClick={(course) => navigate(`/courses/${course.id}`)}
                onModules={setEditingCourse}
                onManageInstructors={setManagingInstructorsCourse}
                onPublish={setPublishingCourse}
                onUnpublish={handleUnpublish}
                page={page}
                limit={queryParams.limit || 10}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Pagination */}
          {meta && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 py-4 sm:py-6 border-t border-border/40 mt-4 sm:mt-6 px-2">
              <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left w-full sm:w-auto">
                <div>
                  Showing <span className="font-semibold text-foreground">{courses.length}</span> of <span className="font-semibold text-foreground">{meta.total}</span> courses
                </div>
                {meta.totalPages > 0 && (
                  <div className="mt-1 sm:mt-0 sm:inline sm:ml-2">
                    (Page {page} of {meta.totalPages})
                  </div>
                )}
              </div>

              {meta.totalPages > 1 ? (
                <Pagination>
                  <PaginationContent className="flex-wrap justify-center">
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(p => Math.max(1, p - 1));
                        }}
                        className={cn(
                          page === 1 ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-muted/50",
                          "transition-colors"
                        )}
                      />
                    </PaginationItem>

                    <div className="hidden sm:flex">
                      {renderPaginationItems()}
                    </div>
                    <div className="sm:hidden text-sm font-medium px-2">
                      {page} / {meta.totalPages}
                    </div>

                    <PaginationItem>
                      <PaginationNext
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(p => Math.min(meta.totalPages, p + 1));
                        }}
                        className={cn(
                          page === meta.totalPages ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-muted/50",
                          "transition-colors"
                        )}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              ) : meta.totalPages === 1 ? (
                <div className="text-xs sm:text-sm text-muted-foreground">
                  All results on one page
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Dialogs & Sheets */}
      <CreateCourseSheet
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      <EditCourseSheet
        open={!!editingCourse}
        onOpenChange={(open) => !open && setEditingCourse(null)}
        course={editingCourse}
      />

      <DeleteCourseDialog
        open={!!deletingCourse}
        onOpenChange={(open) => !open && setDeletingCourse(null)}
        course={deletingCourse}
      />

      <ManageInstructorsSheet
        open={!!managingInstructorsCourse}
        onOpenChange={(open) => !open && setManagingInstructorsCourse(null)}
        course={managingInstructorsCourse}
      />

      <PublishCourseDialog
        open={!!publishingCourse}
        onOpenChange={(open) => !open && setPublishingCourse(null)}
        course={publishingCourse}
      />
    </div>
  );
}

