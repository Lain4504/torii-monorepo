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
  FieldSet,
  FieldLegend,
} from "@workspace/ui/components/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

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
import { KeyValueEditor } from "./key-value-editor"

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

  const kind = watch("kind") as "LESSON" | "QUIZ_TEMPLATE" | "ASSIGNMENT_TEMPLATE" | "EXAM"

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Vị trí & Loại nội dung</FieldLegend>
          <FieldDescription>
            Chọn chương học và loại bài học tương ứng.
          </FieldDescription>
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
                    disabled={isEdit}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LESSON">Bài học (Lesson)</SelectItem>
                      <SelectItem value="QUIZ_TEMPLATE">Mẫu trắc nghiệm (Quiz Template)</SelectItem>
                      <SelectItem value="ASSIGNMENT_TEMPLATE">Mẫu bài tập (Assignment Template)</SelectItem>
                      <SelectItem value="EXAM">Kỳ thi (Exam)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    {isEdit ? "Không thể thay đổi loại nội dung sau khi tạo." : "Chọn loại tài nguyên sẽ hiển thị cho học viên."}
                  </FieldDescription>
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend>Chi tiết bài học</FieldLegend>
          <FieldDescription>
            Tiêu đề hiển thị và liên kết tới tài nguyên.
          </FieldDescription>
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
                  <ResourcePicker
                    kind={kind}
                    courseProfileId={courseProfileId}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isEdit}
                  />
                  {isEdit && (
                    <div className="mt-2 text-xs text-muted-foreground italic">
                      ID tài nguyên: {field.value} (Không thể thay đổi)
                    </div>
                  )}
                  <FieldDescription>
                    Liên kết với nội dung cụ thể từ thư viện.
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
                  <FieldLabel>Thứ tự hiển thị</FieldLabel>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                  <FieldDescription>Số càng nhỏ sẽ hiển thị lên trước.</FieldDescription>
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />

            <Controller
              name={"metadata" as any}
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Cấu hình nâng cao (Metadata)</FieldLabel>
                  <KeyValueEditor
                    value={field.value || {}}
                    onChange={field.onChange}
                    presets={[
                      { key: "estimated_duration", label: "Thời lượng ước tính (phút)", defaultValue: "15" },
                      { key: "is_optional", label: "Bài học tùy chọn", defaultValue: "false" },
                      { key: "is_preview", label: "Cho phép xem thử", defaultValue: "false" },
                      { key: "points", label: "Điểm thưởng", defaultValue: "0" },
                    ]}
                  />
                  <FieldDescription>Các thông số bổ sung cho bài học/kỳ thi này.</FieldDescription>
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        <Field orientation="horizontal" className="justify-end pt-6 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={submitting}
          >
            Hủy bỏ
          </Button>
          <Button type="submit" disabled={submitting} className="min-w-[120px]">
            {submitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
            {isEdit ? "Cập nhật" : "Tạo mới"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
