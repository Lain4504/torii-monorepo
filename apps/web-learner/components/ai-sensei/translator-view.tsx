"use client"

import * as React from "react"
import { Languages, ArrowRightLeft, Copy, Sparkles, Bot } from 'lucide-react'
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@workspace/ui/components/card"
import { Textarea } from "@workspace/ui/components/textarea"
import { agentApi } from "@/lib/api/services/agent-api"
import { AgentTranslateResponseDTO as TranslateResponse } from "@workspace/schemas"
import { Alert, AlertTitle, AlertDescription } from "@workspace/ui/components/alert"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@workspace/ui/components/empty"
import { Separator } from "@workspace/ui/components/separator"
import { Badge } from "@workspace/ui/components/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Spinner } from '@workspace/ui/components/spinner'
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Field, FieldLabel, FieldError } from "@workspace/ui/components/field"

const translatorFormSchema = z.object({
    sourceLang: z.string().min(1),
    targetLang: z.string().min(1),
    text: z.string().min(1, "Vui lòng nhập nội dung cần dịch"),
})

type TranslatorFormData = z.infer<typeof translatorFormSchema>

export function TranslatorView() {
    const [result, setResult] = React.useState<TranslateResponse | null>(null)
    const [isLoading, setIsLoading] = React.useState(false)

    const languages = [
        { value: "Japanese", label: "Tiếng Nhật" },
        { value: "English", label: "Tiếng Anh" },
        { value: "Vietnamese", label: "Tiếng Việt" },
    ]

    const form = useForm<TranslatorFormData>({
        resolver: zodResolver(translatorFormSchema),
        defaultValues: {
            sourceLang: "Japanese",
            targetLang: "Vietnamese",
            text: "",
        },
    })

    const handleTranslate = async (data: TranslatorFormData) => {
        setIsLoading(true)
        try {
            const res = await agentApi.sensei.translate(data.text, data.sourceLang, data.targetLang)
            setResult(res)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const swapLanguages = () => {
        const { sourceLang, targetLang } = form.getValues()
        form.setValue("sourceLang", targetLang)
        form.setValue("targetLang", sourceLang)
        if (result?.translatedText) {
            form.setValue("text", result.translatedText)
        }
        setResult(null)
    }

    const handleCopy = () => {
        if (result?.translatedText) {
            navigator.clipboard.writeText(result.translatedText)
        }
    }

    return (
        <div className="container max-w-6xl py-8 space-y-8">
            <header className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Dịch thuật</h1>
                <p className="text-muted-foreground">Dịch văn bản giữa các ngôn ngữ với AI Sensei.</p>
            </header>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="flex-1 w-full">
                            <Controller
                                name="sourceLang"
                                control={form.control}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Từ" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {languages.map(lang => (
                                                <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <Button variant="ghost" size="icon" onClick={swapLanguages}>
                            <ArrowRightLeft className="size-4" />
                        </Button>

                        <div className="flex-1 w-full">
                            <Controller
                                name="targetLang"
                                control={form.control}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sang" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {languages.map(lang => (
                                                <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <form onSubmit={form.handleSubmit(handleTranslate)}>
                            <Controller
                                name="text"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <div className="space-y-2">
                                        <Textarea
                                            {...field}
                                            placeholder="Nhập nội dung cần dịch..."
                                            className="min-h-[200px]"
                                            disabled={isLoading}
                                        />
                                        {fieldState.invalid && <p className="text-sm text-destructive">{fieldState.error?.message}</p>}
                                    </div>
                                )}
                            />
                        </form>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">{form.watch("text").length} ký tự</span>
                            <Button
                                onClick={form.handleSubmit(handleTranslate)}
                                disabled={!form.watch("text").trim() || isLoading}
                            >
                                {isLoading ? <Spinner className="mr-2" /> : <Sparkles className="size-4 mr-2" />}
                                Dịch
                            </Button>
                        </div>
                    </div>

                    <div className="bg-muted/50 rounded-md p-4 flex flex-col min-h-[200px]">
                        {isLoading ? (
                            <Skeleton className="h-full w-full" />
                        ) : result ? (
                            <div className="flex-1 flex flex-col justify-between">
                                <p className="text-lg leading-relaxed">{result.translatedText}</p>
                                <div className="pt-4 flex justify-end">
                                    <Button variant="outline" size="sm" onClick={handleCopy}>
                                        <Copy className="size-4 mr-2" /> Sao chép
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                                <p className="text-sm">Bản dịch sẽ hiển thị ở đây</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {result?.culturalNotes && (
                <Alert>
                    <Bot className="size-4" />
                    <AlertTitle>Ghi chú văn hóa</AlertTitle>
                    <AlertDescription>
                        {result.culturalNotes}
                    </AlertDescription>
                </Alert>
            )}
        </div>
    )
}
