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
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { PageHeader } from "@/components/common/page-header"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { MoreVertical, User, Calendar, Filter, Layout } from "lucide-react"
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
  useAcademyEnrollments,
  useDeleteAcademyEnrollment,
} from "@/lib/api/services/academy-enrollments"
import { useAcademyClasses } from "@/lib/api/services/academy-classes"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { format } from "date-fns"

export default function AcademyEnrollmentsPage() {
  const [classId, setClassId] = useState("_all")
  const [status, setStatus] = useState("_all")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: classesData = [] } = useAcademyClasses({})
  const classes = Array.isArray(classesData) ? classesData : (classesData as any)?.items || []

  const query = useMemo(
    () => ({
      classId: classId && classId !== "_all" ? classId : undefined,
      status: (status && status !== "_all" ? status : undefined) as any,
    }),
    [classId, status],
  )

  const { data: enrollments = [], isLoading } = useAcademyEnrollments(query)
  const del = useDeleteAcademyEnrollment()

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await del.mutateAsync(deleteId)
      toast.success("Đã xoá ghi danh thành công")
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi xoá ghi danh")
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academy · Quản lý ghi danh"
        subtitle="Quản lý việc học viên tham gia vào các lớp học."
        actions={
          <Button asChild>
            <Link to="/academy/enrollments/new">Ghi danh học viên</Link>
          </Button>
        }
      />

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách Ghi danh</CardTitle>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex-1">
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Layout className="size-4 text-muted-foreground" />
                    <SelectValue placeholder="Chọn lớp học" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">Tất cả lớp học</SelectItem>
                  {classes.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name} ({c.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-[200px]">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Filter className="size-4 text-muted-foreground" />
                    <SelectValue placeholder="Trạng thái" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="ACTIVE">Hoạt động (Active)</SelectItem>
                  <SelectItem value="COMPLETED">Hoàn thành (Completed)</SelectItem>
                  <SelectItem value="CANCELLED">Đã hủy (Cancelled)</SelectItem>
                  <SelectItem value="EXPIRED">Hết hạn (Expired)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Học viên</TableHead>
                <TableHead>Lớp học</TableHead>
                <TableHead>Ngày ghi danh</TableHead>
                <TableHead>Hết hạn</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : enrollments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Không tìm thấy dữ liệu ghi danh.
                  </TableCell>
                </TableRow>
              ) : (
                enrollments.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <User className="size-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{item.user?.displayName || "N/A"}</span>
                          <span className="text-xs text-muted-foreground">{item.user?.email || item.userId}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <Link
                          to={`/academy/classes/${item.classId}`}
                          className="font-medium hover:underline text-primary text-sm"
                        >
                          {item.class?.name || "N/A"}
                        </Link>
                        <span className="text-xs text-muted-foreground font-mono">{item.class?.code || item.classId}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="size-3.5" />
                        <span>{item.enrolledAt ? format(new Date(item.enrolledAt), "dd/MM/yyyy") : "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.expiresAt ? (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <Clock className="size-3.5" />
                          <span>{format(new Date(item.expiresAt), "dd/MM/yyyy")}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Vô thời hạn</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.status === "ACTIVE" ? (
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-none">ACTIVE</Badge>
                      ) : item.status === "COMPLETED" ? (
                        <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-none">COMPLETED</Badge>
                      ) : (
                        <Badge variant="secondary" className="shadow-none opacity-70">{item.status}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0" size="icon">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem asChild>
                            <Link to={`/academy/enrollments/${item.id}/edit`}>
                              Sửa ghi danh
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteId(item.id)}
                          >
                            Xoá ghi danh
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xoá?</AlertDialogTitle>
            <AlertDialogDescription>
              Thao tác này sẽ xoá vĩnh viễn Ghi danh này. Học viên có thể bị mất quyền truy cập vào lớp học và các tài nguyên liên quan immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Xác nhận Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function Clock({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
