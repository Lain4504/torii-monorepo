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
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { MoreVertical, Search, Filter, Layout, BookOpen, User as UserIcon, Calendar } from "lucide-react"
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
} from "@/lib/api/services/academy-classes"
import { useAcademyCourseProfiles } from "@/lib/api/services/academy-course-profiles"
import { useAcademyCourseEditions } from "@/lib/api/services/academy-course-editions"

export default function AcademyClassesPage() {
  const [courseProfileId, setCourseProfileId] = useState("_all")
  const [courseEditionId, setCourseEditionId] = useState("_all")
  const [mode, setMode] = useState("_all")
  const [status, setStatus] = useState("_all")
  const [q, setQ] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: profiles = [] } = useAcademyCourseProfiles({})
  const { data: editions = [] } = useAcademyCourseEditions({})

  const filteredEditions = useMemo(() => {
    if (!courseProfileId || courseProfileId === "_all") return editions
    return editions.filter((e: any) => e.courseProfileId === courseProfileId)
  }, [courseProfileId, editions])

  const query = useMemo(
    () => ({
      courseProfileId: courseProfileId && courseProfileId !== "_all" ? courseProfileId : undefined,
      courseEditionId: courseEditionId && courseEditionId !== "_all" ? courseEditionId : undefined,
      mode: mode && mode !== "_all" ? mode : undefined,
      status: status && status !== "_all" ? status : undefined,
      q: q || undefined,
    }),
    [courseProfileId, courseEditionId, mode, status, q],
  )

  const { data = [], isLoading } = useAcademyClasses(query)
  const del = useDeleteAcademyClass()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academy · Quản lý lớp học"
        subtitle="Quản lý các lớp học, hình thức học và lộ trình đào tạo."
        actions={
          <Button asChild>
            <Link to="/academy/classes/new">Mở lớp mới</Link>
          </Button>
        }
      />

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách Lớp học</CardTitle>
          </div>
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
                <Select value={courseProfileId} onValueChange={(v) => { setCourseProfileId(v); setCourseEditionId("_all") }}>
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
              <div className="w-full md:w-[220px]">
                <Select value={courseEditionId} onValueChange={setCourseEditionId}>
                  <SelectTrigger disabled={courseProfileId === "_all" && editions.length === 0}>
                    <div className="flex items-center gap-2">
                      <BookOpen className="size-4 text-muted-foreground" />
                      <SelectValue placeholder="Lọc theo Edition" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">Tất cả Edition</SelectItem>
                    {filteredEditions.map((e: any) => (
                      <SelectItem key={e.id} value={e.id}>{e.editionTag}</SelectItem>
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
                    <SelectItem value="BLENDED">Blended (Kết hợp)</SelectItem>
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
                    <SelectItem value="ENROLLING">Enrolling</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
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
                      <Badge variant="outline" className="font-normal shadow-none">
                        {it.mode}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {it.term ?? "-"} / {it.batch ?? "-"}
                    </TableCell>
                    <TableCell>
                      {it.status === "ENROLLING" ? (
                        <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-none">ENROLLING</Badge>
                      ) : it.status === "IN_PROGRESS" ? (
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-none">IN PROGRESS</Badge>
                      ) : (
                        <Badge variant="secondary" className="shadow-none">{it.status}</Badge>
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
        </CardContent>
      </Card>

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
    </div>
  )
}
