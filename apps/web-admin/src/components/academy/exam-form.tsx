import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import { Spinner } from "@workspace/ui/components/spinner"
import {
  academyExamCreateDTOSchema,
  academyExamUpdateDTOSchema,
  type AcademyExamCreateDTO,
  type AcademyExamUpdateDTO,
} from "@workspace/schemas"
import type { AcademyExam } from "@/lib/api/services/academy-exams"

export function ExamForm({
  mode,
  initial,
  onSubmit,
  onCancel,
  submitting,
  defaultCourseProfileId,
}: {
  mode: "create" | "edit"
  initial?: AcademyExam
  onSubmit: (data: AcademyExamCreateDTO | AcademyExamUpdateDTO) => Promise<void>
  onCancel: () => void
  submitting?: boolean
  defaultCourseProfileId?: string
}) {
  const isEdit = mode === "edit"

  const { handleSubmit, control } = useForm<
    AcademyExamCreateDTO | AcademyExamUpdateDTO
  >({
    resolver: zodResolver(
      (isEdit ? academyExamUpdateDTOSchema : academyExamCreateDTOSchema) as any,
    ) as any,
    defaultValues: isEdit
      ? {
          title: initial?.title ?? "",
          description: initial?.description ?? undefined,
          examType: initial?.examType ?? undefined,
          level: initial?.level ?? undefined,
          totalTimeLimitMinutes: initial?.totalTimeLimitMinutes ?? undefined,
          status: initial?.status ?? undefined,
          settings: initial?.settings ?? undefined,
        }
      : {
          courseProfileId: defaultCourseProfileId,
          title: "",
          description: undefined,
          examType: "COURSE",
          level: undefined,
          totalTimeLimitMinutes: undefined,
          status: "DRAFT",
          settings: undefined,
          sections: [],
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
          name={"courseProfileId" as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>CourseProfileId</FieldLabel>
              <Input placeholder="UUID của CourseProfile (tuỳ chọn)" {...field} />
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
            <FieldLabel>Tiêu đề Exam</FieldLabel>
            <Input placeholder="JLPT N5 - Final Exam" {...field} />
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
            <Textarea placeholder="Mục tiêu, phạm vi đề thi..." {...field} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </Field>
        )}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Controller
          name={"examType" as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Exam type</FieldLabel>
              <Input placeholder="COURSE / PLACEMENT / MOCK..." {...field} />
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />
        <Controller
          name={"level" as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Level</FieldLabel>
              <Input placeholder="N5 / Beginner / ..." {...field} />
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />
        <Controller
          name={"totalTimeLimitMinutes" as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Thời lượng (phút)</FieldLabel>
              <Input
                type="number"
                min={0}
                {...field}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? undefined : Number(e.target.value),
                  )
                }
              />
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />
      </div>

      <Controller
        name={"status" as any}
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Status</FieldLabel>
            <Input placeholder="DRAFT / PUBLISHED / ARCHIVED" {...field} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </Field>
        )}
      />

      <Controller
        name={"settings" as any}
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Settings (JSON)</FieldLabel>
            <Textarea
              placeholder='Ví dụ: {"shuffleQuestions":true,"passPercent":60}'
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

      {!isEdit && (
        <Controller
          name={"sections" as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Sections (JSON)</FieldLabel>
              <Textarea
                placeholder='Giai đoạn đầu có thể nhập JSON: [{"title":"Phần 1","orderIndex":0,"sectionType":"READING"}]'
                value={
                  typeof field.value === "string"
                    ? field.value
                    : field.value && Array.isArray(field.value)
                      ? JSON.stringify(field.value, null, 2)
                      : ""
                }
                onChange={(e) => {
                  const raw = e.target.value
                  if (!raw) return field.onChange([])
                  try {
                    field.onChange(JSON.parse(raw))
                  } catch {
                    field.onChange(raw)
                  }
                }}
                rows={6}
              />
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />
      )}

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

