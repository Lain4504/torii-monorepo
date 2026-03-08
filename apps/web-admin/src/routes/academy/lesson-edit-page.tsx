import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { PageHeader } from "@/components/common/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { useAcademyLesson, useUpdateAcademyLesson } from "@/lib/api/services/academy-lessons"
import type { AcademyLessonCreateDTO } from "@workspace/schemas"
import { LessonForm } from "@/components/academy/lesson-form"

export default function AcademyLessonEditPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const { data: lesson, isLoading } = useAcademyLesson(id)
  const update = useUpdateAcademyLesson()

  async function onSubmit(data: AcademyLessonCreateDTO) {
    if (!id) return
    try {
      await update.mutateAsync({ id, input: data })
      toast.success("Đã cập nhật Lesson")
      nav(-1)
    } catch (e: any) {
      toast.error(e?.message || "Cập nhật thất bại")
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (!lesson) return <div>Lesson not found</div>

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sửa Lesson"
        subtitle={`Chỉnh sửa bài học: ${lesson.title}`}
      />

      <Card>
        <CardHeader>
          <CardTitle>Thông tin bài học</CardTitle>
        </CardHeader>
        <CardContent>
          <LessonForm
            mode="edit"
            defaultValues={{
              ...lesson,
              contentUrl: lesson.contentUrl ?? undefined,
              contentBody: lesson.contentBody ?? undefined,
              attachments: lesson.attachments ?? undefined,
              metadata: lesson.metadata ?? undefined,
            }}
            submitting={update.isPending}
            onCancel={() => nav(-1)}
            onSubmit={onSubmit}
          />
        </CardContent>
      </Card>
    </div>
  )
}