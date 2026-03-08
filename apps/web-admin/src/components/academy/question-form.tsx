import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  Field,
  FieldError,
  FieldLabel,
  FieldDescription,
  FieldGroup,
} from "@workspace/ui/components/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { RichTextEditor } from "@/components/editor/rich-text-editor"
import { Spinner } from "@workspace/ui/components/spinner"
import {
  academyQuestionCreateDTOSchema,
  academyQuestionUpdateDTOSchema,
} from "@workspace/schemas"
import type { AcademyQuestionCreateDTO, AcademyQuestionUpdateDTO } from "@workspace/schemas"
import type { AcademyQuestion } from "@/lib/api/services/academy-questions"
import { QuestionPicker } from "./question-picker"
import { QuestionOptionsEditor } from "./question-options-editor"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"

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
    defaultValues: isEdit
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
      },
  })

  const questionType = watch("questionType" as any)
  const content = watch("content" as any)
  const options = watch("options" as any)

  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit(async (data) => onSubmit(data))}
      noValidate
    >
      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="edit">Chỉnh sửa</TabsTrigger>
          <TabsTrigger value="preview">Xem trước (Live Preview)</TabsTrigger>
        </TabsList>
        <TabsContent value="edit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nội dung câu hỏi</CardTitle>
              <CardDescription>Xác định loại câu hỏi, nội dung chính và phương tiện đi kèm.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                {!isEdit && (
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
                        <FieldDescription>Sử dụng nếu câu hỏi này thuộc một nhóm câu hỏi.</FieldDescription>
                        <FieldError>{fieldState.error?.message}</FieldError>
                      </Field>
                    )}
                  />
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <Controller
                    name={"questionType" as any}
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel>Loại câu hỏi</FieldLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn loại..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SINGLE_CHOICE">Single Choice (Một đáp án)</SelectItem>
                            <SelectItem value="MULTIPLE_CHOICE">Multiple Choice (Nhiều đáp án)</SelectItem>
                            <SelectItem value="SHORT_ANSWER">Short Answer (Trả lời ngắn)</SelectItem>
                            <SelectItem value="TRUE_FALSE">True/False (Đúng/Sai)</SelectItem>
                            <SelectItem value="GROUP_PARENT">Group Parent (Câu hỏi nhóm)</SelectItem>
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
                      <Field>
                        <FieldLabel>Media URL</FieldLabel>
                        <Input placeholder="https://..." {...field} />
                        <FieldDescription>Link hình ảnh, âm thanh hoặc video cho câu hỏi.</FieldDescription>
                        <FieldError>{fieldState.error?.message}</FieldError>
                      </Field>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Controller
                    name={"level" as any}
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel>Năng lực (Level)</FieldLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn cấp độ..." />
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
                          <SelectTrigger>
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
                        onUpdate={(data: string) =>
                          field.onChange(data)
                        }
                      />
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Đáp án & Giải thích</CardTitle>
              <CardDescription>Cung cấp các lựa chọn, đáp án đúng và lời giải chi tiết.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className="space-y-6">
                  {(questionType === "SINGLE_CHOICE" || questionType === "MULTIPLE_CHOICE" || questionType === "TRUE_FALSE") ? (
                    <div className="space-y-2">
                       <FieldLabel>Cấu hình lựa chọn & Đáp án đúng</FieldLabel>
                       <QuestionOptionsEditor
                        type={questionType}
                        options={options}
                        correctAnswer={watch("correctAnswer" as any)}
                        onChange={(opts, correct) => {
                          setValue("options" as any, opts)
                          setValue("correctAnswer" as any, correct)
                        }}
                      />
                    </div>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                      <Controller
                        name={"options" as any}
                        control={control}
                        render={({ field, fieldState }) => (
                          <Field>
                            <FieldLabel>Các lựa chọn (Options JSON)</FieldLabel>
                            <Textarea
                              placeholder='Ví dụ: [{"value":"A","label":"あ"}, {"value":"B","label":"い"}]'
                              className="font-mono text-xs"
                              rows={8}
                              value={
                                field.value
                                  ? typeof field.value === "string"
                                    ? field.value
                                    : JSON.stringify(field.value, null, 2)
                                  : ""
                              }
                              onChange={(e) => {
                                const raw = e.target.value
                                if (!raw) return field.onChange(undefined)
                                try {
                                  field.onChange(JSON.parse(raw))
                                } catch {
                                  field.onChange(raw)
                                }
                              }}
                            />
                            <FieldDescription>Danh sách các lựa chọn cho câu hỏi trắc nghiệm.</FieldDescription>
                            <FieldError>{fieldState.error?.message}</FieldError>
                          </Field>
                        )}
                      />

                      <Controller
                        name={"correctAnswer" as any}
                        control={control}
                        render={({ field, fieldState }) => (
                          <Field>
                            <FieldLabel>Đáp án đúng (Correct Answer JSON)</FieldLabel>
                            <Textarea
                              placeholder='Ví dụ: {"value":"A"} hoặc ["A","B"]'
                              className="font-mono text-xs"
                              rows={8}
                              value={
                                field.value
                                  ? typeof field.value === "string"
                                    ? field.value
                                    : JSON.stringify(field.value, null, 2)
                                  : ""
                              }
                              onChange={(e) => {
                                const raw = e.target.value
                                if (!raw) return field.onChange(undefined)
                                try {
                                  field.onChange(JSON.parse(raw))
                                } catch {
                                  field.onChange(raw)
                                }
                              }}
                            />
                            <FieldDescription>Giá trị đáp án đúng (JSON).</FieldDescription>
                            <FieldError>{fieldState.error?.message}</FieldError>
                          </Field>
                        )}
                      />
                    </div>
                  )}
                </div>

                <Controller
                  name={"explanation" as any}
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Giải thích đáp án</FieldLabel>
                      <RichTextEditor
                        initialContent={field.value || ""}
                        onUpdate={(data: string) =>
                          field.onChange(data)
                        }
                      />
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />

                <Controller
                  name={"metadata" as any}
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Metadata (JSON)</FieldLabel>
                      <Textarea
                        placeholder='Ví dụ: {"tags":["JLPT N5","kana"],"difficulty":"easy"}'
                        className="font-mono text-xs shadow-none"
                        rows={3}
                        value={
                          field.value
                            ? typeof field.value === "string"
                              ? field.value
                              : JSON.stringify(field.value, null, 2)
                            : ""
                        }
                        onChange={(e) => {
                          const raw = e.target.value
                          if (!raw) return field.onChange(undefined)
                          try {
                            field.onChange(JSON.parse(raw))
                          } catch {
                            field.onChange(raw)
                          }
                        }}
                      />
                      <FieldDescription>Thông tin bổ sung khác.</FieldDescription>
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />
              </FieldGroup>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Preview Chế độ Người học</CardTitle>
              <CardDescription>Dưới đây là cách câu hỏi sẽ hiển thị trên ứng dụng web/mobile của học viên.</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[400px] flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/20">
              <div className="w-full max-w-2xl bg-background p-8 rounded-xl shadow-lg border">
                 <div className="space-y-6">
                    <div className="prose dark:prose-invert max-w-none min-h-[50px]" dangerouslySetInnerHTML={{ __html: content || "<i>Nội dung câu hỏi sẽ hiển thị tại đây...</i>" }} />
                    <div className="space-y-3">
                        {Array.isArray(options) && options.length > 0 ? options.map((opt: any, i: number) => (
                            <div key={i} className="flex items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                                <div className="size-8 rounded-full border flex items-center justify-center mr-3 text-sm font-medium">
                                    {String.fromCharCode(65 + i)}
                                </div>
                                <span>{opt.label || `Lựa chọn ${String.fromCharCode(65 + i)}`}</span>
                            </div>
                        )) : (
                          <div className="text-muted-foreground text-sm italic">Thiết lập lựa chọn để xem preview...</div>
                        )}
                    </div>
                    <div className="pt-6 border-t flex justify-end">
                        <Button disabled>Nộp bài</Button>
                    </div>
                 </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Hủy
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? <Spinner className="mr-2" /> : null}
          {isEdit ? "Lưu thay đổi" : "Tạo Câu hỏi"}
        </Button>
      </div>
    </form>
  )
}
