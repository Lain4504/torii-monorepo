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
import { Spinner } from "@workspace/ui/components/spinner"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/components/card"
import {
  academyCourseProfileCreateDTOSchema,
  academyCourseProfileUpdateDTOSchema,
  type AcademyCourseProfileCreateDTO,
  type AcademyCourseProfileUpdateDTO,
} from "@workspace/schemas"
import type { AcademyCourseProfile } from "@/lib/api/services/academy-course-profiles"
import { LessonMediaUploader } from "./lesson-media-uploader"
import { RichTextEditor } from "@/components/editor/rich-text-editor"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"

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
        defaultLanguage: initial?.defaultLanguage ?? undefined,
        thumbnailUrl: initial?.thumbnailUrl ?? undefined,
      }
      : {
        code: "",
        title: "",
        shortTitle: undefined,
        subject: undefined,
        level: undefined,
        defaultLanguage: undefined,
        thumbnailUrl: undefined,
      },
  })

  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit(async (data) => onSubmit(data))}
      noValidate
    >
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
          <CardDescription>
            Các thông tin định danh chính của Course Profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                  <Input placeholder="JLPT N5" {...field} />
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

            <Controller
              name={"description" as any}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Mô tả chi tiết</FieldLabel>
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
                        className="border rounded-md p-4 min-h-[150px] prose prose-sm dark:prose-invert max-w-none"
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
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Phân loại & Ngôn ngữ</CardTitle>
          <CardDescription>
            Thiết lập môn học, cấp độ và ngôn ngữ hiển thị mặc định.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name={"subject" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Môn</FieldLabel>
                    <Input placeholder="Japanese" {...field} />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              <Controller
                name={"level" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Level</FieldLabel>
                    <Input placeholder="N5" {...field} />
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
                  <FieldLabel>Ngôn ngữ mặc định</FieldLabel>
                  <Input placeholder="vi" {...field} />
                  <FieldDescription>
                    Mã ngôn ngữ (vd: vi, ja, en).
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
          <CardTitle>Hình ảnh & Trình bày</CardTitle>
          <CardDescription>
            Tải lên hình ảnh đại diện cho course profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
          {isEdit ? "Lưu thay đổi" : "Tạo Course Profile"}
        </Button>
      </div>
    </form>
  )
}


