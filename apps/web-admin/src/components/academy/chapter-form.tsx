import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import { Spinner } from "@workspace/ui/components/spinner"
import {
  academyChapterCreateDTOSchema,
  academyChapterUpdateDTOSchema,
  type AcademyChapterCreateDTO,
  type AcademyChapterUpdateDTO,
} from "@workspace/schemas"
import type { AcademyChapter } from "@/lib/api/services/academy-chapters"

export function ChapterForm({
  mode,
  courseEditionId,
  initial,
  onSubmit,
  onCancel,
  submitting,
}: {
  mode: "create" | "edit"
  courseEditionId?: string
  initial?: AcademyChapter
  onSubmit: (data: AcademyChapterCreateDTO | AcademyChapterUpdateDTO) => Promise<void>
  onCancel: () => void
  submitting?: boolean
}) {
  const isEdit = mode === "edit"

  const { handleSubmit, control } = useForm<
    AcademyChapterCreateDTO | AcademyChapterUpdateDTO
  >({
    resolver: zodResolver(
      (isEdit ? academyChapterUpdateDTOSchema : academyChapterCreateDTOSchema) as any,
    ) as any,
    defaultValues: isEdit
      ? {
          title: initial?.title ?? "",
          description: initial?.description ?? undefined,
          orderIndex: initial?.orderIndex ?? 0,
          estimatedMinutes: initial?.estimatedMinutes ?? undefined,
          status: initial?.status ?? undefined,
        }
      : {
          courseEditionId: courseEditionId || "",
          title: "",
          description: undefined,
          orderIndex: 0,
          estimatedMinutes: undefined,
          status: "DRAFT",
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
          name={"courseEditionId" as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>CourseEditionId</FieldLabel>
              <Input placeholder="UUID của CourseEdition" {...field} />
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />
      )}

      <Controller
        name={"title" as any}
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Tiêu đề Chapter</FieldLabel>
            <Input placeholder="Ví dụ: Chương 1 - Ngữ âm cơ bản" {...field} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </Field>
        )}
      />

      <Controller
        name={"description" as any}
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Mô tả</FieldLabel>
            <Textarea placeholder="Mô tả nội dung chính của chương..." {...field} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </Field>
        )}
      />

      <div className="grid gap-4 md:grid-cols-3">
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
          name={"estimatedMinutes" as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Ước lượng phút học</FieldLabel>
              <Input
                type="number"
                min={0}
                {...field}
                onChange={(e) =>
                  field.onChange(e.target.value ? Number(e.target.value) : undefined)
                }
              />
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />

        <Controller
          name={"status" as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Trạng thái</FieldLabel>
              <Input placeholder="DRAFT / PUBLISHED" {...field} />
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />
      </div>

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

