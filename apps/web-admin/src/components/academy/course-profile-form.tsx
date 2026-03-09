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
import { Spinner } from "@workspace/ui/components/spinner"
import {
  academyCourseProfileCreateDTOSchema,
  academyCourseProfileUpdateDTOSchema,
  type AcademyCourseProfileCreateDTO,
  type AcademyCourseProfileUpdateDTO,
  COURSE_PROFILE_METADATA,
} from "@workspace/schemas"
import type { AcademyCourseProfile } from "@/lib/api/services/academy-course-profiles"
import { LessonMediaUploader } from "./lesson-media-uploader"
import { RichTextEditor } from "@/components/editor/rich-text-editor"
import { KeyValueEditor } from "./key-value-editor"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

export function CourseProfileForm({
  mode,
  initial,
  onSubmit,
  onCancel,
  submitting,
}: {
  mode: "create" | "edit"
  initial?: AcademyCourseProfile
  onSubmit: (
    data: AcademyCourseProfileCreateDTO | AcademyCourseProfileUpdateDTO
  ) => Promise<void>
  onCancel: () => void
  submitting?: boolean
}) {
  const isEdit = mode === "edit"
  const { handleSubmit, control } = useForm<
    AcademyCourseProfileCreateDTO | AcademyCourseProfileUpdateDTO
  >({
    resolver: zodResolver(
      isEdit
        ? academyCourseProfileUpdateDTOSchema
        : academyCourseProfileCreateDTOSchema
    ) as any,
    defaultValues: isEdit
      ? {
        title: initial?.title ?? "",
        shortTitle: initial?.shortTitle ?? undefined,
        description: initial?.description ?? undefined,
        subject: initial?.subject ?? undefined,
        level: initial?.level ?? undefined,
        defaultLanguage: initial?.defaultLanguage ?? "vi",
        thumbnailUrl: initial?.thumbnailUrl ?? undefined,
        metadata: initial?.metadata ?? undefined,
      }
      : {
        code: "",
        title: "",
        shortTitle: undefined,
        description: undefined,
        subject: "japanese",
        level: "N5",
        defaultLanguage: "vi",
        thumbnailUrl: undefined,
        metadata: undefined,
      },
  })

  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit(async (data) => onSubmit(data))}
      noValidate
    >
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Thông tin cơ bản</FieldLegend>
          <FieldDescription>
            Các thông tin định danh chính của Course Profile.
          </FieldDescription>
          <FieldGroup>
            {!isEdit && (
              <Controller
                name={"code" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Mã (code)</FieldLabel>
                    <Input placeholder="JLPT_N5" {...field} />
                    <FieldDescription>
                      Mã duy nhất không thể thay đổi sau khi tạo (vd: JLPT_N5).
                    </FieldDescription>
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
                  <Input placeholder="Tiếng Nhật N5" {...field} />
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
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend>Mô tả chi tiết</FieldLegend>
          <FieldDescription>
            Nội dung mô tả chi tiết về chương trình học này.
          </FieldDescription>
          <Controller
            name={"description" as any}
            control={control}
            render={({ field, fieldState }) => (
              <Field>
                <Tabs defaultValue="edit" className="mt-2">
                  <TabsList className="mb-4">
                    <TabsTrigger value="edit">Chỉnh sửa</TabsTrigger>
                    <TabsTrigger value="preview">Xem trước</TabsTrigger>
                  </TabsList>
                  <TabsContent value="edit">
                    <RichTextEditor
                      initialContent={field.value || ""}
                      onUpdate={(data: string) => field.onChange(data)}
                    />
                  </TabsContent>
                  <TabsContent value="preview">
                    <div
                      className="border rounded-md p-4 min-h-[200px] prose prose-sm dark:prose-invert max-w-none bg-muted/20"
                      dangerouslySetInnerHTML={{
                        __html: field.value || "<em>Chưa có mô tả.</em>",
                      }}
                    />
                  </TabsContent>
                </Tabs>
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />
        </FieldSet>

        <FieldSet>
          <FieldLegend>Phân loại & Ngôn ngữ</FieldLegend>
          <FieldDescription>
            Thiết lập môn học, cấp độ và ngôn ngữ hiển thị mặc định.
          </FieldDescription>
          <FieldGroup>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name={"subject" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Môn học (Subject)</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn môn học" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="japanese">Tiếng Nhật (Japanese)</SelectItem>
                        <SelectItem value="english">Tiếng Anh (English)</SelectItem>
                        <SelectItem value="programming">Lập trình (Programming)</SelectItem>
                        <SelectItem value="other">Khác (Other)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              <Controller
                name={"level" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Cấp độ (Level)</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn cấp độ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="N5">N5 (Sơ cấp 1)</SelectItem>
                        <SelectItem value="N4">N4 (Sơ cấp 2)</SelectItem>
                        <SelectItem value="N3">N3 (Trung cấp)</SelectItem>
                        <SelectItem value="N2">N2 (Thượng cấp 1)</SelectItem>
                        <SelectItem value="N1">N1 (Thượng cấp 2)</SelectItem>
                        <SelectItem value="Beginner">Cơ bản (Beginner)</SelectItem>
                        <SelectItem value="Intermediate">Trung bình (Intermediate)</SelectItem>
                        <SelectItem value="Advanced">Nâng cao (Advanced)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
            </div>

            <Controller
              name={"defaultLanguage" as any}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Ngôn ngữ hiển thị mặc định</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn ngôn ngữ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vi">Tiếng Việt (vi)</SelectItem>
                      <SelectItem value="ja">Tiếng Nhật (ja)</SelectItem>
                      <SelectItem value="en">Tiếng Anh (en)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Ngôn ngữ mặc định cho các tài liệu và nội dung bài học.
                  </FieldDescription>
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend>Hình ảnh & Metadata</FieldLegend>
          <FieldDescription>
            Tải lên hình ảnh đại diện và các thông số bổ trợ khác.
          </FieldDescription>
          <FieldGroup>
            <Controller
              name={"thumbnailUrl" as any}
              control={control}
              render={({ field, fieldState }) => (
                <LessonMediaUploader
                  value={field.value || null}
                  onChange={field.onChange}
                  label="Ảnh đại diện (Thumbnail)"
                  description="Chọn ảnh đại diện cho course profile này. Hỗ trợ JPG, PNG, WebP."
                  accept="image/*"
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name={"metadata" as any}
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Cấu hình bổ sung (Metadata)</FieldLabel>
                  <KeyValueEditor
                    value={field.value || {}}
                    onChange={field.onChange}
                    presets={COURSE_PROFILE_METADATA}
                  />
                  <FieldDescription>
                    Dùng để hiển thị các thông tin nhanh trên trang chi tiết khóa học.
                  </FieldDescription>
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
            {isEdit ? "Cập nhật Profile" : "Tạo Profile"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}


