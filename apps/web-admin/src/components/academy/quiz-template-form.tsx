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
    academyQuizTemplateCreateDTOSchema,
    academyQuizTemplateUpdateDTOSchema,
    type AcademyQuizTemplateCreateDTO,
    type AcademyQuizTemplateUpdateDTO,
} from "@workspace/schemas"
import type { AcademyQuizTemplate } from "@/lib/api/services/academy-quiz-templates"
import { useAcademyCourseProfiles } from "@/lib/api/services/academy-course-profiles"
import { useAcademyQuestionPools } from "@/lib/api/services/academy-question-pools"
import { RichTextEditor } from "@/components/editor/rich-text-editor"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@workspace/ui/components/tabs"

export function QuizTemplateForm({
    mode,
    initial,
    onSubmit,
    onCancel,
    submitting,
}: {
    mode: "create" | "edit"
    initial?: AcademyQuizTemplate
    onSubmit: (
        data: AcademyQuizTemplateCreateDTO | AcademyQuizTemplateUpdateDTO
    ) => Promise<void>
    onCancel: () => void
    submitting?: boolean
}) {
    const isEdit = mode === "edit"
    const { data: courseProfiles = [] } = useAcademyCourseProfiles({})
    const { data: pools = [] } = useAcademyQuestionPools({})

    const { handleSubmit, control } = useForm<
        AcademyQuizTemplateCreateDTO | AcademyQuizTemplateUpdateDTO
    >({
        resolver: zodResolver(
            (isEdit
                ? academyQuizTemplateUpdateDTOSchema
                : academyQuizTemplateCreateDTOSchema) as any
        ) as any,
        defaultValues: isEdit
            ? {
                title: initial?.title ?? "",
                description: initial?.description ?? "",
                questionPoolId: initial?.questionPoolId ?? undefined,
                defaultTimeLimitMinutes: initial?.defaultTimeLimitMinutes ?? undefined,
                defaultMaxAttempts: initial?.defaultMaxAttempts ?? 1,
                defaultPassingScorePercent: initial?.defaultPassingScorePercent ?? undefined,
                settings: initial?.settings ?? undefined,
            }
            : {
                courseProfileId: "",
                title: "",
                description: "",
                questionPoolId: undefined,
                defaultMaxAttempts: 1,
            },
    })

    return (
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Card>
                <CardHeader>
                    <CardTitle>Thông tin cơ bản</CardTitle>
                    <CardDescription>
                        Thiết lập tên và mô tả cho mẫu Quiz.
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
                                    <Input placeholder="Quiz giới thiệu..." {...field} />
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
                                                onUpdate={(data: string) => field.onChange(data)}
                                            />
                                        </TabsContent>
                                        <TabsContent value="preview">
                                            <div
                                                className="border rounded-md p-4 min-h-[150px] prose prose-sm dark:prose-invert max-w-none"
                                                dangerouslySetInnerHTML={{
                                                    __html: field.value || "<em>Chưa có mô tả.</em>",
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Controller
                                name={"defaultTimeLimitMinutes" as any}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Thời gian làm bài (phút)</FieldLabel>
                                        <Input
                                            type="number"
                                            placeholder="Trống = Không giới hạn"
                                            {...field}
                                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                        />
                                        <FieldError>{fieldState.error?.message}</FieldError>
                                    </Field>
                                )}
                            />

                            <Controller
                                name={"defaultMaxAttempts" as any}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Số lần làm tối đa</FieldLabel>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                        <FieldError>{fieldState.error?.message}</FieldError>
                                    </Field>
                                )}
                            />
                        </div>

                        <Controller
                            name={"defaultPassingScorePercent" as any}
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Điểm đạt (%)</FieldLabel>
                                    <Input
                                        type="number"
                                        placeholder="80"
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                    />
                                    <FieldError>{fieldState.error?.message}</FieldError>
                                </Field>
                            )}
                        />

                        <Controller
                            name={"questionPoolId" as any}
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Question Pool (Tùy chọn)</FieldLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn Pool để lấy câu hỏi ngẫu nhiên..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">-- Không dùng pool --</SelectItem>
                                            {pools.map((p) => (
                                                <SelectItem key={p.id} value={p.id}>
                                                    {p.name} ({p.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FieldError>{fieldState.error?.message}</FieldError>
                                </Field>
                            )}
                        />

                        <Controller
                            name={"settings" as any}
                            control={control}
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Cài đặt khác (JSON)</FieldLabel>
                                    <Textarea
                                        placeholder='Ví dụ: {"shuffleQuestions":true}'
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
                    {isEdit ? "Lưu thay đổi" : "Tạo Quiz Template"}
                </Button>
            </div>
        </form>
    )
}
