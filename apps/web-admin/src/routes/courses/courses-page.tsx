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
import { BookOpen, Plus, Search, Sparkles, ShieldAlert } from 'lucide-react';
import { Card } from '@workspace/ui/components/card';

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
      <div className="flex flex-col items-center justify-center p-20 space-y-4 bg-destructive/5 rounded-[3rem] border border-dashed border-destructive/20 text-center animate-in fade-in duration-500">
        <div className="w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center">
          <ShieldAlert className="size-8 text-destructive opacity-40" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-black uppercase tracking-tight italic">Registry Failure</h3>
          <p className="text-xs font-bold text-muted-foreground/60 italic uppercase tracking-widest">{error.message}</p>
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
            className="rounded-xl h-10 w-10 text-[11px] font-black hover:bg-primary/10 transition-all"
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
              "rounded-xl h-10 w-10 text-[11px] font-black transition-all",
              page === i ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-primary/10 text-muted-foreground/60 hover:text-primary"
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
            className="rounded-xl h-10 w-10 text-[11px] font-black hover:bg-primary/10 transition-all"
          >
            {meta.totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-8 relative px-2">
        <div className="space-y-4 max-w-2xl text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
            <BookOpen className="size-3" />
            Content Architecture
          </div>
          <h1 className="text-5xl font-black tracking-tight text-foreground uppercase italic leading-[0.85]">
            Learning <br />
            <span className="text-primary not-italic text-4xl sm:text-5xl">Repositories</span>
          </h1>
          <p className="text-[11px] font-bold text-muted-foreground/40 uppercase tracking-[0.15em] italic border-l-2 border-primary/20 pl-6 mt-6">
            Kiến tạo và quản trị hệ sinh thái bài giảng, học liệu số hóa dành cho cộng đồng <span className="text-foreground">Torii Academy</span>.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-6 sm:pt-0">
          <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-background/40 border border-border/20 backdrop-blur-xl hidden sm:flex">
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 text-center">Active Assets</p>
              <h3 className="text-2xl font-black italic text-center">{meta?.total || 0}</h3>
            </div>
          </div>
          <Can permission="course.create">
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="w-full sm:w-auto h-16 px-10 rounded-[1.5rem] bg-primary text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all group"
            >
              Deploy New Module
              <Plus className="ml-3 size-4 opacity-50 group-hover:opacity-100 transition-opacity" />
            </Button>
          </Can>
        </div>
      </div>

      {/* Main Table Container */}
      <Card className="rounded-[3rem] bg-background/40 backdrop-blur-3xl border border-border/20 shadow-2xl shadow-primary/5 overflow-hidden group">
        <div className="p-8 lg:p-12 space-y-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-6 rounded-[2rem] bg-muted/20 border border-border/20">
            <div className="flex flex-1 items-center gap-6 w-full">
              <div className="p-3.5 rounded-2xl bg-background border border-border/20 text-muted-foreground">
                <Search className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
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
          </div>

          <div className="rounded-[2.5rem] border border-border/20 bg-background/40 overflow-hidden relative">
            <div className="absolute inset-0 bg-primary/[0.01] pointer-events-none" />
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
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 pt-10 border-t border-border/10">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 group-hover:text-primary transition-colors">
                  <Sparkles className="size-3" />
                  Metric: <span className="text-foreground text-xs">{meta.total} Registered Repositories</span>
                </div>
                <div className="hidden lg:block w-1 h-1 rounded-full bg-border" />
                <div className="italic">Data Point 0{page} of 0{meta.totalPages}</div>
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
                          "h-12 px-6 rounded-2xl bg-muted/20 border border-border/20 text-[10px] font-black uppercase tracking-widest transition-all",
                          page === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-primary/10 hover:text-primary cursor-pointer active:scale-95"
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
                          "h-12 px-6 rounded-2xl bg-muted/20 border border-border/20 text-[10px] font-black uppercase tracking-widest transition-all",
                          page === meta.totalPages ? "opacity-30 cursor-not-allowed" : "hover:bg-primary/10 hover:text-primary cursor-pointer active:scale-95"
                        )}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </div>
      </Card>

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
