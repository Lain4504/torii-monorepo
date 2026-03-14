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
import { useAcademyClasses } from "@/lib/api/services/academy-classes"
import { RichTextEditor } from "@/components/editor/rich-text-editor"
import { Badge } from "@workspace/ui/components/badge"

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
        description: initial?.description ?? undefined,
        price: (initial as any)?.price ?? 0,
        salePrice: (initial as any)?.salePrice ?? undefined,
        currency: initial?.currency ?? "VND",
        status: initial?.status ?? "DRAFT",
        type: (initial as any)?.type ?? "COURSE",
        mode: (initial as any)?.mode ?? "VOD",
        classIds: initial?.classes?.map((c: any) => c.classId) || [],
        metadata: initial?.metadata ?? undefined,
      }
      : {
        code: "",
        title: "",
        description: undefined,
        price: 0,
        salePrice: undefined,
        currency: "VND",
        status: "DRAFT",
        type: "COURSE",
        mode: "VOD",
        classIds: [],
        metadata: undefined,
      }) as any,
  })

  const selectedMode = watch("mode" as any)
  const offeringStatus = watch("status" as any)

  const { data: classesData = [] } = useAcademyClasses(
    selectedMode ? { mode: selectedMode } as any : {} as any,
  )
  const classes = Array.isArray(classesData) ? classesData : (classesData as any)?.items || []

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
                name={"mode" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Chế độ học (Mode)</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn chế độ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VOD">VOD (Video bài giảng)</SelectItem>
                        <SelectItem value="LIVE">LIVE (Học trực tuyến)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldDescription>Quyết định cách thức hiển thị và vận hành của gói.</FieldDescription>
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
                        {selectedMode
                          ? "Không tìm thấy lớp học nào cho chế độ này."
                          : "Vui lòng chọn chế độ học để xem danh sách lớp."}
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
                name={"price" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Giá niêm yết</FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      step={1000}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value || 0))}
                    />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              <Controller
                name={"salePrice" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Giá khuyến mãi (tuỳ chọn)</FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      step={1000}
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
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

            <p className="text-xs text-muted-foreground italic">
              Thời hạn của gói được cấu hình tự động dựa trên các lớp được gán.
            </p>
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


