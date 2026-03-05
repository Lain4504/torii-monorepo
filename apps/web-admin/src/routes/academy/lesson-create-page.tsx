import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { PageHeader } from "@/components/common/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { useCreateAcademyLesson } from "@/lib/api/services/academy-lessons"
import type { AcademyLessonCreateDTO } from "@workspace/schemas"
import { LessonForm } from "@/components/academy/lesson-form"

export default function AcademyLessonCreatePage() {
  const nav = useNavigate()
  const create = useCreateAcademyLesson()

  async function onSubmit(data: AcademyLessonCreateDTO) {
    try {
      await create.mutateAsync(data)
      toast.success("Đã tạo Lesson")
      nav("/academy/lessons")
    } catch (e: any) {
      toast.error(e?.message || "Tạo thất bại")
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo Lesson Mới"
        subtitle="Thêm bài học vào hệ thống."
      />

      <Card>
        <CardHeader>
          <CardTitle>Thông tin bài học</CardTitle>
        </CardHeader>
        <CardContent>
          <LessonForm
            mode="create"
            submitting={create.isPending}
            onCancel={() => nav("/academy/lessons")}
            onSubmit={onSubmit}
          />
        </CardContent>
      </Card>
    </div>
  )
}
