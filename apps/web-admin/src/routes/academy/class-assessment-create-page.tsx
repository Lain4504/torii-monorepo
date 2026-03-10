import { useLocation, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import { PageHeader } from "@/components/common/page-header"

export default function AcademyClassAssessmentCreatePage() {
  const nav = useNavigate()
  const loc = useLocation()
  const search = new URLSearchParams(loc.search)
  const classId = search.get("classId") ?? undefined
  const kind = search.get("kind") || "QUIZ"
  const isQuiz = kind === "QUIZ"

  return (
    <div className="space-y-6">
      <PageHeader
        title={isQuiz ? "Tạo Class Quiz" : "Tạo Class Assignment"}
        subtitle={`Tạo ${isQuiz ? "Quiz" : "Assignment"} cho lớp học theo flow VOD/LIVE.`}
      />

      <Card>
        <CardHeader>
          <CardTitle>Đường dẫn tạo Assessment cũ</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTitle>Flow này đã được thay thế</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>
                Tạo Quiz/Assignment cho lớp học hiện được thực hiện trực tiếp trong trang chi tiết lớp và syllabus,
                dựa trên mô hình Exam/Assignment mới.
              </p>
              <Button variant="outline" onClick={() => nav(`/academy/classes/${classId}`)}>
                Quay lại chi tiết lớp
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}

