import { useState } from "react"
import { Link } from "react-router-dom"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  ChevronRight,
  CheckCircle2,
  XCircle,
  Search,
  DollarSign,
} from "lucide-react"
import {
  useAcademyCourseOfferings,
  type AcademyCourseOffering,
  useApproveCourseOffering,
  useRejectCourseOffering,
} from "@/lib/api/services/academy-course-offerings"
import { useDebounceValue } from "@workspace/ui/hooks/use-debounce-value"
import { toast } from "@workspace/ui/components/sonner"

export default function ApprovalsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch] = useDebounceValue(searchTerm, 500)
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean
    offering: AcademyCourseOffering | null
    reason: string
  }>({ open: false, offering: null, reason: "" })

  const { data: offerings = [], isLoading } = useAcademyCourseOfferings({
    status: "PENDING_APPROVAL",
    q: debouncedSearch || undefined,
  })

  const approveMutation = useApproveCourseOffering()
  const rejectMutation = useRejectCourseOffering()

  const pendingOfferings = offerings.filter(
    (o) => o.status === "PENDING_APPROVAL"
  )

  const handleApprove = async (offering: AcademyCourseOffering) => {
    try {
      await approveMutation.mutateAsync(offering.id)
      toast.success(`Đã phê duyệt gói "${offering.title}"`)
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Không thể phê duyệt"
      )
    }
  }

  const openRejectDialog = (offering: AcademyCourseOffering) => {
    setRejectDialog({ open: true, offering, reason: "" })
  }

  const closeRejectDialog = () => {
    setRejectDialog({ open: false, offering: null, reason: "" })
  }

  const handleReject = async () => {
    const { offering, reason } = rejectDialog
    if (!offering) return
    const trimmed = reason.trim()
    if (!trimmed) {
      toast.error("Vui lòng nhập lý do từ chối.")
      return
    }
    try {
      await rejectMutation.mutateAsync({ id: offering.id, reason: trimmed })
      toast.success(`Đã từ chối gói "${offering.title}"`)
      closeRejectDialog()
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Không thể từ chối"
      )
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={
          <div className="flex items-center gap-2">
            <Link
              to="/academy/classes"
              className="hover:underline text-muted-foreground transition-colors"
            >
              Academy
            </Link>
            <ChevronRight className="size-4" />
            <span>Trung tâm Duyệt</span>
          </div>
        }
        subtitle="Duyệt gói bán (Course Offering) trước khi công khai lên cổng học viên."
        stats={[
          { label: "Chờ duyệt", value: pendingOfferings.length },
          { label: "Tổng", value: offerings.length },
        ]}
      />

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-muted/30 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm mã hoặc tên gói..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/academy/course-offerings">
              Xem tất cả gói bán
            </Link>
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[120px]">Mã</TableHead>
              <TableHead>Tên gói bán</TableHead>
              <TableHead>Giá (VND)</TableHead>
              <TableHead>Ngày gửi duyệt</TableHead>
              <TableHead>Lớp liên kết</TableHead>
              <TableHead className="text-right w-[180px]">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : pendingOfferings.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  Không có gói bán nào đang chờ duyệt.
                </TableCell>
              </TableRow>
            ) : (
              pendingOfferings.map((offering) => (
                <TableRow key={offering.id} className="group transition-colors">
                  <TableCell className="font-mono text-xs font-bold">
                    {offering.code}
                  </TableCell>
                  <TableCell className="font-medium">{offering.title}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold flex items-center gap-1">
                        <DollarSign className="size-3.5" />
                        {Number(offering.price).toLocaleString()}₫
                      </span>
                      {offering.originalPrice &&
                        Number(offering.originalPrice) > Number(offering.price) && (
                          <span className="text-xs text-muted-foreground line-through">
                            {Number(offering.originalPrice).toLocaleString()}₫
                          </span>
                        )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {offering.submittedForApprovalAt
                      ? new Date(
                          offering.submittedForApprovalAt
                        ).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {offering.classes?.length ?? 0} lớp
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(offering)}
                        disabled={approveMutation.isPending}
                        className="gap-1"
                      >
                        <CheckCircle2 className="size-4" />
                        Duyệt
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openRejectDialog(offering)}
                        disabled={rejectMutation.isPending}
                        className="gap-1"
                      >
                        <XCircle className="size-4" />
                        Từ chối
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={rejectDialog.open}
        onOpenChange={(open) => !open && closeRejectDialog()}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Từ chối gói bán</DialogTitle>
            <DialogDescription>
              {rejectDialog.offering
                ? `Nhập lý do từ chối cho gói "${rejectDialog.offering.title}". Học viên sẽ không thấy gói này trên cổng công khai cho đến khi staff chỉnh sửa và gửi duyệt lại.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Ví dụ: Giá chưa phù hợp, thiếu thông tin lớp liên kết, ..."
              value={rejectDialog.reason}
              onChange={(e) =>
                setRejectDialog((prev) => ({ ...prev, reason: e.target.value }))
              }
              rows={4}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeRejectDialog}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={
                !rejectDialog.reason.trim() || rejectMutation.isPending
              }
            >
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
