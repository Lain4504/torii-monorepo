"use client"

import * as React from "react"
import { Sparkles, ArrowRight, RotateCcw, Bot, CheckCircle2, AlertCircle, Lightbulb } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Alert, AlertTitle, AlertDescription } from "@workspace/ui/components/alert"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@workspace/ui/components/empty"
import { Separator } from "@workspace/ui/components/separator"
import { agentApi } from "@/lib/api/services/agent-api"
import { AgentGrammarCheckResponseDTO as GrammarCheckResponse } from "@workspace/schemas"
import { Spinner } from "@workspace/ui/components/spinner"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Field, FieldError } from "@workspace/ui/components/field"

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
        <div className="h-full overflow-y-auto w-full">
            <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 md:px-8 space-y-8 animate-in fade-in duration-500">
                {/* Header Section */}
                <header className="space-y-2 border-b pb-6">
                    <div className="flex items-center gap-2 text-primary font-medium">
                        <Sparkles className="size-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">AI Sensei</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-foreground">
                                Kiểm tra Ngữ pháp
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Phân tích và tối ưu hóa ngữ pháp tiếng Nhật của bạn với sự hỗ trợ từ trí tuệ nhân tạo.
                            </p>
                        </div>
                        {result && (
                            <Button variant="outline" size="sm" onClick={handleReset} className="w-fit">
                                <RotateCcw className="mr-2 size-4" />
                                Kiểm tra câu khác
                            </Button>
                        )}
                    </div>
                </header>

                <div className="grid lg:grid-cols-2 gap-8 items-start">
                    {/* Input Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Nội dung tiếng Nhật</CardTitle>
                            <CardDescription>Nhập câu hoặc đoạn văn bạn muốn kiểm tra.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form id="grammar-form" onSubmit={form.handleSubmit(handleCheck)}>
                                <Controller
                                    name="text"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <Textarea
                                                {...field}
                                                id={field.name}
                                                placeholder="Ví dụ: 私は昨日、日本へ行きましたですが..."
                                                className="min-h-[300px] resize-none"
                                                disabled={isLoading}
                                            />
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />
                            </form>
                        </CardContent>
                        <CardFooter className="flex items-center justify-between">
                            <div className="text-xs text-muted-foreground">
                                {form.watch("text").length} ký tự
                            </div>
                            <div className="flex gap-2">
                                {result && (
                                    <Button variant="outline" onClick={handleReset} disabled={isLoading}>
                                        <RotateCcw className="mr-2 size-4" />
                                        Làm mới
                                    </Button>
                                )}
                                <Button
                                    form="grammar-form"
                                    type="submit"
                                    disabled={!form.watch('text').trim() || isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Spinner className="mr-2" />
                                            Đang kiểm tra
                                        </>
                                    ) : (
                                        <>
                                            Kiểm tra
                                            <ArrowRight className="ml-2 size-4" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>

                    {/* Result Section */}
                    <div className="space-y-6">
                        {!result && !isLoading && (
                            <Empty className="h-full min-h-[400px]">
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <Bot className="size-5" />
                                    </EmptyMedia>
                                    <EmptyTitle>Sensei đang sẳn sàng</EmptyTitle>
                                    <EmptyDescription>
                                        Nhận kết quả phân tích và gợi ý ngay sau khi gửi nội dung.
                                    </EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        )}

                        {isLoading && (
                            <div className="space-y-4">
                                <Skeleton className="h-[200px] w-full" />
                                <Skeleton className="h-[100px] w-full" />
                                <Skeleton className="h-[100px] w-full" />
                            </div>
                        )}

                        {result && !isLoading && (
                            <div className="space-y-6">
                                {/* Corrected Text Card */}
                                <Card className="border-primary/20 bg-primary/5">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <Badge variant="outline" className="bg-background">Kết quả đề xuất</Badge>
                                            <CheckCircle2 className="size-5 text-emerald-500" />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-xl font-bold leading-relaxed">
                                            {result.correctedText}
                                        </p>
                                        <Separator />
                                        <div>
                                            <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mb-1.5">Nội dung gốc của bạn</p>
                                            <p className="text-sm text-muted-foreground italic bg-muted/30 p-3 rounded-lg border border-dashed">
                                                {result.originalText}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Explanations */}
                                {result.errors.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-semibold flex items-center gap-2 text-destructive">
                                            <AlertCircle className="size-4" />
                                            Lỗi ngữ pháp cần lưu ý
                                        </h3>
                                        {result.errors.map((err, i) => (
                                            <Alert key={i} variant="destructive">
                                                <AlertCircle className="size-4" />
                                                <AlertTitle>Phân tích</AlertTitle>
                                                <AlertDescription>
                                                    {err.explanation}
                                                </AlertDescription>
                                            </Alert>
                                        ))}
                                    </div>
                                )}

                                {/* Suggestions */}
                                {result.suggestions.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-semibold flex items-center gap-2 text-primary">
                                            <Lightbulb className="size-4" />
                                            Gợi ý diễn đạt tự nhiên hơn
                                        </h3>
                                        {result.suggestions.map((sug, i) => (
                                            <Alert key={i}>
                                                <Lightbulb className="size-4" />
                                                <AlertTitle>Gợi ý</AlertTitle>
                                                <AlertDescription>
                                                    {sug}
                                                </AlertDescription>
                                            </Alert>
                                        ))}
                                    </div>
                                )}

                                {result.errors.length === 0 && result.suggestions.length === 0 && (
                                    <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800">
                                        <CheckCircle2 className="size-4 text-emerald-600" />
                                        <AlertTitle>Rất tốt!</AlertTitle>
                                        <AlertDescription>
                                            Câu của bạn đã hoàn toàn chính xác và tự nhiên.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
