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

export function LiveClassForm({
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
        defaultValues: (isEdit
            ? {
                name: initial?.name ?? "",
                mode: "LIVE",
                term: initial?.liveClass?.term ?? "",
                batch: initial?.liveClass?.batch ?? "",
                startDate: initial?.liveClass?.startDate ? new Date(initial.liveClass.startDate) : undefined,
                endDate: initial?.liveClass?.endDate ? new Date(initial.liveClass.endDate) : undefined,
                enrollmentOpenAt: initial?.liveClass?.enrollmentOpenAt
                    ? new Date(initial.liveClass.enrollmentOpenAt)
                    : undefined,
                enrollmentCloseAt: initial?.liveClass?.enrollmentCloseAt
                    ? new Date(initial.liveClass.enrollmentCloseAt)
                    : undefined,
                minStudents: initial?.liveClass?.minStudents ?? 0,
                minStudentsEnforcement: (initial?.liveClass?.minStudentsEnforcement as any) ?? "DISABLED",
                maxStudents: initial?.liveClass?.maxStudents ?? 0,
                status: initial?.status ?? "DRAFT",
                primaryTeacherId: initial?.liveClass?.primaryTeacherId ?? undefined,
                settings: initial?.settings ?? undefined,
            }
            : {
                courseProfileId: defaultCourseProfileId ?? "",
                courseEditionId: defaultCourseEditionId ?? "",
                code: "",
                name: "",
                mode: "LIVE",
                term: "",
                batch: "",
                startDate: undefined,
                endDate: undefined,
                enrollmentOpenAt: undefined,
                enrollmentCloseAt: undefined,
                minStudents: 0,
                maxStudents: 0,
                minStudentsEnforcement: "DISABLED",
                status: "DRAFT",
            }) as any,
    })

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
                    <CardDescription>Xác định Course Profile và Edition cho lớp học LIVE.</CardDescription>
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
                                    <Input disabled value={(initial as any)?.courseProfile?.title || "N/A"} />
                                </Field>
                                <Field>
                                    <FieldLabel>Course Edition</FieldLabel>
                                    <Input disabled value={(initial as any)?.courseEdition?.editionTag || "N/A"} />
                                </Field>
                            </div>
                        )}
                    </FieldGroup>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Thông tin lớp LIVE</CardTitle>
                    <CardDescription>Thiết lập định danh, giảng viên và trạng thái.</CardDescription>
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
                                        <Input placeholder="JLPT_N5_2026_LIVE_K01" {...field} />
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
                                    <Input placeholder="JLPT N5 - LIVE - Khoá 01/2026" {...field} />
                                    <FieldError>{fieldState.error?.message}</FieldError>
                                </Field>
                            )}
                        />
                        <Controller
                            name={"primaryTeacherId" as any}
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Giảng viên dạy chính xuyên suốt</FieldLabel>
                                    <Combobox value={field.value} onValueChange={field.onChange}>
                                        <ComboboxInput placeholder="Tìm kiếm giảng viên..." showClear />
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
                    <CardDescription>Thiết lập kỳ học và thời gian dự kiến.</CardDescription>
                </CardHeader>
                <CardContent>
                    <FieldGroup>
                        <div className="grid gap-4 md:grid-cols-2">
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
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Controller
                                name={"startDate" as any}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Ngày khai giảng (Dự kiến)</FieldLabel>
                                        <Input
                                            type="date"
                                            value={field.value instanceof Date && !Number.isNaN(field.value.getTime()) ? field.value.toISOString().slice(0, 10) : ""}
                                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                                        />
                                        <FieldError>{fieldState.error?.message}</FieldError>
                                    </Field>
                                )}
                            />
                            <Controller
                                name={"endDate" as any}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Ngày bế giảng (Dự kiến)</FieldLabel>
                                        <Input
                                            type="date"
                                            value={field.value instanceof Date && !Number.isNaN(field.value.getTime()) ? field.value.toISOString().slice(0, 10) : ""}
                                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                                        />
                                        <FieldError>{fieldState.error?.message}</FieldError>
                                    </Field>
                                )}
                            />
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                            <Controller
                                name={"minStudents" as any}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>HV tối thiểu</FieldLabel>
                                        <Input type="number" {...field} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                                        <FieldError>{fieldState.error?.message}</FieldError>
                                    </Field>
                                )}
                            />
                            <Controller
                                name={"maxStudents" as any}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>HV tối đa</FieldLabel>
                                        <Input type="number" {...field} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                                        <FieldError>{fieldState.error?.message}</FieldError>
                                    </Field>
                                )}
                            />
                            <Controller
                                name={"minStudentsEnforcement" as any}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Enforcement</FieldLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="DISABLED">Không</SelectItem>
                                                <SelectItem value="NOTIFY">Thông báo</SelectItem>
                                                <SelectItem value="STRICT">Bắt buộc</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FieldError>{fieldState.error?.message}</FieldError>
                                    </Field>
                                )}
                            />
                        </div>
                    </FieldGroup>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Tuyển sinh & Cấu hình</CardTitle>
                    <CardDescription>Thời gian đăng ký và settings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <FieldGroup>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Controller
                                name={"enrollmentOpenAt" as any}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Mở đăng ký</FieldLabel>
                                        <Input
                                            type="datetime-local"
                                            value={field.value instanceof Date && !Number.isNaN(field.value.getTime()) ? new Date(field.value.getTime() - field.value.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
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
                                        <FieldLabel>Đóng đăng ký</FieldLabel>
                                        <Input
                                            type="datetime-local"
                                            value={field.value instanceof Date && !Number.isNaN(field.value.getTime()) ? new Date(field.value.getTime() - field.value.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                                        />
                                        <FieldError>{fieldState.error?.message}</FieldError>
                                    </Field>
                                )}
                            />
                        </div>
                        <Controller
                            name={"settings" as any}
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Settings (JSON)</FieldLabel>
                                    <Textarea
                                        className="font-mono min-h-[100px]"
                                        value={field.value ? (typeof field.value === "string" ? field.value : JSON.stringify(field.value, null, 2)) : ""}
                                        onChange={(e: any) => {
                                            const val = e.target.value
                                            if (!val) field.onChange(undefined)
                                            else {
                                                try { field.onChange(JSON.parse(val)) } catch { field.onChange(val) }
                                            }
                                        }}
                                    />
                                    <FieldError>{fieldState.error?.message}</FieldError>
                                </Field>
                            )}
                        />
                    </FieldGroup>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>Hủy</Button>
                <Button type="submit" disabled={submitting}>
                    {submitting && <Spinner className="mr-2" />}
                    {isEdit ? "Lưu thay đổi" : "Tạo Lớp LIVE"}
                </Button>
            </div>
        </form>
    )
}
