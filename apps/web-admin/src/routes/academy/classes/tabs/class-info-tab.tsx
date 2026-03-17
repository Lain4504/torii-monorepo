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
import type { AcademyClass } from "@/lib/api/services/academy-classes"

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
              <p className="text-xs text-muted-foreground font-medium">
                Flow duyệt & thao tác trạng thái đã được tách sang Approval Center.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/academy/approvals/classes/${classId}`}>Mở trang duyệt</Link>
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
