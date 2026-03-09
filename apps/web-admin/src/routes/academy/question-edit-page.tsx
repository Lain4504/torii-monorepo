import { useNavigate, useParams } from "react-router-dom"
import { toast } from "@workspace/ui/components/sonner"
import { PageHeader } from "@/components/common/page-header"
import { QuestionForm } from "@/components/academy/question-form"
import {
  useAcademyQuestion,
  useUpdateAcademyQuestion,
} from "@/lib/api/services/academy-questions"
import type { AcademyQuestionUpdateDTO } from "@workspace/schemas"

export default function AcademyQuestionEditPage() {
  const nav = useNavigate()
  const { id } = useParams()
  const { data: item, isLoading } = useAcademyQuestion(id)
  const update = useUpdateAcademyQuestion()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cập nhật Question"
        subtitle="Chỉnh sửa câu hỏi trong ngân hàng câu hỏi."
      />

      <div className="pb-8">
        {isLoading || !item ? (
          <div>Đang tải...</div>
        ) : (
          <QuestionForm
            mode="edit"
            initial={item}
            submitting={update.isPending}
            onCancel={() => nav("/academy/questions")}
            onSubmit={async (data) => {
              await update.mutateAsync({
                id: item.id,
                input: data as AcademyQuestionUpdateDTO,
              })
              toast.success("Đã cập nhật")
              nav("/academy/questions")
            }}
          />
        )}
      </div>
    </div>
  )
}

