import { useNavigate } from "react-router-dom"
import { toast } from "@workspace/ui/components/sonner"
import { PageHeader } from "@/components/common/page-header"
import { QuestionForm } from "@/components/academy/question-form"
import { useCreateAcademyQuestion } from "@/lib/api/services/academy-questions"
import type { AcademyQuestionCreateDTO } from "@workspace/schemas"

export default function AcademyQuestionCreatePage() {
  const nav = useNavigate()
  const create = useCreateAcademyQuestion()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo Question"
        subtitle="Tạo câu hỏi cho ngân hàng câu hỏi."
      />

      <div className="pb-8">
        <QuestionForm
          mode="create"
          submitting={create.isPending}
          onCancel={() => nav("/academy/questions")}
          onSubmit={async (data) => {
            await create.mutateAsync(data as AcademyQuestionCreateDTO)
            toast.success("Đã tạo Question")
            nav("/academy/questions")
          }}
        />
      </div>
    </div>
  )
}

