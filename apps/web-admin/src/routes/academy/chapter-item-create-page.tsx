import { useLocation, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { toast } from "@workspace/ui/components/sonner"
import { PageHeader } from "@/components/common/page-header"
import { ChapterItemForm } from "@/components/academy/chapter-item-form"
import { useCreateAcademyChapterItem } from "@/lib/api/services/academy-chapter-items"
import type { AcademyChapterItemCreateDTO } from "@workspace/schemas"

export default function AcademyChapterItemCreatePage() {
  const nav = useNavigate()
  const loc = useLocation()
  const search = new URLSearchParams(loc.search)
  const chapterId = search.get("chapterId") ?? undefined
  const create = useCreateAcademyChapterItem()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo Chapter Item"
        subtitle="Tạo Lesson/Quiz/Assignment/Exam bên trong Chapter."
      />

      <Card>
        <CardHeader>
          <CardTitle>Thông tin</CardTitle>
        </CardHeader>
        <CardContent>
          <ChapterItemForm
            mode="create"
            chapterId={chapterId}
            submitting={create.isPending}
            onCancel={() => nav("/academy/chapter-items")}
            onSubmit={async (data) => {
              await create.mutateAsync(data as AcademyChapterItemCreateDTO)
              toast.success("Đã tạo Chapter Item")
              nav("/academy/chapter-items")
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

