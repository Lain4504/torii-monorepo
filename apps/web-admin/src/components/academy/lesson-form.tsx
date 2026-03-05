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
import { Textarea } from "@workspace/ui/components/textarea"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { useAcademyCourseProfiles } from "@/lib/api/services/academy-course-profiles"
import { LessonMediaUploader } from "@/components/academy/lesson-media-uploader"
import type { AcademyLessonCreateDto } from "@workspace/schemas"
import { academyLessonCreateSchema } from "@workspace/schemas"
import { RichTextEditor } from "@/components/editor/rich-text-editor"

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
  const {
    handleSubmit,
    control,
    watch,
  } = useForm<AcademyLessonCreateDto>({
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

  const contentType = watch("contentType")
  const isRichTextType = contentType === "HTML" || contentType === "MARKDOWN"
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
                      <SelectItem value="HTML">HTML</SelectItem>
                      <SelectItem value="MARKDOWN">Markdown</SelectItem>
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
          <CardTitle>Nội dung bài học</CardTitle>
          <CardDescription>
            Soạn nội dung chi tiết và xem trước hiển thị.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isRichTextType ? (
            <Controller
              name="contentBody"
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Nội dung (HTML/Markdown)</FieldLabel>
                  <Tabs defaultValue="edit">
                    <TabsList className="mb-4">
                      <TabsTrigger value="edit">Chỉnh sửa</TabsTrigger>
                      <TabsTrigger value="preview">Xem trước</TabsTrigger>
                    </TabsList>
                    <TabsContent value="edit">
                      <RichTextEditor
                        initialContent={field.value || ""}
                        onUpdate={(html) => field.onChange(html)}
                      />
                    </TabsContent>
                    <TabsContent value="preview">
                      <div
                        className="border rounded-md p-4 space-y-4"
                        dangerouslySetInnerHTML={{
                          __html: field.value || "",
                        }}
                      />
                    </TabsContent>
                  </Tabs>
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
          ) : (
            <FieldDescription>
              Nội dung văn bản chỉ áp dụng cho loại HTML hoặc Markdown.
            </FieldDescription>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Media & liên kết</CardTitle>
          <CardDescription>
            Thiết lập link video, file, hoặc external link cho bài học.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            {isMediaUrlType && (
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
            )}
            {!isMediaUrlType && (
              <FieldDescription>
                URL nội dung chỉ áp dụng cho loại Video, PDF hoặc External Link.
              </FieldDescription>
            )}
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Metadata nâng cao</CardTitle>
          <CardDescription>
            Thêm thông tin bổ sung cho bài học dưới dạng JSON.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
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
                        field.onChange(e.target.value)
                      }
                    }}
                  />
                  <FieldDescription>Dữ liệu bổ sung dạng JSON.</FieldDescription>
                  <FieldError>{fieldState.error?.message}</FieldError>
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
