import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import { Spinner } from "@workspace/ui/components/spinner"
import {
  academyClassAssessmentCreateDTOSchema,
  academyClassAssessmentUpdateDTOSchema,
  type AcademyClassAssessmentCreateDTO,
  type AcademyClassAssessmentUpdateDTO,
} from "@workspace/schemas"
import type { AcademyClassAssessment } from "@/lib/api/services/academy-class-assessments"

export function ClassAssessmentForm({
  mode,
  initial,
  onSubmit,
  onCancel,
  submitting,
  defaultClassId,
}: {
  mode: "create" | "edit"
  initial?: AcademyClassAssessment
  onSubmit: (
    data: AcademyClassAssessmentCreateDTO | AcademyClassAssessmentUpdateDTO,
  ) => Promise<void>
  onCancel: () => void
  submitting?: boolean
  defaultClassId?: string
}) {
  const isEdit = mode === "edit"

  const { handleSubmit, control } = useForm<
    AcademyClassAssessmentCreateDTO | AcademyClassAssessmentUpdateDTO
  >({
    resolver: zodResolver(
      (isEdit
        ? academyClassAssessmentUpdateDTOSchema
        : academyClassAssessmentCreateDTOSchema) as any,
    ) as any,
    defaultValues: isEdit
      ? {
          titleOverride: initial?.titleOverride ?? undefined,
          deadline: initial?.deadline ? new Date(initial.deadline) : undefined,
          weight: initial?.weight ?? undefined,
          maxAttemptsOverride: initial?.maxAttemptsOverride ?? undefined,
          timeLimitOverrideMinutes: initial?.timeLimitOverrideMinutes ?? undefined,
          maxScoreOverride: initial?.maxScoreOverride ?? undefined,
          status: initial?.status ?? undefined,
          settings: undefined,
        }
      : {
          classId: defaultClassId ?? "",
          kind: "QUIZ",
          quizTemplateId: undefined,
          assignmentTemplateId: undefined,
          titleOverride: undefined,
          deadline: undefined,
          weight: undefined,
          maxAttemptsOverride: undefined,
          timeLimitOverrideMinutes: undefined,
          maxScoreOverride: undefined,
          status: "DRAFT",
          settings: undefined,
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
            name={"classId" as any}
            control={control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>ClassId</FieldLabel>
                <Input placeholder="UUID của Class" {...field} />
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />

          <div className="grid gap-4 md:grid-cols-3">
            <Controller
              name={"kind" as any}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Kind</FieldLabel>
                  <Input placeholder="QUIZ / ASSIGNMENT" {...field} />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
            <Controller
              name={"quizTemplateId" as any}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>QuizTemplateId</FieldLabel>
                  <Input placeholder="UUID của QuizTemplate (nếu là QUIZ)" {...field} />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
            <Controller
              name={"assignmentTemplateId" as any}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>AssignmentTemplateId</FieldLabel>
                  <Input
                    placeholder="UUID của AssignmentTemplate (nếu là ASSIGNMENT)"
                    {...field}
                  />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
          </div>
        </>
      )}

      <Controller
        name={"titleOverride" as any}
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Tiêu đề hiển thị (override)</FieldLabel>
            <Input placeholder="Ví dụ: Quiz giữa kỳ - Lớp N5-K01" {...field} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </Field>
        )}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Controller
          name={"deadline" as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Deadline</FieldLabel>
              <Input
                type="datetime-local"
                value={
                  field.value instanceof Date && !Number.isNaN(field.value.getTime())
                    ? new Date(
                        field.value.getTime() -
                          field.value.getTimezoneOffset() * 60000,
                      )
                        .toISOString()
                        .slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  field.onChange(
                    e.target.value ? new Date(e.target.value) : undefined,
                  )
                }
              />
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />
        <Controller
          name={"weight" as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Weight (%)</FieldLabel>
              <Input
                type="number"
                min={0}
                step={1}
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
        <Controller
          name={"maxScoreOverride" as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Max score override</FieldLabel>
              <Input
                type="number"
                min={0}
                step={0.5}
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

      <div className="grid gap-4 md:grid-cols-3">
        <Controller
          name={"maxAttemptsOverride" as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Max attempts</FieldLabel>
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
        <Controller
          name={"timeLimitOverrideMinutes" as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Time limit (minutes)</FieldLabel>
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
        <Controller
          name={"status" as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Status</FieldLabel>
              <Input placeholder="DRAFT / PUBLISHED / CLOSED" {...field} />
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />
      </div>

      <Controller
        name={"settings" as any}
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Cấu hình thêm (JSON)</FieldLabel>
            <Textarea
              placeholder='Ví dụ: {"shuffleQuestions":true}'
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

