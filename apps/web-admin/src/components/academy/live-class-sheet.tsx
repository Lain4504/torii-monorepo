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
  useCreateAcademyLiveClass,
  useUpdateAcademyLiveClass,
  type AcademyLiveClass,
} from "@/lib/api/services/academy-live-classes"
import { InstructorPicker } from "@/components/academy/instructor-picker"
import { useAcademyCohorts } from "@/lib/api/services/academy-cohorts"
import { useUsers } from "@/lib/api/services/users"
import { UserRole } from "@workspace/schemas"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const liveClassSchema = z.object({
  cohortId: z.string().uuid("Vui lòng chọn Khóa học (Cohort)"),
  code: z.string().min(2, "Mã lớp phải có ít nhất 2 ký tự"),
  name: z.string().min(3, "Tên lớp phải có ít nhất 3 ký tự"),
  instructorId: z.string().uuid().optional().nullable(),
  status: z.string().optional(),
  maxStudents: z.number().int().min(1).optional().nullable(),
})

type LiveClassFormValues = z.infer<typeof liveClassSchema>

interface LiveClassSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  academyClass?: AcademyLiveClass | null
  defaultCohortId?: string
}

export function LiveClassSheet({ open, onOpenChange, academyClass, defaultCohortId }: LiveClassSheetProps) {
  const isEditing = !!academyClass
  const createMutation = useCreateAcademyLiveClass()
  const updateMutation = useUpdateAcademyLiveClass()

  const { data: cohorts } = useAcademyCohorts({})
  const { data: instructors } = useUsers({ role: UserRole.LECTURER, limit: 100 })

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LiveClassFormValues>({
    resolver: zodResolver(liveClassSchema),
    defaultValues: {
      cohortId: "",
      code: "",
      name: "",
      instructorId: null,
      status: "DRAFT",
      maxStudents: null,
    },
  })

  useEffect(() => {
    if (academyClass) {
      reset({
        cohortId: academyClass.cohortId ?? "",
        code: academyClass.code,
        name: academyClass.name,
        instructorId: academyClass.instructorId ?? null,
        status: academyClass.status ?? "DRAFT",
        maxStudents: academyClass.maxStudents ?? null,
      })
    } else {
      reset({
        cohortId: defaultCohortId ?? "",
        code: "",
        name: "",
        instructorId: null,
        status: "DRAFT",
        maxStudents: null,
      })
    }
  }, [academyClass, reset])

  async function onSubmit(values: LiveClassFormValues) {
    try {
      if (isEditing && academyClass) {
        await updateMutation.mutateAsync({
          id: academyClass.id,
          input: {
            name: values.name,
            instructorId: values.instructorId === null ? undefined : values.instructorId,
            status: values.status as any,
            maxStudents: values.maxStudents === null ? undefined : values.maxStudents,
          },
        })
        toast.success("Cập nhật Lớp học LIVE thành công")
      } else {
        await createMutation.mutateAsync({
          cohortId: values.cohortId,
          code: values.code,
          name: values.name,
          instructorId: values.instructorId === null ? undefined : values.instructorId,
          status: values.status as any,
          maxStudents: values.maxStudents === null ? undefined : values.maxStudents,
        })
        toast.success("Tạo Lớp học LIVE thành công")
      }
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error?.userMessage || error?.message || "Đã xảy ra lỗi")
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="!w-full sm:!max-w-[600px] max-h-screen p-0 flex flex-col overflow-hidden">
        <SheetHeader className="px-6 py-4 border-b shrink-0">
          <SheetTitle>{isEditing ? "Chỉnh sửa Lớp học LIVE" : "Tạo Lớp học LIVE mới"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Cập nhật thông tin vận hành cho lớp học này."
              : "Khởi tạo một lớp học LIVE mới thuộc về một Khóa học (Cohort)."}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6">
            <form id="live-class-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <FieldGroup>
                <FieldSet>
                  <FieldLegend>Liên kết cấu trúc</FieldLegend>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Khóa học / Cohort (Sesssion Group)</FieldLabel>
                      <Controller
                        name="cohortId"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isEditing}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn Khóa học (Cohort)" />
                            </SelectTrigger>
                            <SelectContent>
                              {cohorts?.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.name} ({c.code})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FieldError errors={[errors.cohortId]} />
                    </Field>
                  </FieldGroup>
                </FieldSet>

                <FieldSet>
                  <FieldLegend>Thông tin lớp học</FieldLegend>
                  <FieldGroup>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel>Mã lớp</FieldLabel>
                        <Controller
                          name="code"
                          control={control}
                          render={({ field }) => (
                            <Input placeholder="VD: N5-L1-2402" {...field} disabled={isEditing} />
                          )}
                        />
                        <FieldError errors={[errors.code]} />
                      </Field>
                      <Field>
                        <FieldLabel>Tên lớp</FieldLabel>
                        <Controller
                          name="name"
                          control={control}
                          render={({ field }) => (
                            <Input placeholder="VD: Lớp LIVE 1 - Tối 2/4/6" {...field} />
                          )}
                        />
                        <FieldError errors={[errors.name]} />
                      </Field>
                    </div>

                    <Field>
                      <FieldLabel>Giảng viên phụ trách</FieldLabel>
                      <Controller
                        name="instructorId"
                        control={control}
                        render={({ field }) => (
                          <InstructorPicker
                            value={field.value ?? null}
                            onSelect={(val) => field.onChange(val)}
                            instructors={(instructors as any)?.data ?? []}
                          />
                        )}
                      />
                      <FieldError errors={[errors.instructorId]} />
                    </Field>

                    <Field>
                      <FieldLabel>Số học viên tối đa</FieldLabel>
                      <Controller
                        name="maxStudents"
                        control={control}
                        render={({ field }) => (
                          <Input
                            type="number"
                            min={1}
                            placeholder="Để trống = không giới hạn"
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const raw = e.target.value
                              if (raw === "") {
                                field.onChange(null)
                                return
                              }
                              const n = parseInt(raw, 10)
                              field.onChange(isNaN(n) ? null : n)
                            }}
                          />
                        )}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Khi đủ chỗ, học viên không thể đăng ký thêm vào lớp này.
                      </p>
                      <FieldError errors={[errors.maxStudents]} />
                    </Field>
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
          <Button type="submit" form="live-class-form" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Lưu thay đổi" : "Tạo Lớp LIVE"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}


