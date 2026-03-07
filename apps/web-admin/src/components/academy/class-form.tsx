import { Controller, useForm } from "react-hook-form"
import { useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  Field,
  FieldError,
  FieldLabel,
  FieldDescription,
  FieldGroup,
} from "@workspace/ui/components/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Spinner } from "@workspace/ui/components/spinner"
import {
  academyClassCreateDTOSchema,
  academyClassUpdateDTOSchema,
  type AcademyClassCreateDTO,
  type AcademyClassUpdateDTO,
} from "@workspace/schemas"
import type { AcademyClass } from "@/lib/api/services/academy-classes"
import { useAcademyCourseProfiles } from "@/lib/api/services/academy-course-profiles"
import { useAcademyCourseEditions } from "@/lib/api/services/academy-course-editions"
import { useUsers } from "@/lib/api/services/users"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@workspace/ui/components/combobox"

export function ClassForm({
  mode,
  initial,
  onSubmit,
  onCancel,
  submitting,
  defaultCourseProfileId,
  defaultCourseEditionId,
}: {
  mode: "create" | "edit"
  initial?: AcademyClass
  onSubmit: (data: AcademyClassCreateDTO | AcademyClassUpdateDTO) => Promise<void>
  onCancel: () => void
  submitting?: boolean
  defaultCourseProfileId?: string
  defaultCourseEditionId?: string
}) {
  const isEdit = mode === "edit"

  const profilesParams = useMemo(() => ({}), [])
  const { data: profilesData = [] } = useAcademyCourseProfiles(profilesParams)
  const profiles = Array.isArray(profilesData) ? profilesData : (profilesData as any)?.items || []

  const editionsParams = useMemo(() => ({}), [])
  const { data: editionsData = [] } = useAcademyCourseEditions(editionsParams)
  const editions = Array.isArray(editionsData) ? editionsData : (editionsData as any)?.items || []

  const teacherParams = useMemo(() => ({ role: "lecturer", limit: 100 }), [])
  const { data: teachersData } = useUsers(teacherParams)
  const teachers = (teachersData as any)?.data || []

  const { handleSubmit, control, watch } = useForm<
    AcademyClassCreateDTO | AcademyClassUpdateDTO
  >({
    resolver: zodResolver(
      (isEdit ? academyClassUpdateDTOSchema : academyClassCreateDTOSchema) as any
    ) as any,
    defaultValues: isEdit
      ? {
        name: initial?.name ?? "",
        mode: initial?.mode ?? undefined,
        term: initial?.term ?? undefined,
        batch: initial?.batch ?? undefined,
        startDate: initial?.startDate ? new Date(initial.startDate) : undefined,
        endDate: initial?.endDate ? new Date(initial.endDate) : undefined,
        enrollmentOpenAt: initial?.enrollmentOpenAt
          ? new Date(initial.enrollmentOpenAt)
          : undefined,
        enrollmentCloseAt: initial?.enrollmentCloseAt
          ? new Date(initial.enrollmentCloseAt)
          : undefined,
        minStudents: initial?.minStudents ?? undefined,
        maxStudents: initial?.maxStudents ?? undefined,
        status: initial?.status ?? undefined,
        primaryTeacherId: (initial as any)?.primaryTeacherId ?? undefined,
      }
      : {
        courseProfileId: defaultCourseProfileId ?? "",
        courseEditionId: defaultCourseEditionId ?? "",
        code: "",
        name: "",
        mode: "VOD",
        term: undefined,
        batch: undefined,
        startDate: undefined,
        endDate: undefined,
        enrollmentOpenAt: undefined,
        enrollmentCloseAt: undefined,
        minStudents: undefined,
        maxStudents: undefined,
        status: "DRAFT",
      },
  })

  const modeClass = watch("mode" as any)
  const statusClass = watch("status" as any)

  const selectedProfileId = watch("courseProfileId" as any)
  const filteredEditions = useMemo(() => {
    if (!selectedProfileId) return editions
    return editions.filter((e: any) => e.courseProfileId === selectedProfileId)
  }, [selectedProfileId, editions])

  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit(async (data) => onSubmit(data))}
      noValidate
    >
      <Card>
        <CardHeader>
          <CardTitle>Liên kết khóa học</CardTitle>
          <CardDescription>
            Xác định Course Profile và Edition cho lớp học này.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            {!isEdit && (
              <div className="grid gap-4 md:grid-cols-2">
                <Controller
                  name={"courseProfileId" as any}
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Course Profile</FieldLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn Profile..." />
                        </SelectTrigger>
                        <SelectContent>
                          {profiles.map((p: any) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.code} - {p.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />
                <Controller
                  name={"courseEditionId" as any}
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Course Edition</FieldLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn Edition..." />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredEditions.map((e: any) => (
                            <SelectItem key={e.id} value={e.id}>
                              {e.editionTag} ({e.status})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />
              </div>
            )}
            {isEdit && (
              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel>Course Profile</FieldLabel>
                  <Input
                    disabled
                    value={(initial as any)?.courseProfile?.title || "N/A"}
                  />
                </Field>
                <Field>
                  <FieldLabel>Course Edition</FieldLabel>
                  <Input
                    disabled
                    value={(initial as any)?.courseEdition?.editionTag || "N/A"}
                  />
                </Field>
              </div>
            )}
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin định danh</CardTitle>
          <CardDescription>Thiết lập mã, tên và hình thức học.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            {!isEdit && (
              <Controller
                name={"code" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Mã lớp (code)</FieldLabel>
                    <Input placeholder="JLPT_N5_2026_K01" {...field} />
                    <FieldDescription>
                      Mã duy nhất cho lớp học này.
                    </FieldDescription>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
            )}
            <Controller
              name={"name" as any}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Tên lớp</FieldLabel>
                  <Input placeholder="JLPT N5 - Khoá 01/2026" {...field} />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
            <Controller
              name={"mode" as any}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Hình thức học (Mode)</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn hình thức..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VOD">VOD (Video on Demand)</SelectItem>
                      <SelectItem value="LIVE">Live (Trực tuyến)</SelectItem>
                      <SelectItem value="BLENDED">Blended (Kết hợp)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
            <Controller
              name={"primaryTeacherId" as any}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Giảng viên phụ trách</FieldLabel>
                  <Combobox
                    value={field.value}
                    onValueChange={(val) => field.onChange(val)}
                  >
                    <ComboboxInput
                      placeholder="Tìm kiếm giảng viên..."
                      showClear
                    />
                    <ComboboxContent>
                      <ComboboxList>
                        {teachers.map((t: any) => (
                          <ComboboxItem key={t.id} value={t.id}>
                            {t.displayName || t.name} ({t.email})
                          </ComboboxItem>
                        ))}
                        <ComboboxEmpty>Không tìm thấy giảng viên.</ComboboxEmpty>
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thời gian & Quy mô</CardTitle>
          <CardDescription>Thiết lập kỳ học, thời gian và số lượng học viên.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Controller
              name={"term" as any}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Kỳ học (Term)</FieldLabel>
                  <Input placeholder="2026-Q1" {...field} />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
            <Controller
              name={"batch" as any}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Đợt (Batch)</FieldLabel>
                  <Input placeholder="K01" {...field} />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
            <Controller
              name={"status" as any}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Trạng thái</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Bản nháp (Draft)</SelectItem>
                      <SelectItem value="ENROLLING">Đang nhận học viên (Enrolling)</SelectItem>
                      <SelectItem value="IN_PROGRESS">Đang học (In Progress)</SelectItem>
                      <SelectItem value="COMPLETED">Đã kết thúc (Completed)</SelectItem>
                      <SelectItem value="CANCELLED">Đã hủy (Cancelled)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    {statusClass === "DRAFT" && "Lớp học mới khởi tạo, học viên chưa thể thấy."}
                    {statusClass === "ENROLLING" && "Lớp học đang mở đăng ký tuyển sinh."}
                    {statusClass === "IN_PROGRESS" && "Lớp học đang diễn ra theo kế hoạch."}
                    {statusClass === "COMPLETED" && "Lớp học đã hoàn thành chương trình."}
                    {statusClass === "CANCELLED" && "Lớp học đã bị hủy."}
                  </FieldDescription>
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <Controller
              name={"startDate" as any}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>
                    {modeClass === "VOD" ? "Ngày bắt đầu hiệu lực" : "Ngày khai giảng"}
                  </FieldLabel>
                  <Input
                    type="date"
                    value={
                      field.value instanceof Date && !Number.isNaN(field.value.getTime())
                        ? field.value.toISOString().slice(0, 10)
                        : ""
                    }
                    onChange={(e) =>
                      field.onChange(e.target.value ? new Date(e.target.value) : undefined)
                    }
                  />
                  <FieldDescription>
                    {modeClass === "VOD"
                      ? "Thời điểm khóa học sẵn sàng cho học viên."
                      : "Ngày dự kiến bắt đầu buổi học đầu tiên."}
                  </FieldDescription>
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
            <Controller
              name={"endDate" as any}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>
                    {modeClass === "VOD" ? "Ngày hết hạn (tùy chọn)" : "Ngày bế giảng"}
                  </FieldLabel>
                  <Input
                    type="date"
                    value={
                      field.value instanceof Date && !Number.isNaN(field.value.getTime())
                        ? field.value.toISOString().slice(0, 10)
                        : ""
                    }
                    onChange={(e) =>
                      field.onChange(e.target.value ? new Date(e.target.value) : undefined)
                    }
                  />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
          </div>

          {modeClass !== "VOD" && (
            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name={"minStudents" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Số học viên tối thiểu</FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? undefined : Number(e.target.value),
                        )
                      }
                    />
                    <FieldDescription>Cần đạt số lượng này để mở lớp.</FieldDescription>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
              <Controller
                name={"maxStudents" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Số học viên tối đa</FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? undefined : Number(e.target.value),
                        )
                      }
                    />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {modeClass !== "VOD" && (
        <Card>
          <CardHeader>
            <CardTitle>Thời gian tuyển sinh</CardTitle>
            <CardDescription>Cấu hình thời gian mở và đóng đăng ký.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name={"enrollmentOpenAt" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Thời gian mở đăng ký</FieldLabel>
                    <Input
                      type="datetime-local"
                      value={
                        field.value instanceof Date && !Number.isNaN(field.value.getTime())
                          ? new Date(
                            field.value.getTime() -
                            field.value.getTimezoneOffset() * 60000,
                          )
                            .toISOString()
                            .slice(0, 16)
                          : ""
                      }
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? new Date(e.target.value) : undefined,
                        )
                      }
                    />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
              <Controller
                name={"enrollmentCloseAt" as any}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Thời gian đóng đăng ký</FieldLabel>
                    <Input
                      type="datetime-local"
                      value={
                        field.value instanceof Date && !Number.isNaN(field.value.getTime())
                          ? new Date(
                            field.value.getTime() -
                            field.value.getTimezoneOffset() * 60000,
                          )
                            .toISOString()
                            .slice(0, 16)
                          : ""
                      }
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? new Date(e.target.value) : undefined,
                        )
                      }
                    />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Cấu hình nâng cao</CardTitle>
          <CardDescription>Thiết lập bổ sung dưới dạng JSON.</CardDescription>
        </CardHeader>
        <CardContent>
          <Controller
            name={"settings" as any}
            control={control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Settings (JSON)</FieldLabel>
                <Textarea
                  placeholder='Ví dụ: {"allowLateJoin":true}'
                  className="font-mono"
                  value={
                    field.value
                      ? typeof field.value === "string"
                        ? field.value
                        : JSON.stringify(field.value, null, 2)
                      : ""
                  }
                  onChange={(e) => {
                    const raw = e.target.value
                    if (!raw) return field.onChange(undefined)
                    try {
                      field.onChange(JSON.parse(raw))
                    } catch {
                      field.onChange(raw)
                    }
                  }}
                />
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Hủy
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? <Spinner className="mr-2" /> : null}
          {isEdit ? "Lưu thay đổi" : "Tạo Lớp học"}
        </Button>
      </div>
    </form>
  )
}


