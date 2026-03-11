import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import type { AcademyClassAssessment } from "@/lib/api/services/academy-class-assessments"
import { ClassAssessmentForm } from "@/components/academy/class-assessment-form"

interface ClassAssessmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classId: string
  initial?: AcademyClassAssessment | null
  submitting?: boolean
  onSubmit: (data: any) => Promise<void>
}

export function ClassAssessmentDialog({
  open,
  onOpenChange,
  classId,
  initial,
  submitting,
  onSubmit,
}: ClassAssessmentDialogProps) {
  const isEdit = !!initial

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] max-h-[90vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>
            {isEdit ? "Chỉnh sửa Assessment" : "Tạo Assessment mới cho lớp"}
          </DialogTitle>
          <DialogDescription>
            Cấu hình một quiz/exam/assignment gắn riêng với lớp học này.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-6">
            <ClassAssessmentForm
              mode={isEdit ? "edit" : "create"}
              classId={classId}
              initial={initial || undefined}
              submitting={submitting}
              onSubmit={onSubmit}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

