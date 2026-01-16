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
import { BookOpen, Plus, Sparkles, ShieldAlert } from 'lucide-react';


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
      <div className="flex flex-col items-center justify-center p-20 space-y-4 bg-destructive/5 rounded-[2rem] border border-dashed border-destructive/20 text-center animate-in fade-in duration-500">
        <div className="w-16 h-16 rounded-2xl bg-white/50 shadow-sm flex items-center justify-center">
          <ShieldAlert className="size-8 text-destructive/50" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-medium text-foreground">System Notice</h3>
          <p className="text-sm text-muted-foreground">{error.message}</p>
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
            className="rounded-xl h-10 w-10 text-xs font-medium hover:bg-primary/10 transition-all"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) items.push(<PaginationEllipsis key="start-ellipsis" className="opacity-20" />);
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
              "rounded-xl h-10 w-10 text-xs font-medium transition-all",
              page === i ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
            )}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < meta.totalPages) {
      if (endPage < meta.totalPages - 1) items.push(<PaginationEllipsis key="end-ellipsis" className="opacity-20" />);
      items.push(
        <PaginationItem key={meta.totalPages}>
          <PaginationLink
            onClick={(e) => {
              e.preventDefault();
              setPage(meta.totalPages);
            }}
            className="rounded-xl h-10 w-10 text-xs font-medium hover:bg-primary/10 transition-all"
          >
            {meta.totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-8 relative px-2">
        <div className="space-y-4 max-w-2xl text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-medium tracking-wide">
            <BookOpen className="size-3.5" />
            Education Library
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-medium tracking-tight text-foreground leading-[1.1]">
            Course <span className="text-primary italic">Management</span>
          </h1>
          <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-lg border-l-2 border-primary/20 pl-4 mt-4">
            Create and manage the curriculum ecosystem for <span className="text-foreground font-medium">Torii Academy</span>.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-6 sm:pt-0">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-background/60 border border-border/20 backdrop-blur-xl hidden sm:flex shadow-sm">
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium text-center">Active Courses</p>
              <h3 className="text-2xl font-serif font-medium text-center text-primary">{meta?.total || 0}</h3>
            </div>
          </div>
          <Can permission="course.create">
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="w-full sm:w-auto h-12 px-6 rounded-xl bg-primary text-primary-foreground font-medium text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all group"
            >
              Create New Course
              <Plus className="ml-2 size-4 opacity-70 group-hover:opacity-100 transition-opacity" />
            </Button>
          </Can>
        </div>
      </div>

      <div className="space-y-6 px-2">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex-1 w-full">
            <CoursesPrimaryToolbar
              search={search}
              onSearchChange={setSearch}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              jlptLevelFilter={jlptLevelFilter}
              onJlptLevelFilterChange={setJlptLevelFilter}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-white/20 bg-background/50 backdrop-blur-3xl overflow-hidden relative shadow-sm">
          <div className="absolute inset-0 bg-primary/[0.02] pointer-events-none" />
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

        {/* Pagination */}
        {meta && (
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 text-xs text-muted-foreground font-medium text-center lg:text-left pl-2">
              <div className="inline-flex items-center gap-2">
                <Sparkles className="size-3.5 text-primary/70" />
                <span>Total Courses: <span className="text-foreground">{meta.total}</span></span>
              </div>
              <div className="hidden lg:block w-1 h-1 rounded-full bg-border" />
              <div>Page {page} of {meta.totalPages}</div>
            </div>

            {meta.totalPages > 1 && (
              <Pagination>
                <PaginationContent className="flex items-center gap-2">
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(p => Math.max(1, p - 1));
                      }}
                      className={cn(
                        "h-10 px-4 rounded-xl bg-background/50 border border-border/20 text-xs font-medium transition-all",
                        page === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-primary/5 hover:text-primary cursor-pointer"
                      )}
                    />
                  </PaginationItem>

                  <div className="hidden md:flex items-center gap-1 mx-2">
                    {renderPaginationItems()}
                  </div>

                  <PaginationItem>
                    <PaginationNext
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(p => Math.min(meta.totalPages, p + 1));
                      }}
                      className={cn(
                        "h-10 px-4 rounded-xl bg-background/50 border border-border/20 text-xs font-medium transition-all",
                        page === meta.totalPages ? "opacity-30 cursor-not-allowed" : "hover:bg-primary/5 hover:text-primary cursor-pointer"
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}
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
