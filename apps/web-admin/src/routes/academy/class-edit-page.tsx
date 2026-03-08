import { useNavigate, useParams } from "react-router-dom"
import { Card, CardContent } from "@workspace/ui/components/card"
import { toast } from "@workspace/ui/components/sonner"
import { PageHeader } from "@/components/common/page-header"
import { VodClassForm } from "@/components/academy/vod-class-form"
import { LiveClassForm } from "@/components/academy/live-class-form"
import {
  useAcademyClass,
  useUpdateAcademyClass,
} from "@/lib/api/services/academy-classes"
import type { AcademyClassUpdateDTO } from "@workspace/schemas"
import { Spinner } from "@workspace/ui/components/spinner"

export default function AcademyClassEditPage() {
  const nav = useNavigate()
  const { id } = useParams()
  const { data: item, isLoading } = useAcademyClass(id)
  const update = useUpdateAcademyClass()

  const handleUpdate = async (data: any) => {
    if (!item) return
    try {
      await update.mutateAsync({
        id: item.id,
        input: data as AcademyClassUpdateDTO,
      })
      toast.success("Đã cập nhật lớp học")
      nav("/academy/classes")
    } catch (err: any) {
      toast.error("Có lỗi xảy ra: " + (err.message || "Unknown error"))
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cập nhật Lớp học"
        subtitle={`Chỉnh sửa thông tin ${item?.mode === "LIVE" ? "Live Class" : "VOD Class"}.`}
      />

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner />
        </div>
      ) : !item ? (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            Không tìm thấy lớp học.
          </CardContent>
        </Card>
      ) : (
        <>
          {item.mode === "LIVE" ? (
            <LiveClassForm
              mode="edit"
              initial={item}
              submitting={update.isPending}
              onCancel={() => nav(`/academy/classes/${id}`)}
              onSubmit={handleUpdate}
            />
          ) : (
            <VodClassForm
              mode="edit"
              initial={item}
              submitting={update.isPending}
              onCancel={() => nav(`/academy/classes/${id}`)}
              onSubmit={handleUpdate}
            />
          )}
        </>
      )}
    </div>
  )
}
