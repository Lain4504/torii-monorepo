import { useNavigate, useParams } from "react-router-dom"
import { PageHeader } from "@/components/common/page-header"
import { SingleQuestionFlow } from "@/components/academy/single-question-flow"
import { GroupQuestionFlow } from "@/components/academy/group-question-flow"
import { useAcademyQuestion } from "@/lib/api/services/academy-questions"
import { Card, CardContent } from "@workspace/ui/components/card"

export default function AcademyQuestionEditPage() {
  const nav = useNavigate()
  const { id } = useParams()
  const { data: item, isLoading } = useAcademyQuestion(id)

  const isGroupParent = item?.questionType === "GROUP_PARENT"

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cập nhật Question"
        subtitle={isGroupParent ? "Chỉnh sửa đoạn văn và các câu hỏi con đi kèm." : "Chỉnh sửa nội dung và đáp án câu hỏi."}
      />

      <div className="pb-12">
        {isLoading || !item ? (
          <div className="py-12 text-center text-muted-foreground">Đang tải câu hỏi...</div>
        ) : isGroupParent ? (
          <GroupQuestionFlow
            initialParent={item}
            onCancel={() => nav("/academy/questions")}
          />
        ) : (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <SingleQuestionFlow
                  mode="edit"
                  initial={item}
                  onSuccess={() => nav("/academy/questions")}
                  onCancel={() => nav("/academy/questions")}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

