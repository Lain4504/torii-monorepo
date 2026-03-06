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
    academyAssignmentTemplateCreateDTOSchema,
    academyAssignmentTemplateUpdateDTOSchema,
    type AcademyAssignmentTemplateCreateDTO,
    type AcademyAssignmentTemplateUpdateDTO,
} from "@workspace/schemas"
import type { AcademyAssignmentTemplate } from "@/lib/api/services/academy-assignment-templates"
import { useAcademyCourseProfiles } from "@/lib/api/services/academy-course-profiles"
import { RichTextEditor } from "@/components/editor/rich-text-editor"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@workspace/ui/components/tabs"

export function AssignmentTemplateForm({
    mode,
    initial,
    onSubmit,
    onCancel,
    submitting,
}: {
    mode: "create" | "edit"
    initial?: AcademyAssignmentTemplate
    onSubmit: (
        data: AcademyAssignmentTemplateCreateDTO | AcademyAssignmentTemplateUpdateDTO
    ) => Promise<void>
    onCancel: () => void
    submitting?: boolean
}) {
    const isEdit = mode === "edit"
    const { data: courseProfiles = [] } = useAcademyCourseProfiles({})

    const { handleSubmit, control } = useForm<
        AcademyAssignmentTemplateCreateDTO | AcademyAssignmentTemplateUpdateDTO
    >({
        resolver: zodResolver(
            (isEdit
                ? academyAssignmentTemplateUpdateDTOSchema
                : academyAssignmentTemplateCreateDTOSchema) as any
        ) as any,
        defaultValues: isEdit
            ? {
                title: initial?.title ?? "",
                description: initial?.description ?? "",
                defaultType: initial?.defaultType ?? "TEXT",
                defaultMaxScore: initial?.defaultMaxScore ?? undefined,
                defaultRubric: initial?.defaultRubric ?? undefined,
                defaultSubmissionSettings: initial?.defaultSubmissionSettings ?? undefined,
            }
            : {
                courseProfileId: "",
                title: "",
                description: "",
                defaultType: "TEXT",
            },
    })

    return (
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Card>
                <CardHeader>
                    <CardTitle>Thông tin cơ bản</CardTitle>
                    <CardDescription>
                        Thiết lập tên và mô tả cho mẫu Assignment.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FieldGroup>
                        {!isEdit && (
                            <Controller
                                name={"courseProfileId" as any}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Course Profile</FieldLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn Course Profile..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {courseProfiles.map((cp) => (
                                                    <SelectItem key={cp.id} value={cp.id}>
                                                        {cp.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FieldError>{fieldState.error?.message}</FieldError>
                                    </Field>
                                )}
                            />
                        )}

                        <Controller
                            name={"title" as any}
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Tiêu đề</FieldLabel>
                                    <Input placeholder="Bài tập tuần 1..." {...field} />
                                    <FieldError>{fieldState.error?.message}</FieldError>
                                </Field>
                            )}
                        />

                        <Controller
                            name={"description" as any}
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Mô tả</FieldLabel>
                                    <Tabs defaultValue="edit">
                                        <TabsList className="mb-4">
                                            <TabsTrigger value="edit">Chỉnh sửa</TabsTrigger>
                                            <TabsTrigger value="preview">Xem trước</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="edit">
                                            <RichTextEditor
                                                initialContent={field.value || ""}
                                                onUpdate={(html) => field.onChange(html)}
                                            />
                                        </TabsContent>
                                        <TabsContent value="preview">
                                            <div
                                                className="border rounded-md p-4 min-h-[150px] prose prose-sm dark:prose-invert max-w-none"
                                                dangerouslySetInnerHTML={{
                                                    __html: field.value || "<em>Chưa có hướng dẫn.</em>",
                                                }}
                                            />
                                        </TabsContent>
                                    </Tabs>
                                    <FieldError>{fieldState.error?.message}</FieldError>
                                </Field>
                            )}
                        />
                    </FieldGroup>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Cấu hình mặc định</CardTitle>
                    <CardDescription>
                        Các thiết lập này sẽ được áp dụng khi tạo Class Assessment từ mẫu này.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FieldGroup>
                        <Controller
                            name={"defaultType" as any}
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Loại nộp bài</FieldLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn loại..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="TEXT">Chỉ văn bản</SelectItem>
                                            <SelectItem value="FILE">Chỉ file</SelectItem>
                                            <SelectItem value="BOTH">Cả hai</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FieldError>{fieldState.error?.message}</FieldError>
                                </Field>
                            )}
                        />

                        <Controller
                            name={"defaultMaxScore" as any}
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Điểm tối đa</FieldLabel>
                                    <Input
                                        type="number"
                                        placeholder="100"
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                    />
                                    <FieldError>{fieldState.error?.message}</FieldError>
                                </Field>
                            )}
                        />

                        <Controller
                            name={"defaultSubmissionSettings" as any}
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Cài đặt nộp bài (JSON)</FieldLabel>
                                    <Textarea
                                        placeholder='Ví dụ: {"allowLate":true}'
                                        value={
                                            typeof field.value === "string"
                                                ? field.value
                                                : field.value
                                                    ? JSON.stringify(field.value, null, 2)
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
                    {isEdit ? "Lưu thay đổi" : "Tạo Assignment Template"}
                </Button>
            </div>
        </form>
    )
}
