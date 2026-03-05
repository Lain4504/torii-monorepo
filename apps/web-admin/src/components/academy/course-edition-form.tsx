import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Spinner } from "@workspace/ui/components/spinner"
import {
  academyCourseEditionCreateDTOSchema,
  academyCourseEditionUpdateDTOSchema,
  type AcademyCourseEditionCreateDTO,
  type AcademyCourseEditionUpdateDTO,
} from "@workspace/schemas"
import type { AcademyCourseEdition } from "@/lib/api/services/academy-course-editions"
import { useAcademyCourseProfiles } from "@/lib/api/services/academy-course-profiles"

export function CourseEditionForm({
  mode,
  initial,
  onSubmit,
  onCancel,
  submitting,
}: {
  mode: "create" | "edit"
  initial?: AcademyCourseEdition
  onSubmit: (data: AcademyCourseEditionCreateDTO | AcademyCourseEditionUpdateDTO) => Promise<void>
  onCancel: () => void
  submitting?: boolean
}) {
  const isEdit = mode === "edit"
  const { data: courseProfiles = [] } = useAcademyCourseProfiles({ q: undefined })

  const { handleSubmit, control } = useForm<
    AcademyCourseEditionCreateDTO | AcademyCourseEditionUpdateDTO
  >({
    resolver: zodResolver(
      (isEdit ? academyCourseEditionUpdateDTOSchema : academyCourseEditionCreateDTOSchema) as any,
    ) as any,
    defaultValues: isEdit
      ? {
          editionTag: initial?.editionTag ?? "",
          isCurrent: initial?.isCurrent ?? undefined,
          status: initial?.status ?? undefined,
          syllabusSnapshot: initial?.syllabusSnapshot ?? undefined,
          changelog: initial?.changelog ?? undefined,
        }
      : {
          courseProfileId: "",
          editionTag: "",
          status: undefined,
          syllabusSnapshot: undefined,
          changelog: undefined,
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
              <FieldLabel>Course Profile</FieldLabel>
              <Select value={field.value as any} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn Course Profile..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {courseProfiles.map((cp) => (
                      <SelectItem key={cp.id} value={cp.id}>
                        {cp.code} · {cp.title}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />
      )}

      <Controller
        name={"editionTag" as any}
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Edition tag</FieldLabel>
            <Input placeholder="2026-Q1 / v1 / N5-2026" {...field} />
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
            <Input placeholder="DRAFT / PUBLISHED / ARCHIVED" {...field} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </Field>
        )}
      />

      <Controller
        name={"changelog" as any}
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Changelog</FieldLabel>
            <Textarea placeholder="Mô tả thay đổi trong edition này..." {...field} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </Field>
        )}
      />

      <Controller
        name={"syllabusSnapshot" as any}
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Syllabus snapshot (JSON)</FieldLabel>
            <Textarea
              placeholder='Ví dụ: {"chapters":[...]}'
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

