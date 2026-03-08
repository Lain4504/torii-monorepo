import { useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import { toast } from "@workspace/ui/components/sonner"
import { PageHeader } from "@/components/common/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { VodClassForm } from "@/components/academy/vod-class-form"
import { LiveClassForm } from "@/components/academy/live-class-form"
import { useCreateAcademyClass } from "@/lib/api/services/academy-classes"
import type { AcademyClassCreateDTO } from "@workspace/schemas"
import { Video, Users } from "lucide-react"

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
    <div className="space-y-6">
      <PageHeader
        title="Tạo Lớp học mới"
        subtitle="Chọn hình thức học và thiết lập thông tin triển khai."
      />

      <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
        <div className="flex items-center justify-between gap-4 mb-6">
          <TabsList className="grid w-80 grid-cols-2">
            <TabsTrigger value="VOD" className="gap-2">
              <Video className="size-4" /> VOD Class
            </TabsTrigger>
            <TabsTrigger value="LIVE" className="gap-2">
              <Users className="size-4" /> Live Class
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="VOD">
          <VodClassForm
            mode="create"
            submitting={create.isPending}
            defaultCourseProfileId={courseProfileId}
            defaultCourseEditionId={courseEditionId}
            onCancel={() => nav("/academy/classes")}
            onSubmit={handleCreate}
          />
        </TabsContent>

        <TabsContent value="LIVE">
          <LiveClassForm
            mode="create"
            submitting={create.isPending}
            defaultCourseProfileId={courseProfileId}
            defaultCourseEditionId={courseEditionId}
            onCancel={() => nav("/academy/classes")}
            onSubmit={handleCreate}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
