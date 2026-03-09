import { useNavigate, useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"
import { PageHeader } from "@/components/common/page-header"
import { ClassQuizForm } from "@/components/academy/class-quiz-form"
import { ClassAssignmentForm } from "@/components/academy/class-assignment-form"
import {
  useAcademyClassAssessment,
  useUpdateAcademyClassAssessment,
} from "@/lib/api/services/academy-class-assessments"
import { useAcademyClass } from "@/lib/api/services/academy-classes"
import type { AcademyClassAssessmentUpdateDTO } from "@workspace/schemas"

export default function AcademyClassAssessmentEditPage() {
  const nav = useNavigate()
  const { id } = useParams()
  const { data: item, isLoading } = useAcademyClassAssessment(id)
  const { data: klass } = useAcademyClass(item?.classId)
  const update = useUpdateAcademyClassAssessment()

  const isQuiz = item?.kind === "QUIZ"
  const isForbiddenVodAssignment = item?.kind === "ASSIGNMENT" && klass?.mode === "VOD"

  return (
    <div className="space-y-6">
      <PageHeader
        title={isLoading ? "..." : (isQuiz ? "Cập nhật Class Quiz" : "Cập nhật Class Assignment")}
        subtitle="Chỉnh sửa đánh giá của lớp học."
      />

      <Card>
        <CardHeader>
          <CardTitle>Thông tin {isLoading ? "" : (isQuiz ? "Quiz" : "Assignment")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isForbiddenVodAssignment ? (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>VOD class không hỗ trợ Assignment</AlertTitle>
              <AlertDescription className="space-y-4">
                <p>Assessment này thuộc lớp VOD nên không thể chỉnh sửa dưới dạng Assignment.</p>
                <Button variant="outline" onClick={() => nav(`/academy/classes/${item?.classId}`)}>
                  Quay lại chi tiết lớp
                </Button>
              </AlertDescription>
            </Alert>
          ) : null}
          {isLoading || !item ? (
            <div>Đang tải...</div>
          ) : isQuiz ? (
            <ClassQuizForm
              mode="edit"
              initial={item}
              submitting={update.isPending}
              onCancel={() => nav(`/academy/classes/${item.classId}`)}
              onSubmit={async (data) => {
                await update.mutateAsync({
                  id: item.id,
                  input: data as AcademyClassAssessmentUpdateDTO,
                })
                toast.success("Đã cập nhật Quiz")
                nav(`/academy/classes/${item.classId}`)
              }}
            />
          ) : isForbiddenVodAssignment ? null : (
            <ClassAssignmentForm
              mode="edit"
              initial={item}
              submitting={update.isPending}
              onCancel={() => nav(`/academy/classes/${item.classId}`)}
              onSubmit={async (data) => {
                await update.mutateAsync({
                  id: item.id,
                  input: data as AcademyClassAssessmentUpdateDTO,
                })
                toast.success("Đã cập nhật Assignment")
                nav(`/academy/classes/${item.classId}`)
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

