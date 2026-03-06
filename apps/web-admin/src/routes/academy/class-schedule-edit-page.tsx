import { useNavigate, useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { toast } from "@workspace/ui/components/sonner"
import { PageHeader } from "@/components/common/page-header"
import { ClassScheduleForm } from "@/components/academy/class-schedule-form"
import {
  useAcademyClassSchedule,
  useUpdateAcademyClassSchedule,
} from "@/lib/api/services/academy-class-schedules"
import type { AcademyClassScheduleUpdateDTO } from "@workspace/schemas"

export default function AcademyClassScheduleEditPage() {
  const nav = useNavigate()
  const { id } = useParams()
  const { data: item, isLoading } = useAcademyClassSchedule(id)
  const update = useUpdateAcademyClassSchedule()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cập nhật Class Schedule"
        subtitle="Chỉnh sửa lịch học của lớp."
      />

      <Card>
        <CardHeader>
          <CardTitle>Thông tin</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || !item ? (
            <div>Đang tải...</div>
          ) : (
            <ClassScheduleForm
              mode="edit"
              initial={item}
              submitting={update.isPending}
              onCancel={() => item.classId ? nav(`/academy/classes/${item.classId}`) : nav("/academy/classes")}
              onSubmit={async (data) => {
                await update.mutateAsync({
                  id: item.id,
                  input: data as AcademyClassScheduleUpdateDTO,
                })
                toast.success("Đã cập nhật")
                if (item.classId) {
                  nav(`/academy/classes/${item.classId}`)
                } else {
                  nav("/academy/classes")
                }
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

