"use client"

import * as React from "react"
import { Sparkles, Check, ArrowRight, BookOpen } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"
import { agentApi } from "@/apis/services/agent-api"
import type { AgentGrammarCheckResponseDTO } from "@workspace/schemas"


export function GrammarForm() {
    const [input, setInput] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)
    const [result, setResult] = React.useState<AgentGrammarCheckResponseDTO | null>(null)

    const handleCheck = async () => {
        if (!input.trim()) return
        setIsLoading(true)
        setResult(null)

        try {
            const data = await agentApi.sensei.checkGrammar(input)
            setResult(data)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">

            {/* Header */}
            <div className="space-y-1 pb-2 border-b border-border/40">
                <h2 className="text-2xl font-bold tracking-tight">Grammar Correction</h2>
                <p className="text-sm text-muted-foreground">
                    Kiểm tra và sửa lỗi ngữ pháp tiếng Nhật
                </p>
            </div>

            {/* Input Section */}
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <Textarea
                    placeholder="Nhập câu tại đây (Ví dụ: 私は日本語勉強します - thiếu trợ từ を)..."
                    className="w-full min-h-[140px] resize-none border-0 focus-visible:ring-0 p-6 text-lg leading-relaxed bg-transparent"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <div className="flex items-center justify-between p-4 border-t border-border/50 bg-muted/20">
                    <div className="text-xs font-medium text-muted-foreground pl-2">
                        {input.length} ký tự
                    </div>
                    <Button
                        onClick={handleCheck}
                        disabled={!input.trim() || isLoading}
                        className="px-6 font-semibold"
                    >
                        {isLoading ? (
                            <>Đang phân tích...</>
                        ) : (
                            <>
                                Kiểm tra <ArrowRight className="ml-2 size-4" />
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Result Section */}
            {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Main Correction Card */}
                    <div className="rounded-xl border border-border bg-card shadow-sm p-6 space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                                <Check className="size-6" />
                            </div>
                            <div className="space-y-2 flex-1">
                                <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Kết quả chỉnh sửa</h3>
                                <p className="text-xl md:text-2xl font-medium text-foreground">{result.correctedText}</p>
                            </div>
                        </div>

                        <div className="rounded-lg bg-muted/50 p-4 flex gap-3 text-sm text-muted-foreground items-center border border-border/50">
                            <span className="font-semibold text-red-500 text-xs uppercase px-2 py-0.5 bg-red-100 dark:bg-red-900/20 rounded">Gốc</span>
                            <span className="line-through decoration-red-500/30 decoration-auto">{result.originalText}</span>
                        </div>
                    </div>

                    {/* Analysis Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Errors */}
                        {result.errors && result.errors.length > 0 && (
                            <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm">
                                <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wide text-red-600 dark:text-red-400">
                                    <BookOpen className="size-4" />
                                    Lỗi được tìm thấy
                                </div>
                                <ul className="space-y-4">
                                    {result.errors.map((err, i) => (
                                        <li key={i} className="flex gap-3 text-sm">
                                            <span className="flex-none flex items-center justify-center size-5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 font-bold text-xs">
                                                {i + 1}
                                            </span>
                                            <span className="text-foreground/80">{err.explanation}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Tips */}
                        {result.suggestions && result.suggestions.length > 0 && (
                            <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm">
                                <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wide text-blue-600 dark:text-blue-400">
                                    <Sparkles className="size-4" />
                                    Gợi ý cải thiện
                                </div>
                                <ul className="space-y-4">
                                    {result.suggestions.map((sug, i) => (
                                        <li key={`sug-${i}`} className="flex gap-3 text-sm">
                                            <span className="flex-none flex items-center justify-center size-5 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-bold text-xs">
                                                💡
                                            </span>
                                            <span className="text-foreground/80">{sug}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
