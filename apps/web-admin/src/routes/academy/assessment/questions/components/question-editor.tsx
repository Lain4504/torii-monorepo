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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@workspace/ui/components/sheet"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Label } from "@workspace/ui/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Badge } from "@workspace/ui/components/badge"
import { X, CheckCircle2, Loader2 } from "lucide-react"
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="!w-full sm:!max-w-[680px] p-0 flex flex-col overflow-hidden">
        <SheetHeader className="px-6 py-4 border-b shrink-0">
          <SheetTitle>
            {questionId ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}
          </SheetTitle>
          <SheetDescription>
            {questionId
              ? "Chỉnh sửa nội dung câu hỏi trắc nghiệm."
              : "Tạo câu hỏi trắc nghiệm 4 đáp án cho ngân hàng câu hỏi."}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0">
          <form id="question-editor-form" onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">

            {/* Nội dung câu hỏi */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Nội dung câu hỏi <span className="text-destructive">*</span>
              </Label>
              <Textarea
                placeholder="Nhập nội dung câu hỏi..."
                {...form.register("stem")}
                className="min-h-[100px] text-sm resize-none"
              />
              {form.formState.errors.stem && (
                <p className="text-destructive text-xs">{form.formState.errors.stem.message}</p>
              )}
            </div>

            {/* Độ khó + Danh mục */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Độ khó</Label>
                <Select
                  value={form.watch("difficulty")}
                  onValueChange={(v) => form.setValue("difficulty", v)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">🟢 Dễ</SelectItem>
                    <SelectItem value="MEDIUM">🟡 Trung bình</SelectItem>
                    <SelectItem value="HARD">🔴 Khó</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Danh mục</Label>
                <Select
                  value=""
                  onValueChange={(v) => {
                    const current = form.getValues("categoryIds") || []
                    if (!current.includes(v)) {
                      form.setValue("categoryIds", [...current, v], { shouldDirty: true })
                    }
                  }}
                >
                  <SelectTrigger className="h-10">
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
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {watchedCategoryIds.map((catId: string) => {
                      const cat = (categories as any[]).find(c => c.id === catId)
                      return (
                        <Badge key={catId} variant="secondary" className="pl-2 pr-1 h-6 text-xs gap-1">
                          {cat?.name || catId}
                          <button
                            type="button"
                            className="p-0.5 rounded hover:text-destructive transition-colors"
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

            {/* Đáp án - 2x2 grid */}
            <div className="space-y-2">
              <div>
                <Label className="text-sm font-semibold">
                  Các đáp án <span className="text-destructive">*</span>
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bấm vào ô để đánh dấu đáp án đúng
                </p>
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
                        "flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                        isCorrect
                          ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                          : "border-border bg-card hover:border-muted-foreground/30"
                      )}
                    >
                      <div className={cn(
                        "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors",
                        isCorrect
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-muted-foreground/30 text-muted-foreground"
                      )}>
                        {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : field.optionKey}
                      </div>
                      <Input
                        className="flex-1 border-none shadow-none px-0 h-8 bg-transparent focus-visible:ring-0 text-sm font-medium placeholder:text-muted-foreground/40"
                        placeholder={`Nhập đáp án ${field.optionKey}...`}
                        {...form.register(`options.${index}.content`)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Giải thích (tùy chọn) */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Giải thích đáp án{" "}
                <span className="text-muted-foreground font-normal">(tùy chọn)</span>
              </Label>
              <Textarea
                placeholder="Giải thích ngắn gọn tại sao đây là đáp án đúng..."
                {...form.register("explanation")}
                className="min-h-[80px] text-sm resize-none"
              />
            </div>

          </form>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-muted/20 flex items-center justify-between shrink-0">
          <p className="text-xs text-muted-foreground">* Trường bắt buộc</p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              form="question-editor-form"
              disabled={isPending}
              className="min-w-[120px]"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {isPending ? "Đang xử lý..." : questionId ? "Lưu thay đổi" : "Tạo câu hỏi"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
