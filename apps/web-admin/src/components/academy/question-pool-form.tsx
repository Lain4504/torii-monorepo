import { Controller, useForm } from "react-hook-form"
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
    academyQuestionPoolCreateDTOSchema,
    academyQuestionPoolUpdateDTOSchema,
    type AcademyQuestionPoolCreateDTO,
    type AcademyQuestionPoolUpdateDTO,
} from "@workspace/schemas"
import type { AcademyQuestionPool } from "@/lib/api/services/academy-question-pools"
import { useAcademyCourseProfiles } from "@/lib/api/services/academy-course-profiles"

export function QuestionPoolForm({
    mode,
    initial,
    onSubmit,
    onCancel,
    submitting,
}: {
    mode: "create" | "edit"
    initial?: AcademyQuestionPool
    onSubmit: (
        data: AcademyQuestionPoolCreateDTO | AcademyQuestionPoolUpdateDTO,
    ) => Promise<void>
    onCancel: () => void
    submitting?: boolean
}) {
    const isEdit = mode === "edit"
    const { data: profiles = [] } = useAcademyCourseProfiles({})

    const { handleSubmit, control } = useForm<
        AcademyQuestionPoolCreateDTO | AcademyQuestionPoolUpdateDTO
    >({
        resolver: zodResolver(
            (isEdit ? academyQuestionPoolUpdateDTOSchema : academyQuestionPoolCreateDTOSchema) as any,
        ) as any,
        defaultValues: isEdit
            ? {
                code: initial?.code ?? "",
                name: initial?.name ?? "",
                description: initial?.description ?? "",
                courseProfileId: initial?.courseProfileId ?? undefined,
                level: initial?.level ?? "",
                category: initial?.category ?? "",
                status: initial?.status ?? "DRAFT",
                metadata: initial?.metadata ?? undefined,
            }
            : {
                code: "",
                name: "",
                description: "",
                courseProfileId: undefined,
                level: "",
                category: "",
                status: "DRAFT",
                metadata: undefined,
            },
    })

    return (
        <form
            className="space-y-6"
            onSubmit={handleSubmit(async (data) => onSubmit(data))}
            noValidate
        >
            <Card>
                <CardHeader>
                    <CardTitle>Thông tin Question Pool</CardTitle>
                    <CardDescription>Pool giúp nhóm các câu hỏi theo trình độ, danh mục hoặc course profile.</CardDescription>
                </CardHeader>
                <CardContent>
                    <FieldGroup>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Controller
                                name={"code" as any}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Mã Pool (Code)</FieldLabel>
                                        <Input placeholder="POOL_N5_VOCAB..." {...field} />
                                        <FieldError>{fieldState.error?.message}</FieldError>
                                    </Field>
                                )}
                            />
                            <Controller
                                name={"name" as any}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Tên Pool</FieldLabel>
                                        <Input placeholder="N5 Vocabulary Pool..." {...field} />
                                        <FieldError>{fieldState.error?.message}</FieldError>
                                    </Field>
                                )}
                            />
                        </div>

                        <Controller
                            name={"description" as any}
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Mô tả</FieldLabel>
                                    <Textarea placeholder="Mô tả về pool này..." {...field} />
                                    <FieldError>{fieldState.error?.message}</FieldError>
                                </Field>
                            )}
                        />

                        <div className="grid gap-4 md:grid-cols-2">
                            <Controller
                                name={"courseProfileId" as any}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Course Profile</FieldLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn Profile (optional)..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {profiles.map((p) => (
                                                    <SelectItem key={p.id} value={p.id}>
                                                        {p.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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
                                                <SelectItem value="DRAFT">DRAFT</SelectItem>
                                                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                                                <SelectItem value="ARCHIVED">ARCHIVED</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FieldError>{fieldState.error?.message}</FieldError>
                                    </Field>
                                )}
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <Controller
                                name={"level" as any}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Level</FieldLabel>
                                        <Input placeholder="N1, N2, N3..." {...field} />
                                        <FieldError>{fieldState.error?.message}</FieldError>
                                    </Field>
                                )}
                            />
                            <Controller
                                name={"category" as any}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Danh mục</FieldLabel>
                                        <Input placeholder="Vocabulary, Kanji..." {...field} />
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
                                    <FieldLabel>Metadata (JSON)</FieldLabel>
                                    <Textarea
                                        placeholder='Ví dụ: {"tags":["JLPT N5"]}'
                                        className="font-mono text-xs shadow-none"
                                        rows={3}
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
                    </FieldGroup>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
                    Hủy
                </Button>
                <Button type="submit" disabled={submitting}>
                    {submitting ? <Spinner className="mr-2" /> : null}
                    {isEdit ? "Lưu thay đổi" : "Tạo Pool"}
                </Button>
            </div>
        </form>
    )
}
