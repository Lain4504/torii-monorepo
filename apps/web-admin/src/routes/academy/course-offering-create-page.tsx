import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { toast } from "@workspace/ui/components/sonner"
import { PageHeader } from "@/components/common/page-header"
import { CourseOfferingForm } from "@/components/academy/course-offering-form"
import { useCreateAcademyCourseOffering } from "@/lib/api/services/academy-course-offerings"
import type { AcademyCourseOfferingCreateDTO } from "@workspace/schemas"

export default function AcademyCourseOfferingCreatePage() {
  const nav = useNavigate()
  const create = useCreateAcademyCourseOffering()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo Course Offering"
        subtitle="Tạo gói bán (bundle) cho learner đăng ký."
      />

      <Card>
        <CardHeader>
          <CardTitle>Thông tin</CardTitle>
        </CardHeader>
        <CardContent>
          <CourseOfferingForm
            mode="create"
            submitting={create.isPending}
            onCancel={() => nav("/academy/course-offerings")}
            onSubmit={async (data) => {
              await create.mutateAsync(data as AcademyCourseOfferingCreateDTO)
              toast.success("Đã tạo Course Offering")
              nav("/academy/course-offerings")
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

