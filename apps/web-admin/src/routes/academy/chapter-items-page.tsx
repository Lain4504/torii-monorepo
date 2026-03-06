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
  useAcademyChapterItems,
  useDeleteAcademyChapterItem,
} from "@/lib/api/services/academy-chapter-items"

export default function AcademyChapterItemsPage() {
  const [params] = useSearchParams()
  const [chapterIdInput, setChapterIdInput] = useState(params.get("chapterId") ?? "")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const query = useMemo(
    () => ({
      chapterId: chapterIdInput || undefined,
    }),
    [chapterIdInput],
  )
  const { data = [], isLoading } = useAcademyChapterItems(query)
  const del = useDeleteAcademyChapterItem()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academy · Chapter Items"
        subtitle="Các item (Lesson/Quiz/Assignment/Exam) bên trong Chapter."
        actions={
          <Button asChild>
            <Link to="/academy/chapter-items/new">Tạo mới</Link>
          </Button>
        }
      />

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle>Danh sách</CardTitle>
          <div className="flex gap-2">
            <Input
              value={chapterIdInput}
              onChange={(e) => setChapterIdInput(e.target.value)}
              placeholder="Filter theo ChapterId (uuid)..."
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Kind</TableHead>
                <TableHead>ChapterId</TableHead>
                <TableHead>ReferenceId</TableHead>
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
                    <TableCell>{it.orderIndex}</TableCell>
                    <TableCell>{it.title}</TableCell>
                    <TableCell>{it.kind}</TableCell>
                    <TableCell className="font-mono text-xs">{it.chapterId}</TableCell>
                    <TableCell className="font-mono text-xs">{it.referenceId}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/academy/chapter-items/${it.id}/edit`}>Sửa</Link>
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
            <AlertDialogTitle>Xoá Chapter Item</AlertDialogTitle>
            <AlertDialogDescription>
              Thao tác này sẽ xoá vĩnh viễn Chapter Item và có thể ảnh hưởng tới syllabus.
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

