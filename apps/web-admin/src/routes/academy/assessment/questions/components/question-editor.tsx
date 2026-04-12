import { useEffect, useState, type ChangeEvent } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  useCreateAcademyQuestion,
  useUpdateAcademyQuestion,
  type AcademyQuestion,
} from "@/lib/api/services/academy-questions"
import {
  academyQuestionCreateDTOSchema,
  type AcademyQuestionCreateDTO,
  AcademyQuestionCategoryType,
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
import { Label } from "@workspace/ui/components/label"
import { RichTextEditor } from "@/components/editor/rich-text-editor"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"

import { CheckCircle2, Loader2, Upload, Image as ImageIcon, FileAudio, X } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@workspace/ui/lib/utils"
import { storageApi } from "@/lib/api/services/storage-api"

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
  const createMutation = useCreateAcademyQuestion()
  const updateMutation = useUpdateAcademyQuestion()
  const [uploadingMedia, setUploadingMedia] = useState(false)

  const form = useForm<AcademyQuestionCreateDTO>({
    resolver: zodResolver(academyQuestionCreateDTOSchema) as any,
    defaultValues: {
      stem: "",
      questionType: AcademyQuestionType.SINGLE_CHOICE,
      level: "N3",
      categoryType: AcademyQuestionCategoryType.GRAMMAR,
      explanation: "",
      mediaUrl: "",
      options: defaultOptions,
    },
  })

  const { fields } = useFieldArray({ control: form.control, name: "options" })
  const selectedCategory = form.watch("categoryType")
  const mediaUrl = form.watch("mediaUrl")
  const isListening = selectedCategory === AcademyQuestionCategoryType.LISTENING

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
          level: initialData.level || "N3",
          categoryType: (initialData.categoryType as AcademyQuestionCategoryType) || AcademyQuestionCategoryType.GRAMMAR,
          explanation: initialData.explanation || "",
          mediaUrl: initialData.mediaUrl || "",
          options: opts.slice(0, 4),
        })
      } else {
        form.reset({
          stem: "",
          questionType: AcademyQuestionType.SINGLE_CHOICE,
          level: "N3",
          categoryType: AcademyQuestionCategoryType.GRAMMAR,
          explanation: "",
          mediaUrl: "",
          options: defaultOptions,
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

  const mediaLabel = isListening ? "Audio câu hỏi" : "Hình ảnh minh họa"
  const mediaAccept = isListening ? "audio/*" : "image/*"
  const mediaHint = isListening
    ? "Tải file nghe cho câu hỏi dạng Listening (mp3, wav, m4a...)."
    : "Tải ảnh minh họa cho câu hỏi (png, jpg, webp...)."

  const handleMediaUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      setUploadingMedia(true)
      const uploaded = await storageApi.uploadFile(file, "academy-question-bank")
      form.setValue("mediaUrl", uploaded.fileUrl || "", { shouldDirty: true })
      toast.success(`Đã tải lên ${isListening ? "audio" : "hình ảnh"} thành công`)
    } catch {
      toast.error("Tải file thất bại")
    } finally {
      setUploadingMedia(false)
      event.target.value = ""
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:!max-w-[1000px] xl:!max-w-[1200px] p-0 flex flex-col overflow-hidden">
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
          <form id="question-editor-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6 overflow-x-hidden">

            {/* Nội dung câu hỏi */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Nội dung câu hỏi <span className="text-destructive">*</span>
              </Label>
              <RichTextEditor
                value={form.watch("stem")}
                onChange={(val) => form.setValue("stem", val, { shouldDirty: true })}
                placeholder="Nhập nội dung câu hỏi..."
                minHeight={150}
              />
              {form.formState.errors.stem && (
                <p className="text-destructive text-xs">{form.formState.errors.stem.message}</p>
              )}
            </div>

            {/* Cấp độ (JLPT) + Nhóm câu hỏi */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Cấp độ (JLPT)</Label>
                <Select
                  value={form.watch("level")}
                  onValueChange={(v) => form.setValue("level", v)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="N1">N1</SelectItem>
                    <SelectItem value="N2">N2</SelectItem>
                    <SelectItem value="N3">N3</SelectItem>
                    <SelectItem value="N4">N4</SelectItem>
                    <SelectItem value="N5">N5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Nhóm câu hỏi</Label>
                <Select
                  value={(form.watch("categoryType") as string) || AcademyQuestionCategoryType.GRAMMAR}
                  onValueChange={(v) => form.setValue("categoryType", v as AcademyQuestionCategoryType)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AcademyQuestionCategoryType.VOCABULARY}>Từ vựng</SelectItem>
                    <SelectItem value={AcademyQuestionCategoryType.GRAMMAR}>Ngữ pháp</SelectItem>
                    <SelectItem value={AcademyQuestionCategoryType.KANJI}>Kanji</SelectItem>
                    <SelectItem value={AcademyQuestionCategoryType.READING}>Đọc hiểu</SelectItem>
                    <SelectItem value={AcademyQuestionCategoryType.LISTENING}>Nghe hiểu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Media theo nhóm câu hỏi */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">{mediaLabel}</Label>
              <div className="rounded-lg border bg-muted/20 p-3 space-y-3">
                <p className="text-xs text-muted-foreground">{mediaHint}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    type="file"
                    accept={mediaAccept}
                    onChange={handleMediaUpload}
                    disabled={uploadingMedia || isPending}
                    className="max-w-sm"
                  />
                  {uploadingMedia && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
                {mediaUrl ? (
                  <div className="rounded-md border bg-background p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex items-center gap-2">
                        {isListening ? (
                          <FileAudio className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                        <a
                          href={mediaUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="truncate text-xs text-primary hover:underline"
                        >
                          {mediaUrl}
                        </a>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => form.setValue("mediaUrl", "", { shouldDirty: true })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {isListening ? (
                      <audio controls className="mt-2 w-full" src={mediaUrl} />
                    ) : (
                      <img src={mediaUrl} alt="Xem trước media" className="mt-2 max-h-44 rounded-md border object-contain" />
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-md border border-dashed p-2.5 text-xs text-muted-foreground">
                    <Upload className="h-4 w-4" />
                    Chưa có media.
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
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
              <RichTextEditor
                value={form.watch("explanation") ?? ""}
                onChange={(val) => form.setValue("explanation", val, { shouldDirty: true })}
                placeholder="Giải thích ngắn gọn tại sao đây là đáp án đúng..."
                minHeight={120}
              />
            </div>

          </form>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-muted/20 flex items-center justify-between shrink-0">
          <p className="text-xs text-muted-foreground"></p>
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
              disabled={isPending || uploadingMedia}
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
