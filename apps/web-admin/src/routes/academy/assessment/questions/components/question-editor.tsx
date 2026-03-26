import { useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAcademyQuestionCategories, useCreateAcademyQuestion, useUpdateAcademyQuestion, type AcademyQuestion } from "@/lib/api/services/academy-questions"
import { academyQuestionCreateDTOSchema, type AcademyQuestionCreateDTO, AcademyQuestionType } from "@workspace/schemas"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Label } from "@workspace/ui/components/label"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Badge } from "@workspace/ui/components/badge"
import { Plus, Trash2, X } from "lucide-react"
import { toast } from "sonner"

interface QuestionEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  questionId?: string
  initialData?: AcademyQuestion | null
}

export function QuestionEditor({ open, onOpenChange, questionId, initialData }: QuestionEditorProps) {
  const { data: categories } = useAcademyQuestionCategories()
  const createMutation = useCreateAcademyQuestion()
  const updateMutation = useUpdateAcademyQuestion()

  const form = useForm<AcademyQuestionCreateDTO>({
    resolver: zodResolver(academyQuestionCreateDTOSchema) as any,
    defaultValues: {
      stem: "",
      questionType: AcademyQuestionType.SINGLE_CHOICE,
      difficulty: "MEDIUM",
      explanation: "",
      options: [
        { optionKey: "A", content: "", isCorrect: true, orderIndex: 0 },
        { optionKey: "B", content: "", isCorrect: false, orderIndex: 1 },
      ],
      categoryIds: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  })

  useEffect(() => {
    if (initialData && open) {
      form.reset({
        stem: initialData.stem,
        questionType: initialData.questionType as AcademyQuestionType,
        difficulty: initialData.difficulty,
        explanation: initialData.explanation || "",
        options: initialData.options?.map(o => ({
          optionKey: o.optionKey,
          content: o.content,
          isCorrect: o.isCorrect,
          orderIndex: o.orderIndex
        })) || [],
        categoryIds: initialData.categoryLinks?.map(cl => cl.categoryId) || [],
      })
    } else if (!initialData && open) {
      form.reset({
        stem: "",
        questionType: AcademyQuestionType.SINGLE_CHOICE,
        difficulty: "MEDIUM",
        explanation: "",
        options: [
          { optionKey: "A", content: "", isCorrect: true, orderIndex: 0 },
          { optionKey: "B", content: "", isCorrect: false, orderIndex: 1 },
        ],
        categoryIds: [],
      })
    }
  }, [initialData, open, form])

  const onSubmit = async (data: any) => {
    try {
      const formattedData = {
        ...data,
        options: data.options?.map((o: any) => ({
          ...o,
          isCorrect: !!o.isCorrect
        }))
      }
      if (questionId) {
        await updateMutation.mutateAsync({ id: questionId, dto: formattedData })
        toast.success("Cập nhật câu hỏi thành công")
      } else {
        await createMutation.mutateAsync(formattedData)
        toast.success("Tạo câu hỏi thành công")
      }
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || "Đã có lỗi xảy ra")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{questionId ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Nội dung câu hỏi (Stem) *</Label>
            <Textarea 
              placeholder="Nhập nội dung câu hỏi..." 
              {...form.register("stem")}
              className="min-h-[100px]"
            />
            {form.formState.errors.stem && <p className="text-red-500 text-sm">{form.formState.errors.stem.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Loại câu hỏi</Label>
              <Select 
                value={form.watch("questionType")} 
                onValueChange={(v) => form.setValue("questionType", v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AcademyQuestionType.SINGLE_CHOICE}>Trắc nghiệm 1 đáp án</SelectItem>
                  <SelectItem value={AcademyQuestionType.MULTIPLE_CHOICE}>Trắc nghiệm nhiều đáp án</SelectItem>
                  <SelectItem value={AcademyQuestionType.TRUE_FALSE}>Đúng/Sai</SelectItem>
                  <SelectItem value={AcademyQuestionType.SHORT_TEXT}>Câu hỏi ngắn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Độ khó</Label>
              <Select 
                value={form.watch("difficulty")} 
                onValueChange={(v) => form.setValue("difficulty", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EASY">Dễ</SelectItem>
                  <SelectItem value="MEDIUM">Trung bình</SelectItem>
                  <SelectItem value="HARD">Khó</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Các lựa chọn đáp án</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => append({ optionKey: String.fromCharCode(65 + fields.length), content: "", isCorrect: false, orderIndex: fields.length })}
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm đáp án
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-4 items-start p-3 border rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="mt-2">
                    <Checkbox 
                      checked={form.watch(`options.${index}.isCorrect`)}
                      onCheckedChange={(checked) => {
                        if (form.getValues("questionType") === AcademyQuestionType.SINGLE_CHOICE && checked) {
                           // Uncheck others
                           fields.forEach((_, i) => form.setValue(`options.${i}.isCorrect`, i === index));
                        } else {
                           form.setValue(`options.${index}.isCorrect`, !!checked);
                        }
                      }}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                       <Input 
                         className="w-16" 
                         placeholder="Key" 
                         {...form.register(`options.${index}.optionKey`)} 
                       />
                       <Input 
                         className="flex-1" 
                         placeholder="Nội dung đáp án..." 
                         {...form.register(`options.${index}.content`)} 
                       />
                       <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Giải thích đáp án</Label>
            <Textarea 
              placeholder="Nhập giải thích cho đáp án..." 
              {...form.register("explanation")}
            />
          </div>

          <div className="space-y-2">
            <Label>Danh mục (Categories)</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.watch("categoryIds")?.map(catId => {
                const cat = categories?.find(c => c.id === catId);
                return (
                  <Badge key={catId} variant="secondary" className="flex items-center gap-1">
                    {cat?.title || catId}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => {
                        const current = form.getValues("categoryIds") || [];
                        form.setValue("categoryIds", current.filter(id => id !== catId));
                    }} />
                  </Badge>
                )
              })}
            </div>
            <Select onValueChange={(v) => {
                const current = form.getValues("categoryIds") || [];
                if (!current.includes(v)) form.setValue("categoryIds", [...current, v]);
            }}>
                <SelectTrigger>
                    <SelectValue placeholder="Thêm danh mục..." />
                </SelectTrigger>
                <SelectContent>
                    {categories?.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.title}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {questionId ? "Lưu thay đổi" : "Tạo câu hỏi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
