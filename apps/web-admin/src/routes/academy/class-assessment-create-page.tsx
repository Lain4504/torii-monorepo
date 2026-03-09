import { useLocation, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { toast } from "@workspace/ui/components/sonner"
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import { PageHeader } from "@/components/common/page-header"
import { ClassQuizForm } from "@/components/academy/class-quiz-form"
import { ClassAssignmentForm } from "@/components/academy/class-assignment-form"
import { useCreateAcademyClassAssessment } from "@/lib/api/services/academy-class-assessments"
import { useAcademyClass } from "@/lib/api/services/academy-classes"
import type { AcademyClassAssessmentCreateDTO } from "@workspace/schemas"

export default function AcademyClassAssessmentCreatePage() {
  const nav = useNavigate()
  const loc = useLocation()
  const search = new URLSearchParams(loc.search)
  const classId = search.get("classId") ?? undefined
  const kind = search.get("kind") || "QUIZ"
  const create = useCreateAcademyClassAssessment()
  const { data: klass } = useAcademyClass(classId || "")

  const isQuiz = kind === "QUIZ"
  const isForbiddenVodAssignment = kind === "ASSIGNMENT" && klass?.mode === "VOD"

  return (
    <div className="space-y-6">
      <PageHeader
        title={isQuiz ? "Tạo Class Quiz" : "Tạo Class Assignment"}
        subtitle={`Tạo ${isQuiz ? "Quiz" : "Assignment"} cho lớp học.`}
      />

      <Card>
        <CardHeader>
          <CardTitle>Thông tin {isQuiz ? "Quiz" : "Assignment"}</CardTitle>
        </CardHeader>
        <CardContent>
          {isForbiddenVodAssignment ? (
            <Alert variant="destructive">
              <AlertTitle>VOD class không hỗ trợ Assignment</AlertTitle>
              <AlertDescription className="space-y-4">
                <p>Chỉ lớp LIVE mới có thể tạo Assignment.</p>
                <Button variant="outline" onClick={() => nav(`/academy/classes/${classId}`)}>
                  Quay lại chi tiết lớp
                </Button>
              </AlertDescription>
            </Alert>
          ) : null}
          {isQuiz ? (
            <ClassQuizForm
              mode="create"
              submitting={create.isPending}
              defaultClassId={classId}
              onCancel={() => nav(`/academy/classes/${classId}`)}
              onSubmit={async (data) => {
                await create.mutateAsync(data as AcademyClassAssessmentCreateDTO)
                toast.success("Đã tạo Class Quiz")
                nav(`/academy/classes/${classId}`)
              }}
            />
          ) : isForbiddenVodAssignment ? null : (
            <ClassAssignmentForm
              mode="create"
              submitting={create.isPending}
              defaultClassId={classId}
              onCancel={() => nav(`/academy/classes/${classId}`)}
              onSubmit={async (data) => {
                await create.mutateAsync(data as AcademyClassAssessmentCreateDTO)
                toast.success("Đã tạo Class Assignment")
                nav(`/academy/classes/${classId}`)
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

