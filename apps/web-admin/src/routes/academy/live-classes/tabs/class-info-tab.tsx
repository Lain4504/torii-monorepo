import { Link } from "react-router-dom"
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
} from "lucide-react"
import { usePublishClassDirectly, type AcademyLiveClass } from "@/lib/api/services/academy-live-classes"
import { formatDate } from "@/lib/format-utils"
import { toast } from "@workspace/ui/components/sonner"
import { Rocket } from "lucide-react"

interface ClassInfoTabProps {
  academyClass: AcademyLiveClass | null | undefined
  classId: string
  canManageStatus: boolean
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Bản nháp",
  OPENING: "Đang tuyển sinh",
  ONGOING: "Đang diễn ra",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Đã hủy",
  ARCHIVED: "Lưu trữ",
}

export function ClassInfoTab({ academyClass, classId, canManageStatus }: ClassInfoTabProps) {
  const publishMutation = usePublishClassDirectly()

  if (!academyClass) {
    return (
      <div className="rounded-md border bg-card p-8 text-center text-muted-foreground">
        Đang tải thông tin lớp học...
      </div>
    )
  }

  const isLive = true // AcademyLiveClass is always live now
  const cohort = academyClass.cohort

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
            <div className="mt-4 pt-4 border-t space-y-3">
              <p className="text-xs text-muted-foreground font-medium">
                Thao tác nhanh trạng thái lớp học:
              </p>
              <div className="flex flex-wrap gap-2">
                {academyClass.status === "DRAFT" && (
                    <Button
                      size="sm"
                      variant="default"
                      className="gap-2 bg-green-600 hover:bg-green-700 shadow-none"
                      onClick={async () => {
                        if (confirm("Xác nhận mở đăng ký lớp học này?")) {
                          try {
                            await publishMutation.mutateAsync(classId)
                            toast.success("Đã mở đăng ký lớp học thành công! 🚀")
                          } catch (err: any) {
                            toast.error(err?.message || "Không thể mở đăng ký")
                          }
                        }
                      }}
                      disabled={publishMutation.isPending}
                    >
                      <Rocket className="size-4" />
                      Công khai & Mở đăng ký
                    </Button>
                )}
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/academy/approvals/live-classes/${classId}`}>
                    Trang xem trước
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
                <p className="text-xs text-muted-foreground">Ngày bắt đầu</p>
                  <p className="font-medium">{formatDate(academyClass.startDate)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ngày kết thúc</p>
                  <p className="font-medium">{formatDate(academyClass.endDate)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Mở đăng ký</p>
                  <p className="font-medium">{formatDate((cohort as any)?.enrollmentOpenAt)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Đóng đăng ký</p>
                  <p className="font-medium">{formatDate((cohort as any)?.enrollmentCloseAt)}</p>
              </div>
                <div className="flex items-start gap-3 sm:col-span-2 lg:col-span-3">
                  <Users className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Sĩ số (đang học / tối đa)</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium tabular-nums">
                        {(academyClass as any)._count?.enrollments ?? 0}
                        {academyClass.maxStudents != null
                          ? ` / ${academyClass.maxStudents}`
                          : " (∞)"}
                      </p>
                    </div>
                  </div>
                </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  )
}
