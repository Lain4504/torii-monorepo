import { useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { PageHeader } from "@/components/common/page-header"
import { useAcademyExamAttempt } from "@/lib/api/services/academy-exam-attempts"

export default function AcademyExamAttemptDetailPage() {
  const { id } = useParams()
  const { data: item, isLoading } = useAcademyExamAttempt(id)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chi tiết Exam Attempt"
        subtitle="Thông tin trạng thái attempt (read-only)."
      />

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
    </div>
  )
}

