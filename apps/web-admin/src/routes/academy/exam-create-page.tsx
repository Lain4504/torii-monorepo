import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { toast } from "@workspace/ui/components/sonner"
import { PageHeader } from "@/components/common/page-header"
import { ExamForm } from "@/components/academy/exam-form"
import { useCreateAcademyExam } from "@/lib/api/services/academy-exams"
import type { AcademyExamCreateDTO } from "@workspace/schemas"

export default function AcademyExamCreatePage() {
  const nav = useNavigate()
  const create = useCreateAcademyExam()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo Exam"
        subtitle="Bước 1: Tạo khung đề. Bước 2: Thêm câu hỏi ở màn chi tiết đề thi."
      />

      <Card>
        <CardHeader>
          <CardTitle>Thông tin</CardTitle>
        </CardHeader>
        <CardContent>
          <ExamForm
            mode="create"
            submitting={create.isPending}
            onCancel={() => nav("/academy/exams")}
            onSubmit={async (data) => {
              const created = await create.mutateAsync(data as AcademyExamCreateDTO)
              toast.success("Đã tạo Exam")
              nav(`/academy/exams/${created.id}`)
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

