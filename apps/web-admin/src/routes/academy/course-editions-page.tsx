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
import {
  useAcademyCourseEditions,
  useDeleteAcademyCourseEdition,
  useSetCurrentAcademyCourseEdition,
} from "@/lib/api/services/academy-course-editions"

export default function AcademyCourseEditionsPage() {
  const [courseProfileId, setCourseProfileId] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const query = useMemo(
    () => ({
      courseProfileId: courseProfileId || undefined,
    }),
    [courseProfileId],
  )
  const { data = [], isLoading } = useAcademyCourseEditions(query)
  const del = useDeleteAcademyCourseEdition()
  const setCurrent = useSetCurrentAcademyCourseEdition()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academy · Course Editions"
        subtitle="Phiên bản chương trình học (syllabus) theo thời gian."
        actions={
          <Button asChild>
            <Link to="/academy/course-editions/new">Tạo mới</Link>
          </Button>
        }
      />

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle>Danh sách</CardTitle>
          <div className="flex gap-2">
            <Input
              value={courseProfileId}
              onChange={(e) => setCourseProfileId(e.target.value)}
              placeholder="Filter theo CourseProfileId (uuid)..."
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Edition</TableHead>
                <TableHead>CourseProfileId</TableHead>
                <TableHead>Current</TableHead>
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
                    <TableCell className="font-medium">{it.editionTag}</TableCell>
                    <TableCell className="font-mono text-xs">{it.courseProfileId}</TableCell>
                    <TableCell>{it.isCurrent ? "Yes" : "No"}</TableCell>
                    <TableCell>{it.status ?? "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!it.isCurrent ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={setCurrent.isPending}
                            onClick={async () => {
                              try {
                                await setCurrent.mutateAsync(it.id)
                                toast.success("Đã set current")
                              } catch (e: any) {
                                toast.error(e?.message || "Thao tác thất bại")
                              }
                            }}
                          >
                            Set current
                          </Button>
                        ) : null}
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/academy/course-editions/${it.id}/edit`}>Sửa</Link>
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
            <AlertDialogTitle>Xoá Course Edition</AlertDialogTitle>
            <AlertDialogDescription>
              Thao tác này sẽ xoá vĩnh viễn Course Edition và dữ liệu liên quan (nếu có ràng buộc).
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

