import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { EnrollmentForm } from "@/components/academy/enrollment-form"

interface ClassEnrollmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classId?: string
  submitting?: boolean
  onSubmit: (data: any) => Promise<void>
}

export function ClassEnrollmentDialog({
  open,
  onOpenChange,
  classId,
  submitting,
  onSubmit,
}: ClassEnrollmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Ghi danh học viên vào lớp</DialogTitle>
          <DialogDescription>
            Chọn lớp và học viên để tạo bản ghi danh thủ công. Thường dùng cho trường hợp đăng ký
            offline hoặc ưu đãi đặc biệt.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-6">
            <EnrollmentForm
              mode="create"
              defaultClassId={classId}
              onSubmit={onSubmit}
              onCancel={() => onOpenChange(false)}
              submitting={submitting}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

