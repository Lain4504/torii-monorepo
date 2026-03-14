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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldSet,
  FieldLegend,
} from "@workspace/ui/components/field"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import {
  useCreateAcademyClass,
  useUpdateAcademyClass,
  type AcademyClass,
} from "@/lib/api/services/academy-classes"
import { useAcademyCourseProfiles } from "@/lib/api/services/academy-course-profiles"
import { useAcademySyllabuses } from "@/lib/api/services/academy-syllabuses"
import { useUsers } from "@/lib/api/services/users"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

function startOfDayIso(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function addDays(d: Date, days: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + days)
  return x
}

function addMonths(d: Date, months: number) {
  const x = new Date(d)
  x.setMonth(x.getMonth() + months)
  return x
}

const classSchema = z.object({
  courseProfileId: z.string().uuid("Vui lòng chọn Course Profile"),
  syllabusId: z.string().uuid().optional().nullable(),
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
    if (!data.syllabusId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["syllabusId"], message: "LIVE class cần chọn Syllabus" })
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

interface ClassDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  academyClass?: AcademyClass | null
}

export function ClassDialog({ open, onOpenChange, academyClass }: ClassDialogProps) {
  const isEditing = !!academyClass
  const createMutation = useCreateAcademyClass()
  const updateMutation = useUpdateAcademyClass()

  const { data: profiles } = useAcademyCourseProfiles({})
  const { data: instructors } = useUsers({ role: "LECTURER", limit: 100 })

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
      syllabusId: null,
      code: "",
      name: "",
      mode: "LIVE",
      instructorId: null,
      status: "DRAFT",
      termKey: "",
      openingDate: null,
      closingDate: null,
      enrollmentOpenAt: null,
      enrollmentCloseAt: null,
    },
  })

  const selectedCourseProfileId = watch("courseProfileId")
  const selectedMode = watch("mode")
  const { data: syllabuses } = useAcademySyllabuses(selectedCourseProfileId)

  useEffect(() => {
    if (academyClass) {
      reset({
        courseProfileId: academyClass.courseProfileId,
        syllabusId: (academyClass as any).syllabusId || null,
        code: academyClass.code,
        name: academyClass.name,
        mode: academyClass.mode,
        instructorId: (academyClass as any).instructorId ?? academyClass.liveClass?.instructorId ?? null,
        status: (academyClass as any).status ?? "DRAFT",
        openingDate: (academyClass as any).openingDate
          ? new Date((academyClass as any).openingDate).toISOString().slice(0, 10)
          : null,
        closingDate: (academyClass as any).closingDate
          ? new Date((academyClass as any).closingDate).toISOString().slice(0, 10)
          : null,
        enrollmentOpenAt: (academyClass as any).enrollmentOpenAt
          ? new Date((academyClass as any).enrollmentOpenAt).toISOString().slice(0, 10)
          : null,
        enrollmentCloseAt: (academyClass as any).enrollmentCloseAt
          ? new Date((academyClass as any).enrollmentCloseAt).toISOString().slice(0, 10)
          : null,
      })
    } else {
      reset({
        courseProfileId: "",
        syllabusId: null,
        code: "",
        name: "",
        mode: "LIVE",
        instructorId: null,
        status: "DRAFT",
        termKey: "",
        openingDate: null,
        closingDate: null,
        enrollmentOpenAt: null,
        enrollmentCloseAt: null,
      })
    }
  }, [academyClass, reset])

  async function onSubmit(values: ClassFormValues) {
    try {
      const payload = {
        ...values,
        syllabusId: values.syllabusId || undefined,
        termKey: undefined,
        openingDate: values.openingDate ? new Date(values.openingDate) : undefined,
        closingDate: values.closingDate ? new Date(values.closingDate) : undefined,
        enrollmentOpenAt: values.enrollmentOpenAt ? new Date(values.enrollmentOpenAt) : undefined,
        enrollmentCloseAt: values.enrollmentCloseAt ? new Date(values.enrollmentCloseAt) : undefined,
      }

      if (isEditing && academyClass) {
        await updateMutation.mutateAsync({
          id: academyClass.id,
          input: payload as any,
        })
        toast.success("Cập nhật Lớp học thành công")
      } else {
        await createMutation.mutateAsync(payload as any)
        toast.success("Tạo Lớp học thành công")
      }
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || "Đã xảy ra lỗi")
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle>{isEditing ? "Chỉnh sửa Lớp học" : "Tạo Lớp học mới"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Cập nhật thông tin vận hành cho lớp học này."
              : "Khởi tạo một lớp học mới dựa trên Course Profile và Giáo trình."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6">
            <form id="class-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <FieldGroup>
                <FieldSet>
                  <FieldLegend>Liên kết định nghĩa</FieldLegend>
                  <FieldGroup>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel>Course Profile</FieldLabel>
                        <Controller
                          name="courseProfileId"
                          control={control}
                          render={({ field }) => (
                            <Select
                              onValueChange={(val) => {
                                field.onChange(val)
                                setValue("syllabusId", "")
                              }}
                              value={field.value}
                              disabled={isEditing}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn Course Profile" />
                              </SelectTrigger>
                              <SelectContent>
                                {profiles?.map((p) => (
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

                      <Field>
                        <FieldLabel>Giáo trình (Syllabus)</FieldLabel>
                        <Controller
                          name="syllabusId"
                          control={control}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? ""}
                              disabled={!selectedCourseProfileId || isEditing}
                            >
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={
                                    !selectedCourseProfileId
                                      ? "Chọn Profile trước"
                                      : "Chọn phiên bản giáo trình"
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {syllabuses?.map((s) => (
                                  <SelectItem key={s.id} value={s.id}>
                                    {s.versionLabel} {s.name ? `- ${s.name}` : ""}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        <FieldError errors={[errors.syllabusId]} />
                      </Field>
                    </div>
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
                              <Input placeholder="VD: N5-2402" {...field} />
                            )}
                          />
                          <FieldError errors={[errors.code]} />
                        </Field>
                      </div>
                      <div className="md:col-span-1">
                        <Field>
                          <FieldLabel>Trạng thái</FieldLabel>
                          <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                              <Input placeholder="DRAFT / PUBLISHED / ..." {...field} value={field.value ?? ""} />
                            )}
                          />
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
                              <Select
                                onValueChange={field.onChange}
                                value={field.value || undefined}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn giảng viên" />
                                </SelectTrigger>
                                <SelectContent>
                                  {instructors?.data?.map((u: any) => (
                                    <SelectItem key={u.id} value={u.id}>
                                      {u.displayName} ({u.email})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                          <FieldError errors={[errors.instructorId]} />
                        </Field>

                        {!isEditing && (
                          <Field>
                            <FieldLabel>Kỳ học (4 tháng)</FieldLabel>
                            <Controller
                              name="termKey"
                              control={control}
                              render={({ field }) => {
                                const now = new Date()
                                const year = now.getFullYear()
                                const options = [
                                  { key: `${year}-T1`, label: `T1/${year} (01/01 → 30/04)`, start: new Date(year, 0, 1) },
                                  { key: `${year}-T2`, label: `T2/${year} (01/05 → 31/08)`, start: new Date(year, 4, 1) },
                                  { key: `${year}-T3`, label: `T3/${year} (01/09 → 31/12)`, start: new Date(year, 8, 1) },
                                  { key: `${year + 1}-T1`, label: `T1/${year + 1} (01/01 → 30/04)`, start: new Date(year + 1, 0, 1) },
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
                          <Field>
                            <FieldLabel>Ngày khai giảng (auto)</FieldLabel>
                            <Controller
                              name="openingDate"
                              control={control}
                              render={({ field }) => (
                                <Input type="date" value={field.value || ""} readOnly disabled={!isEditing} />
                              )}
                            />
                            <FieldError errors={[errors.openingDate]} />
                          </Field>
                          <Field>
                            <FieldLabel>Ngày kết thúc học (auto)</FieldLabel>
                            <Controller
                              name="closingDate"
                              control={control}
                              render={({ field }) => (
                                <Input type="date" value={field.value || ""} readOnly disabled={!isEditing} />
                              )}
                            />
                            <FieldError errors={[errors.closingDate]} />
                          </Field>
                          <Field>
                            <FieldLabel>Mở đăng ký (auto: -3 tuần)</FieldLabel>
                            <Controller
                              name="enrollmentOpenAt"
                              control={control}
                              render={({ field }) => (
                                <Input type="date" value={field.value || ""} readOnly disabled={!isEditing} />
                              )}
                            />
                          </Field>
                          <Field>
                            <FieldLabel>Đóng đăng ký (auto)</FieldLabel>
                            <Controller
                              name="enrollmentCloseAt"
                              control={control}
                              render={({ field }) => (
                                <Input type="date" value={field.value || ""} readOnly disabled={!isEditing} />
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

        <DialogFooter className="px-6 py-4 border-t gap-2 bg-muted/20">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Hủy
          </Button>
          <Button type="submit" form="class-form" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Lưu thay đổi" : "Tạo Lớp"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

