import { useLocation, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { toast } from "@workspace/ui/components/sonner"
import { PageHeader } from "@/components/common/page-header"
import { ClassQuizForm } from "@/components/academy/class-quiz-form"
import { ClassAssignmentForm } from "@/components/academy/class-assignment-form"
import { useCreateAcademyClassAssessment } from "@/lib/api/services/academy-class-assessments"
import type { AcademyClassAssessmentCreateDTO } from "@workspace/schemas"

export default function AcademyClassAssessmentCreatePage() {
  const nav = useNavigate()
  const loc = useLocation()
  const search = new URLSearchParams(loc.search)
  const classId = search.get("classId") ?? undefined
  const kind = search.get("kind") || "QUIZ"
  const create = useCreateAcademyClassAssessment()

  const isQuiz = kind === "QUIZ"

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
          ) : (
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

