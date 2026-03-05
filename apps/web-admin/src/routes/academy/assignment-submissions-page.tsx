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
import { useAcademyAssignmentSubmissions } from "@/lib/api/services/academy-assignment-submissions"

export default function AcademyAssignmentSubmissionsPage() {
  const [classId, setClassId] = useState("")
  const [classAssessmentId, setClassAssessmentId] = useState("")
  const [userId, setUserId] = useState("")

  const query = useMemo(
    () => ({
      classId: classId || undefined,
      classAssessmentId: classAssessmentId || undefined,
      userId: userId || undefined,
    }),
    [classId, classAssessmentId, userId],
  )

  const { data = [], isLoading } = useAcademyAssignmentSubmissions(query)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academy · Assignment Submissions"
        subtitle="Theo dõi bài nộp Assignment của học viên."
      />

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle>Danh sách</CardTitle>
          <div className="flex flex-col gap-2 md:flex-row">
            <Input
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              placeholder="Filter theo ClassId (uuid)"
            />
            <Input
              value={classAssessmentId}
              onChange={(e) => setClassAssessmentId(e.target.value)}
              placeholder="Filter theo ClassAssessmentId (uuid)"
            />
            <Input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Filter theo UserId (uuid)"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ClassId</TableHead>
                <TableHead>AssessmentId</TableHead>
                <TableHead>UserId</TableHead>
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
                    <TableCell className="font-mono text-xs">{it.classId}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {it.classAssessmentId}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{it.userId}</TableCell>
                    <TableCell>{it.status}</TableCell>
                    <TableCell>
                      {it.score != null ? it.score : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/academy/assignment-submissions/${it.id}`}>
                          Xem / chấm
                        </Link>
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

