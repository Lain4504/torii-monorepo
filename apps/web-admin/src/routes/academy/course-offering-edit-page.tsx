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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { useState } from "react"

export default function AcademyCourseOfferingEditPage() {
  const nav = useNavigate()
  const { id } = useParams()
  const { data: item, isLoading } = useAcademyCourseOffering(id)
  const update = useUpdateAcademyCourseOffering()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [pendingData, setPendingData] = useState<AcademyCourseOfferingUpdateDTO | null>(null)

  const submitUpdate = async (data: AcademyCourseOfferingUpdateDTO) => {
    await update.mutateAsync({
      id: item!.id,
      input: data,
    })
    toast.success("Đã cập nhật")
    nav(`/academy/course-offerings/${item!.id}`)
  }

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
                  const payload = data as AcademyCourseOfferingUpdateDTO
                  const currentClassIds = (item.classes || []).map((c: any) => c.classId).sort()
                  const nextClassIds = (payload.classIds || currentClassIds).slice().sort()
                  const classIdsChanged =
                    JSON.stringify(currentClassIds) !== JSON.stringify(nextClassIds)
                  const priceChanged =
                    payload.originalPrice !== undefined &&
                    Number(payload.originalPrice) !== Number((item as any).originalPrice)
                  const validityChanged =
                    payload.validFrom !== undefined || payload.validTo !== undefined

                  if (item.status === "PUBLISHED" && (classIdsChanged || priceChanged || validityChanged)) {
                    setPendingData(payload)
                    setIsConfirmOpen(true)
                    return
                  }

                  await submitUpdate(payload)
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận cập nhật offering đã publish?</AlertDialogTitle>
            <AlertDialogDescription>
              Thay đổi mapping lớp / giá / thời hạn hiệu lực sẽ đưa offering về <strong>PENDING_APPROVAL</strong> và cần duyệt lại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (pendingData) {
                  await submitUpdate(pendingData)
                  setPendingData(null)
                }
              }}
              disabled={update.isPending}
            >
              Xác nhận cập nhật
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


