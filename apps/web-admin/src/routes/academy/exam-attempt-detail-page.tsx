import { useLocation, useNavigate, useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { PageHeader } from "@/components/common/page-header"
import { useAcademyExamAttempt } from "@/lib/api/services/academy-exam-attempts"
import { useAcademyClassAssessmentAttemptQuestionDetail } from "@/lib/api/services/academy-class-assessments"

export default function AcademyExamAttemptDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const search = new URLSearchParams(location.search)
  const classId = search.get("classId") || undefined
  const classAssessmentId = search.get("classAssessmentId") || undefined
  const returnTab = search.get("tab") || "attempts"
  const backToClass = classId ? `/academy/classes/${classId}?tab=${returnTab}` : "/academy/exam-attempts"
  const { data: item, isLoading } = useAcademyExamAttempt(id)
  const { data: enrichedAttempt } = useAcademyClassAssessmentAttemptQuestionDetail(
    classAssessmentId,
    id,
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chi tiết Exam Attempt"
        subtitle="Thông tin trạng thái attempt (read-only)."
      />
      {classId ? (
        <Button variant="outline" onClick={() => navigate(backToClass)}>
          Quay lại lớp học
        </Button>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Thông tin Attempt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {isLoading || !item ? (
            <div>Đang tải...</div>
          ) : (
            <>
              <div>
                <span className="font-medium">ID:</span>{" "}
                <span className="font-mono text-xs">{item.id}</span>
              </div>
              <div>
                <span className="font-medium">ExamId:</span>{" "}
                <span className="font-mono text-xs">{item.examId}</span>
              </div>
              <div>
                <span className="font-medium">UserId:</span>{" "}
                <span className="font-mono text-xs">{item.userId}</span>
              </div>
              <div>
                <span className="font-medium">ClassId:</span>{" "}
                <span className="font-mono text-xs">{item.classId ?? "-"}</span>
              </div>
              <div>
                <span className="font-medium">Status:</span> {item.status}
              </div>
              <div>
                <span className="font-medium">Started at:</span>{" "}
                {new Date(item.startedAt).toLocaleString("vi-VN")}
              </div>
              <div>
                <span className="font-medium">Submitted at:</span>{" "}
                {item.submittedAt
                  ? new Date(item.submittedAt).toLocaleString("vi-VN")
                  : "-"}
              </div>
              <div>
                <span className="font-medium">Completed at:</span>{" "}
                {item.completedAt
                  ? new Date(item.completedAt).toLocaleString("vi-VN")
                  : "-"}
              </div>
              <div>
                <span className="font-medium">Score:</span>{" "}
                {item.rawScore != null && item.maxScore != null
                  ? `${item.rawScore}/${item.maxScore} (${item.percentage ?? "-"}%)`
                  : "-"}
              </div>
              <div>
                <span className="font-medium">Passed:</span>{" "}
                {item.isPassed == null ? "-" : item.isPassed ? "Yes" : "No"}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {!enrichedAttempt?.details?.length ? null : (
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết câu trả lời</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Câu hỏi</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Kết quả</TableHead>
                  <TableHead>Điểm</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrichedAttempt.details.map((detail: any) => (
                  <TableRow key={detail.id}>
                    <TableCell className="max-w-[420px] truncate">{detail.question?.content}</TableCell>
                    <TableCell>{detail.question?.questionType || "-"}</TableCell>
                    <TableCell>
                      {detail.isCorrect === null
                        ? "Cần chấm tay"
                        : detail.isCorrect
                          ? "Đúng"
                          : "Sai"}
                    </TableCell>
                    <TableCell>{detail.pointsEarned ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

