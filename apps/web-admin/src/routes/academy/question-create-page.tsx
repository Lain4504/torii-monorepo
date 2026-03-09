import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { PageHeader } from "@/components/common/page-header"
import { SingleQuestionFlow } from "@/components/academy/single-question-flow"
import { GroupQuestionFlow } from "@/components/academy/group-question-flow"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { BookOpen, FileText } from "lucide-react"

export default function AcademyQuestionCreatePage() {
  const nav = useNavigate()
  const [searchParams] = useSearchParams()
  const parentId = searchParams.get("parentId")

  // If parentId is present, we are adding a child to an existing parent.
  // In that case, we should probably just use the SingleQuestionFlow with parentId.
  // BUT the user wants a clear split.

  const [flowMode, setFlowMode] = useState<"single" | "group">(
    parentId ? "single" : "single" // default to single
  )

  const handleCreated = () => {
    // For single questions, go back to list
    if (flowMode === "single") {
      nav("/academy/questions")
    }
    // For groups, GroupQuestionFlow handles its own navigation/state
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo Question"
        subtitle={flowMode === "single" ? "Tạo câu hỏi trắc nghiệm hoặc tự luận đơn lẻ." : "Tạo đoạn văn/ngữ cảnh và bộ câu hỏi con đi kèm."}
      />

      {!parentId && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Bạn muốn tạo loại câu hỏi nào?</CardTitle>
            <CardDescription>Chọn flow phù hợp để tối ưu thao tác.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button
              variant={flowMode === "single" ? "default" : "outline"}
              className="h-auto py-4 px-6 flex-1 flex-col gap-2 rounded-xl"
              onClick={() => setFlowMode("single")}
            >
              <FileText className="size-6" />
              <div className="text-left w-full">
                <div className="font-bold">Câu hỏi đơn</div>
                <div className="text-[10px] opacity-80 font-normal">Trắc nghiệm, Ngắn, Đúng/Sai...</div>
              </div>
            </Button>
            <Button
              variant={flowMode === "group" ? "default" : "outline"}
              className="h-auto py-4 px-6 flex-1 flex-col gap-2 rounded-xl"
              onClick={() => setFlowMode("group")}
            >
              <BookOpen className="size-6" />
              <div className="text-left w-full">
                <div className="font-bold">Đoạn văn (Group)</div>
                <div className="text-[10px] opacity-80 font-normal">Đọc hiểu, Nghe hiểu + Câu con</div>
              </div>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="pb-12">
        {flowMode === "single" ? (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <SingleQuestionFlow
                  mode="create"
                  parentId={parentId || undefined}
                  onSuccess={handleCreated}
                  onCancel={() => nav("/academy/questions")}
                />
              </CardContent>
            </Card>
          </div>
        ) : (
          <GroupQuestionFlow
            onCancel={() => nav("/academy/questions")}
          />
        )}
      </div>
    </div>
  )
}

