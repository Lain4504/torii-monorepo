import { useMemo, useState, useEffect } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { MoreVertical, Search } from "lucide-react"
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
  useAcademyCourseOfferings,
  useArchiveAcademyCourseOffering,
  useDeleteAcademyCourseOffering,
} from "@/lib/api/services/academy-course-offerings"
import { Archive, ArchiveX } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

const OFFERING_STATUS_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING_APPROVAL", label: "Chờ phê duyệt" },
  { value: "PUBLISHED", label: "Đang bán" },
  { value: "HIDDEN", label: "Ẩn" },
  { value: "ARCHIVED", label: "Đã lưu trữ" },
]

export default function AcademyCourseOfferingsPage() {
  const [searchParams] = useSearchParams()
  const statusFromUrl = searchParams.get("status")
  const [q, setQ] = useState("")
  const [status, setStatus] = useState(statusFromUrl || "")
  useEffect(() => {
    if (statusFromUrl) setStatus(statusFromUrl)
  }, [statusFromUrl])
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [archiveId, setArchiveId] = useState<string | null>(null)

  const query = useMemo(
    () => ({
      q: q || undefined,
      status: status && status !== "all" ? status : undefined,
    }),
    [q, status],
  )
  const { data = [], isLoading } = useAcademyCourseOfferings(query)
  const archiveMutation = useArchiveAcademyCourseOffering()
  const del = useDeleteAcademyCourseOffering()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academy · Course Offerings"
        subtitle="Các gói bán (bundle) cho learner đăng ký."
        actions={
          <Button asChild>
            <Link to="/academy/course-offerings/new">Tạo mới</Link>
          </Button>
        }
      />

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo code/title..." className="pl-9" />
        </div>
        <Select value={status || "all"} onValueChange={setStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            {OFFERING_STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md bg-background border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[80px]">STT</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Giá</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6}>Đang tải...</TableCell>
              </TableRow>
            ) : data.length ? (
              data.map((it, idx) => (
                <TableRow key={it.id}>
                  <TableCell className="text-muted-foreground font-medium">{idx + 1}</TableCell>
                  <TableCell className="font-mono text-xs">
                    <Link to={`/academy/course-offerings/${it.id}`} className="hover:underline text-primary">
                      {it.code}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link to={`/academy/course-offerings/${it.id}`} className="hover:underline font-medium">
                      {it.title}
                    </Link>
                  </TableCell>
                  <TableCell>{it.status ?? "-"}</TableCell>
                  <TableCell className="text-right">
                    {Intl.NumberFormat("vi-VN").format(it.price)} {it.currency}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0" size="icon">
                          <span className="sr-only">Mở menu thao tác</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <Link to={`/academy/course-offerings/${it.id}/edit`}>
                            Sửa
                          </Link>
                        </DropdownMenuItem>
                        {["PUBLISHED", "HIDDEN"].includes(it.status || "") && (
                          <DropdownMenuItem
                            onClick={() => setArchiveId(it.id)}
                          >
                            <Archive className="mr-2 h-4 w-4" />
                            Lưu trữ
                          </DropdownMenuItem>
                        )}
                        {["DRAFT", "PENDING_APPROVAL"].includes(it.status || "") && (
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteId(it.id)}
                          >
                            <ArchiveX className="mr-2 h-4 w-4" />
                            Xoá
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá Course Offering</AlertDialogTitle>
            <AlertDialogDescription>
              Thao tác này sẽ xoá vĩnh viễn. Chỉ áp dụng cho gói DRAFT hoặc Chờ phê duyệt chưa có đơn hàng.
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
                  const msg = e?.response?.data?.message || e?.message || "Xoá thất bại. Gói đã có đơn hàng? Dùng Lưu trữ thay vì Xoá."
                  toast.error(msg)
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
            <AlertDialogTitle>Lưu trữ Course Offering</AlertDialogTitle>
            <AlertDialogDescription>
              Gói bán sẽ được chuyển sang trạng thái Lưu trữ, ẩn khỏi catalog nhưng giữ nguyên lịch sử đơn hàng.
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
    </div>
  )
}

