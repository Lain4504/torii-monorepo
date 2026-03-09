import { useNavigate, useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { toast } from "@workspace/ui/components/sonner"
import { PageHeader } from "@/components/common/page-header"
import { LiveScheduleForm } from "@/components/academy/live-schedule-form"
import {
  useAcademyLiveSchedule,
  useUpdateAcademyLiveSchedule,
} from "@/lib/api/services/academy-live-schedules"
import type { AcademyLiveScheduleUpdateDTO } from "@workspace/schemas"

export default function AcademyLiveScheduleEditPage() {
  const nav = useNavigate()
  const { id } = useParams()
  const { data: item, isLoading } = useAcademyLiveSchedule(id)
  const update = useUpdateAcademyLiveSchedule()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cập nhật Live Schedule"
        subtitle="Chỉnh sửa lịch học của lớp LIVE."
      />

      <Card>
        <CardHeader>
          <CardTitle>Thông tin</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || !item ? (
            <div>Đang tải...</div>
          ) : (
            <LiveScheduleForm
              mode="edit"
              initial={item}
              submitting={update.isPending}
              onCancel={() =>
                item.liveClass?.classId
                  ? nav(`/academy/classes/${item.liveClass.classId}`)
                  : nav("/academy/classes")
              }
              onSubmit={async (data) => {
                await update.mutateAsync({
                  id: item.id,
                  input: data as AcademyLiveScheduleUpdateDTO,
                })
                toast.success("Đã cập nhật")
                if (item.liveClass?.classId) {
                  nav(`/academy/classes/${item.liveClass.classId}`)
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
