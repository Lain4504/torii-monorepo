import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import { Spinner } from "@workspace/ui/components/spinner"
import {
  academyChapterItemCreateDTOSchema,
  academyChapterItemUpdateDTOSchema,
  type AcademyChapterItemCreateDTO,
  type AcademyChapterItemUpdateDTO,
} from "@workspace/schemas"
import type { AcademyChapterItem } from "@/lib/api/services/academy-chapter-items"

export function ChapterItemForm({
  mode,
  chapterId,
  initial,
  onSubmit,
  onCancel,
  submitting,
}: {
  mode: "create" | "edit"
  chapterId?: string
  initial?: AcademyChapterItem
  onSubmit: (
    data: AcademyChapterItemCreateDTO | AcademyChapterItemUpdateDTO,
  ) => Promise<void>
  onCancel: () => void
  submitting?: boolean
}) {
  const isEdit = mode === "edit"

  const { handleSubmit, control } = useForm<
    AcademyChapterItemCreateDTO | AcademyChapterItemUpdateDTO
  >({
    resolver: zodResolver(
      (isEdit ? academyChapterItemUpdateDTOSchema : academyChapterItemCreateDTOSchema) as any,
    ) as any,
    defaultValues: isEdit
      ? {
          title: initial?.title ?? "",
          orderIndex: initial?.orderIndex ?? 0,
          metadata: initial?.metadata ?? undefined,
        }
      : {
          chapterId: chapterId || "",
          title: "",
          kind: "LESSON",
          referenceId: "",
          orderIndex: 0,
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
        <>
          <Controller
            name={"chapterId" as any}
            control={control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>ChapterId</FieldLabel>
                <Input placeholder="UUID của Chapter" {...field} />
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />

          <Controller
            name={"kind" as any}
            control={control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Kind</FieldLabel>
                <Input placeholder="LESSON / QUIZ / ASSIGNMENT / EXAM" {...field} />
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />

          <Controller
            name={"referenceId" as any}
            control={control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>ReferenceId</FieldLabel>
                <Input placeholder="UUID của Lesson/Quiz/Assignment/Exam" {...field} />
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />
        </>
      )}

      <Controller
        name={"title" as any}
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Tiêu đề Item</FieldLabel>
            <Input placeholder="Ví dụ: Bài 1 - Giới thiệu bảng chữ cái" {...field} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </Field>
        )}
      />

      <Controller
        name={"orderIndex" as any}
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Thứ tự</FieldLabel>
            <Input
              type="number"
              min={0}
              {...field}
              onChange={(e) => field.onChange(Number(e.target.value || 0))}
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
              placeholder='Ví dụ: {"isOptional":true}'
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

