import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import { Spinner } from "@workspace/ui/components/spinner"
import {
  academyCourseProfileCreateDTOSchema,
  academyCourseProfileUpdateDTOSchema,
  type AcademyCourseProfileCreateDTO,
  type AcademyCourseProfileUpdateDTO,
} from "@workspace/schemas"
import type { AcademyCourseProfile } from "@/lib/api/services/academy-course-profiles"

export function CourseProfileForm({
  mode,
  initial,
  onSubmit,
  onCancel,
  submitting,
}: {
  mode: "create" | "edit"
  initial?: AcademyCourseProfile
  onSubmit: (data: AcademyCourseProfileCreateDTO | AcademyCourseProfileUpdateDTO) => Promise<void>
  onCancel: () => void
  submitting?: boolean
}) {
  const isEdit = mode === "edit"
  const { handleSubmit, control } = useForm<
    AcademyCourseProfileCreateDTO | AcademyCourseProfileUpdateDTO
  >({
    resolver: zodResolver(
      isEdit ? academyCourseProfileUpdateDTOSchema : academyCourseProfileCreateDTOSchema,
    ) as any,
    defaultValues: isEdit
      ? {
          title: initial?.title ?? "",
          shortTitle: initial?.shortTitle ?? undefined,
          subject: initial?.subject ?? undefined,
          level: initial?.level ?? undefined,
          defaultLanguage: initial?.defaultLanguage ?? undefined,
          thumbnailUrl: initial?.thumbnailUrl ?? undefined,
        }
      : {
          code: "",
          title: "",
          shortTitle: undefined,
          subject: undefined,
          level: undefined,
          defaultLanguage: undefined,
          thumbnailUrl: undefined,
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
          name={"code" as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Mã (code)</FieldLabel>
              <Input placeholder="JLPT_N5" {...field} />
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
            <FieldLabel>Tiêu đề</FieldLabel>
            <Input placeholder="JLPT N5" {...field} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </Field>
        )}
      />

      <Controller
        name={"shortTitle" as any}
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Tên ngắn</FieldLabel>
            <Input placeholder="N5" {...field} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </Field>
        )}
      />

      <Controller
        name={"subject" as any}
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Môn</FieldLabel>
            <Input placeholder="Japanese" {...field} />
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
            <Input placeholder="N5" {...field} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </Field>
        )}
      />

      <Controller
        name={"defaultLanguage" as any}
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Ngôn ngữ mặc định</FieldLabel>
            <Input placeholder="vi" {...field} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </Field>
        )}
      />

      <Controller
        name={"thumbnailUrl" as any}
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Thumbnail URL</FieldLabel>
            <Input placeholder="https://..." {...field} />
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

