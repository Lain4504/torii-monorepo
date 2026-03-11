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

import { LessonMediaUploader } from "@/components/academy/lesson-media-uploader"
import type { AcademyLessonCreateDTO } from "@workspace/schemas"
import { academyLessonCreateDTOSchema } from "@workspace/schemas"

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
      type: "VIDEO",
      videoUrl: "",
      ...defaultValues,
    },
  })

  const contentType = watch("type")
  const isMediaUrlType = contentType === "VIDEO"

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
              name="type"
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
                      <SelectItem value="READING">READING · Bài đọc / tài liệu</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Lesson dùng để map vào Module trong Syllabus (VIDEO/READING) theo schema V2.
                  </FieldDescription>
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
          </FieldGroup>
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
                name="videoUrl"
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
                      "video/*"
                    }
                    errorMessage={fieldState.error?.message}
                  />
                )}
              />
            </FieldGroup>
          </CardContent>
        </Card>
      )}

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
