import { useLocation, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { toast } from "@workspace/ui/components/sonner"
import { PageHeader } from "@/components/common/page-header"
import { ClassForm } from "@/components/academy/class-form"
import { useCreateAcademyClass } from "@/lib/api/services/academy-classes"
import type { AcademyClassCreateDTO } from "@workspace/schemas"

export default function AcademyClassCreatePage() {
  const nav = useNavigate()
  const loc = useLocation()
  const search = new URLSearchParams(loc.search)
  const courseProfileId = search.get("courseProfileId") ?? undefined
  const courseEditionId = search.get("courseEditionId") ?? undefined
  const create = useCreateAcademyClass()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo Class"
        subtitle="Tạo lớp học cụ thể để triển khai chương trình."
      />

      <Card>
        <CardHeader>
          <CardTitle>Thông tin</CardTitle>
        </CardHeader>
        <CardContent>
          <ClassForm
            mode="create"
            submitting={create.isPending}
            defaultCourseProfileId={courseProfileId}
            defaultCourseEditionId={courseEditionId}
            onCancel={() => nav("/academy/classes")}
            onSubmit={async (data) => {
              await create.mutateAsync(data as AcademyClassCreateDTO)
              toast.success("Đã tạo Class")
              nav("/academy/classes")
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

