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
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Textarea } from "@workspace/ui/components/textarea"
import { useAcademyCourseProfiles } from "@/lib/api/services/academy-course-profiles"
import type { AcademyLessonCreateDto } from "@workspace/schemas"
import { academyLessonCreateSchema } from "@workspace/schemas"

interface LessonFormProps {
  defaultValues?: Partial<AcademyLessonCreateDto>
  onSubmit: (data: AcademyLessonCreateDto) => Promise<void>
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
  const { handleSubmit, control } = useForm<AcademyLessonCreateDto>({
    resolver: zodResolver(academyLessonCreateSchema),
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

  const { data: profiles = [] } = useAcademyCourseProfiles({})

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                disabled={mode === "edit"} // Usually we don't change parent ID on edit
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
                  <SelectItem value="HTML">HTML</SelectItem>
                  <SelectItem value="MARKDOWN">Markdown</SelectItem>
                  <SelectItem value="EXTERNAL_LINK">External Link</SelectItem>
                  <SelectItem value="PDF">PDF</SelectItem>
                </SelectContent>
              </Select>
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />

        <Controller
          name="contentUrl"
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>URL nội dung</FieldLabel>
              <Input placeholder="https://example.com/video.mp4" {...field} value={field.value || ''} />
              <FieldDescription>Link video, file, hoặc external link.</FieldDescription>
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />

        <Controller
          name="contentBody"
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Nội dung (Text/HTML/Markdown)</FieldLabel>
              <Textarea
                placeholder="Nội dung chi tiết..."
                className="min-h-[200px]"
                {...field}
                value={field.value || ''}
              />
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />

        <Controller
          name="metadata"
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>Metadata (JSON)</FieldLabel>
              <Textarea
                placeholder='{"duration": 120, "tags": ["intro"]}'
                className="font-mono text-xs"
                {...field}
                value={
                  typeof field.value === "object"
                    ? JSON.stringify(field.value, null, 2)
                    : field.value || ""
                }
                onChange={(e) => {
                  try {
                    const json = JSON.parse(e.target.value)
                    field.onChange(json)
                  } catch {
                    field.onChange(e.target.value) // Pass raw string if invalid JSON
                  }
                }}
              />
              <FieldDescription>Dữ liệu bổ sung dạng JSON.</FieldDescription>
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />
      </FieldGroup>

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
