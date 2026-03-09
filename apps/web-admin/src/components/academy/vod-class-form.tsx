import { Controller, useForm } from "react-hook-form"
import { useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
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
    CLASS_METADATA,
} from "@workspace/schemas"
import type { AcademyClass } from "@/lib/api/services/academy-classes"
import { useAcademyCourseProfiles } from "@/lib/api/services/academy-course-profiles"
import { useAcademyCourseEditions } from "@/lib/api/services/academy-course-editions"
import { KeyValueEditor } from "@/components/academy/key-value-editor"

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

    const editionsParams = useMemo(() => ({ status: "PUBLISHED" }), [])
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
                <CardContent className="p-6">
                    <FieldGroup>
                        <FieldSet>
                            <FieldLegend>Liên kết khóa học</FieldLegend>
                            <FieldDescription>Xác định nguồn học liệu từ Course Profile và Edition.</FieldDescription>
                            <FieldGroup>
                                {!isEdit ? (
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
                                                    <FieldDescription>Chỉ hiển thị các bản đã Đã xuất bản.</FieldDescription>
                                                    <FieldError>{fieldState.error?.message}</FieldError>
                                                </Field>
                                            )}
                                        />
                                    </div>
                                ) : (
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
                        </FieldSet>

                        <FieldSet>
                            <FieldLegend>Thông tin lớp VOD</FieldLegend>
                            <FieldDescription>Thiết lập tên và định danh cho lớp học.</FieldDescription>
                            <FieldGroup>
                                {!isEdit && (
                                    <Controller
                                        name={"code" as any}
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <Field>
                                                <FieldLabel>Mã lớp (code)</FieldLabel>
                                                <Input placeholder="VOD_N5_2026_01" {...field} />
                                                <FieldDescription>Duy nhất toàn hệ thống, dùng để định danh lớp.</FieldDescription>
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
                                {isEdit && (
                                    <Controller
                                        name={"status" as any}
                                        control={control}
                                        render={({ field }) => (
                                            <Field>
                                                <FieldLabel>Trạng thái</FieldLabel>
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
                                                        {field.value === "ENROLLING" && "Đang mở tuyển sinh"}
                                                        {field.value === "IN_PROGRESS" && "Đang vận hành"}
                                                        {field.value === "COMPLETED" && "Đã đóng"}
                                                        {field.value === "CANCELLED" && "Hủy bỏ"}
                                                    </span>
                                                </div>
                                            </Field>
                                        )}
                                    />
                                )}
                            </FieldGroup>
                        </FieldSet>

                        <FieldSet>
                            <FieldLegend>Cấu hình vận hành</FieldLegend>
                            <FieldDescription>Thiết lập thời gian truy cập cho học viên.</FieldDescription>
                            <FieldGroup>
                                <Controller
                                    name={"defaultExpiresMonths" as any}
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FieldLabel>Thời hạn truy cập mặc định (tháng)</FieldLabel>
                                            <Input type="number" {...field} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                                            <FieldDescription>Hệ thống tự động tính ngày hết hạn (Expires At) sau khi học viên đăng ký.</FieldDescription>
                                            <FieldError>{fieldState.error?.message}</FieldError>
                                        </Field>
                                    )}
                                />
                            </FieldGroup>
                        </FieldSet>

                        <FieldSet>
                            <FieldLegend>Thông tin bổ sung (Settings)</FieldLegend>
                            <FieldDescription>Các cấu hình hiển thị và yêu cầu đầu vào.</FieldDescription>
                            <FieldGroup>
                                <Controller
                                    name={"settings" as any}
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <KeyValueEditor
                                                value={field.value || {}}
                                                onChange={field.onChange}
                                                presets={CLASS_METADATA}
                                            />
                                            <FieldError>{fieldState.error?.message}</FieldError>
                                        </Field>
                                    )}
                                />
                            </FieldGroup>
                        </FieldSet>
                    </FieldGroup>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>Hủy</Button>
                <Button type="submit" size="lg" disabled={submitting}>
                    {submitting && <Spinner className="mr-2" />}
                    {isEdit ? "Lưu thay đổi" : "Tạo Lớp VOD"}
                </Button>
            </div>
        </form>
    )
}
