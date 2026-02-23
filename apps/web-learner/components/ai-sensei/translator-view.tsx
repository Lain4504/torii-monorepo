"use client"

import * as React from "react"
import { Languages, ArrowRightLeft, Copy, Sparkles } from 'lucide-react'
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@workspace/ui/components/card"
import { Textarea } from "@workspace/ui/components/textarea"
import { agentApi } from "@/lib/api/services/agent-api"
import { AgentTranslateResponseDTO as TranslateResponse } from "@workspace/schemas"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Spinner } from '@workspace/ui/components/spinner'
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
        { value: "Japanese", label: "Japanese" },
        { value: "English", label: "English" },
        { value: "Vietnamese", label: "Vietnamese" },
    ]

    const form = useForm<TranslatorFormData>({
        resolver: zodResolver(translatorFormSchema),
        defaultValues: {
            sourceLang: "Japanese",
            targetLang: "English",
            text: "",
        },
    })

    const handleTranslate = async (data: TranslatorFormData) => {
        setIsLoading(true)
        setResult(null)

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

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20 p-4 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Translator</h1>
                    <p className="text-muted-foreground font-medium">Dịch thuật & Giải thích văn hóa</p>
                </div>

                <div className="flex items-center gap-2 bg-card border border-border p-1 rounded-lg shadow-sm">
                    <Controller
                        name="sourceLang"
                        control={form.control}
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="w-[120px] border-0 focus:ring-0 text-sm font-medium">
                                    <SelectValue placeholder="Nguồn" />
                                </SelectTrigger>
                                <SelectContent>
                                    {languages.map(lang => (
                                        <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />

                    <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={swapLanguages}>
                        <ArrowRightLeft className="size-3.5" />
                    </Button>

                    <Controller
                        name="targetLang"
                        control={form.control}
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="w-[120px] border-0 focus:ring-0 text-sm font-medium">
                                    <SelectValue placeholder="Đích" />
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

            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-6 pb-4">
                {/* Source Input */}
                <Card
                    className="flex flex-col overflow-hidden focus-within:ring-1 focus-within:ring-primary/20 transition-all bg-card/50"
                >
                    <form
                        onSubmit={form.handleSubmit(handleTranslate)}
                        className="flex flex-col h-full"
                    >
                        <div className="flex-1 relative min-h-[300px]">
                            <Controller
                                name="text"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid} className="h-full">
                                        <Textarea
                                            {...field}
                                            id={field.name}
                                            placeholder="Nhập văn bản cần dịch..."
                                            className="absolute inset-0 w-full h-full resize-none border-0 focus-visible:ring-0 p-6 text-lg leading-relaxed bg-transparent"
                                            aria-invalid={fieldState.invalid}
                                        />
                                        {fieldState.invalid && (
                                            <div className="absolute bottom-20 left-6 right-6">
                                                <FieldError errors={[fieldState.error]} />
                                            </div>
                                        )}
                                    </Field>
                                )}
                            />
                        </div>
                        <div className="flex-none p-4 flex justify-between items-center border-t border-border/50 bg-muted/20">
                            <span className="text-xs font-medium text-muted-foreground">{form.watch("text").length} ký tự</span>
                            <div className="flex gap-2">
                                {form.watch("text") && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => form.setValue("text", "")}
                                    >
                                        Xóa
                                    </Button>
                                )}
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={!form.watch("text").trim() || isLoading}
                                >
                                    {isLoading ? <Spinner className="size-3.5 animate-spin mr-2" /> : <Sparkles className="size-3.5 mr-2" />}
                                    Dịch
                                </Button>
                            </div>
                        </div>
                    </form>
                </Card>

                {/* Target Output */}
                <Card className="flex flex-col bg-muted/30 overflow-hidden">
                    {result ? (
                        <div className="flex-1 flex flex-col h-full animate-in fade-in duration-300">
                            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                                <p className="text-lg leading-relaxed">{result.translatedText}</p>
                            </div>

                            {result.culturalNotes && (
                                <div className="flex-none p-4 bg-primary/5 border-t border-primary/10">
                                    <div className="flex gap-3">
                                        <Sparkles className="size-4 text-primary mt-0.5 shrink-0" />
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-primary uppercase tracking-wide">Ghi chú văn hóa</p>
                                            <p className="text-sm text-foreground/80 leading-relaxed">{result.culturalNotes}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex-none p-4 flex justify-end border-t border-border/50">
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Copy className="size-3.5" /> Sao chép
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center space-y-4">
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                                <Languages className="size-6 text-muted-foreground/60" />
                            </div>
                            <p className="text-sm font-medium">Bản dịch sẽ xuất hiện tại đây</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}
