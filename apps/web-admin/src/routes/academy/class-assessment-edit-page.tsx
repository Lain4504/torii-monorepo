import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import { PageHeader } from "@/components/common/page-header"

export default function AcademyClassAssessmentEditPage() {
  const nav = useNavigate()
  return (
    <div className="space-y-6">
      <PageHeader
        title="Trang chỉnh sửa Assessment cũ"
        subtitle="Flow này đã được thay thế bởi cấu trúc Exam/Assignment mới."
      />

      <Card>
        <CardHeader>
          <CardTitle>Assessment legacy</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTitle>Không còn hỗ trợ chỉnh sửa tại đây</AlertTitle>
            <AlertDescription className="space-y-4">
              <p>
                Các bài kiểm tra và bài tập của lớp hiện được cấu hình trực tiếp trong trang chi tiết lớp
                (tab Assessments / Exams) theo mô hình mới.
              </p>
              <Button variant="outline" onClick={() => nav("/academy/classes")}>
                Quay lại danh sách lớp
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}

