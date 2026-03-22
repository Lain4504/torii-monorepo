import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { useAcademyCourseProfiles } from "@/lib/api/services/academy-course-profiles"
import { useAcademyLiveTerms } from "@/lib/api/services/academy-classes"
import { RichTextEditor } from "@/components/editor/rich-text-editor"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { CalendarIcon, HelpCircle } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

/** Chuỗi ISO từ API → giá trị cho input datetime-local (giờ địa phương trình duyệt). */
function isoToDatetimeLocalValue(iso: string | null | undefined): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

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

  const { handleSubmit, control, watch, setError, setValue } = useForm<
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
        mode: (initial as any)?.mode ?? "VOD",
        courseProfileId: initial?.courseProfileId ?? "",
        termId: initial?.termId ?? "",
        classId: initial?.classId ?? "",
        validFrom: isoToDatetimeLocalValue(initial?.validFrom ?? undefined),
        validTo: isoToDatetimeLocalValue(initial?.validTo ?? undefined),
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
        mode: "VOD",
        courseProfileId: "",
        termId: "",
        classId: "",
        validFrom: "",
        validTo: "",
        metadata: undefined,
      }) as any,
  })

  const selectedMode = watch("mode" as any)
  const selectedProfileId = watch("courseProfileId" as any)
  const isLive = selectedMode === "LIVE"

  const { data: profiles = [] } = useAcademyCourseProfiles({ status: 'PUBLISHED' })
  const { data: terms = [] } = useAcademyLiveTerms(isLive ? selectedProfileId : undefined)
  const { data: classes = [] } = useAvailableClassesForOffering({
    mode: selectedMode,
    courseProfileId: selectedProfileId,
  })

  useEffect(() => {
    setValue("termId" as any, "")
    setValue("classId" as any, "")
  }, [selectedProfileId, selectedMode, setValue])

  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit(async (data) => {
        const status = (data as any).status
        const classId = (data as any).classId
        const termId = (data as any).termId
        const mode = (data as any).mode
        const courseProfileId =
          (data as any).courseProfileId || (selectedProfileId as any)

        if (!courseProfileId) {
          setError("courseProfileId" as any, {
            type: "manual",
            message: "Phải chọn giáo trình (Course Profile) trước khi tạo gói bán.",
          })
          return
        }

        if (status === "PUBLISHED" || status === "PENDING_APPROVAL") {
          if (mode === "LIVE" && !termId) {
            setError("termId" as any, { type: "manual", message: "Phải chọn Kỳ học trước khi bán." })
            return
          }
          if (mode === "VOD" && !classId) {
            setError("classId" as any, { type: "manual", message: "Phải chọn Lớp học VOD trước khi bán." })
            return
          }
        }
        const payload = { ...(data as any), courseProfileId } as any
        const vf = (payload.validFrom as string | undefined)?.trim()
        const vt = (payload.validTo as string | undefined)?.trim()
        payload.validFrom = vf ? new Date(vf).toISOString() : undefined
        payload.validTo = vt ? new Date(vt).toISOString() : undefined
        await onSubmit(payload)
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
                  <div className="flex items-center gap-1">
                    <FieldLabel className="mb-0">Tiêu đề gói</FieldLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
                          aria-label="Hướng dẫn đặt tên gói bán"
                        >
                          <HelpCircle className="size-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80" align="start">
                        <PopoverHeader>
                          <PopoverTitle>
                            Quy tắc đặt tên hiển thị cho học viên
                          </PopoverTitle>
                          <PopoverDescription className="space-y-2 text-xs leading-relaxed">
                            <span className="block text-popover-foreground">
                              <strong>VOD:</strong> Cổng học viên ưu tiên hiển thị{" "}
                              <strong>tên lớp</strong>. Nên đặt tiêu đề gói trùng
                              hoặc gần tên lớp; nếu khác, hệ thống vẫn hiện tên
                              lớp là chính và tên gói ở dòng phụ.
                            </span>
                            <span className="block text-popover-foreground">
                              <strong>LIVE:</strong> Gói gắn theo{" "}
                              <strong>kỳ học</strong>. Tiêu đề gói nên mô tả
                              kỳ/chương trình; tên từng lớp (ca học, giảng viên)
                              do từng lớp trong kỳ quản lý.
                            </span>
                          </PopoverDescription>
                        </PopoverHeader>
                      </PopoverContent>
                    </Popover>
                  </div>
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
                    <FieldLabel>Giáo trình (Course Profile)</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={(v) => field.onChange(v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn giáo trình" />
                      </SelectTrigger>
                      <SelectContent>
                        {profiles.map((p: any) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.title} ({p.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

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
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
            </div>

            <FieldSeparator />

            {isLive ? (
              <Controller
                name={"termId" as any}
                control={control}
                render={({ field, fieldState }) => {
                  return (
                    <Field>
                      <FieldLabel>Kỳ học (Live Term) <span className="text-destructive">*</span></FieldLabel>
                      <div className="grid gap-3 pt-2">
                        {terms.length === 0 ? (
                          <div className="text-xs text-muted-foreground italic border rounded-lg p-4 bg-muted/5">
                            Giáo trình này chưa có kỳ học nào được tạo. Vui lòng tạo kỳ học tại danh sách Lớp học trước.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {terms.map((t: any) => {
                              const isActive = field.value === t.id
                              return (
                                <div
                                  key={t.id}
                                  onClick={() => field.onChange(t.id)}
                                  className={cn(
                                    "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:bg-muted/10",
                                    isActive ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-muted"
                                  )}
                                >
                                  <div className="shrink-0 pt-0.5">
                                    <div className={cn(
                                      "size-4 rounded-full border flex items-center justify-center transition-colors",
                                      isActive ? "bg-primary border-primary" : "border-muted-foreground/30"
                                    )}>
                                      {isActive && <div className="size-1.5 rounded-full bg-primary-foreground" />}
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-bold truncate">{t.termCode}</p>
                                      <Badge variant="outline" className="text-[10px] uppercase h-4 px-1">
                                        {t.status}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-1">
                                      <CalendarIcon className="size-3" />
                                      {new Date(t.openingDate).toLocaleDateString("vi-VN")} - {new Date(t.closingDate).toLocaleDateString("vi-VN")}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )
                }}
              />
            ) : (
              <Controller
                name={"classId" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Lớp học VOD (BluePrint) <span className="text-destructive">*</span></FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn lớp blueprint" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.filter((c: any) => c.mode === "VOD").map((c: any) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name} ({c.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>Đối với VOD, gói bán cần được gắn trực tiếp vào 1 lớp blueprint.</FieldDescription>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
            )}
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
                  <TabsList className="mb-4 overflow-x-auto whitespace-nowrap">
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name={"validFrom" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Bắt đầu mở bán (Marketing)</FieldLabel>
                    <Input
                      type="datetime-local"
                      {...field}
                      value={field.value || ""}
                    />
                    <FieldDescription>Gói sẽ tự động hiển thị từ thời điểm này.</FieldDescription>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              <Controller
                name={"validTo" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Kết thúc mở bán (Marketing)</FieldLabel>
                    <Input
                      type="datetime-local"
                      {...field}
                      value={field.value || ""}
                    />
                    <FieldDescription>Gói sẽ tự động ẩn sau thời điểm này.</FieldDescription>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
            </div>

            <FieldSeparator />

            <p className="text-[10px] text-muted-foreground italic leading-relaxed">
              <strong>Lưu ý:</strong> "Thời gian mở bán" kiểm soát bộ lọc của cửa hàng. Đối với các lớp 
              LIVE, học viên <strong>vẫn phải tuân thủ</strong> hạn đăng ký của Kỳ học (Term) đi kèm.
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


