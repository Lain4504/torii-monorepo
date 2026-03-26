import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAcademyExam, useCreateAcademyExam, useUpdateAcademyExam, useAddQuestionsToExam, useRemoveQuestionFromExam } from "@/lib/api/services/academy-exams"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@workspace/ui/components/select"
import { toast } from "sonner"
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react"
import { QuestionPickerModal } from "./components/question-picker-modal"
import { Badge } from "@workspace/ui/components/badge"

export default function AcademyExamEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = !!id && id !== "new"

  const { data: exam, isLoading: isFetching } = useAcademyExam(isEditing ? id : undefined)
  const createMutation = useCreateAcademyExam()
  const updateMutation = useUpdateAcademyExam()
  
  const addQuestionsMutation = useAddQuestionsToExam()
  const removeQuestionMutation = useRemoveQuestionFromExam()

  const [pickerOpen, setPickerOpen] = useState(false)
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    examType: "QUIZ",
    status: "DRAFT",
    totalTimeLimitMinutes: 60,
  })

  useEffect(() => {
    if (exam && isEditing) {
      setFormData({
        title: exam.title || "",
        description: exam.description || "",
        examType: exam.examType || "QUIZ",
        status: exam.status || "DRAFT",
        totalTimeLimitMinutes: exam.totalTimeLimitMinutes || 60,
      })
    }
  }, [exam, isEditing])

  const handleAddQuestions = async (questionIds: string[]) => {
    if (!selectedSectionId) return
    await addQuestionsMutation.mutateAsync({
      sectionId: selectedSectionId,
      questionIds,
      points: 1, // Default points
    })
    toast.success("Đã thêm câu hỏi vào bài thi")
  }

  const handleRemoveQuestion = async (examQuestionId: string) => {
    if (confirm("Chắc chắn xóa câu hỏi này khỏi bài thi?")) {
      try {
        await removeQuestionMutation.mutateAsync(examQuestionId)
        toast.success("Đã xóa câu hỏi")
      } catch (err: any) {
        toast.error(err.message || "Lỗi khi xóa câu hỏi")
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id,
          dto: {
            ...formData,
          } as any,
        })
        toast.success("Cập nhật đề thi thành công")
      } else {
        const res = await createMutation.mutateAsync({
          ...formData,
          sections: [
            {
              title: "Phần 1 - Trắc nghiệm",
              orderIndex: 0,
            }
          ],
          settings: {},
        } as any)
        toast.success("Tạo đề thi mới thành công")
        navigate(`/academy/assessment/exams/${res.id}`, { replace: true })
      }
    } catch (error: any) {
      toast.error(error.message || "Đã xảy ra lỗi")
    }
  }

  if (isEditing && isFetching) {
    return <div className="p-8 text-center text-slate-500">Đang tải biểu mẫu...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="icon" onClick={() => navigate("/academy/assessment/exams")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <PageHeader 
          title={isEditing ? "Chỉnh sửa bài thi" : "Tạo bài thi mới"}
          subtitle="Quản lý thông tin chi tiết của bài thi"
          actions={
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              <Save className="w-4 h-4 mr-2" />
              Lưu thay đổi
            </Button>
          }
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tên bài thi</label>
            <Input 
              value={formData.title} 
              onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
              placeholder="VD: Bài kiểm tra đầu vào..."
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mô tả chi tiết</label>
            <Textarea 
              value={formData.description} 
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
              placeholder="Nhập mô tả cho bài thi..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Loại bài thi</label>
              <Select value={formData.examType} onValueChange={(val) => setFormData({ ...formData, examType: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="QUIZ">Quiz ngắn</SelectItem>
                  <SelectItem value="MODULE_TEST">Kiểm tra Module</SelectItem>
                  <SelectItem value="FINAL_EXAM">Thi cuối kỳ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Trạng thái</label>
              <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Bản nháp</SelectItem>
                  <SelectItem value="PUBLISHED">Đã xuất bản (Hoạt động)</SelectItem>
                  <SelectItem value="ARCHIVED">Lưu trữ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Thời gian thi (Phút)</label>
              <Input 
                type="number" 
                value={formData.totalTimeLimitMinutes} 
                onChange={(e) => setFormData({ ...formData, totalTimeLimitMinutes: parseInt(e.target.value) || 0 })} 
                min={0}
              />
            </div>
          </div>
        </form>
      </div>

      {isEditing && exam?.sections && (
        <div className="space-y-6 max-w-3xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Cấu trúc bài thi & Câu hỏi</h3>
          </div>

          {exam.sections.map((section: any) => (
            <div key={section.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between p-4 border-b bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <h4 className="font-semibold">{section.title}</h4>
                  {section.instruction && <p className="text-sm text-slate-500">{section.instruction}</p>}
                </div>
                <Button size="sm" onClick={() => { setSelectedSectionId(section.id); setPickerOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm câu hỏi
                </Button>
              </div>
              
              <div className="p-0">
                {(!section.questions || section.questions.length === 0) ? (
                  <div className="p-8 text-center text-slate-500">
                    Chưa có câu hỏi nào trong phần này.
                  </div>
                ) : (
                  <div className="divide-y border-t-0">
                    {section.questions.map((eq: any, idx: number) => (
                      <div key={eq.id} className="flex p-4 gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="font-medium text-slate-400 mt-1">{idx + 1}.</div>
                        <div className="flex-1 space-y-2">
                          <div className="font-medium text-sm">{eq.question?.stem}</div>
                          <div className="flex gap-2 items-center">
                            <Badge variant="outline" className="text-[10px] uppercase h-5">{eq.question?.questionType}</Badge>
                            <Badge variant="secondary" className="text-[10px] h-5">{eq.points} điểm</Badge>
                          </div>
                        </div>
                        <div>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50" onClick={() => handleRemoveQuestion(eq.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          <QuestionPickerModal 
            open={pickerOpen}
            onOpenChange={setPickerOpen}
            onConfirm={handleAddQuestions}
          />
        </div>
      )}
    </div>
  )
}
