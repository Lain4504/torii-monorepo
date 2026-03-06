import { useNavigate, useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { toast } from "@workspace/ui/components/sonner"
import { PageHeader } from "@/components/common/page-header"
import { ChapterForm } from "@/components/academy/chapter-form"
import {
  useAcademyChapter,
  useUpdateAcademyChapter,
} from "@/lib/api/services/academy-chapters"
import type { AcademyChapterUpdateDTO } from "@workspace/schemas"

export default function AcademyChapterEditPage() {
  const nav = useNavigate()
  const { id } = useParams()
  const { data: item, isLoading } = useAcademyChapter(id)
  const update = useUpdateAcademyChapter()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cập nhật Chapter"
        subtitle="Chỉnh sửa chương."
      />

      <Card>
        <CardHeader>
          <CardTitle>Thông tin</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || !item ? (
            <div>Đang tải...</div>
          ) : (
            <ChapterForm
              mode="edit"
              initial={item}
              submitting={update.isPending}
              onCancel={() => nav("/academy/chapters")}
              onSubmit={async (data) => {
                await update.mutateAsync({
                  id: item.id,
                  input: data as AcademyChapterUpdateDTO,
                })
                toast.success("Đã cập nhật")
                nav("/academy/chapters")
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

