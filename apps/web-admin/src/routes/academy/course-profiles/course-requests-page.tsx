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
} from "lucide-react"
import {
  useAcademyCourseProfiles,
  type AcademyCourseProfile,
  useApproveCourseProfile,
  useRejectCourseProfile,
} from "@/lib/api/services/academy-course-profiles"
import { useDebounceValue } from "@workspace/ui/hooks/use-debounce-value"
import { toast } from "@workspace/ui/components/sonner"

export default function CourseRequestsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch] = useDebounceValue(searchTerm, 500)
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean
    profile: AcademyCourseProfile | null
    reason: string
  }>({ open: false, profile: null, reason: "" })
  const [approveDialog, setApproveDialog] = useState<{
    open: boolean
    profile: AcademyCourseProfile | null
  }>({ open: false, profile: null })

  const { data: profiles = [], isLoading } = useAcademyCourseProfiles({
    status: "PENDING_APPROVAL",
    q: debouncedSearch || undefined,
  } as any)

  const approveMutation = useApproveCourseProfile()
  const rejectMutation = useRejectCourseProfile()

  const pendingProfiles = profiles.filter(
    (p) => p.status === "PENDING_APPROVAL"
  )

  const openApproveDialog = (profile: AcademyCourseProfile) => {
    setApproveDialog({ open: true, profile })
  }

  const closeApproveDialog = () => {
    setApproveDialog({ open: false, profile: null })
  }

  const handleApprove = async () => {
    const { profile } = approveDialog
    if (!profile) return
    try {
      await approveMutation.mutateAsync(profile.id)
      toast.success(`Đã phê duyệt khóa học "${profile.title}"`)
      closeApproveDialog()
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Không thể phê duyệt"
      )
    }
  }

  const openRejectDialog = (profile: AcademyCourseProfile) => {
    setRejectDialog({ open: true, profile, reason: "" })
  }

  const closeRejectDialog = () => {
    setRejectDialog({ open: false, profile: null, reason: "" })
  }

  const handleReject = async () => {
    const { profile, reason } = rejectDialog
    if (!profile) return
    const trimmed = reason.trim()
    if (!trimmed) {
      toast.error("Vui lòng nhập lý do từ chối.")
      return
    }
    try {
      await rejectMutation.mutateAsync({ id: profile.id, reason: trimmed })
      toast.success(`Đã từ chối khóa học "${profile.title}"`)
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
            <span>Duyệt khóa học</span>
          </div>
        }
        subtitle="Duyệt các chương trình khóa học mới trước khi cho phép tạo gói bán."
      />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm mã hoặc tên khóa học..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/academy/course-profiles">
              Xem tất cả khóa học
            </Link>
          </Button>
        </div>

        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12">STT</TableHead>
                <TableHead className="w-[120px]">Mã</TableHead>
                <TableHead>Tên khóa học</TableHead>
                <TableHead>Cấp độ</TableHead>
                <TableHead>Ngày gửi duyệt</TableHead>
                <TableHead className="text-right w-[180px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : pendingProfiles.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-muted-foreground"
                  >
                    Không có khóa học nào đang chờ duyệt.
                  </TableCell>
                </TableRow>
              ) : (
                pendingProfiles.map((profile, index) => (
                  <TableRow key={profile.id} className="group transition-colors">
                    <TableCell className="text-muted-foreground tabular-nums">{index + 1}</TableCell>
                    <TableCell className="font-mono text-xs font-bold">
                      {profile.code}
                    </TableCell>
                    <TableCell className="font-medium">{profile.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {profile.level || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {profile.submittedForApprovalAt
                        ? new Date(
                            profile.submittedForApprovalAt
                          ).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => openApproveDialog(profile)}
                          disabled={approveMutation.isPending}
                          className="gap-1"
                        >
                          <CheckCircle2 className="size-4" />
                          Duyệt
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openRejectDialog(profile)}
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
      </div>

      <Dialog
        open={rejectDialog.open}
        onOpenChange={(open) => !open && closeRejectDialog()}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Từ chối khóa học</DialogTitle>
            <DialogDescription>
              {rejectDialog.profile
                ? `Nhập lý do từ chối cho khóa học "${rejectDialog.profile.title}".`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Nhập lý do từ chối cụ thể..."
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

      <Dialog
        open={approveDialog.open}
        onOpenChange={(open) => !open && closeApproveDialog()}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Xác nhận phê duyệt</DialogTitle>
            <DialogDescription>
              {approveDialog.profile
                ? `Bạn có chắc chắn muốn phê duyệt khóa học "${approveDialog.profile.title}"? Sau khi duyệt, staff có thể bắt đầu tạo các gói bán liên quan.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeApproveDialog}>
              Hủy
            </Button>
            <Button
              onClick={handleApprove}
              disabled={approveMutation.isPending}
            >
              Xác nhận duyệt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
