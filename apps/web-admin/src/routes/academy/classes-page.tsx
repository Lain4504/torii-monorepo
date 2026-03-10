import { useMemo, useState, useEffect } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
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
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { MoreVertical, Search, Filter, Layout, Calendar, Plus } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
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
  type AcademyClass,
} from "@/lib/api/services/academy-classes"
import { useAcademyCourseProfiles } from "@/lib/api/services/academy-course-profiles"
import { DuplicateClassDialog } from "@/components/academy/duplicate-class-dialog"

export default function AcademyClassesPage() {
  const [searchParams] = useSearchParams()
  const statusFromUrl = searchParams.get("status")
  const [courseProfileId, setCourseProfileId] = useState("_all")
  const [mode, setMode] = useState("_all")
  const [status, setStatus] = useState(statusFromUrl || "_all")
  useEffect(() => {
    if (statusFromUrl) setStatus(statusFromUrl)
  }, [statusFromUrl])
  const [q, setQ] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [duplicateClass, setDuplicateClass] = useState<AcademyClass | null>(null)

  const { data: profiles = [] } = useAcademyCourseProfiles({})

  const query = useMemo(
    () => ({
      courseProfileId: courseProfileId && courseProfileId !== "_all" ? courseProfileId : undefined,
      mode: mode && mode !== "_all" ? mode : undefined,
      status: status && status !== "_all" ? status : undefined,
      q: q || undefined,
    }),
    [courseProfileId, mode, status, q],
  )

  const { data = [], isLoading } = useAcademyClasses(query)
  const del = useDeleteAcademyClass()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý lớp học"
        subtitle="Quản lý vận hành các lớp học VOD và Live trong hệ thống."
        actions={
          <Button asChild className="gap-2 shadow-sm">
            <Link to="/academy/course-profiles">
              <Plus className="h-4 w-4" /> Mở lớp mới từ Course Profile
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo mã lớp, tên lớp..."
              className="pl-9"
            />
          </div>
          <div className="w-full md:w-[220px]">
            <Select value={courseProfileId} onValueChange={(v) => { setCourseProfileId(v) }}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Layout className="size-4 text-muted-foreground" />
                  <SelectValue placeholder="Lọc theo Profile" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">Tất cả Profile</SelectItem>
                {profiles.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>{p.code} - {p.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="w-full md:w-[200px]">
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="size-4 text-muted-foreground" />
                  <SelectValue placeholder="Hình thức học" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">Tất cả Hình thức</SelectItem>
                <SelectItem value="VOD">VOD (Video)</SelectItem>
                <SelectItem value="LIVE">Live (Trực tuyến)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-[200px]">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-muted-foreground" />
                  <SelectValue placeholder="Trạng thái" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">Tất cả Trạng thái</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PENDING_APPROVAL">Chờ phê duyệt</SelectItem>
                <SelectItem value="ENROLLING">Enrolling</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-md bg-background border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[80px]">STT</TableHead>
              <TableHead>Mã lớp</TableHead>
              <TableHead>Tên lớp học</TableHead>
              <TableHead>Hình thức</TableHead>
              <TableHead>Kỳ/Khóa</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : data.length ? (
              data.map((it, idx) => (
                <TableRow key={it.id}>
                  <TableCell className="text-muted-foreground font-medium">{idx + 1}</TableCell>
                  <TableCell className="font-mono text-xs font-semibold">
                    <Link to={`/academy/classes/${it.id}`} className="hover:underline text-primary">
                      {it.code}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link to={`/academy/classes/${it.id}`} className="hover:underline font-medium">
                      {it.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn(
                      "font-bold shadow-none border-transparent",
                      it.mode === "LIVE" ? "bg-blue-500/10 text-blue-600" : "bg-purple-500/10 text-purple-600"
                    )}>
                      {it.mode}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {it.liveClass?.term ? (
                      <div className="flex flex-col">
                        <span>{it.liveClass.term}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">Batch: {it.liveClass.batch}</span>
                      </div>
                    ) : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 shadow-none",
                        it.status === "ENROLLING" && "bg-blue-500/10 text-blue-600 border-blue-200",
                        it.status === "IN_PROGRESS" && "bg-emerald-500/10 text-emerald-600 border-emerald-200",
                        it.status === "PENDING_APPROVAL" && "bg-amber-500/10 text-amber-600 border-amber-200",
                        it.status === "DRAFT" && "bg-muted text-muted-foreground border-transparent",
                        it.status === "COMPLETED" && "bg-zinc-500/10 text-zinc-600 border-zinc-200"
                      )}
                    >
                      {it.status}
                    </Badge>
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
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem asChild>
                          <Link to={`/academy/classes/${it.id}`}>
                            Chi tiết lớp
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/academy/classes/${it.id}/edit`}>
                            Sửa thông tin
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDuplicateClass(it)}
                        >
                          Nhân bản
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteId(it.id)}
                        >
                          Xoá lớp
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Không tìm thấy lớp học nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá Lớp học</AlertDialogTitle>
            <AlertDialogDescription>
              Thao tác này sẽ xoá vĩnh viễn Lớp học và các dữ liệu liên quan (học viên, bài tập, điểm số). Hành động này không thể hoàn tác.
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
                  toast.success("Đã xoá lớp học thành công")
                } catch (e: any) {
                  toast.error(e?.message || "Xoá lớp học thất bại")
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

      {duplicateClass && (
        <DuplicateClassDialog
          sourceClass={duplicateClass}
          open={!!duplicateClass}
          onOpenChange={(o) => !o && setDuplicateClass(null)}
        />
      )}
    </div>
  )
}
