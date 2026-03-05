import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Field,
  FieldError,
  FieldLabel,
  FieldDescription,
  FieldGroup,
} from "@workspace/ui/components/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Spinner } from "@workspace/ui/components/spinner"
import {
  academyChapterCreateDTOSchema,
  academyChapterUpdateDTOSchema,
  type AcademyChapterCreateDTO,
  type AcademyChapterUpdateDTO,
} from "@workspace/schemas"
import type { AcademyChapter } from "@/lib/api/services/academy-chapters"
import { useAcademyCourseEditions } from "@/lib/api/services/academy-course-editions"

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
  const { data: editions = [] } = useAcademyCourseEditions({})

  const { handleSubmit, control } = useForm<AcademyChapterCreateDTO | AcademyChapterUpdateDTO>({
    resolver: zodResolver(
      (isEdit ? academyChapterUpdateDTOSchema : academyChapterCreateDTOSchema) as any
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
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Card>
        <CardHeader>
          <CardTitle>Liên kết Course Edition</CardTitle>
          <CardDescription>Chọn phiên bản khóa học chứa chương này.</CardDescription>
        </CardHeader>
        <CardContent>
          {!isEdit && !courseEditionId && (
            <Controller
              name={"courseEditionId" as any}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Course Edition</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn Course Edition..." />
                    </SelectTrigger>
                    <SelectContent>
                      {editions.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {(e as any).courseProfile?.title} - {e.editionTag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
          )}
          {(isEdit || !!courseEditionId) && (
            <Field>
              <FieldLabel>Course Edition</FieldLabel>
              <Input
                disabled
                value={
                  courseEditionId ||
                  `${(initial as any)?.courseEdition?.courseProfile?.title} - ${(initial as any)?.courseEdition?.editionTag}`
                }
              />
            </Field>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin chương học</CardTitle>
          <CardDescription>Thiết lập tiêu đề và thứ tự hiển thị.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Controller
              name={"title" as any}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Tiêu đề chương</FieldLabel>
                  <Input placeholder="Chương 1: Giới thiệu" {...field} />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />

            <Controller
              name={"description" as any}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Mô tả ngắn</FieldLabel>
                  <Input placeholder="Mô tả mục tiêu của chương..." {...field} />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <Controller
                name={"orderIndex" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Thứ tự</FieldLabel>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                    <FieldDescription>Thứ tự xuất hiện.</FieldDescription>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              <Controller
                name={"estimatedMinutes" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Thời lượng (phút)</FieldLabel>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                    />
                    <FieldDescription>Ước lượng thời gian học.</FieldDescription>
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
                  <FieldLabel>Trạng thái</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
        >
          Hủy
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? <Spinner className="mr-2" /> : null}
          {isEdit ? "Lưu thay đổi" : "Tạo Chương"}
        </Button>
      </div>
    </form>
  )
}


