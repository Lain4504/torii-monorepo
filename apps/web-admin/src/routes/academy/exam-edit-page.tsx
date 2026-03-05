import { useNavigate, useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { toast } from "@workspace/ui/components/sonner"
import { PageHeader } from "@/components/common/page-header"
import { ExamForm } from "@/components/academy/exam-form"
import { useAcademyExam, useUpdateAcademyExam } from "@/lib/api/services/academy-exams"
import type { AcademyExamUpdateDTO } from "@workspace/schemas"

export default function AcademyExamEditPage() {
  const nav = useNavigate()
  const { id } = useParams()
  const { data: item, isLoading } = useAcademyExam(id)
  const update = useUpdateAcademyExam()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cập nhật Exam"
        subtitle="Chỉnh sửa đề thi."
      />

      <Card>
        <CardHeader>
          <CardTitle>Thông tin</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || !item ? (
            <div>Đang tải...</div>
          ) : (
            <ExamForm
              mode="edit"
              initial={item}
              submitting={update.isPending}
              onCancel={() => nav("/academy/exams")}
              onSubmit={async (data) => {
                await update.mutateAsync({
                  id: item.id,
                  input: data as AcademyExamUpdateDTO,
                })
                toast.success("Đã cập nhật")
                nav("/academy/exams")
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

