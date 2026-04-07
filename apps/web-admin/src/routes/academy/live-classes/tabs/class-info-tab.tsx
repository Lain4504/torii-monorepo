import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import {
  BookOpen,
  Video,
  GraduationCap,
  Calendar,
  Users,
  Hash,
  FileText,
} from "lucide-react"
import { type AcademyLiveClass } from "@/lib/api/services/academy-live-classes"
import { formatDate } from "@/lib/format-utils"

interface ClassInfoTabProps {
  academyClass: AcademyLiveClass | null | undefined
  classId: string
  canManageStatus: boolean
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Bản nháp",
  OPENING: "Đang tuyển sinh",
  IN_PROGRESS: "Đang diễn ra",
  COMPLETED: "Đã hoàn thành",
  ARCHIVED: "Lưu trữ",
}

const WEEKDAY_LABELS = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"]

export function ClassInfoTab({ academyClass }: ClassInfoTabProps) {

  if (!academyClass) {
    return (
      <div className="rounded-md border bg-card p-8 text-center text-muted-foreground">
        Đang tải thông tin lớp học...
      </div>
    )
  }

  const isLive = true // AcademyLiveClass is always live now

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
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3 flex items-center gap-3">
              <Hash className="size-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Mã lớp</p>
                <p className="font-mono font-medium">{academyClass.code}</p>
              </div>
            </div>
            <div className="rounded-lg border p-3 flex items-center gap-3">
              <FileText className="size-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Tên lớp</p>
                <p className="font-medium break-words">{academyClass.name}</p>
              </div>
            </div>
            <div className="rounded-lg border p-3 flex items-center gap-3">
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
            <div className="rounded-lg border p-3 flex items-center gap-3">
              <Calendar className="size-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Trạng thái</p>
                <Badge variant="outline">
                  {STATUS_LABELS[academyClass.status] ?? academyClass.status}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLive && (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Video className="size-4" />
                Thời gian & Tuyển sinh
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Ngày bắt đầu</p>
                  <p className="font-medium">{formatDate(academyClass.cohort?.startDate || academyClass.startDate)}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Ngày kết thúc</p>
                  <p className="font-medium">{formatDate(academyClass.cohort?.endDate || academyClass.endDate)}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Mở đăng ký</p>
                  <p className="font-medium">{formatDate(academyClass.cohort?.enrollmentOpenAt)}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Đóng đăng ký</p>
                  <p className="font-medium">{formatDate(academyClass.cohort?.enrollmentCloseAt)}</p>
                </div>
                <div className="rounded-lg border p-3 sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Sĩ số (đang học / tối đa)</p>
                  <p className="font-medium">
                    {academyClass._count?.enrollments ?? 0}
                    {academyClass.maxStudents != null
                      ? ` / ${academyClass.maxStudents}`
                      : " (Không giới hạn)"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="size-4" />
                  Lịch học tuần (Lý thuyết)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {academyClass.liveSchedules && academyClass.liveSchedules.length > 0 ? (
                  <div className="space-y-2">
                    {academyClass.liveSchedules.map((s) => (
                      <div key={s.id} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                        <div className="flex flex-col">
                          <span className="font-medium">{WEEKDAY_LABELS[s.weekday]}</span>
                          {s.roomId && (
                            <span className="text-[10px] font-mono text-primary font-bold">
                              Room: {s.roomId}
                            </span>
                          )}
                        </div>
                        <span className="text-muted-foreground">{s.startTime} - {s.endTime}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Chưa thiết lập lịch học tuần.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <GraduationCap className="size-4" />
                  Học phần & Giảng viên
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <BookOpen className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Hồ sơ khóa học</p>
                    <p className="font-medium">{academyClass.cohort?.courseProfile?.title || "—"}</p>
                    {academyClass.cohort?.courseProfile?.level && (
                      <Badge variant="outline" className="mt-1 text-[10px] h-4">
                        {academyClass.cohort.courseProfile.level}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3 border-t pt-4">
                  <Users className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Giảng viên phụ trách</p>
                    <div className="flex items-center gap-2 mt-1">
                      {academyClass.instructor?.avatarUrl ? (
                        <img
                          src={academyClass.instructor.avatarUrl}
                          alt={academyClass.instructor.displayName}
                          className="size-6 rounded-full"
                        />
                      ) : (
                        <div className="size-6 rounded-full bg-secondary flex items-center justify-center text-[10px]">
                          {academyClass.instructor?.displayName?.charAt(0) || "?"}
                        </div>
                      )}
                      <p className="font-medium">{academyClass.instructor?.displayName || "Chưa phân công"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

    </div>
  )
}
