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
      ...defaultValues,
    },
  })

  const contentType = watch("contentType")
  const showContentEditor = contentType === "VIDEO" || contentType === "MATERIAL"

  const isMediaUrlType =
    contentType === "VIDEO" ||
    contentType === "MATERIAL"

  const { data: profiles = [] } = useAcademyCourseProfiles({})

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Thông tin chung</CardTitle>
          <CardDescription>
            Tạo bài học gốc trong Lesson Bank để dùng lại khi ráp Syllabus cho từng lớp (VOD/LIVE).
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
                  <FieldLabel>Loại bài học (Lesson type)</FieldLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại nội dung" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIDEO">VIDEO · Bài giảng có video</SelectItem>
                      <SelectItem value="MATERIAL">MATERIAL · Slide / PDF / Tài liệu</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Lesson Bank dùng để map vào Syllabus của Class. Với lớp LIVE, hệ thống có thể chỉ dùng phần tài liệu (ẩn video) tuỳ cấu hình Syllabus Item.
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
          <CardTitle>Nội dung bài học</CardTitle>
          <CardDescription>
            Ghi chú / lý thuyết kèm theo bài học (tuỳ chọn).
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
              Nội dung văn bản chỉ áp dụng cho loại VIDEO hoặc MATERIAL.
            </FieldDescription>
          )}
        </CardContent>
      </Card>

      {isMediaUrlType && (
        <Card>
          <CardHeader>
            <CardTitle>Media & liên kết</CardTitle>
            <CardDescription>
              Upload file nội dung chính cho bài học.
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
                      contentType === "VIDEO"
                        ? "Video bài giảng"
                        : "Tài liệu (Slide/PDF)"
                    }
                    description={
                      contentType === "VIDEO"
                        ? "Chọn file video, hệ thống sẽ tự động upload lên storage."
                        : "Chọn file tài liệu (PDF), hệ thống sẽ tự động upload lên storage."
                    }
                    accept={
                      contentType === "VIDEO"
                        ? "video/*"
                        : "application/pdf"
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
