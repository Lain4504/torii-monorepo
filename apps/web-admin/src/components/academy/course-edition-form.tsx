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
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
} from "@workspace/ui/components/field"
import { RichTextRenderer } from "@/components/editor/rich-text-editor"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

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
import { RichTextEditor } from "@/components/editor/rich-text-editor"

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
    values: isEdit
      ? {
        editionTag: initial?.editionTag ?? "",
        isCurrent: initial?.isCurrent ?? undefined,
        status: initial?.status ?? undefined,
        syllabusSnapshot: initial?.syllabusSnapshot ?? undefined,
        changelog: initial?.changelog ?? undefined,
      }
      : {
        courseProfileId: initial?.courseProfileId ?? "",
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
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Liên kết Course Profile</FieldLegend>
          <FieldDescription>
            Xác định Course Profile mà edition này thuộc về.
          </FieldDescription>
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
                  value={(() => {
                    const profile = (initial as any)?.courseProfile || courseProfiles.find((cp) => cp.id === initial?.courseProfileId)
                    if (!profile) return initial?.courseProfileId || "Đang tải..."
                    return `${profile.code} · ${profile.title}`
                  })()}
                />
              </Field>
            )}
          </FieldGroup>
        </FieldSet>

        <FieldSeparator />

        <FieldSet>
          <FieldLegend>Phiên bản & Trạng thái</FieldLegend>
          <FieldDescription>
            Thiết lập tag phiên bản, trạng thái hiển thị và cấu hình hiện tại.
          </FieldDescription>
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
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Trạng thái</FieldLabel>
                    {isEdit ? (
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                            field.value === "PUBLISHED"
                              ? "bg-primary/10 text-primary"
                              : field.value === "PENDING_APPROVAL"
                                ? "bg-amber-500/10 text-amber-600"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {field.value === "DRAFT" && "Draft (Nháp)"}
                          {field.value === "PENDING_APPROVAL" && "Chờ phê duyệt"}
                          {field.value === "PUBLISHED" && "Published (Công khai)"}
                          {field.value === "ARCHIVED" && "Archived (Lưu trữ)"}
                          {!["DRAFT", "PENDING_APPROVAL", "PUBLISHED", "ARCHIVED"].includes(field.value || "") && field.value}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {field.value === "DRAFT" && "→ Vào trang chi tiết để Gửi phê duyệt"}
                          {field.value === "PENDING_APPROVAL" && "→ Admin phê duyệt hoặc từ chối"}
                          {field.value === "PUBLISHED" && "→ Đã công bố"}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Draft — tạo xong vào trang chi tiết để Gửi phê duyệt</span>
                    )}
                    <FieldDescription>
                      Luồng: DRAFT → Gửi phê duyệt → PENDING_APPROVAL → Admin Approve → PUBLISHED
                    </FieldDescription>
                  </Field>
                )}
              />
            </div>

            <Controller
              name={"isCurrent" as any}
              control={control}
              render={({ field, fieldState }) => (
                <Field orientation="horizontal" className="items-start">
                  <Checkbox
                    id="isCurrent"
                    className="mt-1"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <FieldContent>
                    <FieldLabel htmlFor="isCurrent">Đặt làm phiên bản hiện tại</FieldLabel>
                    <FieldDescription>
                      Nếu bật, đây sẽ là edition mặc định cho Course Profile này.
                    </FieldDescription>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </FieldContent>
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        <FieldSeparator />

        <FieldSet>
          <FieldLegend>Lịch sử thay đổi (Changelog)</FieldLegend>
          <FieldDescription>
            Ghi chú các thay đổi chính trong edition này.
          </FieldDescription>
          <FieldGroup>
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
                        onUpdate={(data: string) => field.onChange(data)}
                      />
                    </TabsContent>
                    <TabsContent value="preview">
                      <div className="border rounded-md bg-muted/20 p-4 min-h-[150px]">
                        <RichTextRenderer content={field.value} />
                      </div>
                    </TabsContent>
                  </Tabs>
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        <FieldSeparator />

        <Field orientation="horizontal" className="justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitting}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
            {isEdit ? "Lưu thay đổi" : "Tạo Course Edition"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}


