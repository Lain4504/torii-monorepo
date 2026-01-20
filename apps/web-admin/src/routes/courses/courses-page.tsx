import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@workspace/ui/components/button';
import type { CourseQueryDTO, CourseResponseDTO } from '@workspace/schemas';
import { Can } from "@/lib/guard/can";
import { useCourses, useUnpublishCourse, useSubmitCourseForReview } from "@/api/services/courses.ts";
import { CoursesPrimaryToolbar } from "@/components/courses/courses-primary-toolbar.tsx";
import { CoursesTable } from "@/components/courses/courses-table.tsx";
import { CreateCourseSheet } from "@/components/courses/create-course-sheet.tsx";
import { EditCourseSheet } from "@/components/courses/edit-course-sheet.tsx";
import { DeleteCourseDialog } from "@/components/courses/delete-course-dialog.tsx";
import { ManageInstructorsSheet } from "@/components/courses/manage-instructors-sheet.tsx";
import { PublishCourseDialog } from "@/components/courses/publish-course-dialog.tsx";
import { RejectCourseDialog } from "@/components/courses/reject-course-dialog.tsx";
import { CourseAuditLogSheet } from "@/components/courses/course-audit-log-sheet.tsx";
import { LiveSessionManagementSheet } from "@/components/courses/live-session-management-sheet.tsx";
import { usePermissions } from "@/hooks/use-permissions.ts";
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
import { Plus, ShieldAlert } from 'lucide-react';


export default function CoursesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { can } = usePermissions();
  const [debouncedSearch] = useDebounceValue(search, 500);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [jlptLevelFilter, setJlptLevelFilter] = useState<string>('');

  // Dialog/Sheet States
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseResponseDTO | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<CourseResponseDTO | null>(null);
  const [managingInstructorsCourse, setManagingInstructorsCourse] = useState<CourseResponseDTO | null>(null);
  const [publishingCourse, setPublishingCourse] = useState<CourseResponseDTO | null>(null);
  const [rejectingCourse, setRejectingCourse] = useState<CourseResponseDTO | null>(null);
  const [viewingAuditLogCourse, setViewingAuditLogCourse] = useState<CourseResponseDTO | null>(null);
  const [managingLiveSessionsCourse, setManagingLiveSessionsCourse] = useState<CourseResponseDTO | null>(null);

  const queryParams: CourseQueryDTO = {
    page,
    limit: 10,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(statusFilter && { status: statusFilter as any }),
    ...(jlptLevelFilter && { jlptLevel: jlptLevelFilter as any }),
  };

  const { data: coursesData, isLoading, error } = useCourses(queryParams);
  const unpublishMutation = useUnpublishCourse();
  const submitForReviewMutation = useSubmitCourseForReview();

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
      toast.success('Hủy xuất bản khóa học thành công');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể hủy xuất bản khóa học');
    }
  };

  const handleSubmitForReview = async (course: CourseResponseDTO) => {
    try {
      await submitForReviewMutation.mutateAsync(course.id);
      toast.success('Đã gửi yêu cầu kiểm duyệt khóa học');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể gửi yêu cầu kiểm duyệt');
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4 bg-destructive/5 rounded-[2rem] border border-dashed border-destructive/20 text-center animate-in fade-in duration-500">
        <div className="w-16 h-16 rounded-2xl bg-white/50 shadow-sm flex items-center justify-center">
          <ShieldAlert className="size-8 text-destructive/50" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-serif font-bold italic uppercase tracking-tight text-foreground">Thông báo hệ thống</h3>
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
            className="rounded-md border border-border h-9 w-9 text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-all"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) items.push(<PaginationEllipsis key="start-ellipsis" className="opacity-50" />);
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
              "rounded-md border h-9 w-9 text-xs font-semibold transition-all",
              page === i
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < meta.totalPages) {
      if (endPage < meta.totalPages - 1) items.push(<PaginationEllipsis key="end-ellipsis" className="opacity-50" />);
      items.push(
        <PaginationItem key={meta.totalPages}>
          <PaginationLink
            onClick={(e) => {
              e.preventDefault();
              setPage(meta.totalPages);
            }}
            className="rounded-md border border-border h-9 w-9 text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-all"
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-serif font-bold italic tracking-tight text-foreground uppercase leading-[0.9]">
            Quản lý <span className="text-primary not-italic">Khóa học</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic border-l-2 border-primary/20 pl-4 mt-2">
            Hệ sinh thái chương trình giảng dạy Torii Academy
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex flex-col items-end px-4 border-r border-border/40">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic">Tổng số khóa học</span>
            <span className="text-2xl font-bold text-foreground tabular-nums">{meta?.total.toLocaleString() || 0}</span>
          </div>
          <Can permission="course.create">
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="h-10 px-4 rounded-xl bg-primary text-primary-foreground font-serif font-bold italic text-xs uppercase tracking-wide shadow-sm hover:bg-primary/90 hover:shadow-md transition-all"
            >
              Tạo Khóa học Mới
              <Plus className="ml-2 size-4" />
            </Button>
          </Can>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-background p-4 rounded-xl border border-border shadow-sm">
          <CoursesPrimaryToolbar
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            jlptLevelFilter={jlptLevelFilter}
            onJlptLevelFilterChange={setJlptLevelFilter}
          />
        </div>

        <div className="bg-background rounded-xl border border-border overflow-hidden shadow-sm">
          <CoursesTable
            data={courses}
            onEdit={setEditingCourse}
            onDelete={setDeletingCourse}

            onTitleClick={(course) => navigate(`/courses/${course.id}`)}
            onModules={(course) => navigate(`/courses/${course.id}`)}
            onManageInstructors={setManagingInstructorsCourse}
            onPublish={setPublishingCourse}
            onReject={setRejectingCourse}
            onViewAuditLog={setViewingAuditLogCourse}
            onManageLiveSessions={setManagingLiveSessionsCourse}
            onSubmitForReview={handleSubmitForReview}
            onUnpublish={handleUnpublish}
            can={can}
            page={page}
            limit={queryParams.limit || 10}
            isLoading={isLoading}
          />
        </div>

        {/* Pagination */}
        {(meta && (meta.total > 0 || isLoading)) && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 px-1">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span>Hiển thị trang <span className="text-foreground">{page}</span> / {meta.totalPages}</span>
              <span className="mx-1 text-border">|</span>
              <span>Tổng cộng <span className="text-foreground">{meta.total}</span> khóa học</span>
            </div>

            {meta.totalPages > 1 && (
              <Pagination className="w-auto mx-0">
                <PaginationContent className="flex items-center gap-1">
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(p => Math.max(1, p - 1));
                      }}
                      className={cn(
                        "h-9 px-3 rounded-md border border-border text-xs font-medium transition-all",
                        page === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-muted cursor-pointer"
                      )}
                    />
                  </PaginationItem>

                  <div className="hidden md:flex items-center gap-1">
                    {renderPaginationItems()}
                  </div>

                  <PaginationItem>
                    <PaginationNext
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(p => Math.min(meta.totalPages, p + 1));
                      }}
                      className={cn(
                        "h-9 px-3 rounded-md border border-border text-xs font-medium transition-all",
                        page === meta.totalPages ? "opacity-30 cursor-not-allowed" : "hover:bg-muted cursor-pointer"
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

      <RejectCourseDialog
        open={!!rejectingCourse}
        onOpenChange={(open) => !open && setRejectingCourse(null)}
        course={rejectingCourse}
      />

      <CourseAuditLogSheet
        courseId={viewingAuditLogCourse?.id || null}
        courseTitle={viewingAuditLogCourse?.title || null}
        onClose={() => setViewingAuditLogCourse(null)}
      />

      <LiveSessionManagementSheet
        open={!!managingLiveSessionsCourse}
        onOpenChange={(open) => !open && setManagingLiveSessionsCourse(null)}
        course={managingLiveSessionsCourse}
      />
    </div>
  );
}
