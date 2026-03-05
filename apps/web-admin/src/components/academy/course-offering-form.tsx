import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import { Spinner } from "@workspace/ui/components/spinner"
import {
  academyCourseOfferingCreateDTOSchema,
  academyCourseOfferingUpdateDTOSchema,
  type AcademyCourseOfferingCreateDTO,
  type AcademyCourseOfferingUpdateDTO,
} from "@workspace/schemas"
import type { AcademyCourseOffering } from "@/lib/api/services/academy-course-offerings"

export function CourseOfferingForm({
  mode,
  initial,
  onSubmit,
  onCancel,
  submitting,
}: {
  mode: "create" | "edit"
  initial?: AcademyCourseOffering
  onSubmit: (data: AcademyCourseOfferingCreateDTO | AcademyCourseOfferingUpdateDTO) => Promise<void>
  onCancel: () => void
  submitting?: boolean
}) {
  const isEdit = mode === "edit"

  const { handleSubmit, control } = useForm<
    AcademyCourseOfferingCreateDTO | AcademyCourseOfferingUpdateDTO
  >({
    resolver: zodResolver(
      (isEdit
        ? academyCourseOfferingUpdateDTOSchema
        : academyCourseOfferingCreateDTOSchema) as any,
    ) as any,
    defaultValues: isEdit
      ? {
          title: initial?.title ?? "",
          description: initial?.description ?? undefined,
          price: initial?.price ?? undefined,
          currency: initial?.currency ?? undefined,
          status: initial?.status ?? undefined,
        }
      : {
          code: "",
          title: "",
          description: undefined,
          price: 0,
          currency: "VND",
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
          name={"code" as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Mã gói (code)</FieldLabel>
              <Input placeholder="JLPT_N5_LIVE_2026" {...field} />
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
            <Input placeholder="JLPT N5 - Live + VOD 2026" {...field} />
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
            <Textarea placeholder="Mô tả gói bán, quyền lợi..." {...field} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </Field>
        )}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Controller
          name={"price" as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Giá</FieldLabel>
              <Input
                type="number"
                min={0}
                step={1000}
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value || 0))}
              />
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />

        <Controller
          name={"currency" as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Currency</FieldLabel>
              <Input placeholder="VND" {...field} />
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
              <Input placeholder="DRAFT / ACTIVE / HIDDEN" {...field} />
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

