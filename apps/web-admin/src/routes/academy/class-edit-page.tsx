import { useNavigate, useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { toast } from "@workspace/ui/components/sonner"
import { PageHeader } from "@/components/common/page-header"
import { ClassForm } from "@/components/academy/class-form"
import {
  useAcademyClass,
  useUpdateAcademyClass,
} from "@/lib/api/services/academy-classes"
import type { AcademyClassUpdateDTO } from "@workspace/schemas"

export default function AcademyClassEditPage() {
  const nav = useNavigate()
  const { id } = useParams()
  const { data: item, isLoading } = useAcademyClass(id)
  const update = useUpdateAcademyClass()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cập nhật Class"
        subtitle="Chỉnh sửa thông tin lớp học."
      />

      <Card>
        <CardHeader>
          <CardTitle>Thông tin</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || !item ? (
            <div>Đang tải...</div>
          ) : (
            <ClassForm
              mode="edit"
              initial={item}
              submitting={update.isPending}
              onCancel={() => nav("/academy/classes")}
              onSubmit={async (data) => {
                await update.mutateAsync({
                  id: item.id,
                  input: data as AcademyClassUpdateDTO,
                })
                toast.success("Đã cập nhật")
                nav("/academy/classes")
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

