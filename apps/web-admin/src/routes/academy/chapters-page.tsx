import { useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
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
import {
  useAcademyChapters,
  useDeleteAcademyChapter,
} from "@/lib/api/services/academy-chapters"

export default function AcademyChaptersPage() {
  const [params] = useSearchParams()
  const [courseEditionIdInput, setCourseEditionIdInput] = useState(
    params.get("courseEditionId") ?? "",
  )
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const query = useMemo(
    () => ({
      courseEditionId: courseEditionIdInput || undefined,
    }),
    [courseEditionIdInput],
  )
  const { data = [], isLoading } = useAcademyChapters(query)
  const del = useDeleteAcademyChapter()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academy · Chapters"
        subtitle="Các chương (chapter) trong Course Edition."
        actions={
          <Button asChild>
            <Link to="/academy/chapters/new">Tạo mới</Link>
          </Button>
        }
      />

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle>Danh sách</CardTitle>
          <div className="flex gap-2">
            <Input
              value={courseEditionIdInput}
              onChange={(e) => setCourseEditionIdInput(e.target.value)}
              placeholder="Filter theo CourseEditionId (uuid)..."
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>CourseEditionId</TableHead>
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
                    <TableCell>{it.orderIndex}</TableCell>
                    <TableCell>{it.title}</TableCell>
                    <TableCell className="font-mono text-xs">{it.courseEditionId}</TableCell>
                    <TableCell>{it.status ?? "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/academy/chapters/${it.id}/edit`}>Sửa</Link>
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
            <AlertDialogTitle>Xoá Chapter</AlertDialogTitle>
            <AlertDialogDescription>
              Thao tác này sẽ xoá vĩnh viễn Chapter và các ChapterItem liên quan (nếu có).
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

