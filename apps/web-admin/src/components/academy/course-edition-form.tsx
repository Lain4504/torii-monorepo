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
  SelectGroup,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Spinner } from "@workspace/ui/components/spinner"
import {
  academyCourseEditionCreateDTOSchema,
  academyCourseEditionUpdateDTOSchema,
  type AcademyCourseEditionCreateDTO,
  type AcademyCourseEditionUpdateDTO,
} from "@workspace/schemas"
import type { AcademyCourseEdition } from "@/lib/api/services/academy-course-editions"
import { useAcademyCourseProfiles } from "@/lib/api/services/academy-course-profiles"
import { RichTextEditor, type EditorJsData } from "@/components/editor/rich-text-editor"

export function CourseEditionForm({
  mode,
  initial,
  onSubmit,
  onCancel,
  submitting,
}: {
  mode: "create" | "edit"
  initial?: AcademyCourseEdition
  onSubmit: (
    data: AcademyCourseEditionCreateDTO | AcademyCourseEditionUpdateDTO
  ) => Promise<void>
  onCancel: () => void
  submitting?: boolean
}) {
  const isEdit = mode === "edit"
  const { data: courseProfiles = [] } = useAcademyCourseProfiles({ q: undefined })

  const { handleSubmit, control } = useForm<
    AcademyCourseEditionCreateDTO | AcademyCourseEditionUpdateDTO
  >({
    resolver: zodResolver(
      (isEdit
        ? academyCourseEditionUpdateDTOSchema
        : academyCourseEditionCreateDTOSchema) as any
    ) as any,
    defaultValues: isEdit
      ? {
        editionTag: initial?.editionTag ?? "",
        isCurrent: initial?.isCurrent ?? undefined,
        status: initial?.status ?? undefined,
        syllabusSnapshot: initial?.syllabusSnapshot ?? undefined,
        changelog: initial?.changelog ?? undefined,
      }
      : {
        courseProfileId: "",
        editionTag: "",
        status: "DRAFT",
        syllabusSnapshot: undefined,
        changelog: undefined,
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
          <CardTitle>Liên kết Course Profile</CardTitle>
          <CardDescription>
            Xác định Course Profile mà edition này thuộc về.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            {!isEdit && (
              <Controller
                name={"courseProfileId" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Course Profile</FieldLabel>
                    <Select value={field.value as any} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn Course Profile..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {courseProfiles.map((cp) => (
                            <SelectItem key={cp.id} value={cp.id}>
                              {cp.code} · {cp.title}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      Chọn profile chính để tạo phiên bản syllabus.
                    </FieldDescription>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
            )}
            {isEdit && (
              <Field>
                <FieldLabel>Course Profile</FieldLabel>
                <Input
                  disabled
                  value={`${(initial as any)?.courseProfile?.code} · ${(initial as any)?.courseProfile?.title}`}
                />
              </Field>
            )}
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Phiên bản & Trạng thái</CardTitle>
          <CardDescription>
            Thiết lập tag phiên bản, trạng thái hiển thị và cấu hình hiện tại.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name={"editionTag" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Edition tag</FieldLabel>
                    <Input placeholder="2026-Q1 / v1 / N5-2026" {...field} />
                    <FieldDescription>Tên gợi nhớ cho phiên bản này.</FieldDescription>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

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
                        <SelectItem value="DRAFT">Draft (Nháp)</SelectItem>
                        <SelectItem value="PUBLISHED">Published (Công khai)</SelectItem>
                        <SelectItem value="ARCHIVED">Archived (Lưu trữ)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
            </div>

            <Controller
              name={"isCurrent" as any}
              control={control}
              render={({ field, fieldState }) => (
                <Field className="flex flex-row items-center space-x-2 space-y-0">
                  <Checkbox
                    id="isCurrent"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <FieldLabel htmlFor="isCurrent">Đặt làm phiên bản hiện tại</FieldLabel>
                    <FieldDescription>
                      Nếu bật, đây sẽ là edition mặc định cho Course Profile này.
                    </FieldDescription>
                  </div>
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lịch sử thay đổi (Changelog)</CardTitle>
          <CardDescription>
            Ghi chú các thay đổi chính trong edition này.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Controller
            name={"changelog" as any}
            control={control}
            render={({ field, fieldState }) => (
              <Field>
                <Tabs defaultValue="edit">
                  <TabsList className="mb-4">
                    <TabsTrigger value="edit">Chỉnh sửa</TabsTrigger>
                    <TabsTrigger value="preview">Xem trước</TabsTrigger>
                  </TabsList>
                  <TabsContent value="edit">
                    <RichTextEditor
                      initialContent={field.value || ""}
                      onUpdate={(data: EditorJsData) => field.onChange(JSON.stringify(data))}
                    />
                  </TabsContent>
                  <TabsContent value="preview">
                    <div
                      className="border rounded-md p-4 min-h-[150px] prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: field.value || "<em>Chưa có nội dung.</em>",
                      }}
                    />
                  </TabsContent>
                </Tabs>
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />
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
          {isEdit ? "Lưu thay đổi" : "Tạo Course Edition"}
        </Button>
      </div>
    </form>
  )
}


