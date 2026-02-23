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

export function GrammarForm() {
    const [input, setInput] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)
    const [result, setResult] = React.useState<GrammarCheckResponse | null>(null)

    const handleCheck = async () => {
        if (!input.trim()) return
        setIsLoading(true)

        try {
            const data = await agentApi.sensei.checkGrammar(input)
            setResult(data)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleReset = () => {
        setInput("")
        setResult(null)
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 p-4 md:p-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                        <BookOpen className="size-6" />
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Grammar Guide
                    </h2>
                </div>
                <p className="text-muted-foreground font-medium pl-10">
                    Phân tích và tối ưu hóa ngữ pháp tiếng Nhật với AI Sensei
                </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
                {/* Left Side: Input */}
                <Card className="lg:col-span-5 overflow-hidden border-border/50 shadow-xl shadow-black/5 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-sm uppercase tracking-[0.2em] text-muted-foreground/60">Input Content</CardTitle>
                        <CardDescription>Nhập câu tiếng Nhật bạn muốn kiểm tra</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative group">
                            <Textarea
                                placeholder="VD: 私は日本語勉強します..."
                                className="min-h-[200px] text-lg leading-relaxed resize-none bg-background/50 border-border/50 focus:border-blue-500/50 transition-all rounded-2xl p-6"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            {input && (
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => setInput("")}
                                >
                                    <RotateCcw className="size-3" />
                                </Button>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between bg-muted/30 border-t py-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                            {input.length} characters
                        </span>
                        <Button
                            onClick={handleCheck}
                            disabled={!input.trim() || isLoading}
                            className="rounded-xl px-8 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all font-bold group"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Đang xử lý...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span>Kiểm tra</span>
                                    <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            )}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Right Side: Results */}
                <div className="lg:col-span-7 space-y-6">
                    {!result && !isLoading && (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border/10 rounded-3xl bg-muted/5 opacity-50">
                            <div className="size-16 rounded-3xl bg-muted flex items-center justify-center mb-4">
                                <Sparkles className="size-8 text-muted-foreground/40" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">Kết quả phân tích sẽ hiển thị tại đây</p>
                        </div>
                    )}

                    {isLoading && (
                        <div className="space-y-6">
                            <Card className="animate-pulse bg-muted/20 border-border/40">
                                <div className="h-40" />
                            </Card>
                            <div className="grid grid-cols-2 gap-4">
                                <Card className="animate-pulse bg-muted/20 border-border/40 h-32" />
                                <Card className="animate-pulse bg-muted/20 border-border/40 h-32" />
                            </div>
                        </div>
                    )}

                    {result && !isLoading && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                            {/* Corrected Text Card */}
                            <Card className="border-green-500/20 bg-green-500/[0.02] shadow-xl shadow-green-500/5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4">
                                    <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-[10px] uppercase font-bold tracking-widest">
                                        Corrected
                                    </Badge>
                                </div>
                                <CardHeader>
                                    <CardTitle className="text-sm uppercase tracking-[0.2em] text-green-600/70">Bản sửa đổi</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <p className="text-2xl md:text-3xl font-bold text-foreground leading-tight tracking-tight">
                                        {result.correctedText}
                                    </p>
                                    <div className="flex items-center gap-4 py-3 px-4 rounded-2xl bg-muted/50 border border-border/50">
                                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-red-500 border-red-500/20 bg-red-500/5">Gốc</Badge>
                                        <span className="text-muted-foreground line-through decoration-red-500/30 font-medium italic">
                                            {result.originalText}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Errors List */}
                                <Card className="border-red-500/10 bg-card/50">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center gap-2 text-red-500">
                                            <AlertCircle className="size-4" />
                                            <CardTitle className="text-[10px] uppercase tracking-widest font-bold">Lỗi phát hiện</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {result.errors.length > 0 ? (
                                            <ul className="space-y-3">
                                                {result.errors.map((err, i) => (
                                                    <li key={i} className="text-sm p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-foreground/80 leading-relaxed font-medium">
                                                        {err.explanation}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-xs text-muted-foreground italic">Không phát hiện lỗi nghiêm trọng</p>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Suggestions List */}
                                <Card className="border-blue-500/10 bg-card/50">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center gap-2 text-blue-500">
                                            <Lightbulb className="size-4" />
                                            <CardTitle className="text-[10px] uppercase tracking-widest font-bold">Gợi ý phát triển</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {result.suggestions.length > 0 ? (
                                            <ul className="space-y-3">
                                                {result.suggestions.map((sug, i) => (
                                                    <li key={i} className="text-sm p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 text-foreground/80 leading-relaxed font-medium">
                                                        {sug}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-xs text-muted-foreground italic">Cấu trúc câu đã rất ổn</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            <Button
                                variant="outline"
                                className="w-full rounded-2xl h-12 border-dashed border-2 hover:bg-muted/50 transition-all font-bold text-muted-foreground"
                                onClick={handleReset}
                            >
                                <RotateCcw className="size-4 mr-2" />
                                Nhập câu mới
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
