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
import { toast } from "@workspace/ui/components/sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { useAcademyExams, useDeleteAcademyExam } from "@/lib/api/services/academy-exams"

export default function AcademyExamsPage() {
  const [courseProfileId, setCourseProfileId] = useState("")
  const [status, setStatus] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const query = useMemo(
    () => ({
      courseProfileId: courseProfileId || undefined,
      status: status || undefined,
    }),
    [courseProfileId, status],
  )

  const { data = [], isLoading } = useAcademyExams(query)
  const del = useDeleteAcademyExam()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academy · Exams"
        subtitle="Đề thi (exam) dùng cho đánh giá."
        actions={
          <Button asChild>
            <Link to="/academy/exams/new">Tạo Exam</Link>
          </Button>
        }
      />

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle>Danh sách</CardTitle>
          <div className="flex flex-col gap-2 md:flex-row">
            <Input
              value={courseProfileId}
              onChange={(e) => setCourseProfileId(e.target.value)}
              placeholder="Filter theo CourseProfileId (uuid)..."
            />
            <Input
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="Status (DRAFT/PUBLISHED/...)"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5}>Đang tải...</TableCell>
                </TableRow>
              ) : data.length ? (
                data.map((it) => (
                  <TableRow key={it.id}>
                    <TableCell>{it.title}</TableCell>
                    <TableCell>{it.examType}</TableCell>
                    <TableCell>{it.level ?? "-"}</TableCell>
                    <TableCell>{it.status ?? "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/academy/exams/${it.id}/edit`}>Sửa</Link>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={del.isPending}
                          onClick={() => setDeleteId(it.id)}
                        >
                          Xoá
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5}>Chưa có dữ liệu</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá Exam</AlertDialogTitle>
            <AlertDialogDescription>
              Thao tác này sẽ xoá vĩnh viễn Exam và các attempt liên quan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!deleteId) return
                try {
                  await del.mutateAsync(deleteId)
                  toast.success("Đã xoá")
                } catch (e: any) {
                  toast.error(e?.message || "Xoá thất bại")
                } finally {
                  setDeleteId(null)
                }
              }}
            >
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

