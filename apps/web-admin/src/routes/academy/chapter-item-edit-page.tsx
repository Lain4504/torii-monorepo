import { useNavigate, useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { toast } from "@workspace/ui/components/sonner"
import { PageHeader } from "@/components/common/page-header"
import { ChapterItemForm } from "@/components/academy/chapter-item-form"
import {
  useAcademyChapterItem,
  useUpdateAcademyChapterItem,
} from "@/lib/api/services/academy-chapter-items"
import type { AcademyChapterItemUpdateDTO } from "@workspace/schemas"

export default function AcademyChapterItemEditPage() {
  const nav = useNavigate()
  const { id } = useParams()
  const { data: item, isLoading } = useAcademyChapterItem(id)
  const update = useUpdateAcademyChapterItem()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cập nhật Chapter Item"
        subtitle="Chỉnh sửa item trong Chapter."
      />

      <Card>
        <CardHeader>
          <CardTitle>Thông tin</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || !item ? (
            <div>Đang tải...</div>
          ) : (
            <ChapterItemForm
              mode="edit"
              initial={item}
              submitting={update.isPending}
              onCancel={() => nav(-1)}
              onSubmit={async (data) => {
                await update.mutateAsync({
                  id: item.id,
                  input: data as AcademyChapterItemUpdateDTO,
                })
                toast.success("Đã cập nhật")
                nav(-1)
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

