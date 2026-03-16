import { useState } from "react"
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
import {
  useAvailableClassesForOffering,
  type AcademyCourseOffering,
} from "@/lib/api/services/academy-course-offerings"
import { RichTextEditor } from "@/components/editor/rich-text-editor"
import { Badge } from "@workspace/ui/components/badge"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { SearchIcon, XIcon } from "lucide-react"

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
  const [searchTerm, setSearchTerm] = useState("")

  const { data: classes = [], isLoading: isLoadingClasses } = useAvailableClassesForOffering({
    mode: selectedMode,
    q: searchTerm,
  })

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
              render={({ field, fieldState }) => {
                const count = field.value?.length || 0
                const selectedIds = field.value || []

                return (
                  <Field>
                    <FieldLabel>
                      Lớp học được kèm theo ({count})
                      {(offeringStatus === "PUBLISHED" || offeringStatus === "PENDING_APPROVAL") && (
                        <span className="text-destructive ml-1">*</span>
                      )}
                    </FieldLabel>

                    <div className="space-y-4">
                      {/* Search Input */}
                      <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          placeholder="Tìm nhanh theo mã hoặc tên lớp..."
                          className="pl-9 h-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 size-8 hover:bg-transparent"
                            onClick={() => setSearchTerm("")}
                          >
                            <XIcon className="size-4 text-muted-foreground" />
                          </Button>
                        )}
                      </div>

                      {/* Results Grid - responsive 1 to 3 columns */}
                      <div className="border rounded-lg bg-card overflow-hidden">
                        <div className="max-h-[400px] overflow-y-auto p-3">
                          {isLoadingClasses && (
                            <div className="p-8 text-center text-sm text-muted-foreground italic flex flex-col items-center gap-2">
                              <Spinner className="size-4" />
                              Đang tải danh sách lớp...
                            </div>
                          )}

                          {!isLoadingClasses && classes.length === 0 && (
                            <div className="p-8 text-center text-sm text-muted-foreground italic">
                              {searchTerm
                                ? "Không tìm thấy kết quả phù hợp."
                                : selectedMode
                                  ? "Nhập từ khóa hoặc mã lớp để tìm kiếm."
                                  : "Vui lòng chọn chế độ học trước."}
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {classes.map((c: any) => {
                              const isChecked = selectedIds.includes(c.id)
                              return (
                                <div
                                  key={c.id}
                                  className={`relative flex flex-col gap-2 p-3 rounded-md border transition-all cursor-pointer group ${
                                    isChecked 
                                      ? "border-primary bg-primary/5 ring-1 ring-primary" 
                                      : "hover:border-primary/50 hover:bg-muted/50"
                                  }`}
                                  onClick={() => {
                                    if (isChecked) {
                                      field.onChange(selectedIds.filter((id: string) => id !== c.id))
                                    } else {
                                      field.onChange([...selectedIds, c.id])
                                    }
                                  }}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <span className={`text-xs font-bold truncate px-1.5 py-0.5 rounded bg-muted border ${isChecked ? "text-primary border-primary/30" : "text-muted-foreground"}`}>
                                      {c.code}
                                    </span>
                                    <Checkbox
                                      checked={isChecked}
                                      className="size-4 pointer-events-none"
                                    />
                                  </div>
                                  
                                  <div className="min-w-0 flex-1">
                                    <p className={`text-sm font-medium leading-tight line-clamp-2 ${isChecked ? "text-primary" : ""}`}>
                                      {c.name}
                                    </p>
                                  </div>

                                  <div className="mt-auto pt-2 flex items-center justify-between border-t border-dashed">
                                     <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                                      <span className={`size-1.5 rounded-full ${
                                        c.status === 'ENROLLING' ? 'bg-green-500' : 'bg-muted-foreground'
                                      }`} />
                                      {c.status}
                                    </span>
                                    <Badge variant="outline" className="text-[9px] h-3.5 px-1 uppercase opacity-70">
                                      {c.mode}
                                    </Badge>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Summary Footer */}
                        {count > 0 && (
                          <div className="px-4 py-2 bg-muted/30 border-t flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-primary uppercase tracking-tight">
                                Đã chọn {count} lớp
                              </span>
                              <div className="flex -space-x-2 overflow-hidden">
                                {selectedIds.slice(0, 3).map((id: string) => (
                                  <div key={id} className="inline-block size-5 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold">
                                    L
                                  </div>
                                ))}
                                {count > 3 && (
                                  <div className="flex size-5 items-center justify-center rounded-full border-2 border-background bg-muted text-[8px] font-bold">
                                    +{count - 3}
                                  </div>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-[11px] text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={(e) => {
                                e.stopPropagation()
                                field.onChange([])
                              }}
                            >
                              Bỏ chọn hết
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <FieldDescription>
                      {(offeringStatus === "PUBLISHED" || offeringStatus === "PENDING_APPROVAL")
                        ? "Bắt buộc chọn ít nhất 1 lớp khi gửi phê duyệt hoặc đang bán."
                        : "Sử dụng ô tìm kiếm và chọn các lớp học tương ứng ở danh sách trên."}
                    </FieldDescription>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )
              }}
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


