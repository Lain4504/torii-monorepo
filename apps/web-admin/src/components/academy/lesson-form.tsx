import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldError,
  FieldGroup
} from "@workspace/ui/components/field"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

import { useAcademyCourseProfiles } from "@/lib/api/services/academy-course-profiles"
import { LessonMediaUploader } from "@/components/academy/lesson-media-uploader"
import type { AcademyLessonCreateDTO } from "@workspace/schemas"
import { academyLessonCreateDTOSchema } from "@workspace/schemas"
import { RichTextEditor } from "@/components/editor/rich-text-editor"
import { KeyValueEditor } from "@/components/academy/key-value-editor"
import { AttachmentListEditor } from "@/components/academy/attachment-list-editor"

interface LessonFormProps {
  defaultValues?: Partial<AcademyLessonCreateDTO>
  onSubmit: (data: AcademyLessonCreateDTO) => Promise<void>
  onCancel: () => void
  submitting?: boolean
  mode?: "create" | "edit"
}

export function LessonForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitting,
  mode = "create",
}: LessonFormProps) {
  const {
    handleSubmit,
    control,
    watch,
  } = useForm<AcademyLessonCreateDTO>({
    resolver: zodResolver(academyLessonCreateDTOSchema),
    defaultValues: {
      title: "",
      contentType: "VIDEO",
      contentUrl: "",
      contentBody: "",
      attachments: undefined,
      metadata: undefined,
      ...defaultValues,
    },
  })

  const contentType = watch("contentType")
  // User requests: Video content can still have content body.
  // And content body is markdown.
  // We keep the editor visible for VIDEO and MARKDOWN.
  const showContentEditor = contentType === "VIDEO" || contentType === "MARKDOWN" || contentType === "HTML" || contentType === "RICH_TEXT"

  const isMediaUrlType =
    contentType === "VIDEO" ||
    contentType === "PDF" ||
    contentType === "EXTERNAL_LINK"

  const { data: profiles = [] } = useAcademyCourseProfiles({})

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Thông tin chung</CardTitle>
          <CardDescription>
            Chọn course profile và thiết lập loại nội dung cho bài học.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Controller
              name="courseProfileId"
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Course Profile</FieldLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={mode === "edit"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn Course Profile" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.code} - {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Liên kết bài học với Course Profile tương ứng.
                  </FieldDescription>
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />

            <Controller
              name="title"
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Tiêu đề</FieldLabel>
                  <Input placeholder="Nhập tiêu đề bài học" {...field} />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />

            <Controller
              name="contentType"
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Loại nội dung</FieldLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại nội dung" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIDEO">Video</SelectItem>
                      {/* Removed HTML option as requested */}
                      <SelectItem value="MARKDOWN">Markdown</SelectItem>
                      {/* Kept EXTERNAL_LINK and PDF as they are distinct from just "content" */}
                      <SelectItem value="EXTERNAL_LINK">External Link</SelectItem>
                      <SelectItem value="PDF">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Chọn định dạng chính cho nội dung bài học.
                  </FieldDescription>
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nội dung bài học (Markdown)</CardTitle>
          <CardDescription>
            Soạn nội dung chi tiết và xem trước hiển thị.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showContentEditor ? (
            <Controller
              name="contentBody"
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Nội dung</FieldLabel>
                  <RichTextEditor
                    initialContent={field.value || ""}
                    onUpdate={(data: string) =>
                      field.onChange(data)
                    }
                  />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
          ) : (
            <FieldDescription>
              Nội dung văn bản chỉ áp dụng cho loại Video hoặc Markdown.
            </FieldDescription>
          )}
        </CardContent>
      </Card>

      {isMediaUrlType && (
        <Card>
          <CardHeader>
            <CardTitle>Media & liên kết</CardTitle>
            <CardDescription>
              Thiết lập link video, file, hoặc external link cho bài học.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Controller
                name="contentUrl"
                control={control}
                render={({ field, fieldState }) => (
                  <LessonMediaUploader
                    value={field.value || null}
                    onChange={field.onChange}
                    label={
                      contentType === "EXTERNAL_LINK"
                        ? "Liên kết nội dung"
                        : "File nội dung (Video/PDF/Media)"
                    }
                    description={
                      contentType === "EXTERNAL_LINK"
                        ? "Liên kết đến trang hoặc tài nguyên bên ngoài."
                        : "Chọn file video hoặc tài liệu, hệ thống sẽ tự động upload lên storage."
                    }
                    accept={
                      contentType === "VIDEO"
                        ? "video/*"
                        : contentType === "PDF"
                          ? "application/pdf"
                          : undefined
                    }
                    errorMessage={fieldState.error?.message}
                  />
                )}
              />
            </FieldGroup>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tài liệu đính kèm</CardTitle>
          <CardDescription>
            Thêm tài liệu tham khảo cho bài học.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Controller
            name="attachments"
            control={control}
            render={({ field }) => (
              <AttachmentListEditor
                value={field.value || []}
                onChange={field.onChange}
              />
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Metadata nâng cao</CardTitle>
          <CardDescription>
            Thêm thông tin bổ sung cho bài học (key-value).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Controller
              name="metadata"
              control={control}
              render={({ field }) => (
                <Field>
                  <KeyValueEditor
                    value={field.value || {}}
                    onChange={field.onChange}
                    presets={[
                      { key: "summary", label: "Tóm tắt ngắn (Summary)", defaultValue: "Tóm tắt bài học..." },
                      { key: "estimatedMinutes", label: "Thời gian ước tính (phút)", defaultValue: "15" },
                      { key: "tags", label: "Thẻ (Tags)", defaultValue: "jlpt,n5" },
                      { key: "difficulty", label: "Độ khó", defaultValue: "medium" },
                    ]}
                  />
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={submitting}>
          {mode === "create" ? "Tạo mới" : "Cập nhật"}
        </Button>
      </div>
    </form>
  )
}
