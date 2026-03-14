import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@workspace/ui/components/dialog"
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
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import {
  useCreateAcademyCourseOffering,
  useUpdateAcademyCourseOffering,
  type AcademyCourseOffering,
} from "@/lib/api/services/academy-course-offerings"
import { useAcademyClasses } from "@/lib/api/services/academy-classes"
import { toast } from "sonner"
import { Loader2, Check, Search } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

const offeringSchema = z.object({
  code: z.string().min(1, "Mã gói không được để trống"),
  title: z.string().min(1, "Tiêu đề không được để trống"),
  description: z.string().optional().nullable(),
  price: z.coerce.number().min(0, "Giá không được nhỏ hơn 0"),
  salePrice: z.coerce.number().min(0, "Giá khuyến mãi không được nhỏ hơn 0").optional().nullable(),
  currency: z.string().min(1, "Vui lòng nhập tiền tệ"),
  mode: z.string().min(1, "Vui lòng chọn loại hình"),
  syllabusId: z.string().uuid().optional().nullable(),
  status: z.string().optional(),
  type: z.string().optional(),
  classIds: z.array(z.string().uuid()),
})

type OfferingFormValues = z.infer<typeof offeringSchema>

interface OfferingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  offering?: AcademyCourseOffering | null
}

export function OfferingDialog({ open, onOpenChange, offering }: OfferingDialogProps) {
  const isEditing = !!offering
  const createMutation = useCreateAcademyCourseOffering()
  const updateMutation = useUpdateAcademyCourseOffering()

  const { data: classes } = useAcademyClasses({ status: "PUBLISHED" })

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
      syllabusId: null,
      status: "DRAFT",
      type: "COURSE",
      classIds: [],
    },
  })

  const selectedClassIds = watch("classIds")

  const filteredClasses = classes?.filter(c => 
    c.name.toLowerCase().includes(classSearch.toLowerCase()) || 
    c.code.toLowerCase().includes(classSearch.toLowerCase())
  )

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
        syllabusId: (offering as any).syllabusId || null,
        status: offering.status || "DRAFT",
        type: (offering as any).type || "COURSE",
        classIds: offering.classes?.map((c: { classId?: string; id: string }) => c.classId ?? c.id) ?? [],
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
        syllabusId: null,
        status: "DRAFT",
        type: "COURSE",
        classIds: [],
      })
    }
  }, [offering, reset])

  async function onSubmit(values: OfferingFormValues) {
    try {
      const payload = {
        ...values,
        salePrice: values.salePrice == null || Number.isNaN(values.salePrice) ? undefined : values.salePrice,
        syllabusId: values.syllabusId || undefined,
      }

      if (isEditing && offering) {
        await updateMutation.mutateAsync({
          id: offering.id,
          input: payload as any,
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

  const toggleClass = (classId: string) => {
    const current = [...selectedClassIds]
    const index = current.indexOf(classId)
    if (index > -1) {
      current.splice(index, 1)
    } else {
      current.push(classId)
    }
    setValue("classIds", current)
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle>{isEditing ? "Chỉnh sửa Gói bán" : "Tạo Gói bán mới"}</DialogTitle>
          <DialogDescription>
            Cấu hình sản phẩm thương mại, giá bán và các quyền lợi đi kèm.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6">
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
                            <Input {...field} />
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
                             <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn loại hình" />
                                </SelectTrigger>
                                <SelectContent>
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
                    Tìm kiếm và chọn các lớp học sẽ được kích hoạt khi mua gói này.
                  </FieldDescription>
                  
                  <div className="space-y-4 pt-2">
                    <div className="relative">
                       <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                       <Input 
                        placeholder="Tìm lớp học theo tên hoặc mã..." 
                        className="pl-9"
                        value={classSearch}
                        onChange={(e) => setClassSearch(e.target.value)}
                       />
                    </div>

                    <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2">
                      {/* Hiển thị các lớp đã chọn trước */}
                      {selectedClassIds.length > 0 && !classSearch && (
                        <div className="space-y-2">
                           <p className="text-xs font-bold text-muted-foreground uppercase">Đã chọn ({selectedClassIds.length})</p>
                           {classes?.filter(c => selectedClassIds.includes(c.id)).map((cls) => (
                             <div
                                key={cls.id}
                                className="flex items-center justify-between p-3 rounded-lg border border-primary bg-primary/5 ring-1 ring-primary transition-all cursor-pointer"
                                onClick={() => toggleClass(cls.id)}
                              >
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{cls.name}</span>
                                    <Badge variant="outline" className={cn(
                                      "text-[10px] h-4 px-1 uppercase",
                                      cls.mode === 'LIVE' ? "border-green-500/50 text-green-600 bg-green-50" : "border-blue-500/50 text-blue-600 bg-blue-50"
                                    )}>
                                      {cls.mode}
                                    </Badge>
                                  </div>
                                  <span className="text-xs text-muted-foreground font-mono">
                                    {cls.code}
                                  </span>
                                </div>
                                <div className="size-5 bg-primary rounded-full flex items-center justify-center">
                                  <Check className="size-3 text-primary-foreground" />
                                </div>
                              </div>
                           ))}
                           <div className="h-px bg-muted my-2" />
                        </div>
                      )}

                      {/* Hiển thị kết quả tìm kiếm */}
                      {classSearch && filteredClasses?.map((cls) => (
                        <div
                          key={cls.id}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer hover:border-primary/50",
                            selectedClassIds.includes(cls.id)
                              ? "border-primary bg-primary/5 ring-1 ring-primary"
                              : "border-muted"
                          )}
                          onClick={() => toggleClass(cls.id)}
                        >
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{cls.name}</span>
                              <Badge variant="outline" className={cn(
                                "text-[10px] h-4 px-1 uppercase",
                                cls.mode === 'LIVE' ? "border-green-500/50 text-green-600 bg-green-50" : "border-blue-500/50 text-blue-600 bg-blue-50"
                              )}>
                                {cls.mode}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground font-mono">
                              {cls.code}
                            </span>
                          </div>
                          {selectedClassIds.includes(cls.id) && (
                            <div className="size-5 bg-primary rounded-full flex items-center justify-center">
                              <Check className="size-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                      ))}

                      {classSearch && !filteredClasses?.length && (
                        <div className="text-sm text-center py-8 text-muted-foreground italic">
                          Không tìm thấy lớp học nào khớp với từ khóa.
                        </div>
                      )}

                      {!classSearch && selectedClassIds.length === 0 && (
                        <div className="text-sm text-center py-8 text-muted-foreground italic">
                          Nhập tên hoặc mã lớp để tìm kiếm và thêm vào gói.
                        </div>
                      )}
                    </div>
                  </div>
                </FieldSet>
              </FieldGroup>
            </form>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t gap-2 bg-muted/20 shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Hủy
          </Button>
          <Button type="submit" form="offering-form" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Lưu thay đổi" : "Tạo Gói bán"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
