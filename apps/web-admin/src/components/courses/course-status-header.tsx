import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import type { CourseMasterResponseDTO } from '@workspace/schemas';
import { CourseMasterStatus } from '@workspace/schemas';
import { useSubmitCourseForReview } from '@/lib/api/services/courses.ts';
import { useState } from 'react';
import { SubmitForReviewDialog } from './submit-for-review-dialog';
import { toast } from '@workspace/ui/components/sonner';
import { usePermissions } from '@/hooks/use-permissions';

interface CourseStatusHeaderProps {
  course: CourseMasterResponseDTO;
  onStatusChange?: () => void;
}

const STATUS_CONFIG = {
  [CourseMasterStatus.DRAFT]: {
    icon: AlertCircle,
    color: 'bg-gray-100 text-gray-700 border-gray-300',
    label: 'Bản nháp',
    description: 'Khóa học đang được xây dựng. Hãy hoàn thành nội dung và gửi để kiểm duyệt.',
  },
  [CourseMasterStatus.PENDING_REVIEW]: {
    icon: Clock,
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    label: 'Chờ kiểm duyệt',
    description: 'Khóa học đang chờ được kiểm duyệt bởi nhân viên. Vui lòng chờ phản hồi.',
  },
  [CourseMasterStatus.PUBLISHED]: {
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-700 border-green-300',
    label: 'Đã công bố',
    description: '',
  },
  [CourseMasterStatus.REJECTED]: {
    icon: XCircle,
    color: 'bg-red-100 text-red-700 border-red-300',
    label: 'Bị từ chối',
    description: 'Khóa học bị từ chối kiểm duyệt. Vui lòng xem xét lý do từ chối và cập nhật.',
  },
  [CourseMasterStatus.ARCHIVED]: {
    icon: AlertTriangle,
    color: 'bg-amber-100 text-amber-700 border-amber-300',
    label: 'Đã lưu trữ',
    description: 'Khóa học đã được lưu trữ và không còn hoạt động.',
  },
};

export function CourseStatusHeader({
  course,
  onStatusChange,
}: CourseStatusHeaderProps) {
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const submitMutation = useSubmitCourseForReview();
  const { can } = usePermissions();

  const status = (course.status as CourseMasterStatus) || CourseMasterStatus.DRAFT;
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  const handleSubmitForReview = async () => {
    try {
      await submitMutation.mutateAsync(course.id);
      toast.success('Khóa học đã gửi để kiểm duyệt!');
      setSubmitDialogOpen(false);
      onStatusChange?.();
    } catch (error: any) {
      toast.error(error?.message || 'Không thể gửi khóa học');
    }
  };

  const isPublished = status === CourseMasterStatus.PUBLISHED;
  const isDraft = status === CourseMasterStatus.DRAFT;
  const isRejected = status === CourseMasterStatus.REJECTED;
  const isPendingReview = status === CourseMasterStatus.PENDING_REVIEW;
  
  const canPublish = can('course.publish');
  const canUpdate = can('course.update');

  return (
    <div className="space-y-4">
      {/* Status Badge and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${config.color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <Badge className={`${config.color} border`}>{config.label}</Badge>
            {course.rejectionReason && isRejected && (
              <p className="text-xs text-muted-foreground mt-1">
                <span className="font-semibold">Lý do:</span> {course.rejectionReason}
              </p>
            )}
          </div>
        </div>

        {(isDraft || isRejected) && canUpdate && (
          <Button
            onClick={() => setSubmitDialogOpen(true)}
            disabled={submitMutation.isPending}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            {isRejected ? 'Gửi lại để kiểm duyệt' : 'Gửi để kiểm duyệt'}
          </Button>
        )}

        {isPublished && !canPublish && canUpdate && (
          <Button
            onClick={() => setSubmitDialogOpen(true)}
            disabled={submitMutation.isPending}
            variant="outline"
            className="gap-2 border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            <Send className="h-4 w-4" />
            Gửi bản cập nhật để kiểm duyệt
          </Button>
        )}

        {/* Ẩn thông tin ngày công bố theo yêu cầu */}
      </div>

      {/* Status Description Alert (bỏ qua nếu không có mô tả) */}
      {config.description && (
        <Alert className={`border ${config.color}`}>
          <AlertDescription className={config.color}>
            {config.description}
          </AlertDescription>
        </Alert>
      )}

      {/* Bỏ các cảnh báo dài cho trạng thái đã công bố theo yêu cầu */}

      {/* Pending Review Notice */}
      {isPendingReview && (
        <Alert className="border-blue-300 bg-blue-50">
          <Clock className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700 text-sm">
            Khóa học của bạn đang chờ kiểm duyệt. Nhân viên sẽ xem xét trong thời gian sớm nhất. 
            Vui lòng không thực hiện các thay đổi lớn trong lúc chờ đợi.
          </AlertDescription>
        </Alert>
      )}

      <SubmitForReviewDialog
        open={submitDialogOpen}
        onOpenChange={setSubmitDialogOpen}
        onSubmit={handleSubmitForReview}
        isLoading={submitMutation.isPending}
        isResubmit={isRejected}
      />
    </div>
  );
}
