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
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
  ItemActions,
} from "@workspace/ui/components/item"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command"
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
import { PlusIcon, CheckIcon, XIcon } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

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
        classId: initial?.classId ?? initial?.class?.id ?? "",
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
        classId: "",
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
        const classId = ((data as any).classId || "") as string
        if ((status === "PUBLISHED" || status === "PENDING_APPROVAL") && !classId) {
          setError("classId" as any, {
            type: "manual",
            message: "Phải chọn lớp học (classId) trước khi gửi phê duyệt/publish offering.",
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
              name={"classId" as any}
              control={control}
              render={({ field, fieldState }) => {
                const selectedId = field.value as string
                const cls =
                  classes.find((c: any) => c.id === selectedId) ||
                  initial?.class ||
                  null

                return (
                  <Field>
                    <FieldLabel>
                      Lớp học được kèm theo
                      {(offeringStatus === "PUBLISHED" || offeringStatus === "PENDING_APPROVAL") && (
                        <span className="text-destructive ml-1">*</span>
                      )}
                    </FieldLabel>

                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        {selectedId ? (
                          <Item variant="outline" className="group">
                            <ItemMedia>
                              <Badge variant="outline" className="font-mono text-[10px] uppercase">
                                {(cls as any)?.code ?? "CLASS"}
                              </Badge>
                            </ItemMedia>
                            <ItemContent>
                              <ItemTitle className="text-sm">{(cls as any)?.name || (cls as any)?.title}</ItemTitle>
                              <ItemDescription className="text-[10px] uppercase">
                                {(cls as any)?.status} • {(cls as any)?.mode}
                              </ItemDescription>
                            </ItemContent>
                            <ItemActions>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-muted-foreground hover:text-destructive"
                                onClick={(e) => {
                                  e.preventDefault()
                                  field.onChange("")
                                }}
                              >
                                <XIcon className="size-4" />
                              </Button>
                            </ItemActions>
                          </Item>
                        ) : (
                          <div className="border border-dashed rounded-xl py-6 text-center bg-muted/5 font-medium text-xs text-muted-foreground italic">
                            Chưa có lớp học nào được chọn cho gói này.
                          </div>
                        )}
                      </div>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full border-dashed h-10 gap-2"
                            type="button"
                          >
                            <PlusIcon className="size-4" />
                            Chọn lớp học
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-[400px] sm:w-[600px] z-[1002]" align="start">
                          <Command shouldFilter={false}>
                            <CommandInput
                              placeholder="Tìm nhanh mã hoặc tên lớp..."
                              onValueChange={setSearchTerm}
                              value={searchTerm}
                            />
                            <CommandList className="max-h-[300px]">
                              {isLoadingClasses && (
                                <div className="py-6 flex flex-col items-center justify-center gap-2 text-muted-foreground italic text-sm">
                                  <Spinner className="size-4" />
                                  Đang tìm kiếm...
                                </div>
                              )}
                              <CommandEmpty>
                                {!isLoadingClasses && (searchTerm ? "Không tìm thấy lớp học nào." : "Nhập để tìm kiếm...")}
                              </CommandEmpty>
                              <CommandGroup heading="Kết quả tìm kiếm">
                                {classes.map((c: any) => {
                                  const isChecked = selectedId === c.id
                                  return (
                                    <CommandItem
                                      key={c.id}
                                      onSelect={() => field.onChange(c.id)}
                                      className="px-4 py-3 cursor-pointer"
                                    >
                                      <div className="flex items-center gap-3 w-full">
                                        <div className={cn(
                                          "size-4 rounded border flex items-center justify-center transition-colors shrink-0",
                                          isChecked ? "bg-primary border-primary" : "border-muted-foreground/30"
                                        )}>
                                          {isChecked && <CheckIcon className="size-3 text-primary-foreground stroke-[3]" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-mono font-bold bg-muted px-1 rounded uppercase shrink-0">
                                              {c.code}
                                            </span>
                                            <p className="text-sm font-medium truncate">{c.name}</p>
                                          </div>
                                          <p className="text-[10px] text-muted-foreground uppercase mt-0.5">
                                            {c.status} • {c.mode}
                                          </p>
                                        </div>
                                      </div>
                                    </CommandItem>
                                  )
                                })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <FieldDescription>
                      {(offeringStatus === "PUBLISHED" || offeringStatus === "PENDING_APPROVAL")
                        ? "Bắt buộc chọn lớp học khi gửi phê duyệt hoặc đang bán."
                        : "Chọn 1 lớp học cho gói (1 offering = 1 class)."}
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


