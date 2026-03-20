import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@workspace/ui/components/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldSet,
  FieldLegend,
  FieldDescription,
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
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import {
  useCreateAcademyCourseOffering,
  useUpdateAcademyCourseOffering,
  useAvailableClassesForOffering,
  type AcademyCourseOffering,
} from "@/lib/api/services/academy-course-offerings"
import { toast } from "sonner"
import { Loader2, Check, X, Plus } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { Spinner } from "@workspace/ui/components/spinner"

const offeringSchema = z.object({
  code: z.string().min(1, "Mã gói không được để trống"),
  title: z.string().min(1, "Tiêu đề không được để trống"),
  description: z.string().optional().nullable(),
  price: z.coerce.number().min(0, "Giá không được nhỏ hơn 0"),
  salePrice: z.coerce.number().min(0, "Giá khuyến mãi không được nhỏ hơn 0").optional().nullable(),
  currency: z.string().min(1, "Vui lòng nhập tiền tệ"),
  mode: z.string().min(1, "Vui lòng chọn loại hình"),
  status: z.string().optional(),
  type: z.string().optional(),
  classId: z.string().uuid(),
})

type OfferingFormValues = z.infer<typeof offeringSchema>

interface OfferingSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  offering?: AcademyCourseOffering | null
}

export function OfferingSheet({ open, onOpenChange, offering }: OfferingSheetProps) {
  const isEditing = !!offering
  const createMutation = useCreateAcademyCourseOffering()
  const updateMutation = useUpdateAcademyCourseOffering()

  const [classSearch, setClassSearch] = useState("")

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OfferingFormValues>({
    resolver: zodResolver(offeringSchema),
    defaultValues: {
      code: "",
      title: "",
      description: "",
      price: 0,
      salePrice: null,
      currency: "VND",
      mode: "LIVE",
      status: "DRAFT",
      type: "COURSE",
      classId: "",
    },
  })

  const selectedClassId = watch("classId")
  const selectedMode = watch("mode")

  // VOD: PUBLISHED, LIVE: OPENING (đang tuyển sinh) / ONGOING (đang học) – theo live-class-commerce-spec
  const { data: classes = [], isLoading: isLoadingClasses } = useAvailableClassesForOffering({
    mode: selectedMode,
    q: classSearch,
  })

  useEffect(() => {
    if (offering) {
      const priceVal = Number((offering as any).price ?? 0)
      const salePriceVal = (offering as any).salePrice != null ? Number((offering as any).salePrice) : null
      reset({
        code: offering.code,
        title: offering.title,
        description: offering.description || "",
        price: priceVal,
        salePrice: salePriceVal,
        currency: offering.currency || "VND",
        mode: (offering as any).mode || "LIVE",
        status: offering.status || "DRAFT",
        type: (offering as any).type || "COURSE",
        classId: offering.classId ?? offering.class?.id ?? "",
      })
    } else {
      reset({
        code: "",
        title: "",
        description: "",
        price: 0,
        salePrice: null,
        currency: "VND",
        mode: "LIVE",
        status: "DRAFT",
        type: "COURSE",
        classId: "",
      })
    }
  }, [offering, reset])

  async function onSubmit(values: OfferingFormValues) {
    try {
      const payload = {
        ...values,
        salePrice: values.salePrice == null || Number.isNaN(values.salePrice) ? undefined : values.salePrice,
      }

      if (isEditing && offering) {
        const { code: _code, classId: _classId, mode: _mode, type: _type, currency: _currency, ...updateInput } = payload
        await updateMutation.mutateAsync({
          id: offering.id,
          // Backend update endpoint currently ignores classId/mode/currency.
          // We omit them here to fully respect the "no legacy / no class change" flow.
          input: updateInput as any,
        })
        toast.success("Cập nhật Gói bán thành công")
      } else {
        await createMutation.mutateAsync(payload as any)
        toast.success("Tạo Gói bán thành công")
      }
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || "Đã xảy ra lỗi")
    }
  }

  const setClass = (classId: string) => setValue("classId", classId)

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="!w-full sm:!max-w-[800px] flex flex-col h-full p-0 overflow-hidden">
        <SheetHeader className="px-6 py-4 border-b shrink-0">
          <SheetTitle>{isEditing ? "Chỉnh sửa Gói bán" : "Tạo Gói bán mới"}</SheetTitle>
          <SheetDescription>
            Cấu hình sản phẩm thương mại, giá bán và các quyền lợi đi kèm.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-6 p-6">
            <form id="offering-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <FieldGroup>
                <FieldSet>
                  <FieldLegend>Thông tin gói bán</FieldLegend>
                  <FieldGroup>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel>Mã gói (SKU)</FieldLabel>
                        <Controller
                          name="code"
                          control={control}
                          render={({ field }) => (
                            <Input placeholder="VD: N5-COMBO-2024" {...field} disabled={isEditing} />
                          )}
                        />
                        <FieldError errors={[errors.code]} />
                      </Field>
                      <Field>
                        <FieldLabel>Tiêu đề hiển thị</FieldLabel>
                        <Controller
                          name="title"
                          control={control}
                          render={({ field }) => (
                            <Input placeholder="VD: Gói N5 Cấp tốc + Tài liệu" {...field} />
                          )}
                        />
                        <FieldError errors={[errors.title]} />
                      </Field>
                    </div>

                    <Field>
                      <FieldLabel>Mô tả ngắn</FieldLabel>
                      <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                          <Textarea
                            placeholder="Mô tả các quyền lợi, nội dung bao gồm trong gói này..."
                            className="min-h-[80px]"
                            {...field}
                            value={field.value ?? ""}
                          />
                        )}
                      />
                    </Field>
                  </FieldGroup>
                </FieldSet>

                <FieldSet>
                  <FieldLegend>Giá & cấu hình</FieldLegend>
                  <FieldGroup>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel>Giá bán ({watch("currency")})</FieldLabel>
                        <Controller
                          name="price"
                          control={control}
                          render={({ field }) => (
                            <Input type="number" min={0} {...field} />
                          )}
                        />
                        <FieldError errors={[errors.price]} />
                      </Field>
                      <Field>
                        <FieldLabel>Tiền tệ</FieldLabel>
                        <Controller
                          name="currency"
                          control={control}
                          render={({ field }) => (
                            <Input {...field} disabled={isEditing} />
                          )}
                        />
                        <FieldError errors={[errors.currency]} />
                      </Field>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel>Giá khuyến mãi ({watch("currency")})</FieldLabel>
                        <Controller
                          name="salePrice"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="number"
                              min={0}
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(e.target.value === "" ? null : Number(e.target.value))
                              }
                            />
                          )}
                        />
                        <FieldError errors={[errors.salePrice]} />
                      </Field>
                      <Field>
                        <FieldLabel>Loại hình</FieldLabel>
                        <Controller
                          name="mode"
                          control={control}
                          render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange} disabled={isEditing}>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn loại hình" />
                          </SelectTrigger>
                          <SelectContent className="z-[1001]">
                            <SelectItem value="LIVE">Lớp trực tiếp (LIVE)</SelectItem>
                            <SelectItem value="VOD">Khóa học Video (VOD)</SelectItem>
                          </SelectContent>
                        </Select>
                          )}
                        />
                        <FieldError errors={[errors.mode]} />
                      </Field>
                    </div>
                  </FieldGroup>
                </FieldSet>

                <FieldSet>
                  <FieldLegend>Lớp học liên kết</FieldLegend>
                  <FieldDescription>
                    Các lớp học sẽ được kích hoạt khi học viên mua gói này.
                  </FieldDescription>

                  <div className="space-y-4 pt-4">
                    {/* Selected Class */}
                    <div className="space-y-2">
                      {selectedClassId ? (
                        (() => {
                          const cls = classes.find((c: any) => c.id === selectedClassId) || offering?.class
                          return (
                            <Item variant="outline" className="group">
                              <ItemMedia>
                                <Badge variant="outline" className="font-mono text-[10px] uppercase">
                                  {(cls as any)?.code || "CLASS"}
                                </Badge>
                              </ItemMedia>
                              <ItemContent>
                                <ItemTitle className="text-sm">{(cls as any)?.name || (cls as any)?.title}</ItemTitle>
                                <ItemDescription className="text-[10px] uppercase">
                                  {(cls as any)?.status} • {(cls as any)?.mode}
                                </ItemDescription>
                              </ItemContent>
                              <ItemActions>
                                {!isEditing && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-2 border-red-500/30 text-red-600 bg-transparent hover:bg-red-50 hover:text-red-600"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      setClass("")
                                    }}
                                  >
                                    <X className="size-4" />
                                    <span>Bỏ chọn</span>
                                  </Button>
                                )}
                              </ItemActions>
                            </Item>
                          )
                        })()
                      ) : (
                        <div className="border border-dashed rounded-xl py-8 text-center bg-muted/5 font-medium text-muted-foreground italic">
                          Chưa có lớp học nào được chọn.
                        </div>
                      )}
                    </div>

                    {/* Add Class Button with Popover Search */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full border-dashed h-10 gap-2"
                          disabled={isEditing}
                        >
                          <Plus className="size-4" />
                          Thêm lớp học vào gói
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 w-[400px] sm:w-[600px] z-[1002]" align="start">
                        <Command shouldFilter={false}>
                          <CommandInput 
                            placeholder="Tìm kiếm lớp học..." 
                            onValueChange={setClassSearch}
                            value={classSearch}
                          />
                          <CommandList className="max-h-[300px]">
                            {isLoadingClasses && (
                              <div className="py-6 flex flex-col items-center justify-center gap-2 text-muted-foreground italic text-sm">
                                <Spinner className="size-4" />
                                Đang tìm kiếm...
                              </div>
                            )}
                            <CommandEmpty>
                              {!isLoadingClasses && (classSearch ? "Không tìm thấy lớp học nào." : "Nhập để tìm kiếm...")}
                            </CommandEmpty>
                            <CommandGroup heading="Kết quả tìm kiếm">
                              {classes.map((cls: any) => {
                                const isChecked = selectedClassId === cls.id
                                return (
                                  <CommandItem
                                    key={cls.id}
                                    onSelect={() => setClass(cls.id)}
                                    className="px-4 py-3 cursor-pointer"
                                  >
                                    <div className="flex items-center gap-3 w-full">
                                      <div className={cn(
                                        "size-4 rounded border flex items-center justify-center transition-colors shrink-0",
                                        isChecked ? "bg-primary border-primary" : "border-muted-foreground/30"
                                      )}>
                                        {isChecked && <Check className="size-3 text-primary-foreground stroke-[3]" />}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className="text-[10px] font-mono font-bold bg-muted px-1 rounded uppercase shrink-0">
                                            {cls.code}
                                          </span>
                                          <p className="text-sm font-medium truncate">{cls.name}</p>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground uppercase mt-0.5">
                                          {cls.status} • {cls.mode}
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
                </FieldSet>
              </FieldGroup>
            </form>
          </div>
        </ScrollArea>

        <SheetFooter className="px-6 py-4 border-t gap-2 bg-muted/20 shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Hủy
          </Button>
          <Button type="submit" form="offering-form" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Lưu thay đổi" : "Tạo Gói bán"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
