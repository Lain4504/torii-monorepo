import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
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
    academyQuizTemplateCreateDTOSchema,
    academyQuizTemplateUpdateDTOSchema,
    type AcademyQuizTemplateCreateDTO,
    type AcademyQuizTemplateUpdateDTO,
} from "@workspace/schemas"
import type { AcademyQuizTemplate } from "@/lib/api/services/academy-quiz-templates"
import { useAcademyCourseProfiles } from "@/lib/api/services/academy-course-profiles"
import { useAcademyQuestionPools } from "@/lib/api/services/academy-question-pools"
import { useAcademyExams } from "@/lib/api/services/academy-exams"
import { RichTextEditor } from "@/components/editor/rich-text-editor"
import { Info, Settings2 } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@workspace/ui/components/command"
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover"
import { cn } from "@workspace/ui/lib/utils"
import { Check, ChevronsUpDown } from "lucide-react"
import { KeyValueEditor } from "@/components/academy/key-value-editor"
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert"

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

    const { handleSubmit, control, watch } = useForm<
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
                courseProfileId: (initial as any)?.courseProfileId ?? "",
                title: "",
                description: "",
                questionPoolId: undefined,
                defaultMaxAttempts: 1,
            },
    })

    const selectedCourseProfileId = watch("courseProfileId" as any) || initial?.courseProfileId
    const selectedPoolId = watch("questionPoolId" as any)
    const selectedPool = pools.find(p => p.id === selectedPoolId)
    const selectedDefaultExamId = watch("settings.defaultExamId" as any)
    const { data: exams = [] } = useAcademyExams(
        selectedCourseProfileId
            ? { courseProfileId: selectedCourseProfileId, status: "PUBLISHED" }
            : {}
    )
    const [poolOpen, setPoolOpen] = useState(false)

    return (
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Alert>
                <AlertTitle>Flow thao tác gợi ý</AlertTitle>
                <AlertDescription>
                    Tạo Quiz Template trước. Sau đó có thể gắn đề mặc định ngay hoặc để sau. Khi tạo Class Quiz:
                    VOD dùng đề mặc định này, LIVE có thể override theo lớp.
                </AlertDescription>
            </Alert>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Nội dung mẫu Quiz</CardTitle>
                            <CardDescription>
                                Mô tả chi tiết mục tiêu của bài kiểm tra này.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FieldGroup>
                                <Controller
                                    name={"title" as any}
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FieldLabel>Tiêu đề Mẫu</FieldLabel>
                                            <Input placeholder="Ví dụ: Quiz Tổng hợp N5 - Tuần 1" {...field} className="text-lg font-medium h-12" />
                                            <FieldError>{fieldState.error?.message}</FieldError>
                                        </Field>
                                    )}
                                />

                                <Controller
                                    name={"description" as any}
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FieldLabel>Hướng dẫn làm bài</FieldLabel>
                                            <RichTextEditor
                                                initialContent={field.value || ""}
                                                onUpdate={(data: string) => field.onChange(data)}
                                            />
                                            <FieldError>{fieldState.error?.message}</FieldError>
                                        </Field>
                                    )}
                                />
                            </FieldGroup>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings2 className="size-4" /> Cấu hình nâng cao
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Controller
                                name={"settings" as any}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Cài đặt (Key-Value)</FieldLabel>
                                        <KeyValueEditor
                                            value={field.value || {}}
                                            onChange={field.onChange}
                                            presets={[
                                                { key: "summary", label: "Tóm tắt bài tập (Summary)", defaultValue: "Mô tả ngắn..." },
                                                { key: "shuffleQuestions", label: "Trộn câu hỏi", defaultValue: "true" },
                                                { key: "showResultType", label: "Hiển thị kết quả", defaultValue: "DETAILED" },
                                                { key: "passingScore", label: "Điểm đạt", defaultValue: "50" },
                                                { key: "timeLimit", label: "Thời gian (phút)", defaultValue: "60" },
                                                { key: "allowReview", label: "Xem lại bài", defaultValue: "true" },
                                            ]}
                                        />
                                        <FieldDescription>Thiết lập các thông số bổ sung như thời gian, số lần thử, trộn câu hỏi...</FieldDescription>
                                        <FieldError>{fieldState.error?.message}</FieldError>
                                    </Field>
                                )}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <Card className="bg-muted/10 border-dashed border-2">
                        <CardHeader>
                            <CardTitle className="text-sm">Phạm vi & Nguồn câu hỏi</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!isEdit && (
                                <Controller
                                    name={"courseProfileId" as any}
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FieldLabel>Khóa học áp dụng</FieldLabel>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger className="bg-background">
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
                                name={"questionPoolId" as any}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Ngân hàng câu hỏi (Pool)</FieldLabel>
                                        <Popover open={poolOpen} onOpenChange={setPoolOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={poolOpen}
                                                    className="w-full justify-between bg-background"
                                                >
                                                    {selectedPool ? selectedPool.name : "Chọn Pool..."}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0" align="start">
                                                <Command>
                                                    <CommandInput placeholder="Tìm kiếm pool..." />
                                                    <CommandList>
                                                        <CommandEmpty>Không tìm thấy pool nào.</CommandEmpty>
                                                        <CommandGroup>
                                                            <CommandItem
                                                                onSelect={() => {
                                                                    field.onChange(undefined)
                                                                    setPoolOpen(false)
                                                                }}
                                                            >
                                                                <Check className={cn("mr-2 h-4 w-4", !field.value ? "opacity-100" : "opacity-0")} />
                                                                -- Không dùng pool --
                                                            </CommandItem>
                                                            {pools.map((p) => (
                                                                <CommandItem
                                                                    key={p.id}
                                                                    value={p.name}
                                                                    onSelect={() => {
                                                                        field.onChange(p.id)
                                                                        setPoolOpen(false)
                                                                    }}
                                                                >
                                                                    <Check className={cn("mr-2 h-4 w-4", field.value === p.id ? "opacity-100" : "opacity-0")} />
                                                                    <div className="flex flex-col">
                                                                        <span>{p.name}</span>
                                                                        <span className="text-[10px] text-muted-foreground uppercase">{p.code} • {p.level}</span>
                                                                    </div>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        {selectedPool && (
                                            <div className="mt-2 p-3 bg-primary/5 rounded-lg border border-primary/10 space-y-2">
                                                <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                                                    <Info className="size-3" /> Chi tiết Pool
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-[11px]">
                                                    <div className="text-muted-foreground">Level: <span className="text-foreground">{selectedPool.level || "N/A"}</span></div>
                                                    <div className="text-muted-foreground">Category: <span className="text-foreground">{selectedPool.category || "N/A"}</span></div>
                                                </div>
                                            </div>
                                        )}
                                        <FieldError>{fieldState.error?.message}</FieldError>
                                    </Field>
                                )}
                            />
                            <Controller
                                name={"settings.defaultExamId" as any}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Đề mặc định cho Quiz Template (khuyên dùng cho VOD)</FieldLabel>
                                        <Select
                                            value={field.value ?? "NONE"}
                                            onValueChange={(value) =>
                                                field.onChange(value === "NONE" ? undefined : value)
                                            }
                                        >
                                            <SelectTrigger className="bg-background">
                                                <SelectValue placeholder="Chưa chọn đề mặc định" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="NONE">Chưa gắn đề (chọn sau)</SelectItem>
                                                {exams.map((exam) => (
                                                    <SelectItem key={exam.id} value={exam.id}>
                                                        {exam.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FieldDescription>
                                            Không bắt buộc ở bước tạo template. Bạn có thể tạo template trước, rồi gắn đề sau.
                                        </FieldDescription>
                                        <FieldDescription>
                                            Nếu cần tạo đề mới, vào{" "}
                                            <Link to="/academy/exams/new" className="text-primary hover:underline">
                                                Academy Exams
                                            </Link>
                                            .
                                        </FieldDescription>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link to="/academy/exams/new">Tạo đề mới</Link>
                                            </Button>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link to="/academy/exams">Mở danh sách đề</Link>
                                            </Button>
                                        </div>
                                        <FieldError>{fieldState.error?.message}</FieldError>
                                    </Field>
                                )}
                            />
                            {selectedDefaultExamId ? (
                                <FieldDescription>
                                    Đề mặc định đã chọn: <span className="font-medium">{selectedDefaultExamId}</span>
                                </FieldDescription>
                            ) : null}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Luật mặc định</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Controller
                                name={"defaultTimeLimitMinutes" as any}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Thời gian làm (phút)</FieldLabel>
                                        <Input
                                            type="number"
                                            placeholder="Phút..."
                                            {...field}
                                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                        />
                                        <FieldDescription>Để trống = Không giới hạn.</FieldDescription>
                                        <FieldError>{fieldState.error?.message}</FieldError>
                                    </Field>
                                )}
                            />

                            <Controller
                                name={"defaultMaxAttempts" as any}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Số lần thử</FieldLabel>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                        <FieldError>{fieldState.error?.message}</FieldError>
                                    </Field>
                                )}
                            />

                            <Controller
                                name={"defaultPassingScorePercent" as any}
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Điểm đạt (%)</FieldLabel>
                                        <Input
                                            type="number"
                                            placeholder="80..."
                                            {...field}
                                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                        />
                                        <FieldError>{fieldState.error?.message}</FieldError>
                                    </Field>
                                )}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
                <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
                    Hủy bỏ
                </Button>
                <Button type="submit" disabled={submitting} className="min-w-[150px]">
                    {submitting ? <Spinner className="mr-2" /> : null}
                    {isEdit ? "Cập nhật Mẫu" : "Tạo Mẫu mới"}
                </Button>
            </div>
        </form>
    )
}
