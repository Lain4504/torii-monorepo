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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { PageHeader } from "@/components/common/page-header"
import {
  useAcademyCourseProfiles,
  useDeleteAcademyCourseProfile,
} from "@/lib/api/services/academy-course-profiles"
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
import { Badge } from "@workspace/ui/components/badge"
import { Search, Plus, Edit2, Trash2, FolderKey, Flag, BookOpen, Layers } from "lucide-react"

export default function AcademyCourseProfilesPage() {
  const [q, setQ] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const query = useMemo(() => ({ q: q || undefined }), [q])
  const { data = [], isLoading } = useAcademyCourseProfiles(query)
  const del = useDeleteAcademyCourseProfile()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academy · Course Profiles"
        subtitle="Định nghĩa các khung khóa học tổng quát (ví dụ: Tiếng Nhật N5, Luyện thi SAT)."
        actions={
          <Button asChild className="gap-2">
            <Link to="/academy/course-profiles/new">
              <Plus className="h-4 w-4" /> Tạo mới Profile
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="space-y-1">
            <CardTitle>Danh sách Profiles</CardTitle>
            <CardDescription>Quản lý các danh mục và cấp độ khóa học cơ bản.</CardDescription>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo mã hoặc tiêu đề..."
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">
                  <div className="flex items-center gap-2">
                    <FolderKey className="h-3.5 w-3.5" /> Mã (Code)
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-3.5 w-3.5" /> Tiêu đề
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5" /> Chủ đề
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Flag className="h-3.5 w-3.5" /> Cấp độ
                  </div>
                </TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
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
                    <TableCell>
                      <Badge variant="outline" className="font-mono bg-muted/50">
                        {it.code}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link to={`/academy/course-profiles/${it.id}`} className="hover:underline text-primary">
                        {it.title}
                      </Link>
                    </TableCell>
                    <TableCell>{it.subject || <span className="text-muted-foreground text-xs italic">N/A</span>}</TableCell>
                    <TableCell>
                      {it.level ? (
                        <Badge variant="secondary" className="font-normal">
                          {it.level}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          title="Chỉnh sửa"
                        >
                          <Link to={`/academy/course-profiles/${it.id}/edit`}>
                            <Edit2 className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={del.isPending}
                          onClick={() => setDeleteId(it.id)}
                          title="Xoá"
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
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
            <AlertDialogTitle>Xoá Course Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Thao tác này sẽ xoá vĩnh viễn Course Profile và các dữ liệu liên quan (nếu có ràng buộc).
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

