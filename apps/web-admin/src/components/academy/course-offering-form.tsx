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
  FieldSeparator,
  FieldSet,
  FieldLegend,
} from "@workspace/ui/components/field"
import { Checkbox } from "@workspace/ui/components/checkbox"
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
  COURSE_OFFERING_METADATA,
} from "@workspace/schemas"
import type { AcademyCourseOffering } from "@/lib/api/services/academy-course-offerings"
import { useAcademyCourseProfiles } from "@/lib/api/services/academy-course-profiles"
import { useAcademyCourseEditions } from "@/lib/api/services/academy-course-editions"
import { useAcademyClasses } from "@/lib/api/services/academy-classes"
import { RichTextEditor } from "@/components/editor/rich-text-editor"
import { Badge } from "@workspace/ui/components/badge"
import { KeyValueEditor } from "./key-value-editor"

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

  const { data: editionsData = [] } = useAcademyCourseEditions({ status: "PUBLISHED" } as any)
  const editions = Array.isArray(editionsData) ? editionsData : (editionsData as any)?.items || []

  const { handleSubmit, control, watch, setError } = useForm<
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
        classIds: initial?.classes?.map((c: any) => c.classId) || [],
        validTo: initial?.validTo
          ? new Date(initial.validTo).toISOString().split("T")[0]
          : undefined,
        metadata: initial?.metadata ?? undefined,
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
        classIds: [],
        validFrom: undefined,
        validTo: undefined,
        metadata: undefined,
      }) as any,
  })

  const selectedProfileId = watch("courseProfileId" as any)
  const selectedEditionId = watch("courseEditionId" as any)
  const offeringStatus = watch("status" as any)

  const { data: classes = [] } = useAcademyClasses({
    courseEditionId: selectedEditionId,
  })
  const filteredEditions = useMemo(() => {
    if (!selectedProfileId) return editions
    return editions.filter((e: any) => e.courseProfileId === selectedProfileId)
  }, [selectedProfileId, editions])

  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit(async (data) => {
        const status = (data as any).status
        const classIds = ((data as any).classIds || []) as string[]
        if ((status === "PUBLISHED" || status === "PENDING_APPROVAL") && classIds.length === 0) {
          setError("classIds" as any, {
            type: "manual",
            message: "Phải chọn ít nhất 1 lớp trước khi gửi phê duyệt/publish offering.",
          })
          return
        }
        console.log("Submitting Offering Data:", data)
        await onSubmit(data)
      })}
      noValidate
    >
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Thông tin định danh</FieldLegend>
          <FieldDescription>
            Xác định mã và tiêu đề cho gói khóa học (Offering).
          </FieldDescription>
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

            <FieldSeparator />

            <Controller
              name={"classIds" as any}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>
                    Lớp học được kèm theo ({field.value?.length || 0})
                    {(offeringStatus === "PUBLISHED" || offeringStatus === "PENDING_APPROVAL") && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                  </FieldLabel>
                  <div className="grid gap-3 sm:grid-cols-2 mt-2 border rounded-md p-4 bg-muted/5">
                    {classes.length === 0 ? (
                      <div className="text-sm text-muted-foreground italic col-span-full">
                        {selectedEditionId
                          ? "Không tìm thấy lớp học nào cho Edition này."
                          : "Vui lòng chọn Edition để xem danh sách lớp."}
                      </div>
                    ) : (
                      classes.map((c: any) => (
                        <div key={c.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={c.id}
                            checked={field.value?.includes(c.id)}
                            onCheckedChange={(checked) => {
                              const current = field.value || []
                              if (checked) {
                                field.onChange([...current, c.id])
                              } else {
                                field.onChange(current.filter((id: string) => id !== c.id))
                              }
                            }}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <label
                              htmlFor={c.id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {c.name}
                            </label>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px] h-4 px-1">
                                {c.code}
                              </Badge>
                              <Badge variant={c.status === 'ENROLLING' ? 'default' : 'secondary'} className="text-[10px] h-4 px-1 uppercase font-bold">
                                {c.status}
                              </Badge>
                              <Badge variant={c.courseEdition?.status === 'PUBLISHED' ? 'default' : 'secondary'} className="text-[10px] h-4 px-1 uppercase font-bold">
                                Edition: {c.courseEdition?.status || "UNKNOWN"}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground uppercase border-l pl-2">
                                {c.mode}
                              </span>

                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <FieldDescription>
                    {(offeringStatus === "PUBLISHED" || offeringStatus === "PENDING_APPROVAL")
                      ? "Bắt buộc chọn ít nhất 1 lớp khi gửi phê duyệt hoặc đang bán."
                      : "Chọn các lớp học sẽ được mở cho học viên mua gói này."}
                  </FieldDescription>
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend>Nội dung & Quyền lợi</FieldLegend>
          <FieldDescription>
            Mô tả chi tiết những gì người học nhận được từ gói này.
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
                        __html: field.value || "<em>Chưa có nội dung.</em>",
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
          <FieldLegend>Giá & Trạng thái</FieldLegend>
          <FieldDescription>Cấu hình chi phí và quyền truy cập gói.</FieldDescription>
          <FieldGroup>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Controller
                name={"originalPrice" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Giá niêm yết (Price)</FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      step={1000}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value || 0))}
                    />
                    <FieldDescription>Được hiển thị là giá chưa giảm.</FieldDescription>
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
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Trạng thái</FieldLabel>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={
                          field.value === "PUBLISHED"
                            ? "default"
                            : field.value === "PENDING_APPROVAL"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {field.value === "DRAFT" && "Draft (Nháp)"}
                        {field.value === "PENDING_APPROVAL" && "Chờ phê duyệt"}
                        {field.value === "PUBLISHED" && "Đang bán"}
                        {field.value === "HIDDEN" && "Ẩn"}
                        {field.value === "ARCHIVED" && "Lưu trữ"}
                        {!["DRAFT", "PENDING_APPROVAL", "PUBLISHED", "HIDDEN", "ARCHIVED"].includes(field.value || "") && field.value}
                      </Badge>
                      {isEdit && field.value === "DRAFT" && (
                        <span className="text-[10px] text-muted-foreground uppercase">
                          Cần gửi phê duyệt
                        </span>
                      )}
                    </div>
                  </Field>
                )}
              />
            </div>

            <FieldSeparator />

            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name={"validFrom" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Ngày bắt đầu bán</FieldLabel>
                    <Input type="date" {...field} />
                    <FieldDescription>
                      Thời điểm gói này bắt đầu được phép đăng ký. Để trống nếu bán ngay.
                    </FieldDescription>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              <Controller
                name={"validTo" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Ngày kết thúc bán</FieldLabel>
                    <Input type="date" {...field} />
                    <FieldDescription>
                      Thời điểm gói này ngừng bán. Để trống nếu bán vĩnh viễn (Evergreen).
                    </FieldDescription>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
            </div>
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend>Hình ảnh & Metadata</FieldLegend>
          <FieldDescription>Các thông tin hiển thị bổ sung cho gói bán này.</FieldDescription>
          <FieldGroup>
            <Controller
              name="metadata"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Cấu hình bổ sung (Metadata)</FieldLabel>
                  <KeyValueEditor
                    value={field.value || {}}
                    onChange={field.onChange}
                    presets={COURSE_OFFERING_METADATA}
                  />
                  <FieldDescription>
                    Giá trị metadata giúp tùy biến trải nghiệm hiển thị tại trang bán hàng.
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
            {isEdit ? "Lưu thay đổi" : "Tạo Offering"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}


