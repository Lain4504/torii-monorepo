import { useNavigate, useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { toast } from "@workspace/ui/components/sonner"
import { PageHeader } from "@/components/common/page-header"
import { CourseEditionForm } from "@/components/academy/course-edition-form"
import {
  useAcademyCourseEdition,
  useUpdateAcademyCourseEdition,
} from "@/lib/api/services/academy-course-editions"
import type { AcademyCourseEditionUpdateDTO } from "@workspace/schemas"

export default function AcademyCourseEditionEditPage() {
  const nav = useNavigate()
  const { id } = useParams()
  const { data: item, isLoading } = useAcademyCourseEdition(id)
  const update = useUpdateAcademyCourseEdition()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cập nhật Course Edition"
        subtitle="Chỉnh sửa phiên bản syllabus."
      />

      <Card>
        <CardHeader>
          <CardTitle>Thông tin</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || !item ? (
            <div>Đang tải...</div>
          ) : (
            <CourseEditionForm
              mode="edit"
              initial={item}
              submitting={update.isPending}
              onCancel={() => nav("/academy/course-editions")}
              onSubmit={async (data) => {
                await update.mutateAsync({
                  id: item.id,
                  input: data as AcademyCourseEditionUpdateDTO,
                })
                toast.success("Đã cập nhật")
                nav("/academy/course-editions")
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

