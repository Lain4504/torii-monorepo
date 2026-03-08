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
    FieldDescription,
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

export function VodClassForm({
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

    const { handleSubmit, control, watch } = useForm<
        AcademyClassCreateDTO | AcademyClassUpdateDTO
    >({
        resolver: zodResolver(
            (isEdit ? academyClassUpdateDTOSchema : academyClassCreateDTOSchema) as any
        ) as any,
        defaultValues: (isEdit
            ? {
                name: initial?.name ?? "",
                mode: "VOD",
                enrollmentOpenAt: initial?.vodClass?.enrollmentOpenAt
                    ? new Date(initial.vodClass.enrollmentOpenAt)
                    : undefined,
                enrollmentCloseAt: initial?.vodClass?.enrollmentCloseAt
                    ? new Date(initial.vodClass.enrollmentCloseAt)
                    : undefined,
                maxStudents: initial?.vodClass?.maxStudents ?? 0,
                defaultExpiresMonths: initial?.vodClass?.defaultExpiresMonths ?? 12,
                status: initial?.status ?? "DRAFT",
                settings: initial?.settings ?? undefined,
            }
            : {
                courseProfileId: defaultCourseProfileId ?? "",
                courseEditionId: defaultCourseEditionId ?? "",
                code: "",
                name: "",
                mode: "VOD",
                enrollmentOpenAt: undefined,
                enrollmentCloseAt: undefined,
                maxStudents: 0,
                defaultExpiresMonths: 12,
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
                    <CardDescription>Xác định Course Profile và Edition cho lớp học VOD.</CardDescription>
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
                                                <SelectTrigger><SelectValue placeholder="Chọn Profile..." /></SelectTrigger>
                                                <SelectContent>
                                                    {profiles.map((p: any) => (
                                                        <SelectItem key={p.id} value={p.id}>{p.code} - {p.title}</SelectItem>
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
                                                <SelectTrigger><SelectValue placeholder="Chọn Edition..." /></SelectTrigger>
                                                <SelectContent>
                                                    {filteredEditions.map((e: any) => (
                                                        <SelectItem key={e.id} value={e.id}>{e.editionTag}</SelectItem>
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
                    <CardTitle>Thông tin lớp VOD</CardTitle>
                    <CardDescription>Thiết lập định danh và trạng thái.</CardDescription>
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
                                        <Input placeholder="VOD_N5_2026_01" {...field} />
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
                                    <Input placeholder="JLPT N5 - Tự học qua Video" {...field} />
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
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="DRAFT">Bản nháp</SelectItem>
                                            <SelectItem value="ENROLLING">Đang mở tuyển sinh</SelectItem>
                                            <SelectItem value="IN_PROGRESS">Đang vận hành</SelectItem>
                                            <SelectItem value="COMPLETED">Đã đóng</SelectItem>
                                            <SelectItem value="CANCELLED">Hủy bỏ</SelectItem>
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
                    <CardTitle>Quy mô & Hạn sử dụng</CardTitle>
                    <CardDescription>Cấu hình giới hạn người học và thời gian hiệu lực.</CardDescription>
                </CardHeader>
                <CardContent>
                    <FieldGroup>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Controller
                                name={"maxStudents" as any}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>HV tối đa</FieldLabel>
                                        <Input type="number" {...field} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                                        <FieldDescription>Bỏ trống hoặc để 0 nếu không giới hạn.</FieldDescription>
                                        <FieldError>{fieldState.error?.message}</FieldError>
                                    </Field>
                                )}
                            />
                            <Controller
                                name={"defaultExpiresMonths" as any}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Hạn dùng mặc định (tháng)</FieldLabel>
                                        <Input type="number" {...field} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                                        <FieldDescription>Số tháng học viên được truy cập sau khi enroll.</FieldDescription>
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
                                        <FieldLabel>Ngày mở tuyển</FieldLabel>
                                        <Input type="datetime-local" value={field.value instanceof Date && !Number.isNaN(field.value.getTime()) ? new Date(field.value.getTime() - field.value.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""} onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)} />
                                        <FieldError>{fieldState.error?.message}</FieldError>
                                    </Field>
                                )}
                            />
                            <Controller
                                name={"enrollmentCloseAt" as any}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Ngày đóng tuyển</FieldLabel>
                                        <Input type="datetime-local" value={field.value instanceof Date && !Number.isNaN(field.value.getTime()) ? new Date(field.value.getTime() - field.value.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""} onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)} />
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
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>Hủy</Button>
                <Button type="submit" disabled={submitting}>
                    {submitting && <Spinner className="mr-2" />}
                    {isEdit ? "Lưu thay đổi" : "Tạo Lớp VOD"}
                </Button>
            </div>
        </form>
    )
}
