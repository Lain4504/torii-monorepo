import { useNavigate, useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { toast } from "@workspace/ui/components/sonner"
import { PageHeader } from "@/components/common/page-header"
import { ClassAssessmentForm } from "@/components/academy/class-assessment-form"
import {
  useAcademyClassAssessment,
  useUpdateAcademyClassAssessment,
} from "@/lib/api/services/academy-class-assessments"
import type { AcademyClassAssessmentUpdateDTO } from "@workspace/schemas"

export default function AcademyClassAssessmentEditPage() {
  const nav = useNavigate()
  const { id } = useParams()
  const { data: item, isLoading } = useAcademyClassAssessment(id)
  const update = useUpdateAcademyClassAssessment()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cập nhật Class Assessment"
        subtitle="Chỉnh sửa Quiz/Assignment của lớp."
      />

      <Card>
        <CardHeader>
          <CardTitle>Thông tin</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || !item ? (
            <div>Đang tải...</div>
          ) : (
            <ClassAssessmentForm
              mode="edit"
              initial={item}
              submitting={update.isPending}
              onCancel={() => nav("/academy/class-assessments")}
              onSubmit={async (data) => {
                await update.mutateAsync({
                  id: item.id,
                  input: data as AcademyClassAssessmentUpdateDTO,
                })
                toast.success("Đã cập nhật")
                nav("/academy/class-assessments")
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

