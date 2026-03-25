import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
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
  useCreateAcademyCohort,
  useUpdateAcademyCohort,
  type AcademyCohort,
} from "@/lib/api/services/academy-cohorts"
import { useAcademyCourseProfiles } from "@/lib/api/services/academy-course-profiles"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const cohortSchema = z.object({
  courseProfileId: z.string().uuid("Vui lòng chọn Course Profile"),
  code: z.string().min(2, "Mã khóa học phải có ít nhất 2 ký tự"),
  name: z.string().min(3, "Tên khóa học phải có ít nhất 3 ký tự"),
  price: z.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
  discountPrice: z.number().min(0, "Giá giảm phải lớn hơn hoặc bằng 0").optional().nullable(),
  status: z.string().optional(),
  enrollmentOpenAt: z.string().optional().nullable(),
  enrollmentCloseAt: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
}).refine((data) => {
  if (data.enrollmentCloseAt && data.startDate) {
    return new Date(data.enrollmentCloseAt) < new Date(data.startDate);
  }
  return true;
}, {
  message: "Thời hạn đóng đăng ký phải trước ngày khai giảng",
  path: ["enrollmentCloseAt"],
})

type CohortFormValues = z.infer<typeof cohortSchema>

interface CohortSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cohort?: AcademyCohort | null
}

export function CohortSheet({ open, onOpenChange, cohort }: CohortSheetProps) {
  const isEditing = !!cohort
  const createMutation = useCreateAcademyCohort()
  const updateMutation = useUpdateAcademyCohort()

  const { data: profiles } = useAcademyCourseProfiles({ status: isEditing ? undefined : 'PUBLISHED' })

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CohortFormValues>({
    resolver: zodResolver(cohortSchema),
    defaultValues: {
      courseProfileId: "",
      code: "",
      name: "",
      price: 0,
      discountPrice: null,
      status: "DRAFT",
      enrollmentOpenAt: null,
      enrollmentCloseAt: null,
      startDate: null,
      endDate: null,
    },
  })

  useEffect(() => {
    if (cohort) {
      reset({
        courseProfileId: cohort.courseProfileId,
        code: cohort.code,
        name: cohort.name,
        price: Number(cohort.price),
        discountPrice: cohort.discountPrice ? Number(cohort.discountPrice) : null,
        status: cohort.status ?? "DRAFT",
        enrollmentOpenAt: cohort.enrollmentOpenAt
          ? new Date(cohort.enrollmentOpenAt).toISOString().slice(0, 10)
          : null,
        enrollmentCloseAt: cohort.enrollmentCloseAt
          ? new Date(cohort.enrollmentCloseAt).toISOString().slice(0, 10)
          : null,
        startDate: cohort.startDate
          ? new Date(cohort.startDate).toISOString().slice(0, 10)
          : null,
        endDate: cohort.endDate
          ? new Date(cohort.endDate).toISOString().slice(0, 10)
          : null,
      })
    } else {
      reset({
        courseProfileId: "",
        code: "",
        name: "",
        price: 0,
        discountPrice: null,
        status: "DRAFT",
        enrollmentOpenAt: null,
        enrollmentCloseAt: null,
        startDate: null,
        endDate: null,
      })
    }
  }, [cohort, reset])

  async function onSubmit(values: CohortFormValues) {
    try {
      const input = {
        courseProfileId: values.courseProfileId,
        code: values.code,
        name: values.name,
        price: values.price,
        discountPrice: values.discountPrice ?? undefined,
        status: values.status as any,
        enrollmentOpenAt: values.enrollmentOpenAt ? new Date(values.enrollmentOpenAt) : undefined,
        enrollmentCloseAt: values.enrollmentCloseAt ? new Date(values.enrollmentCloseAt) : undefined,
        startDate: values.startDate ? new Date(values.startDate) : undefined,
        endDate: values.endDate ? new Date(values.endDate) : undefined,
      }

      if (isEditing && cohort) {
        await updateMutation.mutateAsync({
          id: cohort.id,
          input,
        })
        toast.success("Cập nhật Đợt khai giảng thành công")
      } else {
        await createMutation.mutateAsync(input)
        toast.success("Tạo Đợt khai giảng thành công")
      }
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error?.userMessage || error?.message || "Đã xảy ra lỗi")
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="!w-full sm:!max-w-[700px] max-h-screen p-0 flex flex-col overflow-hidden">
        <SheetHeader className="px-6 py-4 border-b shrink-0">
          <SheetTitle>{isEditing ? "Chỉnh sửa Đợt khai giảng" : "Tạo Đợt khai giảng mới"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Cập nhật thông tin quản lý cho đợt học này."
              : "Khởi tạo một đợt học mới gắn liền với Syllabus."}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6">
            <form id="cohort-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <FieldGroup>
                <FieldSet>
                  <FieldLegend>Syllabus & Định danh</FieldLegend>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Course Profile (Gốc)</FieldLabel>
                      <Controller
                        name="courseProfileId"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isEditing}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn Course Profile" />
                            </SelectTrigger>
                            <SelectContent>
                              {(isEditing ? profiles : (profiles?.filter(p => p.status === 'PUBLISHED') || []))?.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.title} ({p.code})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FieldError errors={[errors.courseProfileId]} />
                    </Field>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel>Mã Đợt khai giảng (VD: JLPT-N3-2407)</FieldLabel>
                        <Controller
                          name="code"
                          control={control}
                          render={({ field }) => (
                            <Input placeholder="Mã định danh" {...field} disabled={isEditing} />
                          )}
                        />
                        <FieldError errors={[errors.code]} />
                      </Field>
                      <Field>
                        <FieldLabel>Tên Đợt (VD: Khóa N3 Tháng 7/2024)</FieldLabel>
                        <Controller
                          name="name"
                          control={control}
                          render={({ field }) => (
                            <Input placeholder="Tên hiển thị" {...field} />
                          )}
                        />
                        <FieldError errors={[errors.name]} />
                      </Field>
                    </div>
                  </FieldGroup>
                </FieldSet>

                <FieldSet>
                  <FieldLegend>Kinh doanh & Thời gian</FieldLegend>
                  <FieldGroup>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel>Giá học phí (VNĐ)</FieldLabel>
                        <Controller
                          name="price"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          )}
                        />
                        <FieldError errors={[errors.price]} />
                      </Field>
                      <Field>
                        <FieldLabel>Giá giảm giá (VNĐ)</FieldLabel>
                        <Controller
                          name="discountPrice"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="number"
                              placeholder="Không giảm"
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                            />
                          )}
                        />
                        <FieldError errors={[errors.discountPrice]} />
                      </Field>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel>Mở đăng ký</FieldLabel>
                        <Controller
                          name="enrollmentOpenAt"
                          control={control}
                          render={({ field }) => (
                            <Input type="date" value={field.value || ""} onChange={field.onChange} />
                          )}
                        />
                        <FieldError errors={[errors.enrollmentOpenAt]} />
                      </Field>
                      <Field>
                        <FieldLabel>Đóng đăng ký</FieldLabel>
                        <Controller
                          name="enrollmentCloseAt"
                          control={control}
                          render={({ field }) => (
                            <Input type="date" value={field.value || ""} onChange={field.onChange} />
                          )}
                        />
                        <FieldError errors={[errors.enrollmentCloseAt]} />
                      </Field>
                      <Field>
                        <FieldLabel>Ngày khai giảng</FieldLabel>
                        <Controller
                          name="startDate"
                          control={control}
                          render={({ field }) => (
                            <Input type="date" value={field.value || ""} onChange={field.onChange} />
                          )}
                        />
                        <FieldError errors={[errors.startDate]} />
                      </Field>
                      <Field>
                        <FieldLabel>Ngày kết thúc</FieldLabel>
                        <Controller
                          name="endDate"
                          control={control}
                          render={({ field }) => (
                            <Input type="date" value={field.value || ""} onChange={field.onChange} />
                          )}
                        />
                        <FieldError errors={[errors.endDate]} />
                      </Field>
                    </div>
                  </FieldGroup>
                </FieldSet>
              </FieldGroup>
            </form>
          </div>
        </ScrollArea>

        <div className="px-6 py-4 border-t gap-2 bg-muted/20 flex justify-end shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Hủy
          </Button>
          <Button type="submit" form="cohort-form" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Lưu thay đổi" : "Tạo Đợt khai giảng"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
