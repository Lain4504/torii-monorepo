import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { AlertCircle } from 'lucide-react';

interface SubmitForReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void | Promise<void>;
  isLoading?: boolean;
  isResubmit?: boolean;
}

export function SubmitForReviewDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  isResubmit = false,
}: SubmitForReviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isResubmit ? 'Gửi lại khóa học để kiểm duyệt' : 'Gửi khóa học để kiểm duyệt'}
          </DialogTitle>
          <DialogDescription>
            {isResubmit
              ? 'Khóa học của bạn sẽ được gửi lại để nhân viên kiểm duyệt những thay đổi của bạn.'
              : 'Khóa học sẽ được gửi cho nhân viên để kiểm duyệt trước khi công bố.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="border-blue-300 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700 text-sm">
              {isResubmit
                ? 'Sau khi gửi, khóa học sẽ ở trạng thái "Chờ kiểm duyệt" và nhân viên sẽ xem xét những thay đổi của bạn.'
                : 'Sau khi gửi, khóa học sẽ ở trạng thái "Chờ kiểm duyệt" cho đến khi được phê duyệt bởi nhân viên.'}
            </AlertDescription>
          </Alert>

          <div className="space-y-2 rounded-lg bg-gray-50 p-3">
            <h4 className="text-sm font-semibold">Yêu cầu trước khi gửi:</h4>
            <ul className="text-xs space-y-1 text-gray-600">
              <li>✓ Khóa học có ít nhất một module với các lesson</li>
              <li>✓ Tất cả các lesson đã được phê duyệt</li>
              <li>✓ Có hình ảnh đại diện cho khóa học</li>
              <li>✓ Đã đặt giá cho khóa học</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? 'Đang gửi...' : 'Gửi để kiểm duyệt'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
