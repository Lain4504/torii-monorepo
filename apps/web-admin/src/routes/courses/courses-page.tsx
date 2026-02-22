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
import { usePermissions } from "@/hooks/use-permissions.ts";
import { useDebounceValue } from '@workspace/ui/hooks/use-debounce-value';
import { SmartPagination } from '@/components/common/smart-pagination';
import { toast } from '@workspace/ui/components/sonner';
import { Plus, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent } from "@workspace/ui/components/card";

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
        title="Quản lý Khóa học"
        subtitle="Hệ sinh thái chương trình giảng dạy Torii Academy"
        stats={[
          { label: "Tổng số khóa học", value: meta?.total.toLocaleString() || 0 }
        ]}
        actions={
          <Can permission="course.create">
            <Button onClick={() => setShowCreateDialog(true)} size="lg">
              <Plus />
              Tạo Khóa học Mới
            </Button>
          </Can>
        }
      />


      <div className="space-y-4">
        <CoursesPrimaryToolbar
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          jlptLevelFilter={jlptLevelFilter}
          onJlptLevelFilterChange={setJlptLevelFilter}
        />

        <Card className="overflow-hidden">
              <CardContent className="p-0">

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
                          onManageLiveSessions={(course) => navigate(`/courses/${course.id}/live-sessions`)}
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
          itemName="khóa học"
        />
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

    </div>
  );
}
