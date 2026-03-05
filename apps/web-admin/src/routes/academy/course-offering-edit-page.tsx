import { useNavigate, useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { toast } from "@workspace/ui/components/sonner"
import { PageHeader } from "@/components/common/page-header"
import { CourseOfferingForm } from "@/components/academy/course-offering-form"
import {
  useAcademyCourseOffering,
  useUpdateAcademyCourseOffering,
} from "@/lib/api/services/academy-course-offerings"
import type { AcademyCourseOfferingUpdateDTO } from "@workspace/schemas"

export default function AcademyCourseOfferingEditPage() {
  const nav = useNavigate()
  const { id } = useParams()
  const { data: item, isLoading } = useAcademyCourseOffering(id)
  const update = useUpdateAcademyCourseOffering()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cập nhật Course Offering"
        subtitle="Chỉnh sửa gói bán."
      />

      <Card>
        <CardHeader>
          <CardTitle>Thông tin</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || !item ? (
            <div>Đang tải...</div>
          ) : (
            <CourseOfferingForm
              mode="edit"
              initial={item}
              submitting={update.isPending}
              onCancel={() => nav("/academy/course-offerings")}
              onSubmit={async (data) => {
                await update.mutateAsync({
                  id: item.id,
                  input: data as AcademyCourseOfferingUpdateDTO,
                })
                toast.success("Đã cập nhật")
                nav("/academy/course-offerings")
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

