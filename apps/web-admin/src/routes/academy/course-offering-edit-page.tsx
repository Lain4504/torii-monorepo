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
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert"
import { AlertCircle } from "lucide-react"

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
            <div className="space-y-4">
              {item.status === "PUBLISHED" && (
                <Alert className="bg-amber-500/5 border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-700 font-bold">Chế độ sửa gói bán đang xuất bản</AlertTitle>
                  <AlertDescription className="text-amber-600">
                    Lưu ý: Nếu bạn thay đổi các thông tin quan trọng (Tiêu đề, Giá, Lớp học liên kết),
                    gói bán sẽ <strong>tự động chuyển về trạng thái Chờ phê duyệt</strong> và bị tạm ẩn khỏi trang chủ.
                  </AlertDescription>
                </Alert>
              )}
              <CourseOfferingForm
                mode="edit"
                initial={item}
                submitting={update.isPending}
                onCancel={() => nav(`/academy/course-offerings/${item.id}`)}
                onSubmit={async (data) => {
                  await update.mutateAsync({
                    id: item.id,
                    input: data as AcademyCourseOfferingUpdateDTO,
                  })
                  toast.success("Đã cập nhật")
                  nav(`/academy/course-offerings/${item.id}`)
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


