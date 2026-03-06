import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMemo } from "react"
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@workspace/ui/components/combobox"
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
import { Spinner } from "@workspace/ui/components/spinner"
import {
  academyCourseOfferingCreateDTOSchema,
  academyCourseOfferingUpdateDTOSchema,
  type AcademyCourseOfferingCreateDTO,
  type AcademyCourseOfferingUpdateDTO,
} from "@workspace/schemas"
import type { AcademyCourseOffering } from "@/lib/api/services/academy-course-offerings"
import { useAcademyCourseProfiles } from "@/lib/api/services/academy-course-profiles"
import { useAcademyCourseEditions } from "@/lib/api/services/academy-course-editions"
import { RichTextEditor, type EditorJsData } from "@/components/editor/rich-text-editor"

export function CourseOfferingForm({
  mode,
  initial,
  onSubmit,
  onCancel,
  submitting,
}: {
  mode: "create" | "edit"
  initial?: AcademyCourseOffering
  onSubmit: (
    data: AcademyCourseOfferingCreateDTO | AcademyCourseOfferingUpdateDTO
  ) => Promise<void>
  onCancel: () => void
  submitting?: boolean
}) {
  const isEdit = mode === "edit"
  const { data: profilesData = [] } = useAcademyCourseProfiles({})
  const profiles = Array.isArray(profilesData) ? profilesData : (profilesData as any)?.items || []

  const { data: editionsData = [] } = useAcademyCourseEditions({})
  const editions = Array.isArray(editionsData) ? editionsData : (editionsData as any)?.items || []

  const { handleSubmit, control, watch } = useForm<
    AcademyCourseOfferingCreateDTO | AcademyCourseOfferingUpdateDTO
  >({
    resolver: zodResolver(
      (isEdit
        ? academyCourseOfferingUpdateDTOSchema
        : academyCourseOfferingCreateDTOSchema) as any
    ) as any,
    defaultValues: (isEdit
      ? {
        title: initial?.title ?? "",
        courseProfileId: (initial as any)?.courseProfileId ?? undefined,
        courseEditionId: (initial as any)?.courseEditionId ?? undefined,
        description: initial?.description ?? undefined,
        originalPrice: (initial as any)?.originalPrice ?? (initial as any)?.price ?? 0,
        currency: initial?.currency ?? "VND",
        status: initial?.status ?? "DRAFT",
        type: (initial as any)?.type ?? "COURSE",
      }
      : {
        code: "",
        title: "",
        courseProfileId: undefined,
        courseEditionId: undefined,
        description: undefined,
        originalPrice: 0,
        currency: "VND",
        status: "DRAFT",
        type: "COURSE",
      }) as any,
  })

  const selectedProfileId = watch("courseProfileId" as any)
  const filteredEditions = useMemo(() => {
    if (!selectedProfileId) return editions
    return editions.filter((e: any) => e.courseProfileId === selectedProfileId)
  }, [selectedProfileId, editions])

  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit(async (data) => {
        console.log("Submitting Offering Data:", data)
        await onSubmit(data)
      })}
      noValidate
    >
      <Card>
        <CardHeader>
          <CardTitle>Thông tin định danh</CardTitle>
          <CardDescription>
            Xác định mã và tiêu đề cho gói khóa học (Offering).
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
                    <FieldLabel>Mã gói (code)</FieldLabel>
                    <Input placeholder="JLPT_N5_LIVE_2026" {...field} />
                    <FieldDescription>
                      Mã duy nhất dùng để nhận diện gói bán (vd:
                      JLPT_N5_COMBINED).
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
                  <FieldLabel>Tiêu đề gói</FieldLabel>
                  <Input placeholder="JLPT N5 - Live + VOD 2026" {...field} />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name={"courseProfileId" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Course Profile (Link)</FieldLabel>
                    <Combobox
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <ComboboxInput placeholder="Tìm Profile..." />
                      <ComboboxContent>
                        <ComboboxList>
                          {profiles.map((p: any) => (
                            <ComboboxItem key={p.id} value={p.id}>
                              {p.title} ({p.code})
                            </ComboboxItem>
                          ))}
                        </ComboboxList>
                        <ComboboxEmpty>Không tìm thấy Profile nào.</ComboboxEmpty>
                      </ComboboxContent>
                    </Combobox>
                    <FieldDescription>Liên kết gói bán với một Course Profile.</FieldDescription>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              <Controller
                name={"courseEditionId" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Course Edition (Link)</FieldLabel>
                    <Combobox
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!selectedProfileId}
                    >
                      <ComboboxInput
                        placeholder={selectedProfileId ? "Tìm Edition..." : "Chọn Profile trước..."}
                      />
                      <ComboboxContent>
                        <ComboboxList>
                          {filteredEditions.map((e: any) => (
                            <ComboboxItem key={e.id} value={e.id}>
                              {e.editionTag} ({e.status})
                            </ComboboxItem>
                          ))}
                        </ComboboxList>
                        <ComboboxEmpty>Không tìm thấy Edition nào.</ComboboxEmpty>
                      </ComboboxContent>
                    </Combobox>
                    <FieldDescription>Gói này sẽ cấp quyền truy cập vào Edition này.</FieldDescription>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nội dung & Quyền lợi</CardTitle>
          <CardDescription>
            Mô tả chi tiết những gì người học nhận được từ gói này.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Controller
            name={"description" as any}
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

      <Card>
        <CardHeader>
          <CardTitle>Giá & Trạng thái</CardTitle>
          <CardDescription>Cấu hình chi phí và quyền truy cập gói.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Controller
              name={"originalPrice" as any}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Giá gốc</FieldLabel>
                  <Input
                    type="number"
                    min={0}
                    step={1000}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value || 0))}
                  />
                  <FieldDescription>Đơn vị tính theo tiền tệ.</FieldDescription>
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />

            <Controller
              name={"currency" as any}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Tiền tệ</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn đơn vị" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VND">VND</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />

            <Controller
              name={"type" as any}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Loại gói</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COURSE">Khóa học đơn lẻ</SelectItem>
                      <SelectItem value="BUNDLE">Combo (Bundle)</SelectItem>
                      <SelectItem value="SUBSCRIPTION">Thuê bao (Sub)</SelectItem>
                    </SelectContent>
                  </Select>
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
                      <SelectItem value="ACTIVE">Active (Đang bán)</SelectItem>
                      <SelectItem value="HIDDEN">Hidden (Ẩn)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
          </div>
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
          {isEdit ? "Lưu thay đổi" : "Tạo Course Offering"}
        </Button>
      </div>
    </form>
  )
}


