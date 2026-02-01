"use client"

import * as React from "react"
import { Sparkles, Check, ArrowRight, BookOpen } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"
import { agentApi, GrammarCheckResponse } from "@/apis/services/agent-api"

export function GrammarForm() {
    const [input, setInput] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)
    const [result, setResult] = React.useState<GrammarCheckResponse | null>(null)

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
        <div className="h-full p-4 md:p-8 max-w-4xl mx-auto flex flex-col gap-8 pb-20 overflow-y-auto custom-scrollbar">

            {/* Header */}
            <div className="flex-none text-center space-y-2 pt-4">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-green-500/20 to-teal-500/20 mb-4 shadow-lg shadow-green-500/10">
                    <Sparkles className="size-8 text-green-500" />
                </div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold italic text-foreground tracking-tight">
                    Grammar <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-500 not-italic">Correction</span>
                </h2>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60 max-w-md mx-auto">
                    Trợ lý AI phân tích và sửa lỗi ngữ pháp tiếng Nhật chuẩn xác
                </p>
            </div>

            {/* Input Section - Hero Style */}
            <div className="relative group w-full mx-auto">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative rounded-[2rem] bg-background/60 backdrop-blur-2xl border border-white/10 shadow-xl overflow-hidden">
                    <Textarea
                        placeholder="Nhập câu tiếng Nhật của bạn vào đây..."
                        className="w-full min-h-[160px] resize-none bg-transparent border-0 focus-visible:ring-0 text-xl md:text-2xl p-8 placeholder:text-muted-foreground/20 leading-relaxed font-medium text-center md:text-left"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <div className="flex items-center justify-between p-4 border-t border-white/5 bg-white/5">
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 pl-4">
                            {input.length} characters
                        </div>
                        <Button
                            size="lg"
                            className="rounded-xl px-8 h-12 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white shadow-lg shadow-green-500/20 font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                            onClick={handleCheck}
                            disabled={!input.trim() || isLoading}
                        >
                            {isLoading ? (
                                <>Understanding...</>
                            ) : (
                                <>
                                    Sửa lỗi <Check className="ml-2 size-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Result Section */}
            {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">

                    {/* Main Correction Card */}
                    <div className="rounded-[2.5rem] bg-gradient-to-br from-green-500/10 to-teal-500/5 backdrop-blur-3xl border border-green-500/20 p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Check className="size-32 text-green-500" />
                        </div>

                        <div className="relative z-10 space-y-8">
                            <div>
                                <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-green-600 dark:text-green-400 mb-4">
                                    <span className="size-2 rounded-full bg-green-500 animate-pulse" /> Kết quả phân tích
                                </h3>
                                <div className="text-2xl md:text-3xl font-medium leading-relaxed text-foreground/90">
                                    {result.correctedText}
                                </div>
                            </div>

                            <div className="bg-background/40 rounded-2xl p-6 border border-white/10 flex flex-col md:flex-row items-start md:items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex-none px-3 py-1 bg-red-500/10 text-red-500 rounded-lg text-[10px] font-black uppercase tracking-widest">Bản gốc</span>
                                <span className="line-through decoration-red-500/30 decoration-2">{result.originalText}</span>
                            </div>
                        </div>
                    </div>

                    {/* Analysis Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Errors */}
                        {result.errors && result.errors.length > 0 && (
                            <div className="rounded-[2rem] bg-background/40 backdrop-blur-xl border border-white/5 p-6 space-y-6">
                                <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                                    <span className="p-1 rounded bg-red-500/10 text-red-500"><BookOpen className="size-3" /></span>
                                    Lỗi được tìm thấy
                                </h3>
                                <ul className="space-y-4">
                                    {result.errors.map((err, i) => (
                                        <li key={i} className="group flex gap-4 text-sm text-muted-foreground">
                                            <span className="flex-none flex items-center justify-center size-6 rounded-full bg-red-500/10 text-red-500 font-bold text-xs ring-4 ring-red-500/5">
                                                {i + 1}
                                            </span>
                                            <span className="group-hover:text-foreground transition-colors">{err.explanation}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Tips */}
                        {result.suggestions && result.suggestions.length > 0 && (
                            <div className="rounded-[2rem] bg-background/40 backdrop-blur-xl border border-white/5 p-6 space-y-6">
                                <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                                    <span className="p-1 rounded bg-blue-500/10 text-blue-500"><Sparkles className="size-3" /></span>
                                    Gợi ý cải thiện
                                </h3>
                                <ul className="space-y-4">
                                    {result.suggestions.map((sug, i) => (
                                        <li key={`sug-${i}`} className="group flex gap-4 text-sm text-muted-foreground">
                                            <span className="flex-none flex items-center justify-center size-6 rounded-full bg-blue-500/10 text-blue-500 font-bold text-xs ring-4 ring-blue-500/5">
                                                TIP
                                            </span>
                                            <span className="group-hover:text-foreground transition-colors">{sug}</span>
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
