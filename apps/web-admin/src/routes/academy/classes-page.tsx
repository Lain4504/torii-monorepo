import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { Input } from "@workspace/ui/components/input"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
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
  useAcademyClasses,
  useDeleteAcademyClass,
} from "@/lib/api/services/academy-classes"

export default function AcademyClassesPage() {
  const [courseProfileId, setCourseProfileId] = useState("")
  const [courseEditionId, setCourseEditionId] = useState("")
  const [mode, setMode] = useState("")
  const [status, setStatus] = useState("")
  const [q, setQ] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const query = useMemo(
    () => ({
      courseProfileId: courseProfileId || undefined,
      courseEditionId: courseEditionId || undefined,
      mode: mode || undefined,
      status: status || undefined,
      q: q || undefined,
    }),
    [courseProfileId, courseEditionId, mode, status, q],
  )

  const { data = [], isLoading } = useAcademyClasses(query)
  const del = useDeleteAcademyClass()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academy · Classes"
        subtitle="Các lớp học cụ thể gắn với CourseProfile/CourseEdition."
        actions={
          <Button asChild>
            <Link to="/academy/classes/new">Tạo mới</Link>
          </Button>
        }
      />

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle>Danh sách</CardTitle>
          <div className="flex flex-col gap-2 md:flex-row">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo code/name..."
            />
            <Input
              value={courseProfileId}
              onChange={(e) => setCourseProfileId(e.target.value)}
              placeholder="Filter CourseProfileId (uuid)"
            />
            <Input
              value={courseEditionId}
              onChange={(e) => setCourseEditionId(e.target.value)}
              placeholder="Filter CourseEditionId (uuid)"
            />
          </div>
          <div className="flex flex-col gap-2 md:flex-row">
            <Input
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              placeholder="Mode (VOD/LIVE/BLENDED)"
            />
            <Input
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="Status (DRAFT/ENROLLING/...)"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Term/Batch</TableHead>
                <TableHead>Status</TableHead>
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
                    <TableCell className="font-mono text-xs">
                      <Link to={`/academy/classes/${it.id}`} className="hover:underline text-primary">
                        {it.code}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/academy/classes/${it.id}`} className="hover:underline font-medium">
                        {it.name}
                      </Link>
                    </TableCell>
                    <TableCell>{it.mode}</TableCell>
                    <TableCell>
                      {it.term ?? "-"} / {it.batch ?? "-"}
                    </TableCell>
                    <TableCell>{it.status ?? "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/academy/classes/${it.id}/edit`}>Sửa</Link>
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
                  <TableCell colSpan={6}>Chưa có dữ liệu</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá Class</AlertDialogTitle>
            <AlertDialogDescription>
              Thao tác này sẽ xoá vĩnh viễn Class và có thể ảnh hưởng đến enrollment/certificates
              liên quan.
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

