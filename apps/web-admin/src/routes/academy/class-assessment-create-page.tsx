import { useLocation, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { toast } from "@workspace/ui/components/sonner"
import { PageHeader } from "@/components/common/page-header"
import { ClassAssessmentForm } from "@/components/academy/class-assessment-form"
import { useCreateAcademyClassAssessment } from "@/lib/api/services/academy-class-assessments"
import type { AcademyClassAssessmentCreateDTO } from "@workspace/schemas"

export default function AcademyClassAssessmentCreatePage() {
  const nav = useNavigate()
  const loc = useLocation()
  const search = new URLSearchParams(loc.search)
  const classId = search.get("classId") ?? undefined
  const create = useCreateAcademyClassAssessment()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo Class Assessment"
        subtitle="Tạo Quiz/Assignment cho lớp."
      />

      <Card>
        <CardHeader>
          <CardTitle>Thông tin</CardTitle>
        </CardHeader>
        <CardContent>
          <ClassAssessmentForm
            mode="create"
            submitting={create.isPending}
            defaultClassId={classId}
            onCancel={() => nav("/academy/class-assessments")}
            onSubmit={async (data) => {
              await create.mutateAsync(data as AcademyClassAssessmentCreateDTO)
              toast.success("Đã tạo Class Assessment")
              nav("/academy/class-assessments")
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

