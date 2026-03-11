import { useNavigate, useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { PageHeader } from "@/components/common/page-header"
import { ClassAssessmentForm } from "@/components/academy/class-assessment-form"
import { useAcademyClassAssessment, useUpdateAcademyClassAssessment } from "@/lib/api/services/academy-class-assessments"
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert"
import { Info } from "lucide-react"
import { toast } from "sonner"

export default function AcademyClassAssessmentEditPage() {
  const nav = useNavigate()
  const { id } = useParams<{ id: string }>()

  const { data: assessment, isLoading } = useAcademyClassAssessment(id)
  const update = useUpdateAcademyClassAssessment()

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Đang tải thông tin assessment...</div>
  }

  if (!assessment) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Không tìm thấy Assessment"
          subtitle="ID không hợp lệ hoặc assessment đã bị xoá."
        />
        <Alert variant="destructive">
          <AlertTitle>Lỗi tải dữ liệu</AlertTitle>
          <AlertDescription>
            Không tìm thấy bản ghi ClassAssessment tương ứng. Vui lòng quay lại danh sách lớp.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const classId = assessment.classId

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chỉnh sửa Class Assessment"
        subtitle="Cập nhật cấu hình bài kiểm tra/bài tập cho lớp học."
      />

      <Alert variant="default">
        <Info className="h-4 w-4" />
        <AlertTitle>Assessment lớp học</AlertTitle>
        <AlertDescription>
          Đây là instance assessment riêng của lớp
          <code className="mx-1 font-mono text-xs">{classId}</code>. Thay đổi ở đây chỉ áp dụng cho lớp này.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin Assessment</CardTitle>
          <CardDescription>
            Điều chỉnh deadline, trọng số và trạng thái publish. Các lần làm bài hiện tại vẫn được giữ theo rule backend.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClassAssessmentForm
            mode="edit"
            classId={classId}
            initial={assessment as any}
            submitting={update.isPending}
            onSubmit={async (data) => {
              try {
                await update.mutateAsync({ id: assessment.id, input: data as any })
                toast.success("Đã cập nhật Class Assessment")
                nav(`/academy/classes/${classId}?tab=assessments`)
              } catch (e: any) {
                toast.error(e?.response?.data?.message || e?.message || "Cập nhật assessment thất bại")
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}


