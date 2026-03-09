import { useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import { toast } from "@workspace/ui/components/sonner"
import { PageHeader } from "@/components/common/page-header"
import { VodClassForm } from "@/components/academy/vod-class-form"
import { LiveClassForm } from "@/components/academy/live-class-form"
import { useCreateAcademyClass } from "@/lib/api/services/academy-classes"
import type { AcademyClassCreateDTO } from "@workspace/schemas"
import { Video, Users, CheckCircle2 } from "lucide-react"
import { Card, CardContent } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"

export default function AcademyClassCreatePage() {
  const nav = useNavigate()
  const loc = useLocation()
  const search = new URLSearchParams(loc.search)
  const courseProfileId = search.get("courseProfileId") ?? undefined
  const courseEditionId = search.get("courseEditionId") ?? undefined

  const [mode, setMode] = useState<"VOD" | "LIVE">("VOD")
  const create = useCreateAcademyClass()

  const handleCreate = async (data: any) => {
    try {
      await create.mutateAsync(data as AcademyClassCreateDTO)
      toast.success("Đã tạo lớp học thành công")
      nav("/academy/classes")
    } catch (err: any) {
      toast.error("Có lỗi xảy ra: " + (err.message || "Unknown error"))
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Tạo Lớp học mới"
        subtitle="Chọn hình thức học và thiết lập thông tin triển khai phù hợp với nhu cầu vận hành."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:max-w-3xl">
        <Card
          className={cn(
            "relative cursor-pointer overflow-hidden transition-all hover:border-primary/50",
            mode === "VOD" ? "border-primary ring-1 ring-primary" : "opacity-70"
          )}
          onClick={() => setMode("VOD")}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className={cn(
                "rounded-lg p-2",
                mode === "VOD" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                <Video className="size-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">VOD Class</h3>
                <p className="text-sm text-muted-foreground">
                  Học qua video bài giảng có sẵn. Học viên tự chủ thời gian.
                </p>
              </div>
              {mode === "VOD" && (
                <CheckCircle2 className="absolute top-4 right-4 size-5 text-primary" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "relative cursor-pointer overflow-hidden transition-all hover:border-primary/50",
            mode === "LIVE" ? "border-primary ring-1 ring-primary" : "opacity-70"
          )}
          onClick={() => setMode("LIVE")}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className={cn(
                "rounded-lg p-2",
                mode === "LIVE" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                <Users className="size-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">Live Class</h3>
                <p className="text-sm text-muted-foreground">
                  Học trực tuyến với giảng viên. Có lịch học cố định theo buổi.
                </p>
              </div>
              {mode === "LIVE" && (
                <CheckCircle2 className="absolute top-4 right-4 size-5 text-primary" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 pt-6 border-t">
        {mode === "VOD" ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold tracking-tight">Cấu hình Lớp VOD</h2>
              <p className="text-sm text-muted-foreground">Thiết lập các thông số cho lớp học học liệu số.</p>
            </div>
            <VodClassForm
              mode="create"
              submitting={create.isPending}
              defaultCourseProfileId={courseProfileId}
              defaultCourseEditionId={courseEditionId}
              onCancel={() => nav("/academy/classes")}
              onSubmit={handleCreate}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold tracking-tight">Cấu hình Lớp LIVE</h2>
              <p className="text-sm text-muted-foreground">Thiết lập kỳ học, lịch trình và giảng viên.</p>
            </div>
            <LiveClassForm
              mode="create"
              submitting={create.isPending}
              defaultCourseProfileId={courseProfileId}
              defaultCourseEditionId={courseEditionId}
              onCancel={() => nav("/academy/classes")}
              onSubmit={handleCreate}
            />
          </div>
        )}
      </div>
    </div>
  )
}
