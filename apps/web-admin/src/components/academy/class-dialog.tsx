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

const classSchema = z.object({
  courseProfileId: z.string().uuid("Vui lòng chọn Course Profile"),
  syllabusId: z.string().uuid("Vui lòng chọn Giáo trình"),
  code: z.string().min(2, "Mã lớp phải có ít nhất 2 ký tự"),
  name: z.string().min(3, "Tên lớp phải có ít nhất 3 ký tự"),
  mode: z.enum(["VOD", "LIVE"]),
  instructorId: z.string().uuid().optional().nullable(),
  openingDate: z.string().optional().nullable(),
  closingDate: z.string().optional().nullable(),
  maxStudents: z.coerce.number().int().min(0).optional(),
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
      syllabusId: "",
      code: "",
      name: "",
      mode: "LIVE",
      instructorId: null,
      openingDate: null,
      closingDate: null,
      maxStudents: 0,
    },
  })

  const selectedCourseProfileId = watch("courseProfileId")
  const selectedMode = watch("mode")
  const { data: syllabuses } = useAcademySyllabuses(selectedCourseProfileId)

  useEffect(() => {
    if (academyClass) {
      reset({
        courseProfileId: academyClass.courseProfileId,
        syllabusId: (academyClass as any).syllabusId || "",
        code: academyClass.code,
        name: academyClass.name,
        mode: academyClass.mode,
        instructorId: academyClass.liveClass?.instructorId || null,
        openingDate: academyClass.liveClass?.openingDate
          ? new Date(academyClass.liveClass.openingDate).toISOString().split("T")[0]
          : null,
        closingDate: academyClass.liveClass?.closingDate
          ? new Date(academyClass.liveClass.closingDate).toISOString().split("T")[0]
          : null,
        maxStudents:
          (academyClass.liveClass?.maxStudents || academyClass.vodClass?.maxStudents) ?? 0,
      })
    } else {
      reset({
        courseProfileId: "",
        syllabusId: "",
        code: "",
        name: "",
        mode: "LIVE",
        instructorId: null,
        openingDate: null,
        closingDate: null,
        maxStudents: 0,
      })
    }
  }, [academyClass, reset])

  async function onSubmit(values: ClassFormValues) {
    try {
      const payload = {
        ...values,
        openingDate: values.openingDate ? new Date(values.openingDate) : undefined,
        closingDate: values.closingDate ? new Date(values.closingDate) : undefined,
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
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>{isEditing ? "Chỉnh sửa Lớp học" : "Tạo Lớp học mới"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Cập nhật thông tin vận hành cho lớp học này."
              : "Khởi tạo một lớp học mới dựa trên Course Profile và Giáo trình."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1">
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
                              value={field.value}
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
                          <FieldLabel>Số học viên tối đa</FieldLabel>
                          <Controller
                            name="maxStudents"
                            control={control}
                            render={({ field }) => <Input type="number" {...field} />}
                          />
                          <FieldError errors={[errors.maxStudents]} />
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                />
                              )}
                            />
                          </Field>
                          <Field>
                            <FieldLabel>Ngày kết thúc (dự kiến)</FieldLabel>
                            <Controller
                              name="closingDate"
                              control={control}
                              render={({ field }) => (
                                <Input
                                  type="date"
                                  value={field.value || ""}
                                  onChange={field.onChange}
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

