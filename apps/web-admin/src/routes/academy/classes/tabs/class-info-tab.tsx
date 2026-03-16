import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  BookOpen,
  Video,
  GraduationCap,
  Calendar,
  Users,
  Hash,
  FileText,
  Send,
  Check,
  X,
  Play,
  Square,
  Archive,
} from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { toast } from "sonner"
import type { AcademyClass } from "@/lib/api/services/academy-classes"
import {
  useSubmitClassForApproval,
  useApproveClass,
  useRejectClass,
  usePublishClass,
  useStartClass,
  useCompleteClass,
  useArchiveClass,
} from "@/lib/api/services/academy-classes"

interface ClassInfoTabProps {
  academyClass: AcademyClass | null | undefined
  classId: string
  canManageStatus: boolean
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

export function ClassInfoTab({ academyClass, classId, canManageStatus }: ClassInfoTabProps) {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    description: string
    action: () => Promise<void>
    variant?: "default" | "destructive"
  }>({
    open: false,
    title: "",
    description: "",
    action: async () => {},
  })

  const submitMutation = useSubmitClassForApproval()
  const approveMutation = useApproveClass()
  const rejectMutation = useRejectClass()
  const publishMutation = usePublishClass()
  const startMutation = useStartClass()
  const completeMutation = useCompleteClass()
  const archiveMutation = useArchiveClass()

  const runMutation = async (
    fn: () => Promise<unknown>,
    successMsg: string,
    errorMsg: string
  ) => {
    try {
      await fn()
      toast.success(successMsg)
    } catch (e: unknown) {
      toast.error(errorMsg + (e instanceof Error ? `: ${e.message}` : ""))
    }
  }
  if (!academyClass) {
    return (
      <div className="rounded-md border bg-card p-8 text-center text-muted-foreground">
        Đang tải thông tin lớp học...
      </div>
    )
  }

  const vod = academyClass.vodClass
  const isLive = academyClass.mode === "LIVE"

  const formatDate = (d: string | null | undefined) =>
    d ? new Date(d).toLocaleDateString("vi-VN", { dateStyle: "medium" }) : "—"

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="size-5" />
            Thông tin chung
          </CardTitle>
          <CardDescription>Mã lớp, tên lớp và trạng thái</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <Hash className="size-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Mã lớp</p>
                <p className="font-mono font-medium">{academyClass.code}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="size-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Tên lớp</p>
                <p className="font-medium">{academyClass.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isLive ? (
                <Video className="size-4 text-muted-foreground" />
              ) : (
                <GraduationCap className="size-4 text-muted-foreground" />
              )}
              <div>
                <p className="text-xs text-muted-foreground">Loại hình</p>
                <Badge variant="secondary" className="mt-0.5">
                  {isLive ? "Lớp trực tiếp (LIVE)" : "Lớp tự học (VOD)"}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="size-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Trạng thái</p>
                <Badge variant="outline">
                  {STATUS_LABELS[academyClass.status] ?? academyClass.status}
                </Badge>
              </div>
            </div>
          </div>
          {canManageStatus && (
            <div className="mt-4 pt-4 border-t space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Thao tác trạng thái (chỉ tiến lên)</p>
              <div className="flex flex-wrap gap-2">
                {isLive ? (
                  <>
                    {academyClass.status === "DRAFT" && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => setConfirmDialog({
                          open: true,
                          title: "Gửi duyệt lớp học",
                          description: `Bạn có chắc chắn muốn gửi duyệt lớp "${academyClass.name || academyClass.code}"?`,
                          action: () => runMutation(
                            () => submitMutation.mutateAsync(classId),
                            "Đã gửi duyệt",
                            "Lỗi gửi duyệt"
                          )
                        })}
                        disabled={submitMutation.isPending}
                      >
                        <Send className="size-4 mr-1" /> Gửi duyệt
                      </Button>
                    )}
                    {academyClass.status === "PENDING_APPROVAL" && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => setConfirmDialog({
                            open: true,
                            title: "Phê duyệt lớp học",
                            description: `Bạn có chắc chắn muốn phê duyệt lớp "${academyClass.name || academyClass.code}"? Sau khi duyệt, lớp sẽ chuyển sang trạng thái tiếp theo (Tuyển sinh).`,
                            action: () => runMutation(
                              () => approveMutation.mutateAsync(classId),
                              "Đã phê duyệt",
                              "Lỗi phê duyệt"
                            )
                          })}
                          disabled={approveMutation.isPending}
                        >
                          <Check className="size-4 mr-1" /> Phê duyệt
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRejectDialogOpen(true)}
                          disabled={rejectMutation.isPending}
                        >
                          <X className="size-4 mr-1" /> Từ chối
                        </Button>
                      </>
                    )}
                    {academyClass.status === "OPENING" && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => setConfirmDialog({
                          open: true,
                          title: "Bắt đầu lớp học",
                          description: `Bạn có chắc chắn muốn bắt đầu lớp "${academyClass.name || academyClass.code}"? Trạng thái lớp sẽ chuyển sang "Đang diễn ra".`,
                          action: () => runMutation(
                            () => startMutation.mutateAsync(classId),
                            "Đã bắt đầu lớp",
                            "Lỗi bắt đầu"
                          )
                        })}
                        disabled={startMutation.isPending}
                      >
                        <Play className="size-4 mr-1" /> Bắt đầu
                      </Button>
                    )}
                    {academyClass.status === "ONGOING" && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => setConfirmDialog({
                          open: true,
                          title: "Kết thúc lớp học",
                          description: `Bạn có chắc chắn muốn kết thúc lớp "${academyClass.name || academyClass.code}"? Lớp sẽ được đánh dấu là "Đã hoàn thành".`,
                          action: () => runMutation(
                            () => completeMutation.mutateAsync(classId),
                            "Đã kết thúc lớp",
                            "Lỗi kết thúc"
                          )
                        })}
                        disabled={completeMutation.isPending}
                      >
                        <Square className="size-4 mr-1" /> Kết thúc
                      </Button>
                    )}
                    {academyClass.status === "COMPLETED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConfirmDialog({
                          open: true,
                          title: "Lưu trữ lớp học",
                          description: `Bạn có chắc chắn muốn lưu trữ lớp "${academyClass.name || academyClass.code}"? Lớp sẽ không còn hoạt động.`,
                          variant: "destructive",
                          action: () => runMutation(
                            () => archiveMutation.mutateAsync(classId),
                            "Đã lưu trữ",
                            "Lỗi lưu trữ"
                          )
                        })}
                        disabled={archiveMutation.isPending}
                      >
                        <Archive className="size-4 mr-1" /> Lưu trữ
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    {academyClass.status === "DRAFT" && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => setConfirmDialog({
                          open: true,
                          title: "Gửi duyệt lớp học",
                          description: `Bạn có chắc chắn muốn gửi duyệt lớp "${academyClass.name || academyClass.code}"?`,
                          action: () => runMutation(
                            () => submitMutation.mutateAsync(classId),
                            "Đã gửi duyệt",
                            "Lỗi gửi duyệt"
                          )
                        })}
                        disabled={submitMutation.isPending}
                      >
                        <Send className="size-4 mr-1" /> Gửi duyệt
                      </Button>
                    )}
                    {academyClass.status === "PENDING_APPROVAL" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => setConfirmDialog({
                            open: true,
                            title: "Xuất bản khóa học VOD",
                            description: `Bạn có chắc chắn muốn xuất bản lớp "${academyClass.name || academyClass.code}"? Sau khi xuất bản, khóa học sẽ sẵn sàng để bán qua các Offering.`,
                            action: () => runMutation(
                              () => publishMutation.mutateAsync(classId),
                              "Đã xuất bản",
                              "Lỗi xuất bản"
                            )
                          })}
                          disabled={publishMutation.isPending}
                        >
                          <Check className="size-4 mr-1" /> Xuất bản
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRejectDialogOpen(true)}
                          disabled={rejectMutation.isPending}
                        >
                          <X className="size-4 mr-1" /> Từ chối
                        </Button>
                      </div>
                    )}
                    {academyClass.status === "PUBLISHED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConfirmDialog({
                          open: true,
                          title: "Lưu trữ khóa học VOD",
                          description: `Bạn có chắc chắn muốn lưu trữ lớp "${academyClass.name || academyClass.code}"?`,
                          variant: "destructive",
                          action: () => runMutation(
                            () => archiveMutation.mutateAsync(classId),
                            "Đã lưu trữ",
                            "Lỗi lưu trữ"
                          )
                        })}
                        disabled={archiveMutation.isPending}
                      >
                        <Archive className="size-4 mr-1" /> Lưu trữ
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Từ chối duyệt lớp</DialogTitle>
            <DialogDescription>
              Nhập lý do từ chối. Lớp sẽ chuyển về trạng thái Bản nháp.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Lý do</Label>
              <Input
                id="reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ví dụ: Thiếu thông tin lịch học"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!rejectReason.trim()) {
                  toast.error("Vui lòng nhập lý do từ chối")
                  return
                }
                await runMutation(
                  () => rejectMutation.mutateAsync({ id: classId, reason: rejectReason.trim() }),
                  "Đã từ chối",
                  "Lỗi từ chối"
                )
                setRejectReason("")
                setRejectDialogOpen(false)
              }}
              disabled={rejectMutation.isPending}
            >
              Từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog(prev => ({ ...prev, open: false }))}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogDescription>{confirmDialog.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}>
              Hủy
            </Button>
            <Button
              variant={confirmDialog.variant}
              onClick={async () => {
                await confirmDialog.action()
                setConfirmDialog(prev => ({ ...prev, open: false }))
              }}
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isLive && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="size-5" />
              Thông tin lớp học trực tiếp (LIVE)
            </CardTitle>
            <CardDescription>Lịch kỳ học và thời gian mở/đóng đăng ký</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Ngày mở</p>
                <p className="font-medium">{formatDate((academyClass as any).openingDate)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ngày đóng</p>
                <p className="font-medium">{formatDate((academyClass as any).closingDate)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Mở đăng ký</p>
                <p className="font-medium">{formatDate((academyClass as any).enrollmentOpenAt)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Đóng đăng ký</p>
                <p className="font-medium">{formatDate((academyClass as any).enrollmentCloseAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLive && vod && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="size-5" />
              Thông tin lớp học tự học (VOD)
            </CardTitle>
            <CardDescription>Thời gian đăng ký và giới hạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Mở đăng ký</p>
                <p className="font-medium">{formatDate(vod.enrollmentOpenAt)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Đóng đăng ký</p>
                <p className="font-medium">{formatDate(vod.enrollmentCloseAt)}</p>
              </div>
              {vod.maxStudents != null && (
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Học viên tối đa</p>
                    <p className="font-medium">{vod.maxStudents}</p>
                  </div>
                </div>
              )}
              {vod.defaultExpiresMonths != null && (
                <div>
                  <p className="text-xs text-muted-foreground">Thời hạn mặc định (tháng)</p>
                  <p className="font-medium">{vod.defaultExpiresMonths} tháng</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
