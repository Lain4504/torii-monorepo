import { useLocation, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { toast } from "@workspace/ui/components/sonner"
import { PageHeader } from "@/components/common/page-header"
import { ClassScheduleForm } from "@/components/academy/class-schedule-form"
import { useCreateAcademyClassSchedule } from "@/lib/api/services/academy-class-schedules"
import type { AcademyClassScheduleCreateDTO } from "@workspace/schemas"

export default function AcademyClassScheduleCreatePage() {
  const nav = useNavigate()
  const loc = useLocation()
  const search = new URLSearchParams(loc.search)
  const classId = search.get("classId") ?? undefined
  const create = useCreateAcademyClassSchedule()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo Class Schedule"
        subtitle="Thiết lập lịch học định kỳ cho lớp."
      />

      <Card>
        <CardHeader>
          <CardTitle>Thông tin</CardTitle>
        </CardHeader>
        <CardContent>
          <ClassScheduleForm
            mode="create"
            submitting={create.isPending}
            defaultClassId={classId}
            onCancel={() => classId ? nav(`/academy/classes/${classId}`) : nav("/academy/classes")}
            onSubmit={async (data) => {
              await create.mutateAsync(data as AcademyClassScheduleCreateDTO)
              toast.success("Đã tạo Class Schedule")
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

