import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@workspace/ui/components/button';
import type { CourseMasterQueryDTO, CourseMasterResponseDTO } from '@workspace/schemas';
import { Can } from "@/lib/guard/can";
import { useCourses, useUnpublishCourse, useSubmitCourseForReview } from "@/lib/api/services/courses.ts";
import { CourseMasterPrimaryToolbar } from "@/components/courses/course-master-primary-toolbar.tsx";
import { CourseMasterTable } from "@/components/courses/course-master-table.tsx";
import { CreateCourseMasterSheet } from "@/components/courses/create-course-master-sheet.tsx";
import { EditCourseMasterSheet } from "@/components/courses/edit-course-master-sheet.tsx";
import { DeleteCourseMasterDialog } from "@/components/courses/delete-course-master-dialog.tsx";
import { PublishCourseMasterDialog } from "@/components/courses/publish-course-master-dialog.tsx";
import { RejectCourseMasterDialog } from "@/components/courses/reject-course-master-dialog.tsx";
import { CourseMasterAuditLogSheet } from "@/components/courses/course-master-audit-log-sheet.tsx";
import { usePermissions } from "@/hooks/use-permissions.ts";
import { useDebounceValue } from '@workspace/ui/hooks/use-debounce-value';
import { SmartPagination } from '@/components/common/smart-pagination';
import { toast } from '@workspace/ui/components/sonner';
import { Plus, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent } from "@workspace/ui/components/card";
import { formatNumber } from "@/lib/format-utils";

export default function CourseMasterPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { can } = usePermissions();
  const [debouncedSearch] = useDebounceValue(search, 500);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [jlptLevelFilter, setJlptLevelFilter] = useState<string>('');

  // Dialog/Sheet States
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseMasterResponseDTO | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<CourseMasterResponseDTO | null>(null);
  const [publishingCourse, setPublishingCourse] = useState<CourseMasterResponseDTO | null>(null);
  const [rejectingCourse, setRejectingCourse] = useState<CourseMasterResponseDTO | null>(null);
  const [viewingAuditLogCourse, setViewingAuditLogCourse] = useState<CourseMasterResponseDTO | null>(null);

  const queryParams: CourseMasterQueryDTO = {
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

  const handleUnpublish = async (course: CourseMasterResponseDTO) => {
    try {
      await unpublishMutation.mutateAsync(course.id);
      toast.success('Hủy xuất bản khung chương trình thành công');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể hủy xuất bản khung chương trình');
    }
  };

  const handleSubmitForReview = async (course: CourseMasterResponseDTO) => {
    try {
      await submitForReviewMutation.mutateAsync(course.id);
      toast.success('Đã gửi yêu cầu kiểm duyệt khung chương trình');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể gửi yêu cầu kiểm duyệt');
    }
  };

  if (error) {
    return (
      <div className="flex h-[450px] items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="size-12 rounded-full flex items-center justify-center bg-destructive/10 text-destructive">
              <ShieldAlert className="size-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Thông báo hệ thống</h3>
              <p className="text-sm text-muted-foreground">{error.message}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Thử kết nối lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Quản lý Khung chương trình"
        subtitle="Xây dựng và quản lý các bộ giáo trình chuẩn (Course Master) của Torii Academy"
        stats={[
          { label: "Tổng số khung chương trình", value: formatNumber(meta?.total) || 0 }
        ]}
        actions={
          /* 
            Business Rule: Only admin and staff-lms can create courses
            Lecturers can only manage courses assigned to them by admin/staff
            This button is hidden for lecturers who don't have course.create permission
          */
          <Can permission="course.create">
            <Button onClick={() => setShowCreateDialog(true)} size="lg">
              <Plus />
              Tạo Khung chương trình mới
            </Button>
          </Can>
        }
      />


      <div className="space-y-4">
        <CourseMasterPrimaryToolbar
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          jlptLevelFilter={jlptLevelFilter}
          onJlptLevelFilterChange={setJlptLevelFilter}
        />

        <Card className="overflow-hidden">
          <CardContent className="p-0">

            <CourseMasterTable
              data={courses}
              onEdit={setEditingCourse}
              onDelete={setDeletingCourse}
              onTitleClick={(course: CourseMasterResponseDTO) => navigate(`/course-master/${course.id}`)}
              onModules={(course: CourseMasterResponseDTO) => navigate(`/course-master/${course.id}`)}
              onPublish={setPublishingCourse}
              onReject={setRejectingCourse}
              onViewAuditLog={setViewingAuditLogCourse}
              onSubmitForReview={handleSubmitForReview}
              onUnpublish={handleUnpublish}
              can={can}
              page={page}
              limit={queryParams.limit || 10}
              isLoading={isLoading}
            />

          </CardContent>
        </Card>

        {/* Pagination */}
        <SmartPagination
          page={page}
          totalPages={meta?.totalPages || 0}
          totalItems={meta?.total || 0}
          onPageChange={setPage}
          itemName="khung chương trình"
        />
      </div>

      {/* Dialogs & Sheets */}
      <CreateCourseMasterSheet
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      <EditCourseMasterSheet
        open={!!editingCourse}
        onOpenChange={(open: boolean) => !open && setEditingCourse(null)}
        course={editingCourse}
      />

      <DeleteCourseMasterDialog
        open={!!deletingCourse}
        onOpenChange={(open: boolean) => !open && setDeletingCourse(null)}
        course={deletingCourse}
      />


      <PublishCourseMasterDialog
        open={!!publishingCourse}
        onOpenChange={(open: boolean) => !open && setPublishingCourse(null)}
        course={publishingCourse}
      />

      <RejectCourseMasterDialog
        open={!!rejectingCourse}
        onOpenChange={(open: boolean) => !open && setRejectingCourse(null)}
        course={rejectingCourse}
      />

      <CourseMasterAuditLogSheet
        courseId={viewingAuditLogCourse?.id || null}
        courseTitle={viewingAuditLogCourse?.title || null}
        onClose={() => setViewingAuditLogCourse(null)}
      />

    </div>
  );
}
