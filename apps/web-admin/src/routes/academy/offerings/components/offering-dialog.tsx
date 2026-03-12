import { useEffect } from "react"
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
import { Loader2, Check } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

const offeringSchema = z.object({
  code: z.string().min(1, "Mã gói không được để trống"),
  title: z.string().min(1, "Tiêu đề không được để trống"),
  description: z.string().optional().nullable(),
  originalPrice: z.coerce.number().min(0, "Giá không được nhỏ hơn 0"),
  currency: z.string().min(1, "Vui lòng nhập tiền tệ"),
  validFrom: z.string().optional().nullable(),
  validTo: z.string().optional().nullable(),
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
      originalPrice: 0,
      currency: "VND",
      validFrom: null,
      validTo: null,
      classIds: [],
    },
  })

  const selectedClassIds = watch("classIds")

  useEffect(() => {
    if (offering) {
      const priceVal = Number(offering.originalPrice ?? offering.price ?? 0)
      reset({
        code: offering.code,
        title: offering.title,
        description: offering.description || "",
        originalPrice: priceVal,
        currency: offering.currency || "VND",
        validFrom: offering.validFrom ? new Date(offering.validFrom).toISOString().split("T")[0] : null,
        validTo: offering.validTo ? new Date(offering.validTo).toISOString().split("T")[0] : null,
        classIds: offering.classes?.map((c: { id: string }) => c.id) ?? [],
      })
    } else {
      reset({
        code: "",
        title: "",
        description: "",
        originalPrice: 0,
        currency: "VND",
        validFrom: null,
        validTo: null,
        classIds: [],
      })
    }
  }, [offering, reset])

  async function onSubmit(values: OfferingFormValues) {
    try {
      const payload = {
        ...values,
        validFrom: values.validFrom ? new Date(values.validFrom) : undefined,
        validTo: values.validTo ? new Date(values.validTo) : undefined,
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
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>{isEditing ? "Chỉnh sửa Gói bán" : "Tạo Gói bán mới"}</DialogTitle>
          <DialogDescription>
            Cấu hình sản phẩm thương mại, giá bán và các quyền lợi đi kèm.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1">
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
                  <FieldLegend>Giá & Thời hạn</FieldLegend>
                  <FieldGroup>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel>Giá bán ({watch("currency")})</FieldLabel>
                        <Controller
                          name="originalPrice"
                          control={control}
                          render={({ field }) => (
                            <Input type="number" {...field} />
                          )}
                        />
                        <FieldError errors={[errors.originalPrice]} />
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
                        <FieldLabel>Ngày bắt đầu bán</FieldLabel>
                        <Controller
                          name="validFrom"
                          control={control}
                          render={({ field }) => (
                            <Input type="date" value={field.value ?? ""} onChange={field.onChange} />
                          )}
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Ngày kết thúc bán</FieldLabel>
                        <Controller
                          name="validTo"
                          control={control}
                          render={({ field }) => (
                            <Input type="date" value={field.value ?? ""} onChange={field.onChange} />
                          )}
                        />
                      </Field>
                    </div>
                  </FieldGroup>
                </FieldSet>

                <FieldSet>
                  <FieldLegend>Lớp học liên kết</FieldLegend>
                  <FieldDescription>
                    Chọn các lớp học (LIVE/VOD) sẽ được kích hoạt khi mua gói này.
                  </FieldDescription>
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {classes?.map((cls) => (
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
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{cls.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {cls.code} • {cls.mode}
                          </span>
                        </div>
                        {selectedClassIds.includes(cls.id) && (
                          <div className="size-5 bg-primary rounded-full flex items-center justify-center">
                            <Check className="size-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    ))}
                    {!classes?.length && (
                      <div className="text-sm text-muted-foreground italic">
                        Không có lớp học nào khả dụng.
                      </div>
                    )}
                  </div>
                </FieldSet>
              </FieldGroup>
            </form>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t gap-2 bg-muted/20">
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
