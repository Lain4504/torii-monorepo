import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import { Spinner } from "@workspace/ui/components/spinner"
import {
  academyClassScheduleCreateDTOSchema,
  academyClassScheduleUpdateDTOSchema,
  type AcademyClassScheduleCreateDTO,
  type AcademyClassScheduleUpdateDTO,
} from "@workspace/schemas"
import type { AcademyClassSchedule } from "@/lib/api/services/academy-class-schedules"

export function ClassScheduleForm({
  mode,
  initial,
  onSubmit,
  onCancel,
  submitting,
  defaultClassId,
}: {
  mode: "create" | "edit"
  initial?: AcademyClassSchedule
  onSubmit: (
    data: AcademyClassScheduleCreateDTO | AcademyClassScheduleUpdateDTO,
  ) => Promise<void>
  onCancel: () => void
  submitting?: boolean
  defaultClassId?: string
}) {
  const isEdit = mode === "edit"

  const { handleSubmit, control } = useForm<
    AcademyClassScheduleCreateDTO | AcademyClassScheduleUpdateDTO
  >({
    resolver: zodResolver(
      (isEdit
        ? academyClassScheduleUpdateDTOSchema
        : academyClassScheduleCreateDTOSchema) as any,
    ) as any,
    defaultValues: isEdit
      ? {
          weekday: initial?.weekday ?? 1,
          startTime: initial?.startTime ?? "",
          endTime: initial?.endTime ?? "",
          location: initial?.location ?? undefined,
          note: initial?.note ?? undefined,
        }
      : {
          classId: defaultClassId ?? "",
          weekday: 1,
          startTime: "19:00",
          endTime: "21:00",
          location: undefined,
          note: undefined,
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
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Controller
          name={"weekday" as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Weekday (0=CN ... 6=Thứ 7)</FieldLabel>
              <Input
                type="number"
                min={0}
                max={6}
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value || 0))}
              />
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />
        <Controller
          name={"startTime" as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Giờ bắt đầu</FieldLabel>
              <Input placeholder="HH:mm" {...field} />
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />
        <Controller
          name={"endTime" as any}
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Giờ kết thúc</FieldLabel>
              <Input placeholder="HH:mm" {...field} />
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />
      </div>

      <Controller
        name={"location" as any}
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Địa điểm / Room</FieldLabel>
            <Input placeholder="Zoom, Google Meet, phòng 301..." {...field} />
            <FieldError>{fieldState.error?.message}</FieldError>
          </Field>
        )}
      />

      <Controller
        name={"note" as any}
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Ghi chú</FieldLabel>
            <Textarea placeholder="Ghi chú thêm cho lịch học..." {...field} />
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

