import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import { Spinner } from "@workspace/ui/components/spinner"
import {
  academyClassCreateDTOSchema,
  academyClassUpdateDTOSchema,
  type AcademyClassCreateDTO,
  type AcademyClassUpdateDTO,
} from "@workspace/schemas"
import type { AcademyClass } from "@/lib/api/services/academy-classes"

export function ClassForm({
  mode,
  initial,
  onSubmit,
  onCancel,
  submitting,
  defaultCourseProfileId,
  defaultCourseEditionId,
}: {
  mode: "create" | "edit"
  initial?: AcademyClass
  onSubmit: (data: AcademyClassCreateDTO | AcademyClassUpdateDTO) => Promise<void>
  onCancel: () => void
  submitting?: boolean
  defaultCourseProfileId?: string
  defaultCourseEditionId?: string
}) {
  const isEdit = mode === "edit"

  const { handleSubmit, control } = useForm<
    AcademyClassCreateDTO | AcademyClassUpdateDTO
  >({
    resolver: zodResolver(
      (isEdit ? academyClassUpdateDTOSchema : academyClassCreateDTOSchema) as any,
    ) as any,
    defaultValues: isEdit
      ? {
          name: initial?.name ?? "",
          mode: initial?.mode ?? undefined,
          term: initial?.term ?? undefined,
          batch: initial?.batch ?? undefined,
          startDate: initial?.startDate ? new Date(initial.startDate) : undefined,
          endDate: initial?.endDate ? new Date(initial.endDate) : undefined,
          enrollmentOpenAt: initial?.enrollmentOpenAt
            ? new Date(initial.enrollmentOpenAt)
            : undefined,
          enrollmentCloseAt: initial?.enrollmentCloseAt
            ? new Date(initial.enrollmentCloseAt)
            : undefined,
          minStudents: initial?.minStudents ?? undefined,
          maxStudents: initial?.maxStudents ?? undefined,
          status: initial?.status ?? undefined,
        }
      : {
          courseProfileId: defaultCourseProfileId ?? "",
          courseEditionId: defaultCourseEditionId ?? "",
          code: "",
          name: "",
          mode: "VOD",
          term: undefined,
          batch: undefined,
          startDate: undefined,
          endDate: undefined,
          enrollmentOpenAt: undefined,
          enrollmentCloseAt: undefined,
          minStudents: undefined,
          maxStudents: undefined,
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
        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            name={"courseProfileId" as any}
            control={control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>CourseProfileId</FieldLabel>
                <Input placeholder="UUID CourseProfile" {...field} />
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />
          <Controller
            name={"courseEditionId" as any}
            control={control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>CourseEditionId</FieldLabel>
                <Input placeholder="UUID CourseEdition" {...field} />
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {!isEdit && (
          <Controller
            name={"code" as any}
            control={control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Mã lớp (code)</FieldLabel>
                <Input placeholder="JLPT_N5_2026_K01" {...field} />
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />
        )}
        <Controller
          name={"name" as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Tên lớp</FieldLabel>
              <Input placeholder="JLPT N5 - Khoá 01/2026" {...field} />
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />
        <Controller
          name={"mode" as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Mode</FieldLabel>
              <Input placeholder="VOD / LIVE / BLENDED" {...field} />
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Controller
          name={"term" as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Term</FieldLabel>
              <Input placeholder="2026-Q1 / 2026-1" {...field} />
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />
        <Controller
          name={"batch" as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Batch</FieldLabel>
              <Input placeholder="K01 / K02..." {...field} />
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
              <Input placeholder="DRAFT / ENROLLING / IN_PROGRESS..." {...field} />
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Controller
          name={"startDate" as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Start date</FieldLabel>
              <Input
                type="date"
                value={
                  field.value instanceof Date && !Number.isNaN(field.value.getTime())
                    ? field.value.toISOString().slice(0, 10)
                    : ""
                }
                onChange={(e) =>
                  field.onChange(e.target.value ? new Date(e.target.value) : undefined)
                }
              />
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />
        <Controller
          name={"endDate" as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>End date</FieldLabel>
              <Input
                type="date"
                value={
                  field.value instanceof Date && !Number.isNaN(field.value.getTime())
                    ? field.value.toISOString().slice(0, 10)
                    : ""
                }
                onChange={(e) =>
                  field.onChange(e.target.value ? new Date(e.target.value) : undefined)
                }
              />
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />
        <Controller
          name={"minStudents" as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Min students</FieldLabel>
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

      <div className="grid gap-4 md:grid-cols-3">
        <Controller
          name={"enrollmentOpenAt" as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Enrollment open at</FieldLabel>
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
          name={"enrollmentCloseAt" as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Enrollment close at</FieldLabel>
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
          name={"maxStudents" as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Max students</FieldLabel>
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
        name={"settings" as any}
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Cấu hình thêm (JSON)</FieldLabel>
            <Textarea
              placeholder='Ví dụ: {"allowLateJoin":true}'
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

