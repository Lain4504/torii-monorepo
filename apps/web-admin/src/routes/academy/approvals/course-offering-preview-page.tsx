import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { PageHeader } from "@/components/common/page-header"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription as UIDialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Textarea } from "@workspace/ui/components/textarea"
import { toast } from "@workspace/ui/components/sonner"
import { ChevronRight, CheckCircle2, XCircle, Send } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { UserRole } from "@workspace/schemas"
import {
  useAcademyCourseOffering,
  useApproveCourseOffering,
  useRejectCourseOffering,
  useSubmitCourseOfferingForApproval,
} from "@/lib/api/services/academy-course-offerings"
import { formatCurrency } from "@/lib/format-utils"

function formatDateTime(d: string | null | undefined) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function CourseOfferingApprovalPreviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: offering, isLoading } = useAcademyCourseOffering(id)
  const submitMutation = useSubmitCourseOfferingForApproval()
  const approveMutation = useApproveCourseOffering()
  const rejectMutation = useRejectCourseOffering()

  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean
    reason: string
  }>({ open: false, reason: "" })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!offering) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Không tìm thấy Course Offering.
      </div>
    )
  }

  const isStaffOrAdmin =
    user?.role === UserRole.ADMIN ||
    user?.role === UserRole.STAFF_ACADEMIC ||
    user?.role === UserRole.STAFF_OPERATIONS

  const canSubmit = isStaffOrAdmin && offering.status === "DRAFT"
  const canApprove = isStaffOrAdmin && offering.status === "PENDING_APPROVAL"

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={
          <div className="flex items-center gap-2">
            <Link
              to="/academy/approvals"
              className="hover:underline text-muted-foreground transition-colors"
            >
              Approval Center
            </Link>
            <ChevronRight className="size-4" />
            <span>Offering Preview</span>
          </div>
        }
        subtitle={`Xem trước và duyệt gói #${offering.code}`}
        stats={[
          { label: "Trạng thái", value: offering.status ?? "—" },
          { label: "Ngày gửi duyệt", value: formatDateTime(offering.submittedForApprovalAt) },
        ]}
        actions={
          canSubmit || canApprove ? (
            <div className="flex items-center gap-2">
              {canSubmit && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={async () => {
                    try {
                      await submitMutation.mutateAsync(offering.id)
                      toast.success(`Đã gửi duyệt "${offering.title}"`)
                      navigate("/academy/approvals")
                    } catch (err: any) {
                      toast.error(
                        err?.response?.data?.message || err?.message || "Không thể gửi duyệt",
                      )
                    }
                  }}
                  disabled={submitMutation.isPending}
                  className="gap-2"
                >
                  <Send className="size-5" />
                  Gửi duyệt
                </Button>
              )}
              <Button
                size="lg"
                onClick={async () => {
                  try {
                    await approveMutation.mutateAsync(offering.id)
                    toast.success(`Đã phê duyệt "${offering.title}"`)
                    navigate("/academy/approvals")
                  } catch (err: any) {
                    toast.error(
                      err?.response?.data?.message || err?.message || "Không thể phê duyệt",
                    )
                  }
                }}
                disabled={approveMutation.isPending}
                className="gap-2"
              >
                <CheckCircle2 className="size-5" />
                Duyệt
              </Button>
              <Button
                size="lg"
                variant="destructive"
                onClick={() => setRejectDialog({ open: true, reason: "" })}
                disabled={rejectMutation.isPending}
                className="gap-2"
              >
                <XCircle className="size-5" />
                Từ chối
              </Button>
            </div>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin gói bán</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Mã</p>
                <p className="font-mono font-medium">{offering.code}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Giá</p>
                <p className="font-semibold">{formatCurrency(offering.price)}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground">Tiêu đề</p>
                <p className="font-medium">{offering.title}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground">Mô tả</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {offering.description || "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lớp liên kết</CardTitle>
            <CardDescription>
              Các lớp học người dùng sẽ được ghi danh khi mua gói.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {offering.classes?.map((cls: any) => (
              <div
                key={cls.id || cls.classId}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{cls.name || cls.title}</p>
                  <p className="text-xs text-muted-foreground font-mono truncate">{cls.code}</p>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {cls.mode ?? "—"}
                </Badge>
              </div>
            ))}
            {(!offering.classes || offering.classes.length === 0) && (
              <p className="text-sm text-muted-foreground italic">
                Gói này chưa liên kết lớp học nào.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={rejectDialog.open}
        onOpenChange={(open) => !open && setRejectDialog({ open: false, reason: "" })}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Từ chối gói bán</DialogTitle>
            <UIDialogDescription>
              Nhập lý do từ chối để bộ phận liên quan chỉnh sửa và gửi lại.
            </UIDialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              placeholder="Ví dụ: Giá chưa hợp lý, thiếu thông tin lớp liên kết, ..."
              value={rejectDialog.reason}
              onChange={(e) => setRejectDialog((prev) => ({ ...prev, reason: e.target.value }))}
              rows={4}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialog({ open: false, reason: "" })}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectDialog.reason.trim() || rejectMutation.isPending}
              onClick={async () => {
                try {
                  await rejectMutation.mutateAsync({
                    id: offering.id,
                    reason: rejectDialog.reason.trim(),
                  })
                  toast.success(`Đã từ chối "${offering.title}"`)
                  navigate("/academy/approvals")
                } catch (err: any) {
                  toast.error(
                    err?.response?.data?.message || err?.message || "Không thể từ chối",
                  )
                }
              }}
            >
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

