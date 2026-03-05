import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import { Spinner } from "@workspace/ui/components/spinner"
import {
  academyQuestionCreateDTOSchema,
  academyQuestionUpdateDTOSchema,
  type AcademyQuestionCreateDTO,
  type AcademyQuestionUpdateDTO,
} from "@workspace/schemas"
import type { AcademyQuestion } from "@/lib/api/services/academy-questions"

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

  const { handleSubmit, control } = useForm<
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
          metadata: undefined,
        },
  })

  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit(async (data) => onSubmit(data))}
      noValidate
    >
      {!isEdit && (
        <Controller
          name={"parentId" as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Parent QuestionId (nếu là sub-question)</FieldLabel>
              <Input placeholder="UUID câu hỏi cha (tuỳ chọn)" {...field} />
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />
      )}

      <Controller
        name={"questionType" as any}
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Question type</FieldLabel>
            <Input
              placeholder="SINGLE_CHOICE / MULTIPLE_CHOICE / SHORT_ANSWER / GROUP_PARENT..."
              {...field}
            />
            <FieldError>{fieldState.error?.message}</FieldError>
          </Field>
        )}
      />

      <Controller
        name={"content" as any}
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Nội dung câu hỏi</FieldLabel>
            <Textarea
              placeholder="Ví dụ: Chữ cái nào dưới đây là 'あ'?"
              rows={4}
              {...field}
            />
            <FieldError>{fieldState.error?.message}</FieldError>
          </Field>
        )}
      />

      <Controller
        name={"mediaUrl" as any}
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Media URL (tùy chọn)</FieldLabel>
            <Input placeholder="https://..." {...field} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </Field>
        )}
      />

      <Controller
        name={"options" as any}
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Options (JSON)</FieldLabel>
            <Textarea
              placeholder='Ví dụ: [{"value":"A","label":"あ"}, {"value":"B","label":"い"}]'
              value={
                typeof field.value === "string"
                  ? field.value
                  : field.value
                    ? JSON.stringify(field.value, null, 2)
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
              rows={5}
            />
            <FieldError>{fieldState.error?.message}</FieldError>
          </Field>
        )}
      />

      <Controller
        name={"correctAnswer" as any}
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Đáp án đúng (JSON)</FieldLabel>
            <Textarea
              placeholder='Ví dụ: {"value":"A"} hoặc ["A","B"]'
              value={
                typeof field.value === "string"
                  ? field.value
                  : field.value
                    ? JSON.stringify(field.value, null, 2)
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
              rows={4}
            />
            <FieldError>{fieldState.error?.message}</FieldError>
          </Field>
        )}
      />

      <Controller
        name={"explanation" as any}
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Giải thích</FieldLabel>
            <Textarea
              placeholder="Giải thích vì sao đáp án đúng."
              rows={3}
              {...field}
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
              value={
                typeof field.value === "string"
                  ? field.value
                  : field.value
                    ? JSON.stringify(field.value, null, 2)
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
              rows={3}
            />
            <FieldError>{fieldState.error?.message}</FieldError>
          </Field>
        )}
      />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Hủy
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? <Spinner className="mr-2" /> : null}
          {isEdit ? "Lưu" : "Tạo"}
        </Button>
      </div>
    </form>
  )
}

