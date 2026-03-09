import { Controller, useForm } from "react-hook-form"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldError,
  FieldLabel,
  FieldDescription,
  FieldGroup,
  FieldSeparator,
  FieldSet,
  FieldLegend,
} from "@workspace/ui/components/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { RichTextEditor } from "@/components/editor/rich-text-editor"
import { Spinner } from "@workspace/ui/components/spinner"
import {
  academyQuestionCreateDTOSchema,
  academyQuestionUpdateDTOSchema,
  type AcademyQuestionCreateDTO,
  type AcademyQuestionUpdateDTO,
} from "@workspace/schemas"
import type { AcademyQuestion } from "@/lib/api/services/academy-questions"
import { QuestionPicker } from "./question-picker"
import { StringListEditor } from "@/components/academy/string-list-editor"
import { KeyValueEditor } from "./key-value-editor"
import { QuestionOptionsEditor } from "./question-options-editor"
import { LessonMediaUploader } from "./lesson-media-uploader"
import { Eye, Save } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@workspace/ui/components/dialog"

export function QuestionForm({
  mode,
  initial,
  onSubmit,
  onCancel,
  submitting,
  defaultParentId,
}: {
  mode: "create" | "edit"
  initial?: AcademyQuestion
  onSubmit: (
    data: AcademyQuestionCreateDTO | AcademyQuestionUpdateDTO,
  ) => Promise<void>
  onCancel: () => void
  submitting?: boolean
  defaultParentId?: string
}) {
  const isEdit = mode === "edit"

  const { handleSubmit, control, watch, setValue } = useForm<
    AcademyQuestionCreateDTO | AcademyQuestionUpdateDTO
  >({
    resolver: zodResolver(
      (isEdit ? academyQuestionUpdateDTOSchema : academyQuestionCreateDTOSchema) as any,
    ) as any,
    defaultValues: (isEdit
      ? {
        content: initial?.content ?? "",
        mediaUrl: initial?.mediaUrl ?? undefined,
        questionType: initial?.questionType ?? undefined,
        options: initial?.options ?? undefined,
        correctAnswer: initial?.correctAnswer ?? undefined,
        explanation: initial?.explanation ?? undefined,
        level: initial?.level ?? undefined,
        category: initial?.category ?? undefined,
        metadata: initial?.metadata ?? undefined,
      }
      : {
        parentId: defaultParentId ?? undefined,
        content: "",
        mediaUrl: undefined,
        questionType: "SINGLE_CHOICE",
        options: undefined,
        correctAnswer: undefined,
        explanation: undefined,
        level: undefined,
        category: undefined,
        metadata: undefined,
      }) as any,
  })

  const questionType = watch("questionType" as any)
  const content = watch("content" as any)
  const options = watch("options" as any)
  const correctAnswer = watch("correctAnswer" as any)
  const parentId = watch("parentId" as any)

  const normalizedOptions = (() => {
    if (!Array.isArray(options)) return []
    return options.map((opt: any, index: number) => {
      if (typeof opt === "string") {
        return { value: String.fromCharCode(65 + index), label: opt }
      }
      if (opt && typeof opt === "object") {
        if ("value" in opt || "label" in opt) {
          return {
            value: String(opt.value ?? String.fromCharCode(65 + index)),
            label: String(opt.label ?? `Lựa chọn ${String(opt.value ?? String.fromCharCode(65 + index))}`),
          }
        }
        const entries = Object.entries(opt)
        if (entries.length === 1) {
          const [key, value] = entries[0]
          return {
            value: key,
            label: typeof value === "string" ? value : JSON.stringify(value),
          }
        }
      }
      const fallback = String.fromCharCode(65 + index)
      return { value: fallback, label: `Lựa chọn ${fallback}` }
    })
  })()

  const normalizedCorrectValues: string[] = (() => {
    if (correctAnswer == null) return []
    if (Array.isArray(correctAnswer)) {
      return correctAnswer
        .map((item) => {
          if (item == null) return null
          if (typeof item === "string" || typeof item === "number" || typeof item === "boolean") {
            return String(item)
          }
          if (typeof item === "object" && "value" in item) {
            return String((item as any).value)
          }
          return null
        })
        .filter((value): value is string => Boolean(value))
    }
    if (typeof correctAnswer === "string" || typeof correctAnswer === "number" || typeof correctAnswer === "boolean") {
      return [String(correctAnswer)]
    }
    if (typeof correctAnswer === "object") {
      if ("value" in (correctAnswer as any)) {
        return [String((correctAnswer as any).value)]
      }
      if ("values" in (correctAnswer as any) && Array.isArray((correctAnswer as any).values)) {
        return (correctAnswer as any).values.map((item: unknown) => String(item))
      }
    }
    return []
  })()

  const PreviewContent = () => {
    const [selectedValues, setSelectedValues] = useState<string[]>([])
    const [checked, setChecked] = useState(false)
    const [checkMessage, setCheckMessage] = useState<string | null>(null)

    const supportsAnswerCheck =
      questionType === "SINGLE_CHOICE" ||
      questionType === "MULTIPLE_CHOICE" ||
      questionType === "TRUE_FALSE"

    const isResultCorrect = (() => {
      if (!checked || !supportsAnswerCheck) return null
      if (questionType === "MULTIPLE_CHOICE") {
        const selected = [...selectedValues].sort()
        const expected = [...normalizedCorrectValues].sort()
        return (
          selected.length === expected.length &&
          selected.every((value, index) => value === expected[index])
        )
      }
      return selectedValues[0] === normalizedCorrectValues[0]
    })()

    const toggleOption = (value: string) => {
      if (!supportsAnswerCheck) return
      setChecked(false)
      setCheckMessage(null)
      if (questionType === "MULTIPLE_CHOICE") {
        setSelectedValues((prev) =>
          prev.includes(value)
            ? prev.filter((item) => item !== value)
            : [...prev, value],
        )
        return
      }
      setSelectedValues([value])
    }

    const handleCheckAnswer = () => {
      if (!supportsAnswerCheck) return
      if (selectedValues.length === 0) {
        setCheckMessage("Bạn chưa chọn đáp án để kiểm tra.")
        setChecked(false)
        return
      }
      if (normalizedCorrectValues.length === 0) {
        setCheckMessage("Câu hỏi này chưa cấu hình đáp án đúng.")
        setChecked(false)
        return
      }
      setCheckMessage(null)
      setChecked(true)
    }

    return (
      <div className="space-y-6">
        <div
          className="prose dark:prose-invert max-w-none min-h-[50px] p-4 bg-muted/5 rounded-lg border border-dashed"
          dangerouslySetInnerHTML={{ __html: content || "<i>Nội dung câu hỏi sẽ hiển thị tại đây...</i>" }}
        />
        <div className="space-y-3">
          {normalizedOptions.length > 0 ? (
            normalizedOptions.map((opt, i) => {
              const isSelected = selectedValues.includes(opt.value)
              const isCorrectOption = normalizedCorrectValues.includes(opt.value)
              const showCorrect = checked && isCorrectOption
              const showWrong = checked && isSelected && !isCorrectOption
              return (
                <div
                  key={i}
                  className={`flex items-center p-3 border rounded-lg transition-colors group ${
                    supportsAnswerCheck ? "cursor-pointer hover:bg-muted/50" : ""
                  } ${isSelected ? "border-primary bg-muted/30" : ""} ${showCorrect ? "border-green-600 bg-green-50/50" : ""} ${showWrong ? "border-destructive bg-destructive/5" : ""}`}
                  onClick={() => toggleOption(opt.value)}
                >
                  <div className="size-8 rounded-full border bg-background flex items-center justify-center mr-3 text-sm font-bold group-hover:border-primary group-hover:text-primary transition-colors uppercase">
                    {opt.value}
                  </div>
                  <span className="font-medium text-sm">
                    {opt.label || `Lựa chọn ${opt.value}`}
                  </span>
                </div>
              )
            })
          ) : (
            <div className="text-muted-foreground text-sm italic text-center py-4 bg-muted/20 rounded-lg">
              Thiết lập lựa chọn để xem preview...
            </div>
          )}
        </div>
        {checkMessage && (
          <div className="text-sm rounded-lg border border-amber-500/40 text-amber-700 bg-amber-50/70 px-3 py-2">
            {checkMessage}
          </div>
        )}
        {checked && isResultCorrect !== null && !checkMessage && (
          <div className={`text-sm rounded-lg border px-3 py-2 ${isResultCorrect ? "border-green-600 text-green-700 bg-green-50/60" : "border-destructive text-destructive bg-destructive/5"}`}>
            {isResultCorrect
              ? "Chính xác! Bạn đã chọn đúng đáp án."
              : "Chưa đúng. Bạn có thể thử lại hoặc xem phần giải thích."}
          </div>
        )}
        {!supportsAnswerCheck && (
          <div className="text-sm text-muted-foreground bg-muted/20 rounded-lg px-3 py-2">
            Loại câu hỏi này không hỗ trợ kiểm tra đáp án trực tiếp trong preview.
          </div>
        )}
        <div className="pt-4 border-t flex justify-between items-center text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
          <span>Torii Academy Exam System</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8"
            disabled={
              !supportsAnswerCheck ||
              normalizedOptions.length === 0
            }
            onClick={handleCheckAnswer}
          >
            Kiểm tra đáp án
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form
      className="space-y-10"
      onSubmit={handleSubmit(async (data) => onSubmit(data))}
      noValidate
    >
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">{isEdit ? "Cập nhật câu hỏi" : "Tạo câu hỏi mới"}</h2>
          <p className="text-sm text-muted-foreground">Thiết lập nội dung, loại câu hỏi và các đáp án liên quan.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="gap-2">
              <Eye className="size-4" />
              <span>Xem trước</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Xem trước câu hỏi</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <PreviewContent />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Đóng</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-12">
        {/* Phần 1: Nội dung & Phân loại */}
        <FieldSet>
          <FieldLegend>Thông tin cơ bản</FieldLegend>
          <FieldGroup>
            {!isEdit && (
              <>
                <div className="rounded-lg border bg-muted/20 p-3">
                  <p className="text-sm font-medium">Thiết lập nhanh</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setValue("parentId" as any, undefined)
                        setValue("questionType" as any, "GROUP_PARENT")
                      }}
                    >
                      Tạo câu đoạn văn (cha)
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setValue("questionType" as any, "SINGLE_CHOICE")}
                    >
                      Tạo câu hỏi con trắc nghiệm
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {parentId
                      ? "Bạn đang tạo câu hỏi con thuộc một câu hỏi cha."
                      : "Nếu là câu đoạn văn, chọn loại GROUP_PARENT và không cần đáp án."}
                  </p>
                </div>

                <Controller
                  name={"parentId" as any}
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Câu hỏi cha (Parent Question)</FieldLabel>
                      <QuestionPicker
                        value={field.value}
                        onSelect={field.onChange}
                        placeholder="Chọn câu hỏi cha (nếu có)..."
                      />
                      <FieldDescription>
                        Để trống nếu đây là câu đoạn văn/câu độc lập.
                      </FieldDescription>
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />
              </>
            )}

            <div className="grid gap-8 md:grid-cols-2">
              <Controller
                name={"questionType" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Loại câu hỏi</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Chọn loại..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SINGLE_CHOICE">Một đáp án (Single Choice)</SelectItem>
                        <SelectItem value="MULTIPLE_CHOICE">Nhiều đáp án (Multiple Choice)</SelectItem>
                        <SelectItem value="SHORT_ANSWER">Trả lời ngắn (Short Answer)</SelectItem>
                        <SelectItem value="TRUE_FALSE">Đúng/Sai (True/False)</SelectItem>
                        <SelectItem value="GROUP_PARENT">Câu hỏi nhóm (Group Parent)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
              <Controller
                name={"mediaUrl" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <LessonMediaUploader
                    label="Media đính kèm"
                    description="Chọn ảnh, audio hoặc video. Hệ thống sẽ tự upload và lưu URL."
                    value={field.value || null}
                    onChange={(url) => field.onChange(url ?? undefined)}
                    accept="image/*,audio/*,video/*"
                    errorMessage={fieldState.error?.message}
                  />
                )}
              />
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <Controller
                name={"level" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Trình độ (Level)</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Chọn trình độ..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="N1">JLPT N1</SelectItem>
                        <SelectItem value="N2">JLPT N2</SelectItem>
                        <SelectItem value="N3">JLPT N3</SelectItem>
                        <SelectItem value="N4">JLPT N4</SelectItem>
                        <SelectItem value="N5">JLPT N5</SelectItem>
                        <SelectItem value="OTHER">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
              <Controller
                name={"category" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Danh mục (Category)</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Chọn danh mục..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VOCABULARY">Từ vựng (Vocabulary)</SelectItem>
                        <SelectItem value="GRAMMAR">Ngữ pháp (Grammar)</SelectItem>
                        <SelectItem value="KANJI">Hán tự (Kanji)</SelectItem>
                        <SelectItem value="READING">Đọc hiểu (Reading)</SelectItem>
                        <SelectItem value="LISTENING">Nghe hiểu (Listening)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
            </div>

            <Controller
              name={"content" as any}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Nội dung câu hỏi</FieldLabel>
                  <RichTextEditor
                    initialContent={field.value || ""}
                    onUpdate={(data: string) => field.onChange(data)}
                    minHeight={250}
                  />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        <FieldSeparator className="opacity-50" />

        {/* Phần 2: Đáp án & Giải thích */}
        <FieldSet>
          <FieldLegend>Đáp án & Giải thích</FieldLegend>
          <FieldGroup>
            <div className="space-y-6">
              {(questionType === "SINGLE_CHOICE" || questionType === "MULTIPLE_CHOICE" || questionType === "TRUE_FALSE") ? (
                <QuestionOptionsEditor
                  type={questionType}
                  options={options}
                  correctAnswer={watch("correctAnswer" as any)}
                  onChange={(opts, correct) => {
                    setValue("options" as any, opts)
                    setValue("correctAnswer" as any, correct)
                  }}
                />
              ) : questionType === "SHORT_ANSWER" ? (
                <Controller
                  name={"correctAnswer" as any}
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Đáp án chấp nhận</FieldLabel>
                      <StringListEditor
                        value={field.value || []}
                        onChange={field.onChange}
                        placeholder="Nhập đáp án..."
                        addButtonLabel="Thêm đáp án"
                      />
                      <FieldDescription>Hệ thống tự động so khớp không phân biệt hoa thường.</FieldDescription>
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />
              ) : questionType === "GROUP_PARENT" ? (
                <div className="p-10 rounded-2xl border-2 border-dashed bg-muted/5 text-sm text-muted-foreground text-center italic">
                  Đây là câu hỏi cha. Đáp án sẽ được cấu hình ở các câu hỏi con.
                </div>
              ) : null}
            </div>

            <Controller
              name={"explanation" as any}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Giải thích chi tiết</FieldLabel>
                  <RichTextEditor
                    initialContent={field.value || ""}
                    onUpdate={(data: string) => field.onChange(data)}
                    minHeight={200}
                  />
                  <FieldDescription>Hiển thị sau khi học viên hoàn thành bài tập.</FieldDescription>
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />

            <Controller
              name={"metadata" as any}
              control={control}
              render={({ field, fieldState }) => (
                <Field className="pt-2">
                  <FieldLabel>Metadata (Thông tin mở rộng)</FieldLabel>
                  <KeyValueEditor
                    value={field.value || {}}
                    onChange={field.onChange}
                    presets={[
                      { key: "tags", label: "Gắn thẻ (Tags)", description: "Phân loại câu hỏi chuyên sâu" },
                      { key: "difficulty_score", label: "Điểm độ khó", description: "Từ 1 đến 10" },
                      { key: "source_book", label: "Nguồn sách", description: "Tên giáo trình" },
                    ]}
                  />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Hủy bỏ
        </Button>
        <Button type="submit" disabled={submitting} className="min-w-[160px] h-11 shadow-md">
          {submitting ? <Spinner className="mr-2" /> : <Save className="size-4 mr-2" />}
          {isEdit ? "Lưu thay đổi" : "Tạo câu hỏi"}
        </Button>
      </div>
    </form>
  )
}
