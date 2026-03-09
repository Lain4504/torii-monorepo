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
import { PageHeader } from "@/components/common/page-header"
import {
  Empty,
  EmptyContent,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@workspace/ui/components/empty"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  useAcademyCourseProfiles,
  useArchiveAcademyCourseProfile,
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
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Archive,
  FolderKey,
  Flag,
  BookOpen,
  Eye,
  SlidersHorizontal,
  Sparkles,
  BookMarked,
  MoreVertical,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

export default function AcademyCourseProfilesPage() {
  const [q, setQ] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [archiveId, setArchiveId] = useState<string | null>(null)

  const query = useMemo(() => ({ q: q || undefined }), [q])
  const { data = [], isLoading } = useAcademyCourseProfiles(query)
  const archiveMutation = useArchiveAcademyCourseProfile()
  const del = useDeleteAcademyCourseProfile()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Profiles"
        subtitle="Quản lý các khung chương trình đào tạo tổng quát và tài nguyên gốc."
        actions={
          <Button asChild className="gap-2 shadow-sm">
            <Link to="/academy/course-profiles/new">
              <Plus className="h-4 w-4" /> Tạo Profile mới
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between w-full">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo mã hoặc tiêu đề..."
            className="pl-9"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="size-4 text-muted-foreground" />
                <span>Sắp xếp</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuGroup>
                <DropdownMenuItem className="flex justify-between">
                  Mới nhất <Sparkles className="size-3 text-amber-500" />
                </DropdownMenuItem>
                <DropdownMenuItem>Cũ nhất</DropdownMenuItem>
                <DropdownMenuItem>Tiêu đề (A-Z)</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md bg-background border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[80px]">STT</TableHead>
              <TableHead className="w-[180px]">
                <div className="flex items-center gap-2 font-semibold">
                  <FolderKey className="h-4 w-4" /> Mã (Code)
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2 font-semibold">
                  <BookOpen className="h-4 w-4" /> Tiêu đề
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2 font-semibold">
                  <Flag className="h-4 w-4" /> Cấp độ
                </div>
              </TableHead>
              <TableHead className="text-right font-semibold">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : data.length ? (
              data.map((it, idx) => (
                <TableRow key={it.id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell className="text-muted-foreground font-medium">{idx + 1}</TableCell>
                  <TableCell>
                    <code className="px-2 py-1 rounded bg-muted font-mono text-xs font-semibold text-foreground/80">
                      {it.code}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        <Link to={`/academy/course-profiles/${it.id}`}>
                          {it.title}
                        </Link>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {it.level ? (
                      <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 shadow-none font-bold">
                        {it.level}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
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
                        <DropdownMenuGroup>
                          <DropdownMenuItem asChild>
                            <Link to={`/academy/course-profiles/${it.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              <span>Chi tiết</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/academy/course-profiles/${it.id}/edit`}>
                              <Edit2 className="h-4 w-4 mr-2" />
                              <span>Chỉnh sửa</span>
                            </Link>
                          </DropdownMenuItem>
                          {((it as any)._count?.editions > 0 || (it as any)._count?.classes > 0) ? (
                            <DropdownMenuItem onClick={() => setArchiveId(it.id)}>
                              <Archive className="h-4 w-4 mr-2" />
                              <span>Lưu trữ</span>
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteId(it.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              <span>Xoá</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-[300px] text-center">
                  <Empty>
                    <EmptyMedia>
                      <BookMarked className="size-10 text-muted-foreground/50" />
                    </EmptyMedia>
                    <EmptyContent>
                      <EmptyTitle>Không tìm thấy Profile</EmptyTitle>
                      <EmptyDescription>
                        Thử thay đổi từ khóa tìm kiếm hoặc tạo một Course Profile mới.
                      </EmptyDescription>
                    </EmptyContent>
                  </Empty>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá Course Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Chỉ xoá được khi profile chưa có editions hoặc classes. Nếu đã có, dùng Lưu trữ thay vì Xoá.
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
                  toast.error(e?.response?.data?.message || e?.message || "Xoá thất bại. Dùng Lưu trữ nếu đã có editions/classes.")
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

      <AlertDialog open={!!archiveId} onOpenChange={(o) => !o && setArchiveId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lưu trữ Course Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Profile và tất cả editions sẽ được lưu trữ, ẩn khỏi danh sách nhưng giữ nguyên dữ liệu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!archiveId) return
                try {
                  await archiveMutation.mutateAsync(archiveId)
                  toast.success("Đã lưu trữ")
                } catch (e: any) {
                  toast.error(e?.response?.data?.message || e?.message || "Lưu trữ thất bại")
                } finally {
                  setArchiveId(null)
                }
              }}
            >
              Lưu trữ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  )
}

