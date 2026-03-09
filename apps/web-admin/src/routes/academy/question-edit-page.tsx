import { useNavigate, useParams } from "react-router-dom"
import { toast } from "@workspace/ui/components/sonner"
import { PageHeader } from "@/components/common/page-header"
import { QuestionForm } from "@/components/academy/question-form"
import {
  useAcademyQuestion,
  useUpdateAcademyQuestion,
  useAcademyQuestions,
  type AcademyQuestion,
} from "@/lib/api/services/academy-questions"
import type { AcademyQuestionUpdateDTO } from "@workspace/schemas"
import { Button } from "@workspace/ui/components/button"
import { Plus } from "lucide-react"

export default function AcademyQuestionEditPage() {
  const nav = useNavigate()
  const { id } = useParams()
  const { data: item, isLoading } = useAcademyQuestion(id)
  const update = useUpdateAcademyQuestion()

  const { data: children, isLoading: childrenLoading } = useAcademyQuestions({
    parentId: id,
  })

  const isGroupParent = item?.questionType === "GROUP_PARENT"

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
          <div className="space-y-6">
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

            {isGroupParent && (
              <div className="space-y-4 rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Câu hỏi con trong đoạn văn</p>
                    <p className="text-sm text-muted-foreground">
                      Quản lý các câu hỏi trắc nghiệm thuộc câu hỏi cha này.
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() =>
                      nav(`/academy/questions/new?parentId=${item.id}`)
                    }
                  >
                    <Plus className="mr-2 size-4" />
                    Thêm câu hỏi con
                  </Button>
                </div>

                {childrenLoading ? (
                  <div className="text-sm text-muted-foreground">Đang tải danh sách câu hỏi con...</div>
                ) : children && children.length > 0 ? (
                  <div className="space-y-2">
                    {children.map((child: AcademyQuestion) => (
                      <button
                        key={child.id}
                        type="button"
                        className="w-full rounded-lg border p-3 text-left hover:bg-muted/50"
                        onClick={() => nav(`/academy/questions/${child.id}/edit`)}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="line-clamp-1 text-sm font-medium">
                            {stripHtml(child.content) || "Không có nội dung"}
                          </p>
                          <span className="text-xs text-muted-foreground">{child.questionType}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    Chưa có câu hỏi con. Nhấn <strong>Thêm câu hỏi con</strong> để bắt đầu.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function stripHtml(input: string) {
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

