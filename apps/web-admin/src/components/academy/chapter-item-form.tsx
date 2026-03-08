import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
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
  academyChapterItemCreateDTOSchema,
  academyChapterItemUpdateDTOSchema,
  type AcademyChapterItemCreateDTO,
  type AcademyChapterItemUpdateDTO,
} from "@workspace/schemas"
import type { AcademyChapterItem } from "@/lib/api/services/academy-chapter-items"
import { useAcademyChapters, useAcademyChapter } from "@/lib/api/services/academy-chapters"
import { useAcademyCourseEdition } from "@/lib/api/services/academy-course-editions"
import { ResourcePicker } from "./resource-picker"

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
    data: AcademyChapterItemCreateDTO | AcademyChapterItemUpdateDTO
  ) => Promise<void>
  onCancel: () => void
  submitting?: boolean
}) {
  const isEdit = mode === "edit"
  const { data: chapters = [] } = useAcademyChapters({})

  // Fetch context to get courseProfileId for filtering
  const effectiveChapterId = chapterId || initial?.chapterId
  const { data: chapter } = useAcademyChapter(effectiveChapterId)
  const { data: edition } = useAcademyCourseEdition(chapter?.courseEditionId)
  const courseProfileId = edition?.courseProfileId

  const { handleSubmit, control, watch } = useForm<
    AcademyChapterItemCreateDTO | AcademyChapterItemUpdateDTO
  >({
    resolver: zodResolver(
      (isEdit
        ? academyChapterItemUpdateDTOSchema
        : academyChapterItemCreateDTOSchema) as any
    ) as any,
    defaultValues: isEdit
      ? {
          title: initial?.title ?? "",
          orderIndex: initial?.orderIndex ?? 0,
          metadata: initial?.metadata ?? undefined,
          kind: initial?.kind ?? "LESSON",
          referenceId: initial?.referenceId ?? "",
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

  const kind = watch("kind") as "LESSON" | "QUIZ" | "ASSIGNMENT" | "EXAM"

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Card>
        <CardHeader>
          <CardTitle>Vị trí & Loại nội dung</CardTitle>
          <CardDescription>
            Chọn chương học và loại bài học tương ứng.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            {!isEdit && !chapterId && (
              <Controller
                name={"chapterId" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Chương học (Chapter)</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn chương..." />
                      </SelectTrigger>
                      <SelectContent>
                        {chapters.map((c: any) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
            )}
            {(isEdit || !!chapterId) && (
              <Field>
                <FieldLabel>Chương học</FieldLabel>
                <Input
                  disabled
                  value={
                    chapterId || (initial as any)?.chapter?.title || "N/A"
                  }
                />
              </Field>
            )}

            <Controller
              name={"kind" as any}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Loại nội dung</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isEdit} // Usually changing kind in edit is risky, but let's see if allowed. Assuming no for now or yes? The original code didn't disable it.
                    // Wait, original code: {!isEdit && ( ... )} around kind select. So it was disabled/hidden in edit mode.
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LESSON">Lesson</SelectItem>
                      <SelectItem value="QUIZ">Quiz</SelectItem>
                      <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                      <SelectItem value="EXAM">Exam</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chi tiết bài học</CardTitle>
          <CardDescription>
            Tiêu đề hiển thị và liên kết tới tài nguyên.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Controller
              name={"title" as any}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Tiêu đề hiển thị</FieldLabel>
                  <Input placeholder="Bài 1: Giới thiệu..." {...field} />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />

            <Controller
              name={"referenceId" as any}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Tài nguyên gốc</FieldLabel>
                  {/* Use ResourcePicker here */}
                  <ResourcePicker
                    kind={kind}
                    courseProfileId={courseProfileId}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isEdit} // Should we allow changing reference in edit? Original code: {!isEdit && ( ... )} around referenceId.
                    // If original code hid referenceId in edit, then we should probably respect that or check why.
                    // The original code:
                    // {!isEdit && ( ... referenceId input ... )}
                    // So it was NOT editable in edit mode.
                  />
                  {isEdit && (
                     <div className="mt-2 text-sm text-muted-foreground">
                       Reference ID: {field.value} (Không thể thay đổi)
                     </div>
                  )}
                  <FieldDescription>
                    Chọn tài nguyên từ thư viện nội dung.
                  </FieldDescription>
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
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
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
          {isEdit ? "Lưu thay đổi" : "Tạo Chapter Item"}
        </Button>
      </div>
    </form>
  )
}
