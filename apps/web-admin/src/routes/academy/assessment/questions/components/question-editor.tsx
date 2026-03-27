import { useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  useAcademyQuestionCategories,
  useCreateAcademyQuestion,
  useUpdateAcademyQuestion,
  type AcademyQuestion,
} from "@/lib/api/services/academy-questions"
import {
  academyQuestionCreateDTOSchema,
  type AcademyQuestionCreateDTO,
  AcademyQuestionType,
} from "@workspace/schemas"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Badge } from "@workspace/ui/components/badge"
import { X, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@workspace/ui/lib/utils"

interface QuestionEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  questionId?: string
  initialData?: AcademyQuestion | null
}

const OPTION_KEYS = ["A", "B", "C", "D"]

const defaultOptions = OPTION_KEYS.map((key, i) => ({
  optionKey: key,
  content: "",
  isCorrect: i === 0,
  orderIndex: i,
}))

export function QuestionEditor({ open, onOpenChange, questionId, initialData }: QuestionEditorProps) {
  const { data: categories = [] } = useAcademyQuestionCategories()
  const createMutation = useCreateAcademyQuestion()
  const updateMutation = useUpdateAcademyQuestion()

  const form = useForm<AcademyQuestionCreateDTO>({
    resolver: zodResolver(academyQuestionCreateDTOSchema) as any,
    defaultValues: {
      stem: "",
      questionType: AcademyQuestionType.SINGLE_CHOICE,
      difficulty: "MEDIUM",
      explanation: "",
      options: defaultOptions,
      categoryIds: [],
    },
  })

  const { fields } = useFieldArray({ control: form.control, name: "options" })

  useEffect(() => {
    if (open) {
      if (initialData) {
        const opts = [...(initialData.options?.map(o => ({
          optionKey: o.optionKey,
          content: o.content,
          isCorrect: o.isCorrect,
          orderIndex: o.orderIndex,
        })) || [])]
        while (opts.length < 4) {
          opts.push({ optionKey: OPTION_KEYS[opts.length], content: "", isCorrect: false, orderIndex: opts.length })
        }
        form.reset({
          stem: initialData.stem,
          questionType: AcademyQuestionType.SINGLE_CHOICE,
          difficulty: initialData.difficulty || "MEDIUM",
          explanation: initialData.explanation || "",
          options: opts.slice(0, 4),
          categoryIds: initialData.categoryLinks?.map(cl => cl.categoryId) || [],
        })
      } else {
        form.reset({
          stem: "",
          questionType: AcademyQuestionType.SINGLE_CHOICE,
          difficulty: "MEDIUM",
          explanation: "",
          options: defaultOptions,
          categoryIds: [],
        })
      }
    }
  }, [initialData, open, form])

  const onSubmit = async (data: any) => {
    if (!data.options?.some((o: any) => o.isCorrect)) {
      toast.error("Vui lòng chọn ít nhất một đáp án đúng")
      return
    }
    const payload = {
      ...data,
      questionType: AcademyQuestionType.SINGLE_CHOICE,
      options: data.options.map((o: any) => ({ ...o, isCorrect: !!o.isCorrect })),
    }
    try {
      if (questionId) {
        await updateMutation.mutateAsync({ id: questionId, dto: payload })
        toast.success("Cập nhật câu hỏi thành công")
      } else {
        await createMutation.mutateAsync(payload)
        toast.success("Tạo câu hỏi thành công")
      }
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.userMessage || error.message || "Đã có lỗi xảy ra")
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending
  const watchedCategoryIds = form.watch("categoryIds") || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="text-base font-bold">
            {questionId ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col overflow-hidden flex-1">
          <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">

            {/* Question stem */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">
                Nội dung câu hỏi <span className="text-destructive">*</span>
              </Label>
              <Textarea
                placeholder="Nhập nội dung câu hỏi..."
                {...form.register("stem")}
                className="min-h-[90px] resize-none"
              />
              {form.formState.errors.stem && (
                <p className="text-destructive text-xs">{form.formState.errors.stem.message}</p>
              )}
            </div>

            {/* Difficulty + Categories */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Độ khó</Label>
                <Select
                  value={form.watch("difficulty")}
                  onValueChange={(v) => form.setValue("difficulty", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">🟢 Dễ</SelectItem>
                    <SelectItem value="MEDIUM">🟡 Trung bình</SelectItem>
                    <SelectItem value="HARD">🔴 Khó</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Danh mục</Label>
                <Select
                  onValueChange={(v) => {
                    const current = form.getValues("categoryIds") || []
                    if (!current.includes(v)) form.setValue("categoryIds", [...current, v])
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(categories as any[]).length === 0 ? (
                      <div className="px-3 py-2 text-xs text-muted-foreground italic">
                        Chưa có danh mục. Tạo danh mục trước.
                      </div>
                    ) : (
                      (categories as any[]).map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {watchedCategoryIds.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {watchedCategoryIds.map((catId: string) => {
                      const cat = (categories as any[]).find(c => c.id === catId)
                      return (
                        <Badge key={catId} variant="secondary" className="pl-2 pr-1 h-5 text-[10px] gap-1">
                          {cat?.name || catId}
                          <button
                            type="button"
                            className="ml-0.5 hover:text-destructive transition-colors"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              const current = form.getValues("categoryIds") || []
                              form.setValue("categoryIds", current.filter(id => id !== catId), { shouldDirty: true })
                            }}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Answer Options - 2x2 grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Đáp án (chọn 1 đúng)</Label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {fields.map((field, index) => {
                  const isCorrect = form.watch(`options.${index}.isCorrect`)
                  return (
                    <button
                      key={field.id}
                      type="button"
                      onClick={() => {
                        fields.forEach((_, i) => form.setValue(`options.${i}.isCorrect`, i === index))
                      }}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all",
                        isCorrect
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                          : "border-border bg-card hover:border-muted-foreground/40"
                      )}
                    >
                      <div className={cn(
                        "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors",
                        isCorrect
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-muted-foreground/40 text-muted-foreground"
                      )}>
                        {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : field.optionKey}
                      </div>
                      <Input
                        className="flex-1 border-none shadow-none px-1 h-8 py-1 bg-transparent focus-visible:ring-0 text-sm font-medium placeholder:text-muted-foreground/40"
                        placeholder={`Đáp án ${field.optionKey}...`}
                        {...form.register(`options.${index}.content`)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-muted-foreground">Bấm vào ô để đánh dấu đáp án đúng</p>
            </div>

            {/* Explanation (optional) */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">
                Giải thích đáp án <span className="text-muted-foreground font-normal">(tùy chọn)</span>
              </Label>
              <Textarea
                placeholder="Nhập giải thích cho đáp án đúng..."
                {...form.register("explanation")}
                className="min-h-[70px] resize-none text-sm"
              />
            </div>

          </div>

          <DialogFooter className="px-6 py-4 border-t shrink-0 bg-muted/20">
            <p className="text-xs text-muted-foreground flex-1">* Trường bắt buộc</p>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button type="submit" disabled={isPending} className="min-w-[120px]">
              {isPending ? "Đang xử lý..." : (questionId ? "Lưu thay đổi" : "Tạo câu hỏi")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
