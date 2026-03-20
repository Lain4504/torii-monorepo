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
  useCreateAcademyClass,
  useUpdateAcademyClass,
  type AcademyClass,
} from "@/lib/api/services/academy-classes"
import { InstructorPicker } from "@/components/academy/instructor-picker"
import { useAcademyCourseProfiles } from "@/lib/api/services/academy-course-profiles"
import { useUsers } from "@/lib/api/services/users"
import { UserRole } from "@workspace/schemas"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

function startOfDayIso(d: Date) {
  const x = new Date(d)
  // IMPORTANT: Term timeline is used by backend as UTC day boundary.
  // So we must compute in UTC to avoid shifting date by timezone.
  x.setUTCHours(0, 0, 0, 0)
  return x
}

function addDays(d: Date, days: number) {
  const x = new Date(d)
  x.setUTCDate(x.getUTCDate() + days)
  return x
}

function addMonths(d: Date, months: number) {
  const x = new Date(d)
  x.setUTCMonth(x.getUTCMonth() + months)
  return x
}

const classSchema = z.object({
  courseProfileId: z.string().uuid("Vui lòng chọn Course Profile"),
  code: z.string().min(2, "Mã lớp phải có ít nhất 2 ký tự"),
  name: z.string().min(3, "Tên lớp phải có ít nhất 3 ký tự"),
  mode: z.enum(["VOD", "LIVE"]),
  instructorId: z.string().uuid().optional().nullable(),
  status: z.string().optional(),
  termKey: z.string().optional(),
  openingDate: z.string().optional().nullable(),
  closingDate: z.string().optional().nullable(),
  enrollmentOpenAt: z.string().optional().nullable(),
  enrollmentCloseAt: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.mode === "LIVE") {
    if (!data.termKey) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["termKey"], message: "Vui lòng chọn kỳ học" })
    }
    if (!data.openingDate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["openingDate"], message: "LIVE class cần ngày khai giảng" })
    }
    if (!data.closingDate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["closingDate"], message: "LIVE class cần ngày kết thúc học" })
    }
  }
})

type ClassFormValues = z.infer<typeof classSchema>

interface ClassSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  academyClass?: AcademyClass | null
  initialMode?: "VOD" | "LIVE"
}

export function ClassSheet({ open, onOpenChange, academyClass, initialMode = "LIVE" }: ClassSheetProps) {
  const isEditing = !!academyClass
  const createMutation = useCreateAcademyClass()
  const updateMutation = useUpdateAcademyClass()

  const { data: profiles } = useAcademyCourseProfiles({})
  const { data: instructors } = useUsers({ role: UserRole.LECTURER, limit: 100 })

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      courseProfileId: "",
      code: "",
      name: "",
      mode: initialMode,
      instructorId: null,
      status: "DRAFT",
      termKey: "",
      openingDate: null,
      closingDate: null,
      enrollmentOpenAt: null,
      enrollmentCloseAt: null,
    },
  })

  // Filter only active profiles when creating new class
  const activeProfiles = profiles?.filter(p => p.status === 'PUBLISHED') || []
  const selectedMode = watch("mode")

  useEffect(() => {
    if (academyClass) {
      const term = (academyClass as any).term
      reset({
        courseProfileId: academyClass.courseProfileId,
        code: academyClass.code,
        name: academyClass.name,
        mode: academyClass.mode,
        instructorId: (academyClass as any).instructorId ?? null,
        status: (academyClass as any).status ?? "DRAFT",
        termKey: term?.termCode ?? "",
        openingDate: term?.openingDate
          ? new Date(term.openingDate).toISOString().slice(0, 10)
          : null,
        closingDate: term?.closingDate
          ? new Date(term.closingDate).toISOString().slice(0, 10)
          : null,
        enrollmentOpenAt: term?.enrollmentOpenAt
          ? new Date(term.enrollmentOpenAt).toISOString().slice(0, 10)
          : null,
        enrollmentCloseAt: term?.enrollmentCloseAt
          ? new Date(term.enrollmentCloseAt).toISOString().slice(0, 10)
          : null,
      })
    } else {
      reset({
        courseProfileId: "",
        code: "",
        name: "",
        mode: initialMode,
        instructorId: null,
        status: "DRAFT",
        termKey: "",
        openingDate: null,
        closingDate: null,
        enrollmentOpenAt: null,
        enrollmentCloseAt: null,
      })
    }
  }, [academyClass, initialMode, reset])

  async function onSubmit(values: ClassFormValues) {
    try {
      if (isEditing && academyClass) {
        const input = {
          name: values.name,
          instructorId: values.instructorId || undefined,
          status: values.status || undefined,
          courseProfileId: values.courseProfileId,
          termId: (academyClass as any).termId ?? undefined,
        } as any
        await updateMutation.mutateAsync({
          id: academyClass.id,
          input,
        })
        toast.success("Cập nhật Lớp học thành công")
      } else {
        const input = {
          courseProfileId: values.courseProfileId,
          code: values.code,
          name: values.name,
          mode: values.mode,
          instructorId: values.instructorId || undefined,
          status: values.status || undefined,
          term:
            values.mode === "LIVE"
              ? {
                  termCode: values.termKey!,
                  openingDate: new Date(values.openingDate as any),
                  closingDate: new Date(values.closingDate as any),
                  enrollmentOpenAt: values.enrollmentOpenAt
                    ? new Date(values.enrollmentOpenAt)
                    : undefined,
                  enrollmentCloseAt: values.enrollmentCloseAt
                    ? new Date(values.enrollmentCloseAt)
                    : undefined,
                }
              : undefined,
        } as any
        await createMutation.mutateAsync(input)
        toast.success("Tạo Lớp học thành công")
      }
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error?.userMessage || error?.message || "Đã xảy ra lỗi")
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="!w-full sm:!max-w-[800px] max-h-screen p-0 flex flex-col overflow-hidden">
        <SheetHeader className="px-6 py-4 border-b shrink-0">
          <SheetTitle>{isEditing ? "Chỉnh sửa Lớp học" : "Tạo Lớp học mới"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Cập nhật thông tin vận hành cho lớp học này."
              : "Khởi tạo một lớp học mới dựa trên Course Profile."}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6">
            <form id="class-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <FieldGroup>
                <FieldSet>
                  <FieldLegend>Liên kết định nghĩa</FieldLegend>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Course Profile (Product Version)</FieldLabel>
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
                              {(isEditing ? profiles : activeProfiles)?.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.title} ({p.code}) {p.status === 'ARCHIVED' ? '[Lưu trữ]' : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FieldError errors={[errors.courseProfileId]} />
                    </Field>
                  </FieldGroup>
                </FieldSet>

                <FieldSet>
                  <FieldLegend>Thông tin lớp học</FieldLegend>
                  <FieldGroup>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1">
                        <Field>
                          <FieldLabel>Loại hình</FieldLabel>
                          <Controller
                            name="mode"
                            control={control}
                            render={({ field }) => (
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                disabled={isEditing}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="LIVE">Lớp LIVE</SelectItem>
                                  <SelectItem value="VOD">Khóa VOD</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </Field>
                      </div>
                      <div className="md:col-span-1">
                        <Field>
                          <FieldLabel>Mã lớp</FieldLabel>
                          <Controller
                            name="code"
                            control={control}
                            render={({ field }) => (
                              <Input placeholder="VD: N5-2402" {...field} disabled={isEditing} />
                            )}
                          />
                          <FieldError errors={[errors.code]} />
                        </Field>
                      </div>
                    </div>

                    <Field>
                      <FieldLabel>Tên lớp</FieldLabel>
                      <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                          <Input placeholder="VD: Lớp N5 Cấp tốc Tháng 2" {...field} />
                        )}
                      />
                      <FieldError errors={[errors.name]} />
                    </Field>

                    {selectedMode === "LIVE" && (
                      <>
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

                        {!isEditing && (
                          <Field>
                            <FieldLabel>Kỳ học LIVE (LiveTerm) (4 tháng)</FieldLabel>
                            <Controller
                              name="termKey"
                              control={control}
                              render={({ field }) => {
                                const now = new Date()
                                const year = now.getFullYear()
                                const options = [
                                  { key: `${year}-T1`, label: `T1/${year} (01/01 → 30/04)`, start: new Date(Date.UTC(year, 0, 1)) },
                                  { key: `${year}-T2`, label: `T2/${year} (01/05 → 31/08)`, start: new Date(Date.UTC(year, 4, 1)) },
                                  { key: `${year}-T3`, label: `T3/${year} (01/09 → 31/12)`, start: new Date(Date.UTC(year, 8, 1)) },
                                  { key: `${year + 1}-T1`, label: `T1/${year + 1} (01/01 → 30/04)`, start: new Date(Date.UTC(year + 1, 0, 1)) },
                                ]
                                return (
                                  <Select
                                    value={field.value ?? ""}
                                    onValueChange={(val) => {
                                      field.onChange(val)
                                      const picked = options.find((o) => o.key === val)
                                      if (!picked) return
                                      const opening = startOfDayIso(picked.start)
                                      const closing = startOfDayIso(addDays(addMonths(opening, 4), -1))
                                      const enrollOpen = startOfDayIso(addDays(opening, -21))
                                      const enrollClose = opening

                                      setValue("openingDate", opening.toISOString().slice(0, 10))
                                      setValue("closingDate", closing.toISOString().slice(0, 10))
                                      setValue("enrollmentOpenAt", enrollOpen.toISOString().slice(0, 10))
                                      setValue("enrollmentCloseAt", enrollClose.toISOString().slice(0, 10))
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Chọn kỳ học..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {options.map((o) => (
                                        <SelectItem key={o.key} value={o.key}>
                                          {o.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )
                              }}
                            />
                          </Field>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="col-span-full text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-4 py-3">
                            Với lớp <strong>LIVE</strong>, trước khi gửi duyệt cần cấu hình
                            <strong> ít nhất 1 lịch học tuần</strong> tại trang chi tiết lớp.
                          </div>
                          <Field>
                            <FieldLabel>Ngày khai giảng</FieldLabel>
                            <Controller
                              name="openingDate"
                              control={control}
                              render={({ field }) => (
                                <Input
                                  type="date"
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  disabled={isEditing}
                                />
                              )}
                            />
                            <FieldError errors={[errors.openingDate]} />
                          </Field>
                          <Field>
                            <FieldLabel>Ngày kết thúc học</FieldLabel>
                            <Controller
                              name="closingDate"
                              control={control}
                              render={({ field }) => (
                                <Input
                                  type="date"
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  disabled={isEditing}
                                />
                              )}
                            />
                            <FieldError errors={[errors.closingDate]} />
                          </Field>
                          <Field>
                            <FieldLabel>Mở đăng ký</FieldLabel>
                            <Controller
                              name="enrollmentOpenAt"
                              control={control}
                              render={({ field }) => (
                                <Input
                                  type="date"
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  disabled={isEditing}
                                />
                              )}
                            />
                          </Field>
                          <Field>
                            <FieldLabel>Đóng đăng ký</FieldLabel>
                            <Controller
                              name="enrollmentCloseAt"
                              control={control}
                              render={({ field }) => (
                                <Input
                                  type="date"
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  disabled={isEditing}
                                />
                              )}
                            />
                          </Field>
                        </div>
                      </>
                    )}
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
          <Button type="submit" form="class-form" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Lưu thay đổi" : "Tạo Lớp"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}


