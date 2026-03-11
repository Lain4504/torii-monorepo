import { useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { PageHeader } from "@/components/common/page-header"
import { ClassAssessmentForm } from "@/components/academy/class-assessment-form"
import { useCreateAcademyClassAssessment } from "@/lib/api/services/academy-class-assessments"
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert"
import { Info } from "lucide-react"
import { toast } from "sonner"

export default function AcademyClassAssessmentCreatePage() {
  const nav = useNavigate()
  const loc = useLocation()
  const search = new URLSearchParams(loc.search)
  const classId = search.get("classId") ?? undefined
  const kind = (search.get("kind") as "QUIZ" | "ASSIGNMENT" | "EXAM" | null) || "EXAM"

  const create = useCreateAcademyClassAssessment()
  const [hasShownLegacyHint, setHasShownLegacyHint] = useState(false)

  if (!classId) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Tạo Class Assessment"
          subtitle="Thiếu classId trên URL. Hãy đi từ màn chi tiết lớp để tạo assessment."
        />
        <Alert variant="destructive">
          <AlertTitle>Thiếu thông tin lớp học</AlertTitle>
          <AlertDescription>
            Đường dẫn này yêu cầu query <code>classId</code>. Vui lòng quay lại danh sách lớp và mở từ chi tiết lớp.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const title =
    kind === "ASSIGNMENT"
      ? "Tạo Assignment cho lớp"
      : kind === "QUIZ"
        ? "Tạo Quiz cho lớp"
        : "Tạo Exam Assessment cho lớp"

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        subtitle="Cấu hình bài kiểm tra/bài tập riêng cho lớp; sau khi publish sẽ hiển thị ở tab Assessments và web-learner."
      />

      {!hasShownLegacyHint && (
        <Alert variant="secondary">
          <Info className="h-4 w-4" />
          <AlertTitle>Flow mới cho Class Assessment</AlertTitle>
          <AlertDescription>
            Đường dẫn legacy này hiện đã được nối vào form mới. Sau khi lưu, bạn sẽ được chuyển về tab
            <strong className="mx-1">Assessments</strong>
            của lớp học.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Thông tin Assessment</CardTitle>
          <CardDescription>
            Mỗi Class Assessment đại diện cho một bài kiểm tra/bài tập cụ thể trong lớp, có thể dùng lại đề thi (Exam) phía sau.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClassAssessmentForm
            mode="create"
            classId={classId}
            defaultKind={kind}
            submitting={create.isPending}
            onSubmit={async (data) => {
              try {
                await create.mutateAsync(data as any)
                toast.success("Đã tạo Class Assessment")
                setHasShownLegacyHint(true)
                nav(`/academy/classes/${classId}?tab=assessments`)
              } catch (e: any) {
                toast.error(e?.response?.data?.message || e?.message || "Tạo assessment thất bại")
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}


