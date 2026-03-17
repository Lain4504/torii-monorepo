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
import { Input } from "@workspace/ui/components/input"
import { toast } from "@workspace/ui/components/sonner"
import { ChevronRight, CheckCircle2, XCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { UserRole } from "@workspace/schemas"
import {
  useAcademyClass,
  useApproveClass,
  useRejectClass,
  useSubmitClassForApproval,
  type AcademyClass,
} from "@/lib/api/services/academy-classes"

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

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Bản nháp",
  PENDING_APPROVAL: "Chờ duyệt",
  PUBLISHED: "Đã xuất bản",
  OPENING: "Đang tuyển sinh",
  ONGOING: "Đang diễn ra",
  COMPLETED: "Đã hoàn thành",
  ARCHIVED: "Lưu trữ",
}

export default function ClassApprovalPreviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: academyClass, isLoading } = useAcademyClass(id)
  const submitMutation = useSubmitClassForApproval()
  const approveMutation = useApproveClass()
  const rejectMutation = useRejectClass()

  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean
    reason: string
  }>({ open: false, reason: "" })

  const isStaffOrAdmin =
    user?.role === UserRole.ADMIN ||
    user?.role === UserRole.STAFF_ACADEMIC ||
    user?.role === UserRole.STAFF_OPERATIONS

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!academyClass) {
    return (
      <div className="p-8 text-center text-muted-foreground">Không tìm thấy Class.</div>
    )
  }

  const canSubmit = isStaffOrAdmin && academyClass.status === "DRAFT"
  const canApprove = isStaffOrAdmin && academyClass.status === "PENDING_APPROVAL"

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
            <span>Class Preview</span>
          </div>
        }
        subtitle={`Xem trước và duyệt lớp #${academyClass.code}`}
        stats={[
          { label: "Mode", value: academyClass.mode },
          {
            label: "Trạng thái",
            value: STATUS_LABELS[academyClass.status] ?? academyClass.status,
          },
          {
            label: "Ngày gửi duyệt",
            value: formatDateTime(academyClass.submittedForApprovalAt),
          },
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
                      await submitMutation.mutateAsync(academyClass.id)
                      toast.success(`Đã gửi duyệt "${academyClass.name}"`)
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
                  Gửi duyệt
                </Button>
              )}
              <Button
                size="lg"
                onClick={async () => {
                  try {
                    await approveMutation.mutateAsync(academyClass.id)
                    toast.success(`Đã phê duyệt "${academyClass.name}"`)
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
            <CardTitle>Thông tin lớp</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoGrid academyClass={academyClass} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ghi chú duyệt</CardTitle>
            <CardDescription>
              Trang này chỉ phục vụ flow duyệt. Các thao tác quản lý chi tiết nằm ở trang lớp.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" asChild>
              <Link to={`/academy/classes/${academyClass.id}/detail`}>Mở trang quản lý lớp</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={rejectDialog.open}
        onOpenChange={(open) => !open && setRejectDialog({ open: false, reason: "" })}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Từ chối lớp</DialogTitle>
            <UIDialogDescription>
              Nhập lý do từ chối. Lớp sẽ được chuyển về trạng thái phù hợp để chỉnh sửa và gửi lại.
            </UIDialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-2">
            <Input
              placeholder="Nhập lý do từ chối..."
              value={rejectDialog.reason}
              onChange={(e) =>
                setRejectDialog((prev) => ({ ...prev, reason: e.target.value }))
              }
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
                    id: academyClass.id,
                    reason: rejectDialog.reason.trim(),
                  })
                  toast.success(`Đã từ chối "${academyClass.name}"`)
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

function InfoGrid({ academyClass }: { academyClass: AcademyClass }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <p className="text-xs text-muted-foreground">Mã</p>
        <p className="font-mono font-medium">{academyClass.code}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Mode</p>
        <Badge variant="outline">{academyClass.mode}</Badge>
      </div>
      <div className="sm:col-span-2">
        <p className="text-xs text-muted-foreground">Tên lớp</p>
        <p className="font-medium">{academyClass.name}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Trạng thái</p>
        <Badge variant="secondary">
          {STATUS_LABELS[academyClass.status] ?? academyClass.status}
        </Badge>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Ngày gửi duyệt</p>
        <p className="text-sm text-muted-foreground">
          {formatDateTime(academyClass.submittedForApprovalAt)}
        </p>
      </div>
      {academyClass.rejectionReason && (
        <div className="sm:col-span-2">
          <p className="text-xs text-muted-foreground">Lý do từ chối gần nhất</p>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {academyClass.rejectionReason}
          </p>
        </div>
      )}
    </div>
  )
}

