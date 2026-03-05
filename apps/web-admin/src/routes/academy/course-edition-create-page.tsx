import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { toast } from "@workspace/ui/components/sonner"
import { PageHeader } from "@/components/common/page-header"
import { CourseEditionForm } from "@/components/academy/course-edition-form"
import { useCreateAcademyCourseEdition } from "@/lib/api/services/academy-course-editions"
import type { AcademyCourseEditionCreateDTO } from "@workspace/schemas"

export default function AcademyCourseEditionCreatePage() {
  const nav = useNavigate()
  const create = useCreateAcademyCourseEdition()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo Course Edition"
        subtitle="Tạo phiên bản chương trình học (syllabus) cho một Course Profile."
      />

      <Card>
        <CardHeader>
          <CardTitle>Thông tin</CardTitle>
        </CardHeader>
        <CardContent>
          <CourseEditionForm
            mode="create"
            submitting={create.isPending}
            onCancel={() => nav("/academy/course-editions")}
            onSubmit={async (data) => {
              await create.mutateAsync(data as AcademyCourseEditionCreateDTO)
              toast.success("Đã tạo Course Edition")
              nav("/academy/course-editions")
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

