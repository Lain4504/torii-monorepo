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
    academyQuestionPoolCreateDTOSchema,
    academyQuestionPoolUpdateDTOSchema,
    type AcademyQuestionPoolCreateDTO,
    type AcademyQuestionPoolUpdateDTO,
} from "@workspace/schemas"
import type { AcademyQuestionPool } from "@/lib/api/services/academy-question-pools"
import { useAcademyCourseProfiles } from "@/lib/api/services/academy-course-profiles"
import { KeyValueEditor } from "@/components/academy/key-value-editor"

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
                        <div className="grid gap-6 md:grid-cols-2">
                            <Controller
                                name={"code" as any}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Mã định danh (Code)</FieldLabel>
                                        <Input placeholder="Ví dụ: POOL_VOCAB_N5" {...field} className="font-mono uppercase" />
                                        <FieldDescription>Mã duy nhất để phân biệt các pool.</FieldDescription>
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
                                        <Input placeholder="Ví dụ: Pool Từ vựng N5" {...field} />
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
                                    <FieldLabel>Mô tả chi tiết</FieldLabel>
                                    <Textarea placeholder="Mô tả mục đích của pool này..." {...field} rows={3} />
                                    <FieldError>{fieldState.error?.message}</FieldError>
                                </Field>
                            )}
                        />

                        <div className="grid gap-6 md:grid-cols-3">
                            <Controller
                                name={"level" as any}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Cấp độ (Level)</FieldLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn Level..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="N1">JLPT N1</SelectItem>
                                                <SelectItem value="N2">JLPT N2</SelectItem>
                                                <SelectItem value="N3">JLPT N3</SelectItem>
                                                <SelectItem value="N4">JLPT N4</SelectItem>
                                                <SelectItem value="N5">JLPT N5</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FieldError>{fieldState.error?.message}</FieldError>
                                    </Field>
                                )}
                            />
                            <Controller
                                name={"category" as any}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Danh mục (Category)</FieldLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn Danh mục..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="VOCABULARY">Từ vựng</SelectItem>
                                                <SelectItem value="GRAMMAR">Ngữ pháp</SelectItem>
                                                <SelectItem value="KANJI">Hán tự</SelectItem>
                                                <SelectItem value="READING">Đọc hiểu</SelectItem>
                                                <SelectItem value="LISTENING">Nghe hiểu</SelectItem>
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
                                                <SelectValue placeholder="Trạng thái..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="DRAFT">Nháp (Draft)</SelectItem>
                                                <SelectItem value="PUBLISHED">Công khai (Published)</SelectItem>
                                                <SelectItem value="ARCHIVED">Lưu trữ (Archived)</SelectItem>
                                            </SelectContent>
                                        </Select>
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
                                            { key: "tags", label: "Thẻ (Tags)", defaultValue: "jlpt,n5" },
                                            { key: "difficulty", label: "Độ khó", defaultValue: "medium" },
                                            { key: "source", label: "Nguồn câu hỏi", defaultValue: "manual" },
                                        ]}
                                    />
                                    <FieldDescription>Thông tin bổ sung cho pool.</FieldDescription>
                                    <FieldError>{fieldState.error?.message}</FieldError>
                                </Field>
                            )}
                        />

                        <Controller
                            name={"courseProfileId" as any}
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Gắn với Course Profile (Tùy chọn)</FieldLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn Profile (optional)..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {profiles.map((p: any) => (
                                                <SelectItem key={p.id} value={p.id}>
                                                    {p.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FieldDescription>Nếu chọn, pool này chỉ hiển thị cho khóa học đó.</FieldDescription>
                                    <FieldError>{fieldState.error?.message}</FieldError>
                                </Field>
                            )}
                        />
                    </FieldGroup>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
                    Hủy bỏ
                </Button>
                <Button type="submit" disabled={submitting} className="px-8">
                    {submitting ? <Spinner className="mr-2" /> : null}
                    {isEdit ? "Cập nhật Pool" : "Tạo Pool"}
                </Button>
            </div>
        </form>
    )
}
