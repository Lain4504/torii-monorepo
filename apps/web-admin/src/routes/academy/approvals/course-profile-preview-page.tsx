import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { PageHeader } from "@/components/common/page-header"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription as UIDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { toast } from "@workspace/ui/components/sonner"
import { ChevronRight, CheckCircle2, BookOpen } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { UserRole } from "@workspace/schemas"
import { useAcademyCourseProfile, useApproveAcademyCourseProfile, type AcademyCourseProfile } from "@/lib/api/services/academy-course-profiles"
import { formatDateTime } from "@/lib/format-utils"

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Bản nháp",
  PENDING_APPROVAL: "Chờ duyệt",
  PUBLISHED: "Đã xuất bản",
  ARCHIVED: "Lưu trữ",
}

export default function CourseProfileApprovalPreviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: profile, isLoading } = useAcademyCourseProfile(id)
  const approveMutation = useApproveAcademyCourseProfile()

  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false)

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

  if (!profile) {
    return <div className="p-8 text-center text-muted-foreground">Không tìm thấy CourseProfile.</div>
  }

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
            <span>CourseProfile Preview</span>
          </div>
        }
        subtitle={`Xem trước và duyệt hồ sơ ${profile.code}`}
        stats={[
          { label: "Trạng thái", value: STATUS_LABELS[profile.status] ?? profile.status },
          { label: "Ngày gửi duyệt", value: formatDateTime(profile.submittedForApprovalAt, "HH:mm dd/MM/yyyy") },
        ]}
        actions={
          canApprove ? (
            <Button
              size="lg"
              onClick={() => setApproveConfirmOpen(true)}
              disabled={approveMutation.isPending}
              className="gap-2"
            >
              <CheckCircle2 className="size-5" />
              Duyệt
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin CourseProfile</CardTitle>
            <CardDescription>Trang này chỉ phục vụ flow duyệt. Approve thực hiện ở đây.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <BookOpen className="size-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-mono font-bold text-sm text-primary truncate">{profile.code}</p>
                <p className="text-sm font-semibold truncate">{profile.title}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Cấp độ</p>
                <p className="font-medium">{profile.level || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Trạng thái</p>
                <Badge variant="secondary">{STATUS_LABELS[profile.status] ?? profile.status}</Badge>
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

        <Card>
          <CardHeader>
            <CardTitle>Chỉ dẫn duyệt</CardTitle>
            <CardDescription>Chỉ bộ phận được cấp quyền `academy.content.approve` mới thấy nút Duyệt.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Khi duyệt, hồ sơ sẽ chuyển sang trạng thái <span className="font-medium text-foreground">PUBLISHED</span>.
            </p>
            <Button variant="outline" asChild className="gap-2">
              <Link to={`/academy/course-profiles/${profile.id}/detail`}>Mở trang quản lý chi tiết</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={approveConfirmOpen} onOpenChange={setApproveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận phê duyệt</AlertDialogTitle>
            <UIDialogDescription>
              Bạn có chắc muốn phê duyệt hồ sơ <span className="font-medium">{profile.code}</span>?
              Sau khi duyệt, hồ sơ sẽ chuyển sang trạng thái <span className="font-medium">PUBLISHED</span>.
            </UIDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  await approveMutation.mutateAsync(profile.id)
                  toast.success(`Đã phê duyệt "${profile.code}"`)
                  navigate("/academy/approvals")
                } catch (err: any) {
                  toast.error(err?.response?.data?.message || err?.message || "Không thể phê duyệt")
                }
              }}
              disabled={approveMutation.isPending}
            >
              Xác nhận duyệt
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

