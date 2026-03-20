import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import type { AcademyClassAssessment } from "@/lib/api/services/academy-class-assessments"
import { ClassAssessmentForm } from "@/components/academy/class-assessment-form"

interface ClassAssessmentSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classId: string
  initial?: AcademyClassAssessment | null
  submitting?: boolean
  onSubmit: (data: any) => Promise<void>
}

export function ClassAssessmentSheet({
  open,
  onOpenChange,
  classId,
  initial,
  submitting,
  onSubmit,
}: ClassAssessmentSheetProps) {
  const isEdit = !!initial

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="!w-full sm:!max-w-[720px] max-h-screen p-0 flex flex-col overflow-hidden">
        <SheetHeader className="p-6 border-b shrink-0">
          <SheetTitle>
            {isEdit ? "Chỉnh sửa Assessment" : "Tạo Assessment mới cho lớp"}
          </SheetTitle>
          <SheetDescription>
            Cấu hình một quiz/exam/assignment gắn riêng với lớp học này.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-6 p-6">
            <ClassAssessmentForm
              mode={isEdit ? "edit" : "create"}
              classId={classId}
              initial={initial || undefined}
              submitting={submitting}
              onSubmit={onSubmit}
            />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}


