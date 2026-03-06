import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { PageHeader } from "@/components/common/page-header"
import { useAcademyExamAttempts } from "@/lib/api/services/academy-exam-attempts"

export default function AcademyExamAttemptsPage() {
  const [userId, setUserId] = useState("")
  const [classId, setClassId] = useState("")
  const [status, setStatus] = useState("")

  const query = useMemo(
    () => ({
      userId: userId || undefined,
      classId: classId || undefined,
      status: status || undefined,
    }),
    [userId, classId, status],
  )

  const { data = [], isLoading } = useAcademyExamAttempts(query)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academy · Exam Attempts"
        subtitle="Theo dõi trạng thái attempt cho Exam (staff)."
      />

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle>Danh sách</CardTitle>
          <div className="flex flex-col gap-2 md:flex-row">
            <Input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Filter theo UserId (uuid)"
            />
            <Input
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              placeholder="Filter theo ClassId (uuid)"
            />
            <Input
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="Status (IN_PROGRESS/SUBMITTED/...)"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ExamId</TableHead>
                <TableHead>UserId</TableHead>
                <TableHead>ClassId</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6}>Đang tải...</TableCell>
                </TableRow>
              ) : data.length ? (
                data.map((it) => (
                  <TableRow key={it.id}>
                    <TableCell className="font-mono text-xs">{it.examId}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {it.userId}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {it.classId ?? "-"}
                    </TableCell>
                    <TableCell>{it.status}</TableCell>
                    <TableCell>
                      {it.rawScore != null && it.maxScore != null
                        ? `${it.rawScore}/${it.maxScore}`
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/academy/exam-attempts/${it.id}`}>Xem</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6}>Chưa có dữ liệu</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

