"use client"

import * as React from "react"
import {
    Languages,
    ArrowRightLeft,
    Volume2,
    Copy,
    MessageCircle,
    CheckCircle2,
    AlertCircle,
    Sparkles,
    Check,
    ArrowRight,
    X,
    ChevronDown,
    Search
} from 'lucide-react'
import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"
import { Card, CardContent } from "@workspace/ui/components/card"
import { agentApi } from "@/lib/api/services/agent-api"
import { AgentTranslateResponseDTO, AgentGrammarCheckResponseDTO } from "@workspace/schemas"
import { Spinner } from "@workspace/ui/components/spinner"
import { Separator } from "@workspace/ui/components/separator"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import { toast } from "sonner"

export function TranslatorView() {
    const [sourceText, setSourceText] = React.useState("")
    const [targetText, setTargetText] = React.useState("")
    const [sourceLang, setSourceLang] = React.useState("ja")
    const [targetLang, setTargetLang] = React.useState("vi")
    const [isTranslating, setIsTranslating] = React.useState(false)
    const [isCheckingGrammar, setIsCheckingGrammar] = React.useState(false)
    const [translationResult, setTranslationResult] = React.useState<AgentTranslateResponseDTO | null>(null)
    const [grammarResult, setGrammarResult] = React.useState<AgentGrammarCheckResponseDTO | null>(null)

    const handleTranslate = async () => {
        if (!sourceText.trim()) return
        setIsTranslating(true)
        setGrammarResult(null) // Clear old check results
        try {
            const res = await agentApi.sensei.translate(sourceText, sourceLang, targetLang)
            setTargetText(res.translatedText)
            setTranslationResult(res)
        } catch (error) {
            toast.error("Không thể dịch văn bản")
        } finally {
            setIsTranslating(false)
        }
    }

    const handleGrammarCheck = async () => {
        if (!sourceText.trim()) return
        setIsCheckingGrammar(true)
        try {
            const res = await agentApi.sensei.checkGrammar(sourceText)
            setGrammarResult(res)
        } catch (error) {
            toast.error("Không thể kiểm tra ngữ pháp")
        } finally {
            setIsCheckingGrammar(false)
        }
    }

    const swapLanguages = () => {
        setSourceLang(targetLang)
        setTargetLang(sourceLang)
        setSourceText(targetText)
        setTargetText(sourceText)
    }

    return (
        <div className="container max-w-7xl mx-auto py-8 space-y-6 h-full overflow-y-auto scrollbar-none">
            {/* Google Translate Style Header */}
            <div className="flex items-center gap-2 mb-2 p-1 bg-muted/20 rounded-lg w-fit">
                <Select value={sourceLang} onValueChange={setSourceLang}>
                    <SelectTrigger className="w-[140px] border-none shadow-none font-medium h-9 focus:ring-0">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ja">Japanese</SelectItem>
                        <SelectItem value="vi">Vietnamese</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={swapLanguages}>
                    <ArrowRightLeft className="size-4" />
                </Button>
                <Select value={targetLang} onValueChange={setTargetLang}>
                    <SelectTrigger className="w-[140px] border-none shadow-none font-medium h-9 focus:ring-0">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="vi">Vietnamese</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Translation Layout (2 Columns) */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Source Input */}
                <Card className="rounded-2xl border shadow-sm group">
                    <CardContent className="p-0 flex flex-col h-full min-h-[280px]">
                        <div className="p-4 flex-1">
                            <Textarea
                                value={sourceText}
                                onChange={(e) => setSourceText(e.target.value)}
                                placeholder="Nhập văn bản cần dịch..."
                                className="min-h-[180px] border-none focus-visible:ring-0 p-0 text-xl resize-none shadow-none leading-relaxed bg-transparent"
                            />
                        </div>
                        <div className="p-4 border-t bg-muted/5 flex items-center justify-between">
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Volume2 className="size-4" /></Button>
                                {sourceText && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => setSourceText("")}><X className="size-4" /></Button>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] text-muted-foreground font-medium">{sourceText.length}/5000</span>
                                <Button size="sm" onClick={handleTranslate} disabled={!sourceText.trim() || isTranslating} className="px-6 rounded-full font-bold">
                                    {isTranslating ? <Spinner className="size-3 mr-2" /> : <Languages className="size-3 mr-2" />}
                                    Dịch
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Target Output */}
                <Card className="rounded-2xl border shadow-sm bg-muted/10">
                    <CardContent className="p-0 flex flex-col h-full min-h-[280px]">
                        <div className="p-4 flex-1 text-xl font-medium leading-relaxed">
                            {isTranslating ? (
                                <div className="space-y-4 pt-2">
                                    <div className="h-5 bg-muted animate-pulse rounded w-3/4" />
                                    <div className="h-5 bg-muted animate-pulse rounded w-1/2" />
                                </div>
                            ) : (
                                targetText || <span className="text-muted-foreground/30 font-normal italic">Kết quả dịch...</span>
                            )}
                        </div>
                        <div className="p-4 border-t flex items-center justify-between">
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => navigator.clipboard.writeText(targetText)} disabled={!targetText}><Copy className="size-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" disabled={!targetText}><Volume2 className="size-4" /></Button>
                            </div>
                            {targetText && (
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="rounded-full h-8 text-xs font-bold gap-2">
                                        Hỏi AI <MessageCircle className="size-3" />
                                    </Button>
                                    <Button variant="outline" size="sm" className="rounded-full h-8 text-xs font-bold gap-2">
                                        Lưu lại <Check className="size-3" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Grammar Section - ONLY SHOW WHEN TRANSLATED */}
            {targetText && (
                <div className="pt-2 animate-in fade-in slide-in-from-top-4 duration-500">
                    <Card className="border-destructive/30 bg-destructive/5 border rounded-2xl overflow-hidden shadow-sm">
                        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="space-y-1">
                                <h3 className="font-bold text-destructive flex items-center gap-2">
                                    <Sparkles className="size-4" />
                                    Kiểm tra ngữ pháp Nhật ngữ
                                </h3>
                                <p className="text-muted-foreground text-sm">Phát hiện lỗi sai và gợi ý cách dùng từ tự nhiên hơn cho câu văn này.</p>
                            </div>
                            <Button
                                className="bg-destructive hover:bg-destructive/90 text-white font-bold rounded-full px-8 gap-2 shadow-lg"
                                onClick={handleGrammarCheck}
                                disabled={isCheckingGrammar}
                            >
                                {isCheckingGrammar ? <Spinner className="size-4" /> : <Search className="size-4" />}
                                Phân tích ngữ pháp
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Detailed Grammar Analysis Result */}
            {grammarResult && (
                <Card className="rounded-2xl border shadow-sm animate-in zoom-in-95 duration-500 overflow-hidden">
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {grammarResult.isCorrect ? (
                                    <Badge className="bg-green-500 uppercase tracking-widest text-[10px]">Chính xác</Badge>
                                ) : (
                                    <Badge variant="destructive" className="uppercase tracking-widest text-[10px]">Cần lưu ý</Badge>
                                )}
                                <span className="font-bold text-lg">Phân tích chi tiết ngữ pháp</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setGrammarResult(null)} className="rounded-full h-8 w-8"><X className="size-4" /></Button>
                        </div>

                        {/* Comparison box */}
                        <div className="grid md:grid-cols-[1fr,40px,1fr] gap-4 items-center">
                            <div className="p-5 rounded-2xl bg-muted/30 border space-y-2">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Câu văn gốc</p>
                                <p className="text-lg font-medium leading-relaxed">{grammarResult.originalText}</p>
                            </div>
                            <div className="flex justify-center flex-col items-center opacity-30">
                                <ArrowRight className="size-5" />
                            </div>
                            <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
                                <p className="text-[10px] font-bold text-primary uppercase">Đề xuất hoàn thiện</p>
                                <p className="text-lg font-bold leading-relaxed text-primary">{grammarResult.correctedText}</p>
                            </div>
                        </div>

                        {/* Errors List */}
                        {grammarResult.errors.length > 0 && (
                            <div className="space-y-4">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Danh sách chỉnh sửa</p>
                                <div className="grid gap-3">
                                    {grammarResult.errors.map((error, idx) => (
                                        <div key={idx} className="flex gap-4 p-5 rounded-2xl bg-muted/10 border hover:bg-muted/20 transition-all">
                                            <div className="size-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center font-bold text-sm shrink-0">
                                                {idx + 1}
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className="font-bold text-destructive line-through decoration-destructive/30">{error.issue}</span>
                                                    <ArrowRight className="size-4 text-muted-foreground" />
                                                    <span className="font-bold text-green-600 dark:text-green-400 text-lg">{error.correction}</span>
                                                    <Badge variant="outline" className="text-[9px] px-2">{error.type}</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground italic leading-relaxed">{error.explanation}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Suggestions */}
                        {grammarResult.suggestions.length > 0 && (
                            <div className="pt-4 border-t space-y-4">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Cách diễn đạt khác</p>
                                <div className="flex flex-wrap gap-2">
                                    {grammarResult.suggestions.map((s, i) => (
                                        <Badge key={i} variant="secondary" className="px-4 py-2 font-medium rounded-xl text-sm bg-transparent border shadow-none flex items-center gap-2">
                                            <Check className="size-3 text-primary" />
                                            {s}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    )
}
