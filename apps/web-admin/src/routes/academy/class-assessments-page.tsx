import { useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { PageHeader } from "@/components/common/page-header"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { MoreVertical, Filter, Layout, Calendar, Percent } from "lucide-react"
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
  useAcademyClassAssessments,
  useDeleteAcademyClassAssessment,
} from "@/lib/api/services/academy-class-assessments"
import { useAcademyClasses } from "@/lib/api/services/academy-classes"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { format } from "date-fns"

export default function AcademyClassAssessmentsPage() {
  const [searchParams] = useSearchParams()
  const [classId, setClassId] = useState(searchParams.get("classId") || "_all")
  const [kind, setKind] = useState("_all")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: classesData = [] } = useAcademyClasses({})
  const classes = Array.isArray(classesData) ? classesData : (classesData as any)?.items || []

  const query = useMemo(
    () => ({
      classId: classId && classId !== "_all" ? classId : undefined,
      kind: kind && kind !== "_all" ? kind : undefined,
    }),
    [classId, kind],
  )

  const { data = [], isLoading } = useAcademyClassAssessments(query)
  const del = useDeleteAcademyClassAssessment()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academy · Đánh giá lớp học"
        subtitle="Quản lý các bài kiểm tra (Quiz) và bài tập (Assignment) được gán cho từng lớp."
        actions={
          <Button asChild>
            <Link to="/academy/class-assessments/new">Tạo đánh giá mới</Link>
          </Button>
        }
      />

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
          <Select value={kind} onValueChange={setKind}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Filter className="size-4 text-muted-foreground" />
                <SelectValue placeholder="Loại đánh giá" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Tất cả loại</SelectItem>
              <SelectItem value="QUIZ">Quiz</SelectItem>
              <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md bg-background border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[80px]">STT</TableHead>
              <TableHead>Thông tin đánh giá</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Thời hạn</TableHead>
              <TableHead>Trọng số</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-64" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : data.length ? (
              data.map((it, idx) => (
                <TableRow key={it.id}>
                  <TableCell className="text-muted-foreground font-medium">{idx + 1}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold">{it.titleOverride || "N/A"}</span>
                      <span className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">{it.classId}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={it.kind === "QUIZ" ? "default" : "outline"} className="font-normal shadow-none">
                      {it.kind}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {it.deadline ? (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="size-3.5" />
                        {format(new Date(it.deadline), "dd/MM/yyyy HH:mm")}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Không có thời hạn</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {it.weight ? (
                      <div className="flex items-center gap-1.5 text-xs font-medium">
                        <Percent className="size-3.5 text-primary" />
                        {it.weight}%
                      </div>
                    ) : "-"}
                  </TableCell>
                  <TableCell>
                    {it.status === "PUBLISHED" ? (
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-none">PUBLISHED</Badge>
                    ) : (
                      <Badge variant="secondary" className="shadow-none opacity-70">{it.status}</Badge>
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
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem asChild>
                          <Link to={`/academy/class-assessments/${it.id}/edit`}>
                            Sửa đánh giá
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteId(it.id)}
                        >
                          Xoá đánh giá
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  Chưa có bài đánh giá nào cho lớp này.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá Đánh giá</AlertDialogTitle>
            <AlertDialogDescription>
              Thao tác này sẽ xoá vĩnh viễn bài Quiz/Assignment gắn với lớp này cùng tất cả kết quả làm bài của học viên. Hành động này không thể hoàn tác.
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
                  toast.success("Đã xoá đánh giá lớp học thành công")
                } catch (e: any) {
                  toast.error(e?.message || "Xoá đánh giá lớp học thất bại")
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
