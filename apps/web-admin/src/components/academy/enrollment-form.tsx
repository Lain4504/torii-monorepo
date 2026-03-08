import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
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
    academyEnrollmentCreateDTOSchema,
    academyEnrollmentUpdateDTOSchema,
    type AcademyEnrollmentCreateDTO,
    type AcademyEnrollmentUpdateDTO,
} from "@workspace/schemas"
import type { AcademyEnrollment } from "@/lib/api/services/academy-enrollments"
import { useAcademyClasses } from "@/lib/api/services/academy-classes"
import { KeyValueEditor } from "@/components/academy/key-value-editor"
import { useUsers } from "@/lib/api/services/users"

export function EnrollmentForm({
    mode,
    initial,
    onSubmit,
    onCancel,
    submitting,
    defaultClassId,
}: {
    mode: "create" | "edit"
    initial?: AcademyEnrollment
    onSubmit: (
        data: AcademyEnrollmentCreateDTO | AcademyEnrollmentUpdateDTO
    ) => Promise<void>
    onCancel: () => void
    submitting?: boolean
    defaultClassId?: string
}) {
    const isEdit = mode === "edit"
    const { data: classesData = [] } = useAcademyClasses({})
    const classes = Array.isArray(classesData) ? classesData : (classesData as any)?.items || []

    const { data: learnersData } = useUsers({ role: "LEARNER", limit: 1000 })
    const learners = learnersData?.data || []

    const { handleSubmit, control } = useForm<
        AcademyEnrollmentCreateDTO | AcademyEnrollmentUpdateDTO
    >({
        resolver: zodResolver(
            (isEdit
                ? academyEnrollmentUpdateDTOSchema
                : academyEnrollmentCreateDTOSchema) as any
        ) as any,
        defaultValues: isEdit
            ? {
                expiresAt: initial?.expiresAt ? new Date(initial.expiresAt).toISOString().split('T')[0] : undefined,
                status: initial?.status ?? 'ACTIVE',
                metadata: initial?.metadata ?? undefined,
            }
            : {
                classId: defaultClassId ?? "",
                userId: "",
                status: "ACTIVE",
            },
    })

    return (
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Card>
                <CardHeader>
                    <CardTitle>Thông tin ghi danh</CardTitle>
                    <CardDescription>
                        Chọn lớp học và học viên để ghi danh.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FieldGroup>
                        {!isEdit && (
                            <>
                                <Controller
                                    name={"classId" as any}
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FieldLabel>Lớp học</FieldLabel>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn lớp..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {classes.map((cls: any) => (
                                                        <SelectItem key={cls.id} value={cls.id}>
                                                            {cls.name} ({cls.code})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FieldError>{fieldState.error?.message}</FieldError>
                                        </Field>
                                    )}
                                />

                                <Controller
                                    name={"userId" as any}
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FieldLabel>Học viên</FieldLabel>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn học viên..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {learners.map((u: any) => (
                                                        <SelectItem key={u.id} value={u.id}>
                                                            {u.name} ({u.email})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FieldError>{fieldState.error?.message}</FieldError>
                                        </Field>
                                    )}
                                />
                            </>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                <SelectItem value="ACTIVE">Hoạt động (ACTIVE)</SelectItem>
                                                <SelectItem value="COMPLETED">Hoàn thành (COMPLETED)</SelectItem>
                                                <SelectItem value="CANCELLED">Đã huỷ (CANCELLED)</SelectItem>
                                                <SelectItem value="EXPIRED">Hết hạn (EXPIRED)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FieldError>{fieldState.error?.message}</FieldError>
                                    </Field>
                                )}
                            />

                            <Controller
                                name={"expiresAt" as any}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Ngày hết hạn</FieldLabel>
                                        <Input type="date" {...field} />
                                        <FieldError>{fieldState.error?.message}</FieldError>
                                    </Field>
                                )}
                            />
                        </div>

                        <Controller
                            name={"metadata" as any}
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Metadata (Key-Value)</FieldLabel>
                                    <KeyValueEditor
                                        value={field.value || {}}
                                        onChange={field.onChange}
                                        presets={[
                                            { key: "source", label: "Nguồn", defaultValue: "admin" },
                                            { key: "notes", label: "Ghi chú", defaultValue: "" },
                                        ]}
                                    />
                                    <FieldError>{fieldState.error?.message}</FieldError>
                                </Field>
                            )}
                        />
                    </FieldGroup>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={submitting}
                >
                    Hủy
                </Button>
                <Button type="submit" disabled={submitting}>
                    {submitting ? <Spinner className="mr-2" /> : null}
                    {isEdit ? "Lưu thay đổi" : "Ghi danh học viên"}
                </Button>
            </div>
        </form>
    )
}
