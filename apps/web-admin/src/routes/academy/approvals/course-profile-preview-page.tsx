import { useState } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { PageHeader } from "@/components/common/page-header"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  useAcademyCourseProfile,
  useApproveCourseProfile,
  useRejectCourseProfile,
  useSubmitCourseProfileForApproval,
} from "@/lib/api/services/academy-course-profiles"

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

export default function CourseProfileApprovalPreviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: profile, isLoading } = useAcademyCourseProfile(id)
  const submitMutation = useSubmitCourseProfileForApproval()
  const approveMutation = useApproveCourseProfile()
  const rejectMutation = useRejectCourseProfile()

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

  if (!profile) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Không tìm thấy Course Profile.
      </div>
    )
  }

  const isStaffOrAdmin =
    user?.role === UserRole.ADMIN ||
    user?.role === UserRole.STAFF_ACADEMIC ||
    user?.role === UserRole.STAFF_OPERATIONS

  const canSubmit = isStaffOrAdmin && profile.status === "DRAFT"
  const canApprove = isStaffOrAdmin && profile.status === "PENDING_APPROVAL"

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
            <span>Course Profile Preview</span>
          </div>
        }
        subtitle={`Xem trước và duyệt khóa học #${profile.code}`}
        stats={[
          { label: "Trạng thái", value: profile.status ?? "—" },
          { label: "Ngày gửi duyệt", value: formatDateTime(profile.submittedForApprovalAt) },
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
                      await submitMutation.mutateAsync(profile.id)
                      toast.success(`Đã gửi duyệt "${profile.title}"`)
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
                    await approveMutation.mutateAsync(profile.id)
                    toast.success(`Đã phê duyệt "${profile.title}"`)
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

      <Card>
        <CardHeader>
          <CardTitle>Thông tin khóa học</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Mã</p>
              <p className="font-mono font-medium">{profile.code}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cấp độ</p>
              <Badge variant="outline">{profile.level || "N/A"}</Badge>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-muted-foreground">Tên khóa học</p>
              <p className="font-medium">{profile.title}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-muted-foreground">Mô tả</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {profile.description || "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={rejectDialog.open}
        onOpenChange={(open) => !open && setRejectDialog({ open: false, reason: "" })}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Từ chối khóa học</DialogTitle>
            <DialogDescription>
              Nhập lý do từ chối. Khóa học sẽ được đưa về trạng thái phù hợp để chỉnh sửa và gửi lại.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              placeholder="Ví dụ: Thiếu thông tin mô tả, nội dung chưa phù hợp, ..."
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
                    id: profile.id,
                    reason: rejectDialog.reason.trim(),
                  })
                  toast.success(`Đã từ chối "${profile.title}"`)
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

