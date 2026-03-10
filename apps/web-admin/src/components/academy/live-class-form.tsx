import { Controller, useForm } from "react-hook-form"
import { useEffect, useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { toast } from "@workspace/ui/components/sonner"
import {
    Field,
    FieldError,
    FieldLabel,
    FieldGroup,
    FieldDescription,
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
    Card,
    CardContent,
} from "@workspace/ui/components/card"
import { Spinner } from "@workspace/ui/components/spinner"
import {
    academyClassCreateDTOSchema,
    academyClassUpdateDTOSchema,
    type AcademyClassCreateDTO,
    type AcademyClassUpdateDTO,
    LIVE_CLASS_METADATA,
} from "@workspace/schemas"
import type { AcademyClass } from "@/lib/api/services/academy-classes"
import { useAcademyCourseProfiles, useAcademyCourseProfile } from "@/lib/api/services/academy-course-profiles"
import { useUsers } from "@/lib/api/services/users"
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@workspace/ui/components/combobox"
import { KeyValueEditor } from "@/components/academy/key-value-editor"

export function LiveClassForm({
    mode,
    initial,
    onSubmit,
    onCancel,
    submitting,
    defaultCourseProfileId,
}: {
    mode: "create" | "edit"
    initial?: AcademyClass
    onSubmit: (data: AcademyClassCreateDTO | AcademyClassUpdateDTO) => Promise<void>
    onCancel: () => void
    submitting?: boolean
    defaultCourseProfileId?: string
}) {
    const isEdit = mode === "edit"
    const courseProfileFromRoute = !!defaultCourseProfileId

    const profilesParams = useMemo(() => ({}), [])
    const { data: profilesData = [] } = useAcademyCourseProfiles(profilesParams)
    const profiles = Array.isArray(profilesData) ? profilesData : (profilesData as any)?.items || []

    const { data: singleProfile } = useAcademyCourseProfile(courseProfileFromRoute ? defaultCourseProfileId : undefined)

    const teacherParams = useMemo(() => ({ role: "lecturer", limit: 100 }), [])
    const { data: teachersData } = useUsers(teacherParams)
    const teachers = (teachersData as any)?.data || []

    const { handleSubmit, control, register, setValue, formState } = useForm<
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
                openingDate: initial?.liveClass?.openingDate ? new Date(initial.liveClass.openingDate) : undefined,
                closingDate: initial?.liveClass?.closingDate ? new Date(initial.liveClass.closingDate) : undefined,
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
                instructorId: initial?.liveClass?.instructorId ?? undefined,
                settings: initial?.settings ?? undefined,
            }
            : {
                courseProfileId: defaultCourseProfileId ?? "",
                code: "",
                name: "",
                mode: "LIVE",
                term: "",
                batch: "",
                openingDate: undefined,
                closingDate: undefined,
                enrollmentOpenAt: undefined,
                enrollmentCloseAt: undefined,
                minStudents: 0,
                maxStudents: 0,
                minStudentsEnforcement: "DISABLED",
                status: "DRAFT",
            }) as any,
    })

    useEffect(() => {
        if (!isEdit && defaultCourseProfileId) {
            setValue("courseProfileId" as any, defaultCourseProfileId, {
                shouldValidate: true,
                shouldDirty: false,
            })
        }
    }, [defaultCourseProfileId, isEdit, setValue])

    return (
        <form
            className="space-y-8"
            onSubmit={handleSubmit(
                async (data) => onSubmit(data),
                (errors) => {
                    const firstKey = Object.keys(errors ?? {})[0]
                    const firstMessage =
                        firstKey && (errors as any)[firstKey]?.message
                            ? String((errors as any)[firstKey].message)
                            : "Vui lòng kiểm tra lại các trường bắt buộc."
                    toast.error(firstMessage)
                    // eslint-disable-next-line no-console
                    console.error("[LiveClassForm] validation errors", errors)
                },
            )}
            noValidate
        >
            <div className="space-y-6">
                {/* 1. Liên kết khóa học */}
                <Card>
                    <CardContent className="p-6">
                        <FieldSet>
                            <FieldLegend>Liên kết khóa học</FieldLegend>
                            <FieldDescription>Xác định Course Profile cho lớp học LIVE.</FieldDescription>
                            <FieldGroup>
                                {!isEdit ? (
                                    courseProfileFromRoute ? (
                                        <Field>
                                            <FieldLabel>Course Profile</FieldLabel>
                                            <Input
                                                disabled
                                                value={singleProfile ? `${singleProfile.code} - ${singleProfile.title}` : defaultCourseProfileId}
                                                readOnly
                                                className="h-10"
                                            />
                                            <input type="hidden" {...register("courseProfileId" as any)} />
                                            <FieldError>{(formState.errors as any)?.courseProfileId?.message}</FieldError>
                                        </Field>
                                    ) : (
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <Controller
                                                name={"courseProfileId" as any}
                                                control={control}
                                                render={({ field, fieldState }) => (
                                                    <Field>
                                                        <FieldLabel>Course Profile</FieldLabel>
                                                        <Select value={field.value} onValueChange={field.onChange}>
                                                            <SelectTrigger className="h-10">
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
                                        </div>
                                    )
                                ) : (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Field>
                                            <FieldLabel>Course Profile</FieldLabel>
                                            <Input disabled value={(initial as any)?.courseProfile?.title || "N/A"} className="h-10" />
                                        </Field>
                                    </div>
                                )}
                            </FieldGroup>
                        </FieldSet>
                    </CardContent>
                </Card>

                {/* 2. Thông tin lớp LIVE */}
                <Card>
                    <CardContent className="p-6">
                        <FieldSet>
                            <FieldLegend>Thông tin lớp LIVE</FieldLegend>
                            <FieldDescription>Thiết lập định danh và tên hiển thị cho lớp học.</FieldDescription>
                            <FieldGroup>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {!isEdit && (
                                        <Controller
                                            name={"code" as any}
                                            control={control}
                                            render={({ field, fieldState }) => (
                                                <Field>
                                                    <FieldLabel>Mã lớp (code)</FieldLabel>
                                                    <Input placeholder="JLPT_N5_2026_LIVE_K01" {...field} className="h-10 uppercase font-mono" />
                                                    <FieldError>{fieldState.error?.message}</FieldError>
                                                </Field>
                                            )}
                                        />
                                    )}
                                    <Controller
                                        name={"name" as any}
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <Field className={!isEdit ? "" : "col-span-2"}>
                                                <FieldLabel>Tên lớp</FieldLabel>
                                                <Input placeholder="JLPT N5 - LIVE - Khoá 01/2026" {...field} className="h-10" />
                                                <FieldError>{fieldState.error?.message}</FieldError>
                                            </Field>
                                        )}
                                    />
                                </div>

                                <Controller
                                    name={"status" as any}
                                    control={control}
                                    render={({ field }) => (
                                        <Field>
                                            <FieldLabel>Trạng thái vận hành</FieldLabel>
                                            {isEdit ? (
                                                <div className="flex flex-col gap-1">
                                                    <span
                                                        className={`inline-flex w-fit items-center rounded-md px-2 py-1 text-xs font-medium ${field.value === "ENROLLING" || field.value === "IN_PROGRESS"
                                                            ? "bg-primary/10 text-primary"
                                                            : field.value === "PENDING_APPROVAL"
                                                                ? "bg-amber-500/10 text-amber-600"
                                                                : "bg-muted text-muted-foreground"
                                                            }`}
                                                    >
                                                        {field.value === "DRAFT" && "Bản nháp"}
                                                        {field.value === "PENDING_APPROVAL" && "Chờ phê duyệt"}
                                                        {field.value === "ENROLLING" && "Đang nhận học viên"}
                                                        {field.value === "IN_PROGRESS" && "Đang học"}
                                                        {field.value === "COMPLETED" && "Đã kết thúc"}
                                                        {field.value === "CANCELLED" && "Đã hủy"}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground italic">Bản nháp (DRAFT) — Sẽ được gửi phê duyệt sau khi tạo</span>
                                            )}
                                        </Field>
                                    )}
                                />
                            </FieldGroup>
                        </FieldSet>
                    </CardContent>
                </Card>

                {/* 3. Thời gian & Tuyển sinh */}
                <Card>
                    <CardContent className="p-6">
                        <FieldSet>
                            <FieldLegend>Thời gian & Tuyển sinh</FieldLegend>
                            <FieldDescription>Lịch trình khai giảng và giới hạn quy mô lớp học.</FieldDescription>
                            <FieldGroup>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Controller
                                        name={"term" as any}
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <Field>
                                                <FieldLabel>Kỳ học (Term)</FieldLabel>
                                                <Input placeholder="2026-Q1" {...field} className="h-10" />
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
                                                <Input placeholder="K01" {...field} className="h-10" />
                                                <FieldError>{fieldState.error?.message}</FieldError>
                                            </Field>
                                        )}
                                    />
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Controller
                                        name={"openingDate" as any}
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <Field>
                                                <FieldLabel>Ngày khai giảng (Dự kiến)</FieldLabel>
                                                <Input
                                                    type="date"
                                                    className="h-10"
                                                    value={field.value instanceof Date && !Number.isNaN(field.value.getTime()) ? field.value.toISOString().slice(0, 10) : ""}
                                                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                                                />
                                                <FieldError>{fieldState.error?.message}</FieldError>
                                            </Field>
                                        )}
                                    />
                                    <Controller
                                        name={"closingDate" as any}
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <Field>
                                                <FieldLabel>Ngày bế giảng (Dự kiến)</FieldLabel>
                                                <Input
                                                    type="date"
                                                    className="h-10"
                                                    value={field.value instanceof Date && !Number.isNaN(field.value.getTime()) ? field.value.toISOString().slice(0, 10) : ""}
                                                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                                                />
                                                <FieldError>{fieldState.error?.message}</FieldError>
                                            </Field>
                                        )}
                                    />
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Controller
                                        name={"enrollmentOpenAt" as any}
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <Field>
                                                <FieldLabel>Mở đăng ký</FieldLabel>
                                                <Input
                                                    type="datetime-local"
                                                    className="h-10"
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
                                                    className="h-10"
                                                    value={field.value instanceof Date && !Number.isNaN(field.value.getTime()) ? new Date(field.value.getTime() - field.value.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
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
                                                <Input type="number" className="h-10" {...field} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
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
                                                <Input type="number" className="h-10" {...field} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                                                <FieldError>{fieldState.error?.message}</FieldError>
                                            </Field>
                                        )}
                                    />
                                    <Controller
                                        name={"minStudentsEnforcement" as any}
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <Field>
                                                <FieldLabel>Ràng buộc (Enforcement)</FieldLabel>
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="DISABLED">Không áp dụng</SelectItem>
                                                        <SelectItem value="NOTIFY">Cảnh báo</SelectItem>
                                                        <SelectItem value="STRICT">Bắt buộc</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FieldError>{fieldState.error?.message}</FieldError>
                                            </Field>
                                        )}
                                    />
                                </div>
                            </FieldGroup>
                        </FieldSet>
                    </CardContent>
                </Card>

                {/* 4. Giảng viên & Cấu hình */}
                <Card>
                    <CardContent className="p-6">
                        <FieldSet>
                            <FieldLegend>Giảng viên & Cấu hình</FieldLegend>
                            <FieldDescription>Phụ trách học thuật và các thông tin bổ sung.</FieldDescription>
                            <FieldGroup>
                                <Controller
                                    name={"instructorId" as any}
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FieldLabel>Giảng viên dạy chính</FieldLabel>
                                            <Combobox value={field.value} onValueChange={field.onChange}>
                                                <ComboboxInput placeholder="Tìm kiếm giảng viên..." showClear className="h-10" />
                                                <ComboboxContent>
                                                    <ComboboxList>
                                                        {teachers.map((t: any) => (
                                                            <ComboboxItem key={t.id} value={t.id}>
                                                                {t.displayName || t.name} ({t.email})
                                                            </ComboboxItem>
                                                        ))}
                                                        <ComboboxEmpty>Không thấy giảng viên.</ComboboxEmpty>
                                                    </ComboboxList>
                                                </ComboboxContent>
                                            </Combobox>
                                            <FieldError>{fieldState.error?.message}</FieldError>
                                        </Field>
                                    )}
                                />

                                <Controller
                                    name={"settings" as any}
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FieldLabel>Settings & Metadata</FieldLabel>
                                            <KeyValueEditor
                                                value={field.value || {}}
                                                onChange={field.onChange}
                                                presets={LIVE_CLASS_METADATA}
                                            />
                                            <FieldError>{fieldState.error?.message}</FieldError>
                                        </Field>
                                    )}
                                />
                            </FieldGroup>
                        </FieldSet>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>Hủy</Button>
                    <Button type="submit" size="lg" disabled={submitting} className="min-w-[150px] shadow-lg">
                        {submitting && <Spinner className="mr-2" />}
                        {isEdit ? "Cập nhật lớp LIVE" : "Tạo Lớp LIVE"}
                    </Button>
                </div>
            </div>
        </form>
    )
}
