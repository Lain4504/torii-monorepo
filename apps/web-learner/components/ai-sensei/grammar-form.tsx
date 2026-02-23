"use client"

import * as React from "react"
import { Sparkles, Check, ArrowRight, BookOpen, AlertCircle, Lightbulb, RotateCcw } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { agentApi } from "@/lib/api/services/agent-api"
import { AgentGrammarCheckResponseDTO as GrammarCheckResponse } from "@workspace/schemas"
import { cn } from "@workspace/ui/lib/utils"
import { Spinner } from "@workspace/ui/components/spinner"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Field, FieldLabel, FieldError } from "@workspace/ui/components/field"

const grammarFormSchema = z.object({
    text: z.string().min(1, "Vui lòng nhập nội dung"),
})

type GrammarFormData = z.infer<typeof grammarFormSchema>

export function GrammarForm() {
    const [isLoading, setIsLoading] = React.useState(false)
    const [result, setResult] = React.useState<GrammarCheckResponse | null>(null)

    const form = useForm<GrammarFormData>({
        resolver: zodResolver(grammarFormSchema),
        defaultValues: {
            text: "",
        },
    })

    const handleCheck = async (data: GrammarFormData) => {
        setIsLoading(true)

        try {
            const response = await agentApi.sensei.checkGrammar(data.text)
            setResult(response)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleReset = () => {
        form.reset()
        setResult(null)
    }

    return (
        <div className="mx-auto max-w-5xl space-y-8 p-4 md:p-8">
            {/* Header Section */}
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <BookOpen className="size-6 text-primary" />
                    <h1 className="text-3xl font-bold tracking-tight">
                        Grammar Guide
                    </h1>
                </div>
                <p className="text-muted-foreground font-medium">
                    Phân tích và tối ưu hóa ngữ pháp tiếng Nhật với AI Sensei
                </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
                {/* Left Side: Input */}
                <Card className="lg:col-span-5 bg-card/50">
                    <form onSubmit={form.handleSubmit(handleCheck)}>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-sm uppercase tracking-[0.2em] text-muted-foreground/60">Input Content</CardTitle>
                            <CardDescription>Nhập câu tiếng Nhật bạn muốn kiểm tra</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Controller
                                name="text"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <div className="relative group">
                                            <Textarea
                                                {...field}
                                                id={field.name}
                                                placeholder="VD: 私は日本語勉強します..."
                                                className="min-h-[200px] resize-none"
                                                aria-invalid={fieldState.invalid}
                                            />
                                            {field.value && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => form.setValue("text", "")}
                                                >
                                                    <RotateCcw className="size-3" />
                                                </Button>
                                            )}
                                        </div>
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </CardContent>
                        <CardFooter className="flex items-center justify-between py-4 border-t bg-muted/50">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                {form.watch("text").length} characters
                            </span>
                            <Button
                                type="submit"
                                disabled={!form.watch('text').trim() || isLoading}
                            >
                                {isLoading
                                    ? (
                                        <div className="flex items-center gap-2">
                                            <Spinner />
                                            <span>Đang xử lý...</span>
                                        </div>
                                    )
                                    : (
                                        <div className="flex items-center gap-2">
                                            <span>Kiểm tra</span>
                                            <ArrowRight className="size-4" />
                                        </div>
                                    )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                {/* Right Side: Results */}
                <div className="lg:col-span-7 space-y-6">
                    {!result && !isLoading && (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border/10 rounded-lg bg-muted/5 opacity-50">
                            <div className="size-16 rounded-lg bg-muted flex items-center justify-center mb-4">
                                <Sparkles className="size-8 text-muted-foreground/40" />
                            </div>
                            <p className="font-medium text-muted-foreground">Kết quả phân tích sẽ hiển thị tại đây</p>
                        </div>
                    )}

                    {isLoading && (
                        <div className="space-y-6">
                            <Skeleton className="h-[200px] w-full rounded-lg" />
                            <div className="grid grid-cols-2 gap-4">
                                <Skeleton className="h-40 w-full rounded-lg" />
                                <Skeleton className="h-40 w-full rounded-lg" />
                            </div>
                        </div>
                    )}

                    {result && !isLoading && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                            {/* Corrected Text Card */}
                            <Card className="relative overflow-hidden border-primary/20 bg-primary/5">
                                <div className="absolute top-0 right-0 p-4">
                                    <Badge>
                                        Corrected
                                    </Badge>
                                </div>
                                <CardHeader>
                                    <CardTitle className="text-sm uppercase tracking-[0.2em] text-green-600/70">Bản sửa đổi</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <p className="text-2xl font-bold leading-tight tracking-tight md:text-3xl">
                                        {result.correctedText}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="destructive">Gốc</Badge>
                                        <span className="text-xs font-medium text-muted-foreground">Lỗi Ngữ Pháp / Từ Vựng</span>
                                    </div>
                                    <div className="rounded-lg border bg-muted px-4 py-3">
                                        <span className="font-medium italic text-muted-foreground line-through decoration-destructive/50">
                                            {result.originalText}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Errors List */}
                                <Card className="bg-muted/50">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center gap-2 text-destructive">
                                            <AlertCircle className="size-4" />
                                            <CardTitle className="text-[10px] font-bold uppercase tracking-widest">Lỗi phát hiện</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {result.errors.length > 0
                                            ? (
                                                <ul className="space-y-2">
                                                    {result.errors.map((err, i) => (
                                                        <li key={i} className="text-sm font-medium leading-relaxed rounded-md border border-destructive/20 bg-destructive/5 p-3">
                                                            {err.explanation}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )
                                            : (
                                                <p className="text-xs italic text-muted-foreground">Không phát hiện lỗi nghiêm trọng</p>
                                            )}
                                    </CardContent>
                                </Card>

                                {/* Suggestions List */}
                                <Card className="bg-muted/50">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center gap-2 text-primary">
                                            <Lightbulb className="size-4" />
                                            <CardTitle className="text-[10px] font-bold uppercase tracking-widest">Gợi ý phát triển</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {result.suggestions.length > 0
                                            ? (
                                                <ul className="space-y-2">
                                                    {result.suggestions.map((sug, i) => (
                                                        <li key={i} className="text-sm font-medium leading-relaxed rounded-md border border-primary/20 bg-primary/5 p-3">
                                                            {sug}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )
                                            : (
                                                <p className="text-xs italic text-muted-foreground">Cấu trúc câu đã rất ổn</p>
                                            )}
                                    </CardContent>
                                </Card>
                            </div>

                            <Button
                                variant="outline"
                                className="w-full border-dashed"
                                onClick={handleReset}
                            >
                                <RotateCcw className="mr-2 size-4" />
                                Nhập câu mới
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
