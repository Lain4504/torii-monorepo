import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { PageHeader } from "@/components/common/page-header"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { MoreVertical, Filter, Layers, Layout } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { useAcademyCourseProfiles } from "@/lib/api/services/academy-course-profiles"
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
import { toast } from "sonner"

export default function AcademyExamsPage() {
  const [courseProfileId, setCourseProfileId] = useState("all")
  const [status, setStatus] = useState("all")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: profiles = [] } = useAcademyCourseProfiles({})

  const query = useMemo(
    () => ({
      courseProfileId: courseProfileId === "all" ? undefined : courseProfileId,
      status: status === "all" ? undefined : status,
    }),
    [courseProfileId, status],
  )

  const { data = [], isLoading } = useAcademyExams(query)
  const del = useDeleteAcademyExam()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academy · Đề thi"
        subtitle="Quản lý đề thi và các kỳ thi trong hệ thống."
        actions={
          <Button asChild>
            <Link to="/academy/exams/new">Tạo Đề thi</Link>
          </Button>
        }
      />

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách Đề thi</CardTitle>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex-1">
              <Select value={courseProfileId} onValueChange={setCourseProfileId}>
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <Layout className="size-4 text-muted-foreground" />
                    <SelectValue placeholder="Tất cả Course Profile" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả Course Profile</SelectItem>
                  {profiles.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.code} - {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-[200px]">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Filter className="size-4 text-muted-foreground" />
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">STT</TableHead>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Cấp độ</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : data.length ? (
                data.map((it, idx) => (
                  <TableRow key={it.id}>
                    <TableCell className="text-muted-foreground font-medium">{idx + 1}</TableCell>
                    <TableCell className="font-semibold">{it.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">{it.examType}</Badge>
                    </TableCell>
                    <TableCell>
                      {it.level ? (
                        <div className="flex items-center gap-1.5 text-sm font-medium">
                          <Layers className="size-3.5 text-primary" />
                          {it.level}
                        </div>
                      ) : "-"}
                    </TableCell>
                    <TableCell>
                      {it.status === "PUBLISHED" ? (
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20 shadow-none">PUBLISHED</Badge>
                      ) : it.status === "DRAFT" ? (
                        <Badge variant="secondary" className="opacity-70 shadow-none">DRAFT</Badge>
                      ) : (
                        <Badge variant="outline" className="shadow-none">{it.status}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            size="icon"
                          >
                            <span className="sr-only">Mở menu thao tác</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem asChild>
                            <Link to={`/academy/exams/${it.id}`}>
                              Xem chi tiết & Câu hỏi
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/academy/exams/${it.id}/edit`}>
                              Sửa thông tin
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteId(it.id)}
                          >
                            Xoá
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Chưa có đề thi nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá Đề thi</AlertDialogTitle>
            <AlertDialogDescription>
              Thao tác này sẽ xoá vĩnh viễn Đề thi và các dữ liệu liên quan. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!deleteId) return
                try {
                  await del.mutateAsync(deleteId)
                  toast.success("Đã xoá đề thi thành công")
                } catch (e: any) {
                  toast.error(e?.message || "Xoá đề thi thất bại")
                } finally {
                  setDeleteId(null)
                }
              }}
            >
              Xác nhận Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
