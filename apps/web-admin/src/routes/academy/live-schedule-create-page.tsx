import { useLocation, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { toast } from "@workspace/ui/components/sonner"
import { PageHeader } from "@/components/common/page-header"
import { LiveScheduleForm } from "@/components/academy/live-schedule-form"
import { useCreateAcademyLiveSchedule } from "@/lib/api/services/academy-live-schedules"
import type { AcademyLiveScheduleCreateDTO } from "@workspace/schemas"

export default function AcademyLiveScheduleCreatePage() {
  const nav = useNavigate()
  const loc = useLocation()
  const search = new URLSearchParams(loc.search)
  const classId = search.get("classId") || undefined
  const liveClassId = search.get("liveClassId") || undefined
  const create = useCreateAcademyLiveSchedule()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo Live Schedule"
        subtitle="Thiết lập lịch học định kỳ cho lớp LIVE."
      />

      <Card>
        <CardHeader>
          <CardTitle>Thông tin</CardTitle>
        </CardHeader>
        <CardContent>
          <LiveScheduleForm
            mode="create"
            submitting={create.isPending}
            defaultLiveClassId={liveClassId}
            onCancel={() => classId ? nav(`/academy/classes/${classId}`) : nav("/academy/classes")}
            onSubmit={async (data) => {
              await create.mutateAsync(data as AcademyLiveScheduleCreateDTO)
              toast.success("Đã tạo Live Schedule")
              if (classId) {
                nav(`/academy/classes/${classId}`)
              } else {
                nav("/academy/classes")
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
