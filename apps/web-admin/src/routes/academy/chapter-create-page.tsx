import { useLocation, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { toast } from "@workspace/ui/components/sonner"
import { PageHeader } from "@/components/common/page-header"
import { ChapterForm } from "@/components/academy/chapter-form"
import { useCreateAcademyChapter } from "@/lib/api/services/academy-chapters"
import type { AcademyChapterCreateDTO } from "@workspace/schemas"

export default function AcademyChapterCreatePage() {
  const nav = useNavigate()
  const loc = useLocation()
  const search = new URLSearchParams(loc.search)
  const courseEditionId = search.get("courseEditionId") ?? undefined
  const create = useCreateAcademyChapter()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo Chapter"
        subtitle="Tạo chương cho Course Edition."
      />

      <Card>
        <CardHeader>
          <CardTitle>Thông tin</CardTitle>
        </CardHeader>
        <CardContent>
          <ChapterForm
            mode="create"
            courseEditionId={courseEditionId}
            submitting={create.isPending}
            onCancel={() => nav("/academy/chapters")}
            onSubmit={async (data) => {
              await create.mutateAsync(data as AcademyChapterCreateDTO)
              toast.success("Đã tạo Chapter")
              nav("/academy/chapters")
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

